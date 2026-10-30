import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { ProfileController } from "../controllers/profileController";
import { tamboCrudLimiter, tamboGetLimiter } from "../middleware/RateLimit";


const router = express.Router();

router.use(authenticate);

router.use((req, res, next) => {
    if (req.method === "GET") {
        return tamboGetLimiter(req, res, next);
    }
    return tamboCrudLimiter(req, res, next);
});


router.get('/invitaciones', ProfileController.getInvitations);
router.post('/invitaciones/org', ProfileController.respondOrganizationInvitation);
router.post('/invitaciones/est', ProfileController.respondEstablishmentInvitation);
//eliminar usuarios de establecimientos (solo dueño)

export default router;