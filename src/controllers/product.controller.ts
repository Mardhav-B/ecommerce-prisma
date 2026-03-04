import { Request, Response } from "express";
import { prisma } from "../prisma.ts";

export const getProducts = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  let { id } = req.params;

  if (Array.isArray(id)) id = id[0];

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  let { title, description, productImg, price } = req.body;

  if (Array.isArray(title)) title = title[0];
  if (Array.isArray(description)) description = description[0];
  if (Array.isArray(productImg)) productImg = productImg[0];
  price = Number(price);

  if (!title || !description || !productImg || isNaN(price)) {
    return res.status(400).json({ error: "Invalid product data" });
  }

  try {
    const product = await prisma.product.create({
      data: { title, description, productImg, price },
    });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "Unable to create product" });
  }
};
