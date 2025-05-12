import { Types } from "mongoose";

export type RestaurantType = {
    name: String;
    image: String;
    chef: Types.ObjectId | null;
    rating: Number;
    dishes: Types.ObjectId[];
  };