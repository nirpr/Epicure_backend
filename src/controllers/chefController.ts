import { Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import Chef from "../models/Chef";
import Restaurant from "../models/Restaurant";
import "../models/Restaurant";
import { ChefType } from "../types/ChefType";
import { RestaurantType } from "../types/RestaurantType";

async function linkChefAndRestaurant(
    chef: HydratedDocument<ChefType>,
    restaurantName: String
) {
    const restaurant = await Restaurant.findOne({ name: restaurantName });

    if (!restaurant) {
        console.error(`Restaurant '${restaurantName}' not found.`);
        return;
    }

    restaurant.chef = chef._id;
    await restaurant.save();

    chef.restaurants.push(restaurant._id);
    await chef.save();

    console.log(`Linked ${restaurantName} to ${chef.name}.`);
}

async function linkChefAndRestaurantObjects(
    chef: HydratedDocument<ChefType>,
    restaurant: HydratedDocument<RestaurantType>
) {
    restaurant.chef = chef._id;
    await restaurant.save();

    chef.restaurants.push(restaurant._id);
    await chef.save();

    console.log(`Linked ${restaurant.name} to ${chef.name}.`);
}

export const getAllChefs = async (req: Request, res: Response) => {
    try {
        const chefs = await Chef.find().populate("restaurants");
        res.json(chefs);
    } catch (error) {
        console.error("Error fetching chefs:", error);
        res.status(500).json({ error: "Failed to fetch chefs" });
    }
};

export const getChefById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const chef = await Chef.findById(id);

        if (!chef) {
            console.error("Chef not found");
            res.status(404).json({ error: "Chef not found" });
            return;
        }

        const populatedChef = await chef.populate("restaurants", "name");

        res.json(populatedChef);
    } catch (error) {
        console.error("Error fetching chef:", error);
        res.status(500).json({ error: "Failed to fetch chef" });
    }
};

export const addChef = async (req: Request, res: Response) => {
    try {
        const {
            name,
            image,
            description,
            restaurants: restaurantNames = [],
        } = req.body;
        const newChef = new Chef({ name, image, description, restaurants: [] });
        await newChef.save();

        for (const restaurantName of restaurantNames) {
            await linkChefAndRestaurant(newChef, restaurantName);
        }
        res.status(201).json(newChef);
    } catch (error) {
        console.error("Error creating chef:", error);
        res.status(500).json({ error: "Failed to create chef" });
    }
};

export const patchChef = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            image,
            description,
            restaurants: restaurantNames,
        } = req.body;

        const chef = await Chef.findById(id);
        if (!chef) {
            res.status(404).json({ error: "Chef not found" });
            return;
        }

        if (name !== undefined) chef.name = name;
        if (image !== undefined) chef.image = image;
        if (description !== undefined) chef.description = description;

        if (restaurantNames) {
            const restaurants = await Restaurant.find({
                name: { $in: restaurantNames },
            });

            for (const restaurant of restaurants) {
                if (!chef.restaurants.includes(restaurant._id)) {
                    await linkChefAndRestaurantObjects(chef, restaurant);
                }
            }
        }

        await chef.save();
        res.status(200).json(chef);
    } catch (error) {
        console.error("Error updating chef:", error);
        res.status(500).json({ error: "Failed to update chef" });
    }
};

export const deleteChef =  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const chef = await Chef.findById(id);

        if (!chef) {
            console.error("Chef not found");
            res.status(404).json({ error: "Chef not found" });
            return;
        }

        await Restaurant.updateMany(
            { chef: chef._id },
            { $unset: { chef: "" } }
        );

        await chef.deleteOne();
    } catch (error) {
        console.error("Error deleting chef:", error);
        res.status(500).json({ error: "Failed to delete chef" });
    }
}
