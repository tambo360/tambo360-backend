import { Router } from "express"
import  MermaController from "../controllers/mermaController"
import { establecimientoRequireOrgAccess, estContext, orgContext, requireOrgAccess, requireRoles } from "../middleware/orgMiddleware";
import { authenticate } from "../middleware/authMiddleware";
import { RolEstablecimiento } from "@prisma/client";

const router = Router()

router.use(authenticate);

router.get("/tipos", MermaController.getTipos)

router.use(orgContext);
router.use(requireOrgAccess);
router.use(estContext);
router.use(establecimientoRequireOrgAccess);

router.post("/", MermaController.create)
router.get("/", MermaController.findAll)
router.get("/:id", MermaController.findById)
router.put("/:id", MermaController.update)
router.delete("/:id",requireRoles({ est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE] }), MermaController.delete)

export default router