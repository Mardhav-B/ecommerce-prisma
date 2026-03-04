import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.ts";
import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();

router.use(authenticate);

router.get("/", getCart); 
router.post("/add", addToCart); 
router.delete("/remove/:id", removeFromCart); 
router.delete("/clear", clearCart); 

export default router;
