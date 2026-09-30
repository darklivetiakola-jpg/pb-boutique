import { Router } from "express";
import { getCart, addItem, updateItem } from "../controllers/cart.controller.js";

const router = Router();
router.get("/", getCart);
router.post("/add-item", addItem);
router.post("/update-item", updateItem);

export default router;
