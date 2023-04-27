import { component } from "../../../../functions/model";

export default component({
  name: "id",
  in: "path",
  description: `id of the note`,
  schema: {
    type: "string",
    format: "uuid",
  },
} as const);
