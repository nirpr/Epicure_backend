import { Types } from "mongoose";

export type DishType = {
  name: String;
  price: Number;
  image: String;
  ingredients: String;
  tags: String[];
  restaurant: Types.ObjectId | null;
};
