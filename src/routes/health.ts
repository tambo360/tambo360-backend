import express from "express";
import {check} from '../controllers/healthController';
import { tamboCrudLimiter, tamboGetLimiter } from "../middleware/RateLimit";

const router = express.Router();

router.use((req, res, next) => {
    if (req.method === "GET") {
        return tamboGetLimiter(req, res, next);
    }
    return tamboCrudLimiter(req, res, next);
});

router.get('/', check);

export default router;
