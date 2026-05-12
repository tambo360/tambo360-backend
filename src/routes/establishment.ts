import express from "express";
import { registrarEstablecimiento, listarEstablecimientos,/* editarNombreEstablecimiento*/ getEstablishmentById, registrarCuestionario, getCuestionario, sendInvitation } from "../controllers/establishmentController";
import { authenticate } from "../middleware/authMiddleware";
import { orgContext, requireOrgAccess, establecimientoRequireOrgAccess, estContext, requireRoles } from "../middleware/orgMiddleware";
import { RolEstablecimiento, RolOrganizacion } from "@prisma/client";

const router = express.Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);

router.post('/', registrarEstablecimiento);
router.get('/:idEst', getEstablishmentById);
router.get('/', listarEstablecimientos);
router.post('/cuestionario', estContext, establecimientoRequireOrgAccess, registrarCuestionario);
router.get('/cuestionario/info', estContext, establecimientoRequireOrgAccess, getCuestionario);
router.patch('/editar-nombre', /* editarNombreEstablecimiento */);
router.post('/invitacion', estContext, establecimientoRequireOrgAccess, sendInvitation);

router.get('/test/rolMiddle', estContext, establecimientoRequireOrgAccess, requireRoles({est: [RolEstablecimiento.OWNER], org: [RolOrganizacion.ORG_OWNER]}));

export default router;