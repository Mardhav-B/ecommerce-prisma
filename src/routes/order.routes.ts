import { Router } from "express";
import { placeOrder, getOrders } from "../controllers/order.controller.ts";
import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();

router.use(authenticate);
router.post("/", placeOrder);
router.get("/", getOrders);

export default router;
