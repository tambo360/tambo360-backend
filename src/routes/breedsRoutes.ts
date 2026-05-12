import express from "express";
import { BreedController } from "../controllers/breedsController";
import { authenticate } from "../middleware/authMiddleware";
import { orgContext, requireOrgAccess, establecimientoRequireOrgAccess, estContext } from "../middleware/orgMiddleware";

const router = express.Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);

router.get('/', BreedController.getAllBreeds);


export default router;