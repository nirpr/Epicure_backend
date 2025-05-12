import express from "express";
import {
    getAllRestaurants,
    addRestaurant,
    patchRestaurant,
    deleteRestaurant,
} from "../controllers/restaurantController";

const router = express.Router();

router.get("/", getAllRestaurants);
router.post("/", addRestaurant);
router.patch("/:id", patchRestaurant);
router.delete("/:id", deleteRestaurant);

export default router;
