import express from "express";
import { AlertController } from "../controllers/alertController";

const router = express.Router();

router.get("/:idEstablecimiento", AlertController.getAlertas);
router.get("/:idEstablecimiento/ultimas", AlertController.getUltimasAlertas);
router.put("/:idAlerta/visto", AlertController.marcarAlertaVisto);

router.get("/:idEstablecimiento/no-vistas", AlertController.getAlertasNoVistasCount);

router.get("/:idEstablecimiento/lote/:idLote", AlertController.getAlertasPorLote);

export default router;
