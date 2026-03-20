import express from "express";
import { registrarMerma, actualizarMerma, obtenerMermaPorId } from "../controllers/decreseController";

const router = express.Router();

router.post('/registrar', registrarMerma);
router.put("/:id", actualizarMerma);
router.get("/:id", obtenerMermaPorId);

export default router;