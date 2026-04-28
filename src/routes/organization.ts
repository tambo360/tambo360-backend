import express from "express";
import { authenticate } from "../middleware/authMiddleware"; //agregue esto para el middleware de autenticacion
import { OrganizationController } from "../controllers/organizationController";
import { orgContext, requireOrgAccess } from "../middleware/orgMiddleware";

const router = express.Router();

router.use(authenticate); 

router.post("/", OrganizationController.createOrganization);
router.get("/", OrganizationController.getOrganizations);
router.get("/:id", OrganizationController.getOrganizationById);
router.post('/invitacion', orgContext, requireOrgAccess,OrganizationController.sendInvitation);

export default router;
