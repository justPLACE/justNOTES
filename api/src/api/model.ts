import { api } from "../functions/model";
import { JWT_REQUIREMENTS } from "./components/securitySchemes/JWT/controller";

export default api({
  openapi: "3.0.0",
  info: {
    title: "justNOTES back-end",
    description: "Backend for sample notes project",
    version: require("../../package.json").version,
  },
  servers: [
    {
      url:
        (process.env.PROTOCOL || "http") +
        "://" +
        (process.env.HOST || "localhost") +
        (process.env.URL_PORT ? `:${process.env.URL_PORT}` : "") +
        (process.env.URL_PATH || ""),
      description: "Default server",
      variables: {
        title: {
          default: "default",
        },
      },
    },
  ],
  security: [
    {
      JWT: [JWT_REQUIREMENTS.OWNER],
    },
  ],
});
