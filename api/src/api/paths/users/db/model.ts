import { FromSchema } from "json-schema-to-ts";
import { db, mergeSchemas } from "../../../../functions/model";
import User from "../../../components/schemas/user/model";

const schema = mergeSchemas(User, {
  required: ["name", "email"],
} as const);

export default db<typeof schema, FromSchema<typeof schema> & { salt?: string }>(
  Object.assign(schema, { primaryKey: "email" })
);
