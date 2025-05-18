import { Schema, model } from "mongoose";
import {UserType} from "../types/UserType"; 

const UserSchema = new Schema<UserType>({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export default model<UserType>("User", UserSchema);