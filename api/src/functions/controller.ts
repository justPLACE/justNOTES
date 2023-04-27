import { NextFunction, Request, Response } from "express";
import { Db } from "mongodb";
import { SwaggerObject } from "swagger-express-middleware";
import MongoDBDataStore from "./mongodb.datastore";
import { getPathString } from "./path";

type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

type DB2API<T> = (doc: T, saved: boolean, db: Db, list: boolean) => Partial<T>;

export const db2apis: Record<string, DB2API<any>> = {};

export const db2api: <S>(controller: DB2API<S>) => DB2API<S> = (controller) => {
  const pathString = getPathString();
  if (!pathString.startsWith("paths/")) {
    throw new Error("db2api outside paths: " + pathString);
  }
  const [, pathLocation] = /paths(\/.*)\/([^\/]*)$/.exec(pathString)!;
  db2apis[pathLocation] = controller;
  return controller;
};

export const operations: ((db: Db) => Middleware)[] = [];

export const operation = (controller: Middleware) => {
  const pathString = getPathString();
  if (!pathString.startsWith("paths/")) {
    throw new Error("Operation controller outside paths: " + pathString);
  }
  const [, pathLocation, op] = /paths(\/.*)\/([^\/]*)$/.exec(pathString)!;
  operations.push((db: Db) => async (req, res, next) => {
    if (
      req.path !== pathLocation ||
      req.method.toLowerCase() !== op.toLowerCase()
    ) {
      return next();
    }
    (req as any).db = db;
    if (controller.length > 2) {
      return controller(req, res, next);
    } else {
      try {
        const r = await controller(req, res, next);
        if (r as any) {
          next(r);
        }
      } catch (e) {
        next(e);
      }
    }
  });
  return operations[operations.length - 1];
};

export const securities: Record<
  string,
  (dataStore: MongoDBDataStore) => Middleware
> = {};

export const security = (
  controller: Middleware,
  setup?: (dataStore: MongoDBDataStore) => void
) => {
  const pathString = getPathString();
  const lastSlash = pathString.lastIndexOf("/");
  const securityName = pathString.substring(lastSlash + 1);
  securities[securityName] = (dataStore: MongoDBDataStore) => {
    setup?.(dataStore);
    return (req, res, next) => {
      (req as any).dataStore = dataStore;
      const sec: { requirements?: string[]; apiKey?: any } = {};
      sec.requirements = ((req as any).openapi as SwaggerObject).security?.find(
        (s) => s[securityName]
      )?.[securityName];
      const model = (req as any).openapi.api.components?.securitySchemes?.[
        securityName
      ];
      if (sec.requirements && model) {
        if (model.type === "apiKey") {
          switch (model.in) {
            case "header":
              sec.apiKey =
                req.headers[model.name] ||
                req.headers[model.name.toLowerCase()];
              break;
            case "query":
              sec.apiKey =
                req.query[model.name] || req.query[model.name.toLowerCase()];
              break;
            case "cookie":
              sec.apiKey =
                req.cookies[model.name] ||
                req.cookies[model.name.toLowerCase()];
              break;
          }
        }
        (req as any).security = sec;
        controller(req, res, next);
      } else {
        next();
      }
    };
  };
  return securities[securityName];
};
