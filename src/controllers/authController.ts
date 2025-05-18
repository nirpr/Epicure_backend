import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const login = async (req: Request, res: Response) => {
    try {
        const { identifier, password } = req.body;

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
            res.status(400).json({ error: "Invalid credentials"});
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({
            jwt: token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          res.status(400).json({ error: "User already exists" });
          return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({
            jwt: token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
