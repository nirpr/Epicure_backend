import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import Chef from "../models/Chef";
import Restaurant from "../models/Restaurant";
import Dish from "../models/Dish";
import "../models/Dish";
import { RestaurantType } from "../types/RestaurantType";
import { DishType } from "../types/DishType";
import { restaurants } from "../data_consts/restaurantData";

async function linkDishAndRestaurant(
    dish: HydratedDocument<DishType>,
    restaurantName: string
) {
    const restaurant = await Restaurant.findOne({ name: restaurantName });

    if (!restaurant) {
        console.error(`restaurant '${restaurantName}' not found.`);
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

export const getAllDishes = async (req: Request, res: Response) => {
    try {
        const dishes = await Dish.find().populate("restaurant");
        res.json(dishes);
    } catch (error) {
        console.error("Error fetching dishes:", error);
        res.status(500).json({ error: "Failed to fetch dishes" });
    }
};

export const addDish = async (req: Request, res: Response) => {
    try {
        const { name, price, image, ingredients, tags, restaurant } = req.body;
        const newDish = new Dish({
            name,
            price,
            image,
            ingredients,
            tags,
        });
        await newDish.save();

        await linkDishAndRestaurant(newDish, restaurant);

        res.status(201).json(newDish);
    } catch (error) {
        console.error("Error creating dish:", error);
        res.status(500).json({ error: "Failed to create dish" });
    }
};

export const deleteDish = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const dish = await Dish.findById(id);

        if (!dish) {
            console.error("Dish not found");
            res.status(404).json({ error: "Dish not found" });
            return;
        }

        if (dish.restaurant) {
            await Restaurant.findByIdAndUpdate(dish.restaurant, {
                $pull: { dishes: dish._id },
            });
        }

        await dish.deleteOne();
        res.status(200).json({ message: "Dish deleted successfully" });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Failed to delete dish" });
    }
};

export const patchDish = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            price,
            image,
            ingredients,
            tags,
            restaurant: restaurantName,
        } = req.body;

        const dish = await Dish.findById(id);
        if (!dish) {
            res.status(404).json({ error: "Dish not found" });
            return;
        }

        if (name !== undefined) dish.name = name;
        if (image !== undefined) dish.image = image;
        if (ingredients !== undefined) dish.ingredients = ingredients;
        if (tags !== undefined) dish.tags = tags;


        if (restaurantName) {
            if (dish.restaurant) {
                await Restaurant.findByIdAndUpdate(dish.restaurant, {
                    $pull: { dishes: dish._id },
                });
            }

            await linkDishAndRestaurant(dish, restaurantName);
        }

        await dish.save();
        res.status(200).json(dish);
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Failed to update dish" });
    }
};
