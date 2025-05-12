import { Schema, model } from "mongoose";
import { ChefType } from "../types/ChefType";

const chefSchema = new Schema<ChefType>({
    name: String,
    image: String,
    description: String,
    restaurants: [{ type: Schema.Types.ObjectId, ref: "Restaurant" }],
});

chefSchema.set("toJSON", {
    transform: (_doc, ret) => {
      delete ret.__v;
      return ret;
    }
  });

const Chef = model<ChefType>("Chef", chefSchema);
export default Chef;
