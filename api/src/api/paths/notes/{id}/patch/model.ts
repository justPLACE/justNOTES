import { operation } from "../../../../../functions/model";
import NoteId from "../../../../components/parameters/noteId/model";
import Error from "../../../../components/responses/error/model";
import Note from "../../../../components/schemas/note/model";

export default operation({
  description: "Updates a note",
  tags: ["Notes"],
  parameters: [NoteId],
  requestBody: {
    content: {
      "application/json": {
        schema: Note,
      },
    },
    description: "The updated note",
    required: true,
  },
  responses: {
    default: Error,
    201: {
      description: "Returns the updated note",
      headers: {
        Location: {
          description: "The URL of the updated note",
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
