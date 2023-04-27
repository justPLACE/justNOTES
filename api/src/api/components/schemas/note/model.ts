import { component } from "../../../../functions/model";

export default component({
  description: "Note document",
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
    title: {
      type: "string",
      minLength: 1,
    },
    body: {
      type: "string",
    },
  },
  readOnly: ["id"],
  additionalProperties: false,
} as const);
