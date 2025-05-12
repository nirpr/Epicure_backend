import mongoose from "mongoose";
import dotenv from "dotenv";
import { chefs } from "../data_consts/chefData";
import { restaurants } from "../data_consts/restaurantData";
import { dishData } from "../data_consts/dishData";
import Chef from "../models/Chef";
import Restaurant from "../models/Restaurant";
import Dish from "../models/Dish";

dotenv.config();
const deletePrior = true;
const inserts = true;

const resToChefDict: Record<string, string[]> = {
  "Ran Shmueli": ["Claro"],
  "Yuval Ben Neriah": ["Taizu"],
  "Yossi Shitrit": ["Kitchen Market", "Mashya", "Onza"],
  "Yariv Malili": ["Kab Kem"],
  "Aviv Moshe": ["Messa"],
  "Shahaf Shabtay": ["Nithan Thai"],
  "Yanir Green": ["Tiger Lily"],
};

async function linkRestaurantToChef(chefName: string, restaurantName: string) {
  const chef = await Chef.findOne({ name: chefName });
  const restaurant = await Restaurant.findOne({ name: restaurantName });

  if (!chef) {
    console.error(`Chef '${chefName}' not found.`);
    return;
  }

  if (!restaurant) {
    console.error(`Restaurant '${restaurantName}' not found.`);
    return;
  }

  restaurant.chef = chef._id;
  await restaurant.save();

  chef.restaurants.push(restaurant._id);
  await chef.save();

  console.log(`Linked ${restaurantName} to ${chefName}.`);
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    if (deletePrior) {
      await Chef.deleteMany({});
      await Restaurant.deleteMany({});
      await Dish.deleteMany({});
    }

    if (inserts) {
      await Chef.insertMany(chefs);
      console.log("Chefs inserted");

      await Restaurant.insertMany(restaurants);
      console.log("Restaurants inserted");

      await Dish.insertMany(dishData);
      console.log("Dishes inserted");

      for (const [chefName, restaurantNames] of Object.entries(resToChefDict)) {
        for (const restaurantName of restaurantNames) {
          await linkRestaurantToChef(chefName, restaurantName);
        }
      }
    }

    const restAndChefAggr = await Chef.aggregate([
      {
        $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "chef",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },
      {
        $group: {
          _id: "$name",
          restaurantCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          chefName: "$_id",
          restaurantCount: 1,
        },
      },
      { $sort: { restaurantCount: -1 } },
      { $limit: 1 },
    ]);

    console.log("Chef restaurant aggregation result:");
    console.log(restAndChefAggr);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();
