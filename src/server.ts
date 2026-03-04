process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("🔥 Unhandled Rejection:", reason);
});

import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`📡 Starting server in ${NODE_ENV} mode`);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("🛒 E-commerce API is running!");
});

async function registerRoutes() {
  const authRoutes = (await import("./routes/auth.routes.ts")).default;
  const productRoutes = (await import("./routes/product.routes.ts")).default;
  const cartRoutes = (await import("./routes/cart.routes.ts")).default;
  const orderRoutes = (await import("./routes/order.routes.ts")).default;
  const featuredRoutes = (await import("./routes/featured.routes.ts")).default;

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/featured", featuredRoutes);
}

registerRoutes().catch((err) => {
  console.error("Failed to register routes:", err);
  console.error("Stack:", err.stack);
  process.exit(1);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

(async () => {
  try {
    await registerRoutes();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
