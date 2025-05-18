import express from "express";
import { login, register } from "../controllers/authController";



const router = express.Router();

router.post("/local", login);
router.post("/local/register", register);

export default router;