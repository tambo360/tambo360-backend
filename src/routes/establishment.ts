import express from "express";
import { registrarEstablecimiento, listarEstablecimientos, editarNombreEstablecimiento } from "../controllers/establishmentController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/registrar', authenticate, registrarEstablecimiento);
router.get('/listar', authenticate, listarEstablecimientos);
router.patch('/editar-nombre', authenticate, editarNombreEstablecimiento);

export default router;