import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
} from "../controllers/product.controller.ts";
import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, createProduct); 

export default router;
