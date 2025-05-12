import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import Chef from "./models/Chef";
import Restaurant from "./models/Restaurant";
import Dish from "./models/Dish";

dotenv.config();
const uri = process.env.MONGODB_URI;

const init = false;

const main = async () => {
  try {
    await mongoose.connect(uri!);

    if (init) {
      const chef = await Chef.create({
        name: "Yuval",
        description: "Modern Asian",
        restaurants: [],
      });

      const restaurant = await Restaurant.create({
        name: "Taizu",
        chef: chef._id,
        dishes: [],
      });

      const dish = await Dish.create({
        name: "Lamb Curry",
        price: 88,
        ingredients: "salt, pepper, lamb",
        restaurant: restaurant._id,
      });

      chef.restaurants.push(restaurant._id);
      await chef.save();

      restaurant.dishes.push(dish._id);
      await restaurant.save();

      console.log("data created successfully!");
    }

    const populatedDish = await Dish.findOne({ name: "Lamb Curry" }).populate({
      path: "restaurant",
    });

    const populateRestaurant = await Restaurant.findOne({
      name: "Mashya",
    }).populate("chef", "name-_id").populate("dishes");

    console.log("Populated Dish:", populatedDish);
    console.log("Populated Restaurant:", populateRestaurant);

    process.exit();
  } catch (err) {
    console.error("connection error:", err);
    process.exit(1);
  }
};

main();
