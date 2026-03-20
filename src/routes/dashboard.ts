import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { listarPorMes, loteGrafico } from "../controllers/dashboardController";


const router = express.Router();

router.get("/mes-actual", authenticate, listarPorMes)
router.get("/grafico", authenticate, loteGrafico)


export default router;