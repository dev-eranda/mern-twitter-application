import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies = async (id, res) => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // info: prevent XSS attacks cross site scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // info: CRFS attacks cross-site request forgery attcks
    maxAge: 7 * 24 * 60 * 60 * 1000, // info: 7d
  });
};
