import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { establecimientoRequireOrgAccess, estContext, orgContext, requireOrgAccess, requireRoles } from "../middleware/orgMiddleware";
import { RolEstablecimiento } from "@prisma/client";
import { DashboardController } from "../controllers/dashboardController";
import { tamboCrudLimiter, tamboGetLimiter } from "../middleware/RateLimit";


const router = express.Router();


router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);
router.use(estContext);
router.use(establecimientoRequireOrgAccess);

router.use((req, res, next) => {
    if (req.method === "GET") {
        return tamboGetLimiter(req, res, next);
    }
    return tamboCrudLimiter(req, res, next);
});

router.get("/costos", requireRoles({ est: [RolEstablecimiento.ADMIN, RolEstablecimiento.OWNER] }), DashboardController.costosPorCategoria)

router.get("/mes-actual", DashboardController.mesActual)
router.get("/grafico", DashboardController.grafico)
router.get("/litros-libres", DashboardController.litrosLibres);
router.get("/costos-generales", DashboardController.graficoCostosGenerales);
router.get("/precio-mercado", DashboardController.precioMercado);


export default router;