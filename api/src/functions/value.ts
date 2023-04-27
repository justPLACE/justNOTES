import { FromSchema, JSONSchema7 } from "json-schema-to-ts";
import { db } from "./model";
import jsam from "json-schema-as-model";
import ono from "ono";

export const value: <S extends JSONSchema7>(
  schema: S,
  value: FromSchema<S>
) => FromSchema<S> = (schema, v) => {
  const model = jsam.model({
    schema,
  });
  if (!model.validate(v)) {
    const e = ono({ status: 400 }, "Invalid db document");
    (e as any).reason = model.validate.errors;
    throw e;
  }
  return v;
};

export const docs: {
  model: ReturnType<typeof db>;
  value: FromSchema<JSONSchema7>;
}[] = [];

export const doc: <M extends ReturnType<typeof db>>(
  model: M,
  value: FromSchema<M>
) => FromSchema<M> = (model, v) => {
  v = (value as any)(model, v);
  docs.push({
    model,
    value: v,
  });
  return v;
};
