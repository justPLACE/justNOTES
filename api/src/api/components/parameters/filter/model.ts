import { component } from "../../../../functions/model";

export default component({
  name: "filter",
  in: "query",
  description: `String with a filter.

  Accepts comparisons with most of the MongoDB comparators in the form of (fieldName operator value).
  - fieldName can be anything except MongoDB reserved words (e.g.: $eq).
  - operator is a [MongoDB Aggregation Pipeline Operators](https://docs.mongodb.com/manual/reference/operator/aggregation/), but without the preceding $ character (e.g.: and, or, eq, ne, lt, gt, etc). The not operator has a different syntax: (not comparison).
  - value can be any valid JSON value, single quote delimited string or other comparisons.`,
  schema: {
    type: "string",
  },
  examples: {
    "no filter": {
      value: undefined,
    },
  },
} as const);
