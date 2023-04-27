import { Db, MongoClient, MongoClientOptions, WithId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

type Context = { db?: { [key: string]: any[] } };

export const contextToDb = async (context: Context, db: Db) => {
  return Promise.all(
    Object.entries(context.db || {}).map(([collectionName, docs]) =>
      docs && docs.length
        ? db.collection(collectionName).insertMany(docs.reverse())
        : Promise.resolve()
    )
  );
};

export const dbToContext = async (context: Context, db: Db) => {
  const dbCollections: { [collectionName: string]: WithId<any>[] } = {};
  for (const { collectionName } of await db.collections()) {
    dbCollections[collectionName] = (
      await db.collection(collectionName).find().toArray()
    ).reverse();
  }
  context.db = new Proxy(dbCollections, {
    get: (obj, key) => {
      return obj[key as string] || [];
    },
  });
};

export const closeDb = async (
  connection: MongoClient,
  server?: MongoMemoryServer
) => {
  await connection.close();
  if (server) {
    await new Promise((resolve) => {
      setTimeout(() => resolve(server.stop()), 100);
    });
  }
};

export const closeDbToContext = async (
  context: Context,
  db: Db,
  connection: MongoClient,
  server?: MongoMemoryServer
) => {
  await dbToContext(context, db);
  await closeDb(connection, server);
};

export default async () => {
  let uri: string;
  let dbServer: MongoMemoryServer | undefined;
  if (process.env.MONGO_RAM || !process.env.MONGO_URI) {
    dbServer =
      await require("mongodb-memory-server").MongoMemoryServer.create();
    uri = (dbServer as MongoMemoryServer).getUri(
      process.env.MONGO_DB_NAME || "test"
    );
  } else {
    uri =
      process.env.MONGO_URI +
      (process.env.MONGO_DB_NAME ? "/" + process.env.MONGO_DB_NAME : "");
  }
  const connectionOptions: MongoClientOptions = {
    auth: {
      user: process.env.MONGO_USER!,
      password: process.env.MONGO_PASS!,
    },
    authSource: process.env.MONGO_AUTHDB,
    useUnifiedTopology: true,
  };
  if (!connectionOptions.auth?.user || !connectionOptions.auth.password) {
    delete connectionOptions.auth;
  }
  if (!connectionOptions.authSource) {
    delete connectionOptions.authSource;
  }
  const connection = await new MongoClient(uri, connectionOptions).connect();
  const db = connection.db();
  return {
    connection,
    db,
    dbServer,
  };
};
