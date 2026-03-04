import { Router } from "express";
import {
  getFeaturedProducts,
  addToFeatured,
  removeFromFeatured,
} from "../controllers/featured.controller.ts";
import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();

router.get("/", getFeaturedProducts); 
router.post("/add", authenticate, addToFeatured); 
router.delete("/remove/:productId", authenticate, removeFromFeatured); 
export default router;
