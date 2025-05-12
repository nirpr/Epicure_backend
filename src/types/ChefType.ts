import {Types} from "mongoose";

export type ChefType = {
    name: String,
    image: String,
    description: String,
    restaurants: Types.ObjectId[],
};