import { Router } from "express"
import MermaController from "../controllers/mermaController"
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
/*
router.post("/", MermaController.create)
router.get("/", MermaController.findAll)
router.get("/:id", MermaController.findById)
router.delete("/:id",requireRoles({ est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE] }), MermaController.delete)
*/

router.post("/", requireRoles({
  est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE]
}),
  MermaController.create)

router.get("/", requireRoles({
  est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE]
}),
  MermaController.findAll)

router.get("/:id", requireRoles({
  est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE]
}),
  MermaController.findById)

router.put("/:id", requireRoles({
  est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE]
}),
  MermaController.update)

router.delete("/:id", requireRoles({
  est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE]
}),
  MermaController.delete)

router.patch("/:id", requireRoles({
  est: [RolEstablecimiento.OWNER, RolEstablecimiento.ADMIN, RolEstablecimiento.EMPLOYEE]
}), MermaController.update)

export default router