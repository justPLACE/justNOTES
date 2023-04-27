import { component } from "../../../../functions/model";

export default component({
  description: "Error returned as response on failure",
  properties: {
    status: {
      type: "integer",
      description: "HTTP status code of the response",
    },
    message: {
      type: "string",
      description: "Message of the error",
    },
    stack: {
      type: "string",
      description: "Stack trace of the error",
    },
    reason: {
      description: "Error or errors thrown by dependency module",
      oneOf: [
        {
          $ref: "#/components/schemas/error",
        },
        {
          type: "array",
          items: {
            $ref: "#/components/schemas/error",
          },
        },
      ],
    },
  },
} as const);
