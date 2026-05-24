import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { eliminarCosto } from "../controllers/costController";
import { RolEstablecimiento } from "@prisma/client";
import { orgContext, estContext, requireOrgAccess, establecimientoRequireOrgAccess, requireRoles } from "../middleware/orgMiddleware";

const router = Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);
router.use(estContext);
router.use(establecimientoRequireOrgAccess);

/*
router.post("/registrar", authenticate, crearCosto);
router.get("/costos-lote/:loteId", authenticate, obtenerCostosPorLote);
router.get("/detalle/:id", authenticate, obtenerCostoPorId);
router.put("/actualizar/:id", authenticate, actualizarCosto);
*/

router.delete(
    "/:id",
    requireRoles({ est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN] }),
    eliminarCosto
);

export default router;
