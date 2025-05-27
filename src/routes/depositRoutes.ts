import { Router } from "express";
import * as DepositController from "../controllers/DepositController";
import { authorize } from "../middlewares/authMiddleware";
import { UserRole } from "../enums/Role";

const router = Router();

router.use(authorize([UserRole.ADMIN]));

router
  .route("/")
  .post(DepositController.createDeposit)
  .get(DepositController.getDepositsByEmployee);

export default router;
