import { component } from "../../../../functions/model";

export default component({
  name: "amount",
  in: "query",
  description: `Amount of resources to list. No more than that amount of resources is going to be listed. If there are less resources than the amount, only the ones available are returned.`,
  schema: {
    type: "integer",
    minimum: 1,
  },
  examples: {
    "list all resources": {
      value: undefined,
    },
    "list 2 resources": {
      value: 2,
    },
  },
} as const);
