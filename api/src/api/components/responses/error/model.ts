import { component } from "../../../../functions/model";
import Error from "../../schemas/error/model";

export default component({
  description: "Returns a JSON representation of the error that occured",
  content: {
    "application/json": {
      schema: Error,
    },
  },
} as const);
