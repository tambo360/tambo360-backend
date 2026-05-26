import { Router } from "express"
import  MermaController from "../controllers/mermaController"

const router = Router()

router.get("/tipos", MermaController.getTipos)
router.post("/", MermaController.create)
router.get("/", MermaController.findAll)
router.get("/:id", MermaController.findById)
router.put("/:id", MermaController.update)
router.delete("/:id", MermaController.delete)

export default router