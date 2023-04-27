import { operation } from "../../../../../functions/controller";
import User from "../../db/model";
import { ono } from "ono";
import crypto from "crypto";

export default operation(async (req, res) => {
  const Users = User.collection((req as any).db);
  const user = await Users.findOne({ _id: "/" + req.body.email } as any);
  if (!user) {
    throw ono({ status: 404 }, "User not found");
  }
  try {
    user.data.salt = crypto.randomBytes(16).toString("hex");
    await Users.deleteOne({ _id: user._id } as any);
    await Users.insertOne(user);
  } catch (err) {
    const e = new Error("Error generating salt");
    (e as any).reason = err;
    throw e;
  }
  res.status(201).json(user.data.salt);
});
