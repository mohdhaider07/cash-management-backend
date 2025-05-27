import { Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";
import { z } from "zod";
import asyncRequestHandler from "../middlewares/asyncRequestHandler";
import { AuthRequest } from "../middlewares/authMiddleware";
import { generateToken } from "../utils/generateToken";
import { UserRole } from "../enums/Role";

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});
// register funtcion
export const register = asyncRequestHandler(
  { body: registerSchema },
  async (req: AuthRequest, res: Response) => {
    const { email, name, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });
    await user.save();

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  }
);
// login funtion
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const login = asyncRequestHandler(
  { body: loginSchema },
  async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("invalid email or password");
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (isMatched) {
      const token = generateToken({ _id: user._id, email: user.email });
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
      });
    } else {
      res.status(401);
      throw new Error("invalid password");
    }
  }
);
