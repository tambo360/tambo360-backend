import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { establecimientoRequireOrgAccess, estContext, orgContext, requireOrgAccess, requireRoles } from "../middleware/orgMiddleware";
import { RolEstablecimiento } from "@prisma/client";
import { DashboardController} from "../controllers/dashboardController";


const router = express.Router();


router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);
router.use(estContext);
router.use(establecimientoRequireOrgAccess);

router.get("/costos", requireRoles({ est: [RolEstablecimiento.ADMIN, RolEstablecimiento.OWNER] }), DashboardController.costosPorCategoria)
/*
router.get("/mes-actual", authenticate, listarPorMes)
router.get("/grafico", authenticate, loteGrafico)

*/
export default router;