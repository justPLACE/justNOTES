import cloneDeep from "clone-deep";
import { FromSchema, JSONSchema7 } from "json-schema-to-ts";
import { Db, Collection } from "mongodb";
import objectPath from "object-path";
import {
  ExampleObject,
  HeaderObject,
  OperationObject,
  ParameterObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
  SecuritySchemeObject,
  SwaggerObject,
} from "swagger-express-middleware";
import Resource from "swagger-express-middleware/lib/data-store/resource";

type OpenAPIObject = SwaggerObject & {
  swagger: never;
  openapi: string;
  servers: {
    url: string;
    description: string;
    variables?: Record<
      string,
      {
        default: any;
      }
    >;
  }[];
  components?: {
    schemas?: Record<string, JSONSchema7>;
    securitySchemes?: Record<string, JSONSchema7>;
  };
};

export const model: OpenAPIObject = {} as any;

const deepMerge = <T, S>(a: T, b: S) => {
  for (const k of Object.keys(b as any)) {
    if ((a as any)[k] === undefined) {
      (a as any)[k] = (b as any)[k];
    } else {
      if (
        !["number", "boolean", "string"].includes(typeof (a as any)[k]) &&
        Object.keys((b as any)[k]).length > 0
      ) {
        deepMerge((a as any)[k], (b as any)[k]);
      }
    }
  }
  return a as T | S;
};

const modelType =
  <T = JSONSchema7, S extends T = T>(fn: (schema: T, path: string[]) => S) =>
  (schema: T) => {
    const stack = new Error()
      .stack!.split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("at "));
    const [thisPath, otherPath] = [stack[0], stack[1]].map((s) => {
      const i1 = s.indexOf("(");
      const i2 = s.indexOf(":", i1 + "webpack://".length);
      return s
        .substring(i1 > -1 ? i1 + 1 : "at ".length, i2)
        .replace(/\\/g, "/");
    });
    const pathString = decodeURI(
      otherPath.substring(
        thisPath.lastIndexOf("/", thisPath.lastIndexOf("/") - 1) +
          "/api/".length,
        otherPath.lastIndexOf("/")
      )
    );
    let path: string[];
    if (pathString.startsWith("paths/")) {
      const [, pathLocation, op] = /paths(\/.*)\/([^\/]*)$/.exec(pathString)!;
      path = ["paths", pathLocation, op];
    } else {
      path = pathString.split("/").filter(Boolean);
    }
    const newSchema = deepMerge(
      objectPath.get(model, path) || {},
      fn(cloneDeep(schema), path)
    ) as S;
    if (path.length > 0) {
      objectPath.set(model, path, newSchema);
    }
    if ((newSchema as any).result) {
      const { result } = newSchema as any;
      delete (newSchema as any).result;
      return result as S;
    }
    return newSchema;
  };

export const api = modelType(
  <T extends JSONSchema7>(schema: T & Partial<OpenAPIObject>) => {
    return Object.assign(schema, {
      paths: schema.paths || {},
    });
  }
);

export const db: <
  S extends Omit<JSONSchema7, "readOnly"> & { readOnly?: readonly string[] },
  T = FromSchema<Omit<S, "readOnly">>
>(
  schema: S
) => S & {
  collection: (database: Db) => Collection<Resource<T>>;
  db: T;
} = modelType((schema, path) =>
  Object.assign(schema, {
    collection: (database: Db) => database.collection("path" + path[1]) as any,
    db: undefined as any,
  })
);

type ParameterType = (ParameterObject | ReferenceObject) & {
  examples?: Record<string, any>;
};

type OperationType<
  T extends Omit<JSONSchema7, "readOnly"> & { readOnly?: readonly string[] },
  S = FromSchema<Omit<T, "readOnly">>
> = Omit<OperationObject, "security" | "parameters" | "tags"> & {
  tags?: readonly string[];
  parameters?: readonly (
    | ParameterType
    | { allOf: readonly Partial<ParameterType>[] }
  )[];
  requestBody?: {
    description?: string;
    content: Record<
      string,
      {
        schema?: T;
        example?: S;
        examples?: Record<string, S>;
        encoding?: Record<
          string,
          {
            contentType?: string;
            headers?: Record<string, HeaderObject>;
            style?: string;
            explode?: boolean;
            allowReserved?: boolean;
          }
        >;
      }
    >;
    required?: boolean;
  };
  security?: readonly Record<string, readonly string[]>[];
};

export const operation: <
  T extends Omit<JSONSchema7, "readOnly"> & { readOnly?: readonly string[] }
>(
  schema: OperationType<T>
) => OperationType<T> = modelType((schema) => schema);

type ComponentType =
  | SchemaObject
  | ResponseObject
  | ParameterObject
  | ExampleObject
  | HeaderObject
  | SecuritySchemeObject;

export const component = modelType(
  <T extends ComponentType>(schema: T, path: string[]) =>
    Object.assign(schema, {
      result: {
        $ref: "#/" + path.join("/"),
      },
    }) as T
);

export const mergeSchemas = <
  T extends JSONSchema7 | ComponentType,
  S extends JSONSchema7 | ComponentType
>(
  schema1: T,
  schema2: S
): T & S => ({ allOf: [schema1, schema2] } as JSONSchema7 as any);
