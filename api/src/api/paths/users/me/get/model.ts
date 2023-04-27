import { mergeSchemas, operation } from "../../../../../functions/model";
import Error from "../../../../components/responses/error/model";
import User from "../../../../components/schemas/user/model";

export default operation({
  description: "Get signed-in user data",
  tags: ["Users"],
  responses: {
    default: Error,
    201: {
      description: "Returns the user data",
      content: {
        "application/json": {
          schema: mergeSchemas(User, {
            properties: {
              passwordHash: { not: {} },
            },
            example: { name: "string", email: "user@example.com" },
          } as const),
        },
      },
    },
  },
} as const);
