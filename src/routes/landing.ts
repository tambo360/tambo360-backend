import express from "express";
import { LandingController } from "../controllers/landingController"

const router = express.Router();

router.post("/contacto", LandingController.enviarCorreoContacto);


export default router;
