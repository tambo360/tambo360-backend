import express from "express";
import { LandingController } from "../controllers/landingController"
import { tamboCrudLimiter, tamboGetLimiter } from "../middleware/RateLimit";

const router = express.Router();

router.use((req, res, next) => {
    if (req.method === "GET") {
        return tamboGetLimiter(req, res, next);
    }
    return tamboCrudLimiter(req, res, next);
});

router.post("/contacto", LandingController.enviarCorreoContacto);


export default router;
