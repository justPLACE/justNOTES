import { mergeSchemas, operation } from "../../../../functions/model";
import Error from "../../../components/responses/error/model";
import Note from "../../../components/schemas/note/model";

export default operation({
  description: "Creates a new note",
  tags: ["Notes"],
  requestBody: {
    content: {
      "application/json": {
        schema: mergeSchemas(Note, {
          properties: { id: { not: {} } },
          example: { title: "string", body: "string" },
        }),
      },
    },
    description: "The note to create",
    required: true,
  },
  responses: {
    default: Error,
    201: {
      description: "Returns the newly-created note",
      headers: {
        Location: {
          description: "The URL of the newly-created note",
          schema: {
            type: "string",
            format: "url",
          },
        },
      },
      content: {
        "application/json": {
          schema: Note,
        },
      },
    },
  },
} as const);
