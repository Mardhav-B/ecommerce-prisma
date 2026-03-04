import { Request, Response } from "express";
import { prisma } from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.middleware.ts";

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId! },
      include: {
        items: { include: { product: true } },
      },
    });

    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  let { productId, quantity } = req.body;

  if (Array.isArray(productId)) productId = productId[0];
  quantity = Number(quantity);

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid productId or quantity" });
  }

  try {
    let cart = await prisma.cart.findUnique({ where: { userId: req.userId! } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.userId! } });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const totalPrice = product.price * quantity;

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        totalPrice,
      },
    });

    res.json(cartItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  let { id } = req.params;

  if (Array.isArray(id)) id = id[0];

  try {
    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove item" });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId! },
    });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
