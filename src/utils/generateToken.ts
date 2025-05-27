import jwt from "jsonwebtoken";

export const generateToken = (payload: {
  _id: string;
  email: string;
}): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

// Function to generate a token that never expires
export const generateNonExpiringToken = (payload: {
  _id: string; // this id is the member._id
  email: string;
}): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!);
};
