import { ono } from "ono";
import { operation } from "../../../../../functions/controller";
import User from "../../db/model";

export default operation(async (req, res) => {
  const Users = User.collection((req as any).db);
  const user = await Users.findOne({ _id: "/" + (req as any).id.email } as any);
  if (!user) {
    throw ono({ status: 404 }, "User not found");
  }
  res.status(201).json({ ...user.data, passwordHash: undefined });
});
