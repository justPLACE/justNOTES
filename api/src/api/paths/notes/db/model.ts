import { db, mergeSchemas } from "../../../../functions/model";
import Note from "../../../components/schemas/note/model";

export default db(
  mergeSchemas(Note, {
    required: ["title", "body"],
  } as const)
);
