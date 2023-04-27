import { component } from "../../../../functions/model";

export default component({
  name: "start",
  in: "query",
  description: `Index of the resource to start listing. Also represents the amount of resources to skip.`,
  schema: {
    type: "integer",
    minimum: 0,
  },
  examples: {
    "skip nothing": {
      value: undefined,
    },
    "skip first 2 resources": {
      value: 2,
    },
  },
} as const);
