import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { orgContext, estContext, requireOrgAccess, establecimientoRequireOrgAccess, requireRoles } from "../middleware/orgMiddleware";
import { crear, listar, actualizar, eliminar } from "../controllers/costoGeneralController";
import { RolEstablecimiento } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);
router.use(estContext);
router.use(establecimientoRequireOrgAccess);

router.post("/", requireRoles({ est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN] }), crear);
router.get("/", listar);
router.patch("/:id", requireRoles({ est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN] }), actualizar);
router.delete("/:id", requireRoles({ est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN] }), eliminar);

export default router;