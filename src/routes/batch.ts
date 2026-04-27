import express from "express";
import { authenticate } from "../middleware/authMiddleware";
//import { crearLote, editarLote, listarLotes, obtenerLote, eliminarLote, produccionDelDia, completarLote } from "../controllers/batchController";
import { aiLimiter } from "../middleware/RateLimit";

const router = express.Router();
/*
router.post('/registrar', authenticate, crearLote);
router.put('/actualizar/:idLote', authenticate, editarLote);

router.get("/listar", authenticate, listarLotes);
router.get("/buscar-lote/:idLote", authenticate, obtenerLote);
router.get("/produccion-hoy", authenticate, produccionDelDia);
router.delete("/eliminar/:idLote", authenticate, eliminarLote);
router.post("/completar/:idLote", authenticate, aiLimiter, completarLote);
*/

export default router;
