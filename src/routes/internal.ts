import express from "express";

import iaRoutes from "../module/ia/routes/ia.routes";

const router = express.Router();

// Rutas internas del módulo de Inteligencia Artificial
router.use("/ia", iaRoutes);

export default router;