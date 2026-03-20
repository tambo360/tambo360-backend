import express from "express";
import { listarProductos } from "../controllers/productController";

const router = express.Router();

router.get("/", listarProductos);

export default router;