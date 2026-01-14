import jwt from "jsonwebtoken";
import requiredConfig from "../config/requiredConfig";

const JWT_SECRET = requiredConfig.JWT_SECRET;

export const signAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export const signRefreshToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}