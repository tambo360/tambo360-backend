import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { ProfileController } from "../controllers/profileController";


const router = express.Router();

router.use(authenticate);


router.get('/invitaciones', ProfileController.getInvitations);
router.post('/invitaciones/org', ProfileController.respondOrganizationInvitation);
router.post('/invitaciones/est', ProfileController.respondEstablishmentInvitation);


export default router;