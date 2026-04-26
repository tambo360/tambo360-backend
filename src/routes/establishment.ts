import express from "express";
import { registrarEstablecimiento, listarEstablecimientos, editarNombreEstablecimiento, getEstablishmentById } from "../controllers/establishmentController";
import { authenticate } from "../middleware/authMiddleware";
import { orgContext, requireOrgAccess } from "../middleware/orgMiddleware";

const router = express.Router();

router.use(authenticate);
router.use(orgContext)
router.use(requireOrgAccess);

router.post('/registrar', registrarEstablecimiento);
router.get("/establecimiento/:idEst",  getEstablishmentById);
router.get('/listar', listarEstablecimientos);
router.patch('/editar-nombre', editarNombreEstablecimiento);

export default router;