import express from "express";
import chefRoutes from "./routes/chefRoutes";
import restaurantRoutes from "./routes/restaurantRoutes";
import dishRoutes from "./routes/dishRoutes";
import cors from "cors";
import path from "path";
import { corsMiddleware } from "./middlewares/cors";
import { jsonParser } from "./middlewares/jsonParser";

const app = express();

app.use(corsMiddleware);
app.use(jsonParser);

app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use("/api/chefs", chefRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/dishes", dishRoutes);

app.get("/", (req, res) => {
    res.send("Epicure backend up and running");
});

export default app;
