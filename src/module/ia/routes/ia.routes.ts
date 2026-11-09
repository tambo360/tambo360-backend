import express from "express";

import { obtenerHistoricoMensual } from "../controllers/ia.controller";

const router = express.Router();

/**
 * Histórico de resúmenes mensuales.
 *
 * TODO: incorporar aquí el middleware de autenticación interna
 * Node-Python cuando se defina el mecanismo de comunicación
 * segura entre ambos servicios.
 * Hasta que se acuerde e integre la autenticación, esta ruta no debe exponerse en un entorno público.
 */
router.get("/resumenes/:idResumenMensual/historico", obtenerHistoricoMensual);

export default router;
