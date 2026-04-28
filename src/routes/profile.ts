import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { ProfileController } from "../controllers/profileController";


const router = express.Router();

router.use(authenticate);


router.get('/invitaciones', ProfileController.getInvitations);


export default router;