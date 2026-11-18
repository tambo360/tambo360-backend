import express from "express";
import { obtenerHistoricoMensual } from "../controllers/ia.controller";
import { obtenerContextoEvento } from "../controllers/contexto-evento.controller";

const router = express.Router();

/**
 * Rutas internas del módulo de IA.
 *
 * TODO: incorporar middleware de autenticación interna
 * Node-Python cuando se defina el mecanismo de comunicación
 * segura entre ambos servicios.
 *
 * Hasta entonces, estas rutas no deben exponerse
 * en un entorno público.
 */

// Histórico de resúmenes mensuales.
router.get("/resumenes/:idResumenMensual/historico", obtenerHistoricoMensual);

// Contexto productivo de un evento de IA.
router.get( "/eventos/:idEvento/contexto",  obtenerContextoEvento);

export default router;
