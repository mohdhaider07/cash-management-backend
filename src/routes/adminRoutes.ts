import express from "express";
import {
  employeePaymentReport,
  getSummaryStats,
  getOutstandingReport,
} from "../controllers/AdminController";
import { authorize } from "../middlewares/authMiddleware";
import { UserRole } from "../enums/Role";

const router = express.Router();

// one middleware for all admin routes
router.use(authorize([UserRole.ADMIN]));

// Endpoint for employee payment report
router.get("/employee-payment-report", employeePaymentReport);

// Endpoint for summary statistics
router.get("/summary-stats", getSummaryStats);

// Endpoint for outstanding report
router.get("/outstanding-report", getOutstandingReport);

export default router;
