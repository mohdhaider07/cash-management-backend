// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import envConfig from "../config/envConfig";
import { UserRole } from "../enums/Role";

export type AuthRequest<TBody = any, TQuery = any> = Request<
  any,
  any,
  TBody,
  TQuery
> & {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
  };
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting 'Bearer <token>'
  // This is only for testing purpose through postman, in production the adminEmail should not be there
  const adminEmail = envConfig.ADMIN_EMAIL;
  // find one user in database if the user role is superAdmin then assign the role to the user
  const admin = await User.findOne({ email: adminEmail });
  if (admin?.role === UserRole.SUPER_ADMIN || admin?.role === UserRole.ADMIN) {
    req.user = {
      _id: admin._id.toString(),
      role: admin.role,
      email: admin.email,
      name: admin.name,
    };
    console.log("Admin user found in database");
    return next();
  }

  if (!token) {
    res.status(401);
    return next(new Error("Access denied. No token provided."));
  }

  try {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET!) as {
      _id: string;
      email: string;
      exp: number; // JWT expiration time
    };

    const user = await User.findById(decoded._id);
    if (!user) {
      res.status(404);
      return next(new Error("User not found."));
    }
    req.user = {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (err: any) {
    if (err == "TokenExpiredError: jwt expired") {
      res.status(403).json({ message: "Token expired." });
      return next(new Error("Token expired."));
    } else {
      res.status(400);
      next(new Error("Invalid token."));
    }
  }
};

export const authorize = (roles: Array<UserRole>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Call authenticate function
      await new Promise<void>((resolve, reject) => {
        authenticate(req, res, (err?: any) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      if (req.user?.role === UserRole.SUPER_ADMIN) {
        return next();
      }

      console.log("User role", req.user?.role);
      console.log("Roles", roles);

      if (!req.user || !roles.includes(req.user.role)) {
        res.status(400);
        return next(new Error("Access forbidden: insufficient permissions."));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
