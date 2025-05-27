// src/routes/authRoutes.ts
import { Router } from "express";
import * as AuthController from "../controllers/AuthController";

const router = Router();

// Public Routes
router.route("/register").post(AuthController.register);
router.route("/login").post(AuthController.login);

export default router;
