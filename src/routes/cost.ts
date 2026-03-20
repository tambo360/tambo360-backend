import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { crearCosto, obtenerCostoPorId, obtenerCostosPorLote, actualizarCosto, eliminarCosto } from "../controllers/costController";


const router = Router();

router.post("/registrar", authenticate, crearCosto);
router.get("/costos-lote/:loteId", authenticate, obtenerCostosPorLote);
router.get("/detalle/:id", authenticate, obtenerCostoPorId);
router.put("/actualizar/:id", authenticate, actualizarCosto);
router.delete("/eliminar/:id", authenticate, eliminarCosto);

export default router;
