import express from "express";
import { getAllChefs, addChef, getChefById, patchChef, deleteChef } from "../controllers/chefController";

const router = express.Router();

router.get("/", getAllChefs);
router.get("/:id", getChefById);
router.post("/", addChef);
router.patch("/:id", patchChef);
router.delete("/:id", deleteChef);

export default router;
