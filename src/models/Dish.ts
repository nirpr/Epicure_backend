import { Schema, model } from "mongoose";
import { DishType } from "../types/DishType";

const dishSchema = new Schema<DishType>({
    name: String,
    price: Number,
    image: String,
    ingredients: String,
    tags: [{ type: String }],
    restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant" },
});

const Dish = model<DishType>("Dish", dishSchema);
export default Dish;
