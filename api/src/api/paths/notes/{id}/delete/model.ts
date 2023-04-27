import { operation } from "../../../../../functions/model";
import NoteId from "../../../../components/parameters/noteId/model";
import Error from "../../../../components/responses/error/model";
import Note from "../../../../components/schemas/note/model";

export default operation({
  description: "Deletes a note",
  tags: ["Notes"],
  parameters: [NoteId],
  responses: {
    default: Error,
    201: {
      description: "Returns the deleted note",
      content: {
        "application/json": {
          schema: Note,
        },
      },
    },
  },
} as const);
