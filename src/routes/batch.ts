import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { crearLote, listarLotes, eliminarLote, obtenerLote/* editarLote,  , , produccionDelDia, completarLote */} from "../controllers/batchController";
import { aiLimiter } from "../middleware/RateLimit";
//import { orgContext, estContext, requireOrgAccess, establecimientoRequireOrgAccess} from "../middleware/orgMiddleware";
import { establecimientoRequireOrgAccess, estContext, orgContext, requireOrgAccess, requireRoles } from "../middleware/orgMiddleware";
import { RolEstablecimiento } from "@prisma/client";

const router = express.Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);
router.use(estContext);
router.use(establecimientoRequireOrgAccess);

router.post('/', crearLote);

// Listar lotes paginados con filtros
router.get("/listar", listarLotes);

router.delete("/:idLote", requireRoles({est: [RolEstablecimiento.ADMIN, RolEstablecimiento.OWNER]}), eliminarLote);
router.get("/buscar/:idLote", obtenerLote);

/*
router.put('/actualizar/:idLote', authenticate, editarLote);


router.get("/produccion-hoy", authenticate, produccionDelDia);

router.post("/completar/:idLote", authenticate, aiLimiter, completarLote);
*/

export default router;
