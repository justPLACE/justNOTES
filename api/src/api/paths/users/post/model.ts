import { mergeSchemas, operation } from "../../../../functions/model";
import Error from "../../../components/responses/error/model";
import User from "../../../components/schemas/user/model";

export default operation({
  description: "Creates a new user",
  tags: ["Users"],
  requestBody: {
    content: {
      "application/json": {
        schema: mergeSchemas(User, {
          required: ["passwordHash"],
        } as const),
      },
    },
    description: "The user to create",
    required: true,
  },
  responses: {
    default: Error,
    201: {
      description: "Returns the newly-created user",
      headers: {
        Location: {
          description: "The URL of the newly-created user",
          schema: {
            type: "string",
            format: "url",
          },
        },
      },
      content: {
        "application/json": {
          schema: mergeSchemas(User, {
            properties: { passwordHash: { not: {} } },
            example: { name: "string", email: "user@example.com" },
          }),
        },
      },
    },
  },
  security: [],
} as const);
