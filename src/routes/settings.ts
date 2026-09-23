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

router.patch("/establecimiento", SettingController.actualizarEstablecimiento);
router.post("/animal", SettingController.crearAnimal);
router.delete("/animal", SettingController.eliminarAnimal);
router.get("/animal/listar", SettingController.listarAnimales)
router.get("/movimiento", SettingController.obtenerMovimientos)
router.patch("/animal", SettingController.actualizarAnimal)
router.post("/animal/transferir", SettingController.transferirAnimal);


router.get("/animal/alta/form-data")
router.get("/animal/baja/form-data")
router.get("/animal/transferir/form-data")

export default router;
