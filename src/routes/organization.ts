import express from "express";
import { authenticate } from "../middleware/authMiddleware"; //agregue esto para el middleware de autenticacion
import { OrganizationController } from "../controllers/organizationController";

const router = express.Router();

router.use(authenticate); 

router.post("/", OrganizationController.createOrganization);
router.get("/", OrganizationController.getOrganizations);
router.get("/:id", OrganizationController.getOrganizationById);


export default router;
