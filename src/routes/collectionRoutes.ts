import { Router } from "express";
import * as CollectionController from "../controllers/CollectionController";
import { authorize } from "../middlewares/authMiddleware";
import { UserRole } from "../enums/Role";

const router = Router();

router.use(authorize([UserRole.ADMIN]));

router
  .route("/")
  .post(CollectionController.createCollectionWithAllocation)
  .get(CollectionController.getCollections);

export default router;
