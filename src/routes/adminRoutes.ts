import express from "express";
import {
  employeePaymentReport,
  getSummaryStats,
  getOutstandingReport,
} from "../controllers/AdminController";

const router = express.Router();

// Endpoint for employee payment report
router.get("/employee-payment-report", employeePaymentReport);

// Endpoint for summary statistics
router.get("/summary-stats", getSummaryStats);

// Endpoint for outstanding report
router.get("/outstanding-report", getOutstandingReport);

export default router;
