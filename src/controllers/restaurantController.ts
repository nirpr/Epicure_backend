import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import Chef from "../models/Chef";
import Restaurant from "../models/Restaurant";
import Dish from "../models/Dish";
import "../models/Dish";
import { RestaurantType } from "../types/RestaurantType";
import { DishType } from "../types/DishType";

async function linkRestaurantAndChef(
    restaurant: HydratedDocument<RestaurantType>,
    chefName: String
) {
    const chef = await Chef.findOne({ name: chefName });

    if (!chef) {
        console.error(`Chef '${chefName}' not found.`);
        return;
    }

    restaurant.chef = chef._id;
    await restaurant.save();

    chef.restaurants.push(restaurant._id);
    await chef.save();

    console.log(`Linked ${restaurant.name} to ${chefName}.`);
}

async function linkDishAndRestaurant(
    restaurant: HydratedDocument<RestaurantType>,
    dishName: string
) {
    const dish = await Dish.findOne({ name: dishName });

    if (!dish) {
        console.error(`Dish '${dishName}' not found.`);
        return;
    }

    dish.restaurant = restaurant._id;
    await dish.save();

    restaurant.dishes.push(dish._id);
    await restaurant.save();

    console.log(
        `Linked dish '${dish.name}' to restaurant '${restaurant.name}'`
    );
}

async function linkRestaurantAndDishObjects(
    restaurant: HydratedDocument<RestaurantType>,
    dish: HydratedDocument<DishType>
) {
    dish.restaurant = restaurant._id;
    await dish.save();

    restaurant.dishes.push(dish._id);
    await restaurant.save();

    console.log(
        `Linked dish '${dish.name}' to restaurant '${restaurant.name}'`
    );
}

export const getAllRestaurants = async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find()
            .populate("chef", "name")
            .populate("dishes", "name");
        res.json(restaurants);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ error: "Failed to fetch restaurants" });
    }
};

export const addRestaurant = async (req: Request, res: Response) => {
    try {
        const {
            name,
            image,
            chef: chefName,
            dishes: dishesNames = [],
        } = req.body;
        const newRestaurant = new Restaurant({
            name,
            image,
            dishes: [],
        });
        await newRestaurant.save();

        await linkRestaurantAndChef(newRestaurant, chefName);

        for (const dishName of dishesNames) {
            await linkDishAndRestaurant(newRestaurant, dishName);
        }
        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error("Error creating chef:", error);
        res.status(500).json({ error: "Failed to create chef" });
    }
};

export const deleteRestaurant = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            console.error("Restaurant not found");
            res.status(404).json({ error: "Restaurant not found" });
            return;
        }

        if (restaurant.chef) {
            await Chef.findByIdAndUpdate(restaurant.chef, {
                $pull: { restaurants: restaurant._id },
            });
        }

        if (restaurant.dishes) {
            await Dish.updateMany(
                { restaurant: restaurant._id },
                { $unset: { restaurant: "" } }
            );
        }

        await restaurant.deleteOne();

        res.status(200).json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        console.error("Error deleting restaurant", error);
        res.status(500).json({ error: "Failed to delete restaurant" });
    }
};

export const patchRestaurant = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            image,
            chef: chefName,
            rating,
            dishes: dishesNames,
        } = req.body;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            console.error("Restaurant not found");
            res.status(404).json({ error: "Restaurant not found" });
            return;
        }

        if (name !== undefined) restaurant.name = name;
        if (image !== undefined) restaurant.image = image;
        if (rating !== undefined) restaurant.rating = rating;

        if (chefName) {
            if (restaurant.chef) {
                await Chef.findByIdAndUpdate(restaurant.chef, {
                    $pull: { restaurants: restaurant._id },
                });
            }
            await linkRestaurantAndChef(restaurant, chefName);
        }

        if (dishesNames) {
            if (restaurant.dishes) {
                const dishes = await Dish.find({ name: { $in: dishesNames } });

                for (const dish of dishes) {
                    if (!restaurant.dishes.includes(dish._id)) {
                        await linkRestaurantAndDishObjects(restaurant, dish);
                    }
                }
            }
        }

        await restaurant.save();
        res.status(201).json(restaurant);
    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({ error: "Failed to update restaurant" });
    }
};
