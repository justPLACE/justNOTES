import { component } from "../../../../functions/model";

export default component({
  type: "apiKey",
  in: "header",
  name: "Authorization",
} as const);
