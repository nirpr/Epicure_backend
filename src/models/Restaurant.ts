import { Schema, model } from "mongoose";
import { RestaurantType } from "../types/RestaurantType";

const restaurantSchema = new Schema<RestaurantType>({
    name: String,
    image: String,
    chef: { type: Schema.Types.ObjectId, ref: "Chef" },
    rating: Number,
    dishes: [{ type: Schema.Types.ObjectId, ref: "Dish" }],
});

const Restaurant = model<RestaurantType>("Restaurant", restaurantSchema);
export default Restaurant;
