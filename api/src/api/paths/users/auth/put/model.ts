import { operation } from "../../../../../functions/model";
import Error from "../../../../components/responses/error/model";

export default operation({
  description: "Second and final stage of authentication",
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
            secondHash: {
              type: "string",
              minLength: 128,
              maxLength: 128,
            },
          },
          required: ["email", "secondHash"],
          additionalProperties: false,
        },
      },
    },
    description:
      "The e-mail of the user being authenticated and the second hash of the password",
    required: true,
  },
  responses: {
    default: Error,
    201: {
      description: "Returns the JWT",
      content: {
        "application/json": {
          schema: {
            type: "string",
          },
        },
      },
    },
  },
  security: [],
} as const);
