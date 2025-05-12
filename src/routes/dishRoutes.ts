import express from "express";
import { getAllDishes, addDish, patchDish, deleteDish } from "../controllers/dishController";

const router = express.Router();

router.get("/", getAllDishes);
router.post("/", addDish);
router.patch("/:id", patchDish);
router.delete("/:id", deleteDish);

export default router;