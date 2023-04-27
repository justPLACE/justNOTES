import { Request } from "express";
import jsam from "json-schema-as-model";
import type { FromSchema, JSONSchema7 } from "json-schema-to-ts";
import { Db } from "mongodb";
import objectPath from "object-path";
import ono from "ono";
import DataStore from "swagger-express-middleware/lib/data-store";
import Resource from "swagger-express-middleware/lib/data-store/resource";
import { db2apis } from "./controller";
import { randomUUID } from "crypto";

const existing = "Resource already exists";

type Data = FromSchema<JSONSchema7> & { name: string };

export default class MongoDBDataStore extends DataStore {
  constructor(
    public db: Db,
    public schemas: {
      [path: string]: JSONSchema7 & {
        docs?: {
          [title: string]: Resource<Data>;
        };
        resource?: Resource<
          JSONSchema7 & {
            validate?: any;
            db2api?: any;
            resource?: Resource<any>;
            primaryKey?: string;
          }
        >;
      };
    },
    public pathLength: number,
    public validate?: (
      resource: Resource<Data> | undefined,
      db: Db,
      resourceBefore?: Resource<Data>
    ) => Resource<Data> | void,
    public db2api?: (resource: Resource<Data>) => Resource | undefined
  ) {
    super();
  }

  async init() {
    for (const [path, schema] of Object.entries(this.schemas)) {
      const collection = this.db.collection("path" + path);
      // Insert or update docs on DB
      for (const doc of Object.values(schema.docs || {})) {
        const _id = encodeURI(doc.data.name).toLowerCase();
        const res = await collection.findOne({ _id });
        if (!res || !res.version || res.version < doc.version!) {
          const resource = new Resource(path, doc.data.name, doc.data);
          resource._id = _id as any;
          delete resource.name;
          resource.version = doc.version;
          resource.createdOn = doc.createdOn || new Date();
          resource.modifiedOn = doc.modifiedOn || resource.createdOn;
          await collection.replaceOne({ _id }, resource, { upsert: true });
        }
      }
      delete schema.docs;
      // Create schema resource
      schema.resource = new Resource(path, "db", schema);
    }
  }

  async get(
    resource: Resource | string,
    callback: (err: Error | undefined, resource?: Resource | null) => void
  ) {
    if (typeof callback === "function") {
      try {
        if (typeof resource === "string") {
          resource = new Resource(resource);
        }
        const { collection: collectionName, name } = new Resource(
          resource.valueOf(this.__router)
        );
        const collection = this.db.collection(
          "path" + collectionName.substring(this.pathLength)
        );
        const res = await collection.findOne({ _id: name });
        if (res) {
          const api = await dbToApi(this)([Object.assign(new Resource(), res)]);
          if (api[0]) {
            callback(undefined, api[0]);
          } else {
            throw ono({ status: 404 }, "Not found");
          }
        } else {
          callback(undefined, res);
        }
      } catch (e) {
        callback(e as Error);
      }
    }
  }

  async save(
    resources: Resource | Resource[],
    callback: (
      err: Error | undefined,
      resources?: Resource | Resource[]
    ) => void
  ) {
    if (typeof callback === "function") {
      try {
        let upsert = false;
        if (resources instanceof Resource) {
          resources = [resources];
          upsert = true;
        }
        for (const resource of resources) {
          const schemas = Object.values(this.schemas)
            .map((schema) => schema.resource!)
            .filter(resource.filter(this.__router, true));
          const { collection: collectionName } = new Resource(
            resource.valueOf(this.__router)
          );
          const colName = collectionName.substring(this.pathLength);
          const collection = this.db.collection("path" + colName);
          const obj = await collection.findOne({ _id: resource.name });
          if (obj && !upsert) {
            return callback(ono({ status: 403 }, existing));
          }
          const now = new Date();
          Object.assign(
            resource,
            new Resource(colName, resource.name, {}),
            (obj && {
              ...obj,
              data: {
                ...obj.data,
                ...resource.data,
              },
            }) || {
              data: resource.data,
              createdOn: resource.createdOn || now,
            }
          );
          resource.modifiedOn = now;
          if (this.validate) {
            Object.assign(
              resource,
              this.validate(
                resource,
                this.db,
                obj ? Object.assign(new Resource(), obj) : undefined
              ) || resource
            );
          }
          if (schemas.length > 0) {
            const schema = Object.assign({}, schemas[0].data);
            const { validate } = schema;
            delete schema.validate;
            delete schema.resource;
            delete schema.primaryKey;
            validateReadOnly(schema, obj?.data, resource.data);
            const model = jsam.model({
              schema,
            });
            if (!model.validate(resource.data)) {
              const e = ono({ status: 400 }, "Invalid db document");
              (e as any).reason = model.validate.errors;
              throw e;
            }
            if (typeof validate === "function") {
              resource.data = validate(resource.data, this.db, obj && obj.data);
            }
          }
          let id: string = objectPath.get(
            resource.data,
            schemas[0]?.data.primaryKey || "id"
          );
          if (!id) {
            id = randomUUID();
            objectPath.set(
              resource.data,
              schemas[0]?.data.primaryKey || "id",
              id
            );
          }
          resource._id = ("/" + encodeURI(id.toLowerCase())) as any;
          if (resource._id === resource.name) {
            try {
              await collection.deleteOne({ _id: resource._id });
            } catch (err) {
              const e = new Error("Error deleting old resource");
              (e as any).reason = err;
              throw e;
            }
          }

          try {
            const _id = resource.name!.toLowerCase();
            delete resource.name;
            try {
              await collection.insertOne(resource);
            } catch (err: any) {
              const e = ono(
                {
                  status: err.code === 11000 ? 403 : 500,
                },
                err.code === 11000 ? existing : "Error saving resource"
              );
              (e as any).reason = err;
              throw e;
            }
            resource.name = resource._id as any;
            delete resource._id;
            if (_id !== resource.name) {
              await collection.deleteOne({ _id });
            }
          } catch (e: any) {
            const err = new Error("Invalid data to save on db");
            (err as any).reason = e;
            if (e.status) {
              (err as any).status = e.status;
            }
            return callback(err);
          }
        }

        if (typeof callback === "function") {
          try {
            const res = await dbToApi(this, true, !upsert)(resources);
            callback(undefined, upsert ? res[0] || {} : res);
          } catch (err: any) {
            callback(err);
          }
        }
      } catch (e) {
        callback(e as Error);
      }
    }
  }

  async remove(
    resources: Resource | Resource[],
    callback: (
      err: Error | undefined,
      resources?: Resource | Resource[]
    ) => void
  ) {
    if (typeof callback !== "function") {
      callback = () => {
        return;
      };
    }
    const single = resources instanceof Resource;
    if (resources instanceof Resource) {
      resources = [resources];
    }
    try {
      for (let i = 0; i < resources.length; ++i) {
        const resource = resources[i];
        const collection = this.db.collection(
          "path" +
            new Resource(resource.valueOf(this.__router)).collection.substring(
              this.pathLength
            )
        );
        const { name } = new Resource(resource.valueOf(this.__router));
        const document = await collection.findOne({ _id: name });
        if (document) {
          const documentResource = Object.assign(new Resource(), document);
          documentResource.name = documentResource._id as any;
          delete (documentResource as any)._id;
          await this.validate?.(undefined, this.db, documentResource);
          resources[i] = documentResource;
        }
      }
    } catch (err) {
      const e = new Error("Error getting resources to delete");
      (e as any).reason = err;
      return callback(e);
    }
    try {
      for (const resource of resources) {
        const collection = this.db.collection(
          "path" +
            new Resource(resource.valueOf(this.__router)).collection.substring(
              this.pathLength
            )
        );
        await collection.deleteOne({ _id: resource.name });
      }
    } catch (err) {
      const e = new Error("Error deleting resources");
      (e as any).reason = err;
      return callback(e);
    }
    try {
      resources = await dbToApi(this, false, !single)(resources);
    } catch (err) {
      const e = new Error(
        "Resources deleted, but error occurred when preparing to return"
      );
      (e as any).reason = err;
      return callback(e);
    }
    return callback(undefined, single ? resources[0] || {} : resources);
  }

  delete(
    resources: Resource | Resource[],
    callback: (
      err: Error | undefined,
      resources?: Resource | Resource[]
    ) => void
  ) {
    this.remove(resources, callback);
  }

  private db2apiCallback<
    T extends (err: Error | undefined, res?: any[]) => void
  >(originalCallback: T) {
    return ((err, res) => {
      if (err) {
        originalCallback(err, res);
      } else {
        dbToApi(
          this,
          false,
          true
        )(res!)
          .then((r) => originalCallback(err, r))
          .catch(originalCallback);
      }
    }) as T;
  }

  getCollection(
    collectionPath: string,
    callback: (err: Error | undefined, resources?: Resource[]) => void
  ) {
    const req: Request = arguments[2];
    const collectionName = new Resource(collectionPath, "", "")
      .valueOf(this.__router)
      .substring(this.pathLength);
    let aggregation: any[] = [];
    if (req) {
      if (req.method === "DELETE") {
        if (!req.query.filter) {
          throw ono(
            {
              status: 403,
            },
            "Deleting collections without a filter is not allowed"
          );
        }
        const query = req.query;
        req.query = {};
        return (this.removeCollection as Function).call(
          this,
          collectionPath,
          ((err, resources) => {
            (req as any).deleted = resources;
            callback(err, resources);
          }) as typeof callback,
          { query }
        );
      }
      aggregation = aggregate(req.query.filter as string, req.query as any);
      req.query = {};
    }
    let originalCallback = callback;
    callback = this.db2apiCallback(originalCallback);
    this.db
      .collection("path" + collectionName)
      .aggregate(aggregation)
      .toArray()
      .then((docs) =>
        callback(
          undefined,
          docs.map((doc) => Object.assign(new Resource(), doc))
        )
      )
      .catch((err) => {
        const e = new Error("Error getting collection");
        (e as any).reason = err;
        return callback(e);
      });
  }

  removeCollection(
    collectionPath: string,
    callback: (err: Error | undefined, resources?: Resource[]) => void
  ) {
    const req = arguments[2];
    const collectionName = new Resource(collectionPath, "", "")
      .valueOf(this.__router)
      .substring(this.pathLength);
    const originalCallback = callback;
    callback = this.db2apiCallback(originalCallback);
    const collection = this.db.collection("path" + collectionName);
    let aggregation: any[] = [];
    if (req) {
      if (req.deleted) {
        return callback(undefined, req.deleted);
      }
      aggregation = aggregate(req.query.filter, req.query);
      req.query = {};
    }
    collection
      .aggregate(aggregation)
      .toArray()
      .then(async (res) => {
        if (this.validate) {
          try {
            for (const r of res) {
              await this.validate(
                undefined,
                this.db,
                Object.assign(new Resource(), {
                  ...r,
                  name: r._id,
                  _id: undefined,
                })
              );
            }
          } catch (e) {
            return callback(e as Error);
          }
        }
        const promises = res.map((r) =>
          collection
            .deleteOne({
              _id: r._id,
            })
            .then(() => Object.assign(new Resource(), r))
            .catch((err) => {
              const e = new Error("Error deleting resource");
              (e as any).reason = err;
              throw e;
            })
        );
        Promise.all(promises)
          .then((r) => {
            callback(undefined, r);
          })
          .catch((err) => {
            callback(err);
          });
      })
      .catch((err) => {
        const e = new Error("Error getting collection before removal");
        (e as any).reason = err;
        return callback(e);
      });
  }

  deleteCollection(
    collectionPath: string,
    callback: (err: Error | undefined, resources?: Resource[]) => void
  ) {
    this.removeCollection.apply(this, arguments as any);
  }

  __openDataStore() {
    // Not necessary
  }

  __saveDataStore() {
    // Not necessary
  }
}

/*
 * Function that builds an aggregation pipeline array from filter and pagination
 */
function aggregate(
  filter: string,
  pagination: { start: number; amount: number }
) {
  let aggregation = [];
  if (filter) {
    getParenthesis(filter + ")", 0, (value) =>
      aggregation.push({
        $match: value,
      })
    );
  }
  if (!isNaN(pagination.start)) {
    aggregation.push({
      $skip: +pagination.start,
    });
  }
  if (!isNaN(pagination.amount)) {
    aggregation.push({
      $limit: +pagination.amount,
    });
  }
  return aggregation;
}

function getParenthesis(
  filter: string,
  start: number,
  callback: (value: string) => void
): number {
  let parts: (string | Date)[] = [];
  let current = 0;
  let objectStart = -1;
  let brackets = 0;
  let quotes = false;
  let doubleQuotes = false;
  let backslashs = false;
  for (let i = start; i < filter.length; ++i) {
    let char = filter.substring(i, i + 1);
    if (
      char === " " &&
      !backslashs &&
      !quotes &&
      !doubleQuotes &&
      brackets === 0
    ) {
      if (objectStart > -1) {
        let part = filter.substring(objectStart, i);
        if (part.toLowerCase() === "not") {
          if (current === 0) {
            ++current;
          }
          parts[current++] = "$not";
        } else {
          try {
            parts[current] = JSON.parse(part);
            if (
              /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/g.test(
                parts[current] as string
              )
            ) {
              parts[current] = new Date(parts[current]);
            }
          } catch (e) {
            parts[current] =
              "$" +
              (part.toLowerCase() === "and" || part.toLowerCase() === "or"
                ? part.toLowerCase()
                : part);
          }
          ++current;
        }
        objectStart = -1;
      }
    } else {
      if (objectStart === -1) {
        objectStart = i;
      }
      if (char === "\\") {
        backslashs = !backslashs;
      } else {
        switch (char) {
          case "'":
            if (!backslashs) {
              if (quotes) {
                filter =
                  filter.substring(0, objectStart) +
                  '"' +
                  filter.substring(objectStart + 1, i).replace(/"/g, '\\"') +
                  '"' +
                  filter.substring(i + 1);
              }
              quotes = !quotes;
            }
            break;
          case '"':
            if (!backslashs) {
              doubleQuotes = !doubleQuotes;
            }
            break;
          case "{":
            if (!quotes && !doubleQuotes && !backslashs) {
              ++brackets;
            }
            break;
          case "}":
            if (!quotes && !doubleQuotes && !backslashs) {
              --brackets;
            }
            break;
          case "(":
            if (!quotes && !doubleQuotes && !backslashs) {
              i = getParenthesis(filter, i + 1, (value) => {
                parts[current++] = value;
              });
              objectStart = -1;
            }
            break;
          case ")":
            if (!quotes && !doubleQuotes && !backslashs) {
              if (objectStart) {
                let part = filter.substring(objectStart, i);
                if (current === 0 && part.toLowerCase() === "not") {
                  parts[current++] = "$not";
                } else {
                  try {
                    parts[current] = JSON.parse(part);
                    if (
                      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/g.test(
                        parts[current] as string
                      )
                    ) {
                      parts[current] = new Date(parts[current]);
                    }
                  } catch (e) {
                    parts[current] = "$" + part;
                  }
                }
              }
              let object: any = {};
              switch ((parts[1] as string)?.toLowerCase()) {
                case "$and":
                case "$or":
                  if (parts.length < 3) {
                    throw ono(
                      {
                        status: 400,
                      },
                      "Invalid filter"
                    );
                  }
                  let expressions = [];
                  parts.unshift(parts[1]);
                  for (let j = 1; j < parts.length; j += 2) {
                    if (
                      (parts[j - 1] as string).toLowerCase() ===
                      (parts[0] as string).toLowerCase()
                    ) {
                      if (
                        typeof parts[j] !== "object" ||
                        parts[j] instanceof Array ||
                        parts[j] instanceof Date
                      ) {
                        throw ono(
                          {
                            status: 400,
                          },
                          "Invalid filter"
                        );
                      }
                      expressions.push(parts[j]);
                    } else {
                      throw ono(
                        {
                          status: 400,
                        },
                        "Invalid filter"
                      );
                    }
                  }
                  object[(parts[0] as string).toLowerCase()] = expressions;
                  break;
                case "$not":
                  if (parts.length !== 2) {
                    throw ono(
                      {
                        status: 400,
                      },
                      "Invalid filter"
                    );
                  }
                  object.$not = [parts[2]];
                  break;
                default:
                  if (parts.length !== 3) {
                    throw ono(
                      {
                        status: 400,
                      },
                      "Invalid filter"
                    );
                  }
                  if (parts[0]) {
                    object["data." + (parts[0] as string).substring(1)] = {
                      [parts[1] as string]: parts[2],
                    };
                  }
                  break;
              }
              callback(object);
              return i;
            }
            break;
        }
        backslashs = false;
      }
    }
  }
  throw ono(
    {
      status: 400,
    },
    "Invalid filter"
  );
}

function dbToApi(
  { __router, db, schemas, db2api: datastoreDb2api }: MongoDBDataStore,
  saved?: boolean,
  list?: boolean
) {
  return async (resources: Resource[]) => {
    if (resources) {
      resources = resources
        .map((resource) => {
          if (resource._id) {
            resource.name = resource._id as any;
            delete resource._id;
          }
          return datastoreDb2api ? datastoreDb2api(resource) : resource;
        })
        .filter(Boolean) as Resource[];
      if (resources[0]) {
        const schemaResources = Object.values(schemas)
          .map((schema) => schema.resource!)
          .filter(
            new Resource(
              resources[0].collection,
              decodeURI(resources[0].name!).substring(1),
              {}
            ).filter(__router, true)
          );
        if (schemaResources.length > 0) {
          const db2api = db2apis[schemaResources[0].collection];
          if (db2api) {
            resources = await Promise.all(
              resources.map((resource) =>
                Promise.resolve(
                  db2api(resource.data, !!saved, db, !!list)
                ).then((obj) => {
                  resource.data = obj;
                  return resource;
                })
              )
            );
          }
        }
      }
    }
    return resources?.map((r) => Object.assign(new Resource(), r)) || [];
  };
}

function validateReadOnly(
  schema: JSONSchema7 & { $merge?: { source: JSONSchema7; with: JSONSchema7 } },
  before: any,
  after: any,
  readOnly = false,
  rootSchema = schema,
  path = ""
) {
  if (typeof schema === "object") {
    if (schema.$ref) {
      validateReadOnly(
        objectPath.get(
          rootSchema as object,
          schema.$ref.substring(2).split("/")
        ),
        before,
        after,
        readOnly,
        rootSchema,
        path
      );
    }
    if (schema.$merge) {
      validateReadOnly(
        schema.$merge.source,
        before,
        after,
        readOnly,
        rootSchema,
        path
      );
      validateReadOnly(
        schema.$merge.with,
        before,
        after,
        readOnly,
        rootSchema,
        path
      );
    }
    readOnly = schema.readOnly || readOnly;
    if (
      (before && JSON.stringify(before)) !== (after && JSON.stringify(after))
    ) {
      if (
        schema.properties instanceof Object &&
        (before instanceof Object || after instanceof Object)
      ) {
        for (const property in schema.properties) {
          if (before?.[property] !== after?.[property]) {
            validateReadOnly(
              schema.properties[property],
              before?.[property] || undefined,
              after?.[property] || undefined,
              readOnly,
              rootSchema,
              path + "." + property
            );
          }
        }
      } else {
        if (
          schema.items instanceof Object &&
          (before instanceof Array || after instanceof Array)
        ) {
          let i = Math.max(
            (before && before.length) || 0,
            (after && after.length) || 0
          );
          while (i--) {
            validateReadOnly(
              schema.items instanceof Array ? schema.items[i] : schema.items,
              (before && before[i]) || undefined,
              (after && after[i]) || undefined,
              readOnly,
              rootSchema,
              path + "[" + i + "]"
            );
          }
        } else {
          if (readOnly) {
            throw Object.assign(
              new Error("Setting read-only properties is not allowed"),
              {
                path: path.substring(0, 1) === "." ? path.substring(1) : 0,
                before,
                after,
              }
            );
          }
        }
      }
    }
  }
}
