import { Router } from "express";
import * as EmployeeController from "../controllers/EmployeeController";
import { authorize } from "../middlewares/authMiddleware";
import { UserRole } from "../enums/Role";

const router = Router();
// Middleware to authorize access to employee routes
router.use(authorize([UserRole.ADMIN]));

router
  .route("/")
  .post(EmployeeController.createEmployee)
  .get(EmployeeController.getAllEmployees);

router
  .route("/:id")
  .get(EmployeeController.getEmployeeById)
  .put(EmployeeController.updateEmployee)
  .delete(EmployeeController.deleteEmployee);

export default router;
