import express from "express";
import { listarProductos } from "../controllers/productController";
import { orgContext, requireOrgAccess } from "../middleware/orgMiddleware";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);

router.get("/", listarProductos);

export default router;