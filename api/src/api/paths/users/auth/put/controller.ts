import { operation } from "../../../../../functions/controller";
import User from "../../db/model";
import { ono } from "ono";
import { sha512 } from "js-sha512";
import jwt from "jsonwebtoken";

export default operation(async (req, res) => {
  const Users = User.collection((req as any).db);
  const user = await Users.findOne({ _id: "/" + req.body.email } as any);
  if (!user) {
    throw ono({ status: 404 }, "User not found");
  }
  const salt = user.data.salt;
  delete user.data.salt;
  await Users.deleteOne({ _id: user._id } as any);
  await Users.insertOne(user);
  if (!salt || req.body.secondHash !== sha512(user.data.passwordHash! + salt)) {
    throw ono({ status: 403 }, "Authentication failed");
  }
  res
    .status(201)
    .json(
      jwt.sign(
        { email: user.data.email, name: user.data.name },
        process.env.JWT_SECRET!
      )
    );
});
