import express from "express";
import { authenticate } from "../middleware/authMiddleware"; //agregue esto para el middleware de autenticacion
import { authLimiter } from "../middleware/RateLimit";
import { orgContext, requireOrgAccess, establecimientoRequireOrgAccess, estContext, requireRoles } from "../middleware/orgMiddleware";
import SettingController  from "../controllers/settingController";

const router = express.Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);
router.use(establecimientoRequireOrgAccess);
router.use(estContext);

router.post("/rodeo", );
router.post("/rodeo/transferir", SettingController.transferirRodeo);
router.delete("/rodeo", );

export default router;
