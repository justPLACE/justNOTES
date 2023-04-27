import { operation } from "../../../../../functions/model";
import Error from "../../../../components/responses/error/model";

export default operation({
  description: "Get salt string to start user authentication",
  tags: ["Authentication"],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          properties: {
            email: {
              type: "string",
              format: "email",
            },
          },
          required: ["email"],
          additionalProperties: false,
        },
      },
    },
    description: "The e-mail of the user being authenticated",
    required: true,
  },
  responses: {
    default: Error,
    201: {
      description: "Returns the salt string",
      content: {
        "application/json": {
          schema: {
            type: "string",
            minLength: 32,
            maxLength: 32,
          },
        },
      },
    },
  },
  security: [],
} as const);
