import { Request, Response } from "express";
import { prisma } from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.middleware.ts";

export const placeOrder = async (req: AuthRequest, res: Response) => {
  const { paymentMethod, shippingAddress, expectedDelivery } = req.body;

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
        create: cart.items.map((item) => ({
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
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId! },
    include: { items: { include: { product: true } } },
  });
  res.json(orders);
};
