import express from "express";
import { register, login, verifyEmail, resendVerificationEmail, forgotPassword, verifyResetPasswordToken, resetPassword, getMe, logout } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware"; //agregue esto para el middleware de autenticacion
import { authLimiter } from "../middleware/RateLimit";

const router = express.Router();

router.post("/crear-cuenta", authLimiter, register);
router.post("/verificar-email",authLimiter, verifyEmail);
router.post("/reenviar-verificacion", authLimiter, resendVerificationEmail);
router.post("/iniciar-sesion", authLimiter, login);
router.post("/contrasena-olvidada", authLimiter, forgotPassword);
router.post("/verificar-restablecer-contrasena", authLimiter, verifyResetPasswordToken);
router.post("/restablecer-contrasena", authLimiter, resetPassword);
router.post("/logout", authenticate, logout);

//router.get("/me", getMe);
router.get("/me", authenticate, getMe); //para proteger la ruta para que no devuelva siempre error 401

export default router;
