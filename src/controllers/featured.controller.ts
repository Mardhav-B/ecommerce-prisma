import { Request, Response } from "express";
import { prisma } from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.middleware.ts";

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const featured = await prisma.featured.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!featured || featured.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    res.json({
      count: featured.length,
      featured,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch featured products" });
  }
};

export const addToFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existingFeatured = await prisma.featured.findUnique({
      where: { productId },
    });

    if (existingFeatured) {
      return res.status(400).json({ error: "Product is already featured" });
    }

    const featured = await prisma.featured.create({
      data: {
        productId,
      },
      include: {
        product: true,
      },
    });

    res.status(201).json({
      message: "Product added to featured",
      featured,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product to featured" });
  }
};

export const removeFromFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const featured = await prisma.featured.findUnique({
      where: { productId },
    });

    if (!featured) {
      return res.status(404).json({ error: "Product not found in featured" });
    }

    await prisma.featured.delete({
      where: { productId },
    });

    res.json({
      message: "Product removed from featured",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove product from featured" });
  }
};
