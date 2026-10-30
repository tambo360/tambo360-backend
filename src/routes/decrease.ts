import express from "express";
import { registrarMerma, actualizarMerma, obtenerMermaPorId } from "../controllers/decreseController";
import { tamboCrudLimiter, tamboGetLimiter } from "../middleware/RateLimit";

const router = express.Router();

router.use((req, res, next) => {
    if (req.method === "GET") {
        return tamboGetLimiter(req, res, next);
    }
    return tamboCrudLimiter(req, res, next);
});

router.post('/registrar', registrarMerma);
router.put("/:id", actualizarMerma);
router.get("/:id", obtenerMermaPorId);

export default router;

//REVISAR ARCHIVOS POSIBLEMENTE SIN USO