import { Request, Response } from "express";
import { prisma } from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.middleware.ts";
import { z } from "zod";

const placeOrderSchema = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  expectedDelivery: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const validation = placeOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }

    const { paymentMethod, shippingAddress, expectedDelivery } =
      validation.data;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId! },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    const order = await prisma.order.create({
      data: {
        userId: req.userId!,
        paymentMethod,
        shippingAddress,
        expectedDelivery: new Date(expectedDelivery),
        items: {
          create: cart.items.map((item: (typeof cart.items)[number]) => ({
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.json(order);
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId! },
    include: { items: { include: { product: true } } },
  });
  res.json(orders);
};
