import express from "express";
import { listarProductos } from "../controllers/productController";
import { orgContext, requireOrgAccess } from "../middleware/orgMiddleware";
import { authenticate } from "../middleware/authMiddleware";
import { tamboCrudLimiter, tamboGetLimiter } from "../middleware/RateLimit";

const router = express.Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);

router.use((req, res, next) => {
    if (req.method === "GET") {
        return tamboGetLimiter(req, res, next);
    }
    return tamboCrudLimiter(req, res, next);
});

router.get("/", listarProductos);

export default router;