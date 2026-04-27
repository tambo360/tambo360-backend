import express from "express";
import { registrarEstablecimiento, listarEstablecimientos,/* editarNombreEstablecimiento*/ getEstablishmentById, registrarCuestionario } from "../controllers/establishmentController";
import { authenticate } from "../middleware/authMiddleware";
import { orgContext, requireOrgAccess, establecimientoRequireOrgAccess } from "../middleware/orgMiddleware";

const router = express.Router();

router.use(authenticate);
router.use(orgContext)
router.use(requireOrgAccess);

router.post('/', registrarEstablecimiento);
router.get('/:idEst', getEstablishmentById);
router.get('/', listarEstablecimientos);
router.post('/cuestionario', establecimientoRequireOrgAccess, registrarCuestionario);
router.patch('/editar-nombre', /* editarNombreEstablecimiento */);

export default router;