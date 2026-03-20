import express from "express";
import { register, login, verifyEmail, resendVerificationEmail, forgotPassword, verifyResetPasswordToken, resetPassword, getMe, logout } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware"; //agregue esto para el middleware de autenticacion

const router = express.Router();

router.post("/crear-cuenta", register);
router.post("/verificar-email", verifyEmail);
router.post("/reenviar-verificacion", resendVerificationEmail);
router.post("/iniciar-sesion", login);
router.post("/contrasena-olvidada", forgotPassword);
router.post("/verificar-restablecer-contrasena", verifyResetPasswordToken);
router.post("/restablecer-contrasena", resetPassword)
router.post("/logout", authenticate, logout)

//router.get("/me", getMe);
router.get("/me", authenticate, getMe); //para proteger la ruta para que no devuelva siempre error 401

export default router;
