declare module "swagger-express-middleware/lib/data-store" {
  type Router = import("express").Router;
  type Resource = import("swagger-express-middleware/lib/data-store/resource");
  type Callback<T> = (err: Error | undefined, v?: T) => void;
  export = class DataStore {
    __router: Router;

    constructor();

    get(resource: Resource | string, callback: Callback<Resource | null>);
    save(
      resources: Resource | Resource[],
      callback: Callback<Resource | Resource[]>
    );
    delete(
      resources: Resource | Resource[],
      callback: Callback<Resource | Resource[]>
    );
    getCollection(collection: string, callback: Callback<Resource[]>);
    deleteCollection(collection: string, callback: Callback<Resource[]>);
    abstract __openDataStore(
      collection: string,
      callback: Callback<Resource[]>
    );
    abstract __saveDataStore(
      collection: string,
      resources: Resource[],
      callback: Callback<void>
    );
  };
}

declare module "swagger-express-middleware/lib/data-store/resource" {
  type Router = import("express").Router;
  export = class Resource<D = any> {
    collection: string;
    _id?: import("mongodb").ObjectId;
    name?: string;
    version?: number;
    data: D;
    createdOn: Date;
    modifiedOn: Date;
    owner: string;

    constructor(path?: string, name?: string, data?: D);

    merge(other?: Resource | D);
    valueOf(router?: Router, collectionOnly?: boolean): string;
    filter(
      router?: Router,
      collectionOnly?: boolean
    ): (resource: Resource) => boolean;
    parse(json: any): Resource | Resource[];
  };
}

declare module "json-schema-as-model" {
  export const model = <T extends import("json-schema-to-js").JSONSchema7>({
    schema,
  }: {
    schema: T;
  }) =>
    Object.assign((v: import("json-schema-to-ts").FromSchema<T>) => v, {
      validate: Object.assign(
        (v: import("json-schema-to-ts").FromSchema<T>) => true,
        { errors: any }
      ),
    });

  export = { model, config: { disabled: boolean } };
}
