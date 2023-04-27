import { db2api as dbToApi } from "../../../../functions/controller";
import model from "./model";

export const db2api = dbToApi<typeof model["db"]>((dbUser) => ({
  ...dbUser,
  passwordHash: undefined,
  salt: undefined,
}));
