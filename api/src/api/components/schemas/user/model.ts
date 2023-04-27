import { component } from "../../../../functions/model";

export default component({
  description: "User document",
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
    },
    email: {
      type: "string",
      format: "email",
    },
    passwordHash: {
      type: "string",
      minLength: 128,
      maxLength: 128,
    },
  },
  additionalProperties: false,
} as const);
