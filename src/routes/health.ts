import express from "express";
import {check} from '../controllers/healthController';

const router = express.Router();

router.get('/', check);

export default router;
