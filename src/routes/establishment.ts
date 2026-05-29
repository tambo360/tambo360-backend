import express from "express";
import { registrarEstablecimiento, listarEstablecimientos,/* editarNombreEstablecimiento*/ getEstablishmentById, registrarCuestionario, getCuestionario, sendInvitation, deleteInvitation } from "../controllers/establishmentController";
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
router.post('/cuestionario', estContext, establecimientoRequireOrgAccess, requireRoles({est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN], org: [RolOrganizacion.ORG_OWNER]}), registrarCuestionario);
router.get('/cuestionario/info', estContext, establecimientoRequireOrgAccess, getCuestionario);
router.patch('/editar-nombre', /* editarNombreEstablecimiento */);
router.post('/invitacion', estContext, establecimientoRequireOrgAccess, sendInvitation);
router.delete('/invitacion/:idInvitacion', estContext, establecimientoRequireOrgAccess, requireRoles({est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN]}), deleteInvitation);

router.get('/test/rolMiddle', estContext, establecimientoRequireOrgAccess, requireRoles({est: [RolEstablecimiento.OWNER], org: [RolOrganizacion.ORG_OWNER]}));

export default router;