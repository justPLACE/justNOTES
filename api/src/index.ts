/// <reference types="webpack/module" />

import cloneDeep from "clone-deep";
import commandLineArgs from "command-line-args";
import express, { Request, Response } from "express";
import createMiddleware from "swagger-express-middleware";
import swaggerUi from "swagger-ui-express";
import url from "url";
import process from "process";
import { promisify } from "util";
import startDb from "./functions/db";
import { operations, securities } from "./functions/controller";
import { model } from "./functions/model";
import MongoDBDataStore from "./functions/mongodb.datastore";

const context = require.context("./api", true, /\.ts$/);
for (const key of context.keys()) {
  context(key);
}

export const start = async () => {
  const app = express();

  if ((global as any).it) {
    app.set("env", "test");
    Object.entries(process.env).forEach(([key, value]) => {
      if (key.startsWith("TEST_")) {
        process.env[key.substring(5)] = value;
      }
    });
    process.env.WARN = "off";
  }

  const options = commandLineArgs([
    {
      name: "server",
      alias: "s",
      defaultValue: (global as any).server,
    },
  ]);

  const apiModel = cloneDeep(model);

  if (options.server !== undefined) {
    const servers = apiModel.servers.filter(
      (s) => s.variables?.title.default === options.server
    );
    if (servers.length === 0) {
      console.error("There is no server with title '" + options.server + "'\n");
      process.exit(1);
    } else {
      apiModel.servers[apiModel.servers.indexOf(servers[0])] =
        apiModel.servers[0];
      apiModel.servers[0] = servers[0];
    }
  }

  for (const s of apiModel.servers) {
    if (s.variables) {
      delete s.variables.title;
    }
  }

  const { db, dbServer } = await startDb();

  const apiPath = ((p) => (p.endsWith("/") ? p.substring(0, p.length - 1) : p))(
    url.parse(apiModel.servers[0].url).pathname!
  );

  const dbSchemas: MongoDBDataStore["schemas"] = {};
  Object.entries(apiModel.paths).forEach(([path, ops]) => {
    if (ops.db) {
      dbSchemas[path] = Object.assign(ops.db, apiModel);
      delete ops.db;
    }
  });
  const dataStore = new MongoDBDataStore(db, dbSchemas, apiPath.length);
  await dataStore.init();

  const middlewareApiModel = cloneDeep(apiModel);
  const queue = Object.keys(middlewareApiModel).map((key) => {
    return {
      obj: middlewareApiModel as Record<string, any>,
      key,
      parents: ["#"],
    };
  });
  while (queue.length > 0) {
    const { obj, key, parents } = queue.shift()!;
    if (typeof obj[key] === "object") {
      if (parents.indexOf(obj[key].$ref) !== -1) {
        obj[key] = {
          type: "object",
        };
      } else {
        for (const k of Object.keys(obj[key])) {
          queue.push({
            obj: obj[key],
            key: k,
            parents: [`${parents[0]}/${key}`, ...parents],
          });
        }
      }
    }
  }

  const middleware = await promisify(createMiddleware)(middlewareApiModel, app);

  app.use((_req, res, next) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    next();
  });

  app.use(
    apiPath + "/doc",
    swaggerUi.serve,
    swaggerUi.setup(apiModel, {
      swaggerOptions: {
        filter: true,
        plugins: [
          function () {
            return {
              fn: {
                opsFilter: (taggedOps: any, phrase: string) => {
                  return taggedOps
                    .map((taggedObj: any, tag: string) => {
                      return taggedObj.set(
                        "operations",
                        taggedObj.get("operations").filter((op: any) => {
                          const search = (
                            tag +
                            " " +
                            (op.get("path") || "") +
                            " " +
                            (op.get("method") || "") +
                            " " +
                            (op.get("operation").get("summary") || "") +
                            " " +
                            (op.get("operation").get("description") || "")
                          ).toLowerCase();
                          return phrase
                            .split(" ")
                            .map(search.indexOf.bind(search))
                            .reduce((found, i) => found && i > -1, true);
                        })
                      );
                    })
                    .filter(
                      (taggedObj: any) => taggedObj.get("operations").size > 0
                    );
                },
              },
              wrapComponents: {
                FilterContainer: (Original: any) => {
                  const oldRender = Original.prototype.render;
                  Original.prototype.render = function () {
                    const rendered = oldRender.apply(this, arguments);
                    rendered.props.children.props.children.props.children.props.placeholder =
                      "Filter";
                    return rendered;
                  };
                  return Original;
                },
              },
            };
          },
          function () {
            return {
              wrapComponents: {
                Model: (Original: any) => {
                  const oldRender = Original.prototype.render;
                  Original.prototype.render = function () {
                    const rendered = oldRender.apply(this, arguments);
                    rendered.ref = (e: any) => (this.element = e);
                    return rendered;
                  };
                  const originalPrototype = Object.getPrototypeOf(
                    Original.prototype
                  );
                  originalPrototype.componentDidMount = function () {
                    if (JSON.stringify(this.props.schema) !== "{}") {
                      (window["docson" as any] as any).doc(
                        JSON.parse(
                          JSON.stringify(
                            this.props.schema._schema || this.props.schema
                          )
                        ),
                        this.element._reactInternalInstance._renderedComponent
                          ._hostNode.parentElement
                      );
                    }
                  };
                  originalPrototype.componentDidUpdate = function () {
                    (window["docson" as any] as any).doc(
                      JSON.parse(
                        JSON.stringify(
                          this.props.schema._schema || this.props.schema
                        )
                      ),
                      this.element._reactInternalInstance._renderedComponent
                        ._hostNode.parentElement
                    );
                  };
                  return Original;
                },
              },
            };
          },
        ],
      },
      customJs:
        "https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js" +
        '"></script><script src="' +
        "https://github.com/TexKiller/node-docson/releases/download/v0.4.6/node-docson.min.js" +
        '"></script><script>' +
        "window.docson = nodeDocson();" +
        '</script><script type="',
    })
  );

  app.use(
    middleware.metadata(),
    middleware.CORS(),
    middleware.files(),
    middleware.parseRequest()
  );

  for (const securityName of Object.keys(
    apiModel.components?.securitySchemes || {}
  )) {
    const controller = securities[securityName];
    if (controller) {
      app.use(controller(dataStore));
    }
  }

  app.use(middleware.validateRequest());

  for (const operation of operations) {
    app.use(operation(db));
  }

  app.use(middleware.mock(dataStore as any));

  app.use(
    (
      err: Error & { status?: number; reason?: any },
      _req: Request,
      res: Response,
      _next: () => void
    ) => {
      res.status(err.status || 500).send({
        ...err,
        message: err.message,
        stack: err.stack,
        reason:
          (err.reason instanceof Array &&
            err.reason.map((reason: any) => ({
              ...reason,
              message: reason.message,
              stack: reason.stack,
            }))) ||
          typeof err.reason === "object"
            ? {
                ...err.reason,
                message: err.reason.message,
                stack: err.reason.stack,
              }
            : err.reason,
      });
    }
  );

  if (!Object.keys(global).includes("it")) {
    app.listen(
      process.env.PORT ||
        model.servers[0]?.url.split(":")[2]?.split("/")[0] ||
        80,
      function () {
        console.log("The API is now running at " + apiModel.servers[0].url);
      }
    );
  }

  return {
    app,
    db,
    dbServer,
    apiPath,
  };
};

if (!Object.keys(global).includes("it")) {
  start();
}
