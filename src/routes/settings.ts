import express from "express";
import { authenticate } from "../middleware/authMiddleware"; //agregue esto para el middleware de autenticacion
import { authLimiter } from "../middleware/RateLimit";
import { orgContext, requireOrgAccess, establecimientoRequireOrgAccess, estContext, requireRoles } from "../middleware/orgMiddleware";
import SettingController from "../controllers/settingController";

const router = express.Router();

router.use(authenticate);
router.use(orgContext);
router.use(requireOrgAccess);
router.use(establecimientoRequireOrgAccess);
router.use(estContext);

router.post("/animal", SettingController.crearAnimal);
router.patch("/animal", SettingController.actualizarAnimal)
router.get("/animal/listar", SettingController.listarAnimales)
router.post("/rodeo/transferir", SettingController.transferirRodeo);
router.delete("/animal", SettingController.eliminarAnimal);

router.patch("/establecimiento", SettingController.actualizarEstablecimiento);

router.get("/movimiento", SettingController.obtenerMovimientos)

export default router;
