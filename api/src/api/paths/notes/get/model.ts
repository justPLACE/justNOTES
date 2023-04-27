import { mergeSchemas, operation } from "../../../../functions/model";
import Amount from "../../../components/parameters/amount/model";
import Filter from "../../../components/parameters/filter/model";
import Start from "../../../components/parameters/start/model";
import Error from "../../../components/schemas/error/model";
import Note from "../../../components/schemas/note/model";

export default operation({
  description: "Lists notes",
  tags: ["Notes"],
  parameters: [
    Start,
    Amount,
    mergeSchemas(Filter, {
      examples: {
        'titled "January 15"': {
          value: 'title eq "January 15"',
          description: `List the single note with title set to \"January 15\", or [] if it is not registered.`,
        },
      },
    } as const),
  ],
  responses: {
    default: Error,
    200: {
      description: "Returns the matching notes",
      headers: {
        "last-modified": {
          description: "The date/time that a note was last modified",
          schema: {
            type: "string",
          },
        },
      },
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: Note,
          },
        },
      },
    },
  },
} as const);
