import jwt from "jsonwebtoken";
import User from "../models/User.js";

const DEFAULT_DEV_SECRET = "sigmagpt_default_dev_jwt_secret_32_characters_minimum";

export const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
