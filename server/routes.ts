import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCustomerSchema, insertSupplierSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(parseInt(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid product data" });
    }
    const product = await storage.createProduct(result.data);
    res.json(product);
  });

  app.patch("/api/products/:id", async (req, res) => {
    const product = await storage.updateProduct(parseInt(req.params.id), req.body);

    // Check if stock is low after update
    if (product.stock <= product.minStockLevel) {
      await storage.createNotification({
        type: "low_stock",
        message: `المنتج ${product.name} منخفض المخزون (${product.stock} وحدة متبقية)`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    await storage.deleteProduct(parseInt(req.params.id));
    res.status(204).end();
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.post("/api/customers", async (req, res) => {
    const result = insertCustomerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid customer data" });
    }
    const customer = await storage.createCustomer(result.data);
    res.json(customer);
  });

  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post("/api/suppliers", async (req, res) => {
    const result = insertSupplierSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid supplier data" });
    }
    const supplier = await storage.createSupplier(result.data);
    res.json(supplier);
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    const { customerId, items } = req.body;

    // Calculate total from items
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const order = await storage.createOrder({
      customerId,
      status: "pending",
      total
    });

    // Create order items
    for (const item of items) {
      await storage.createOrderItem({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });

      // Update product stock
      const product = await storage.getProduct(item.productId);
      if (product) {
        await storage.updateProduct(item.productId, {
          stock: product.stock - item.quantity
        });
      }
    }

    res.json(order);
  });

  // Add these routes after the existing ones
  app.get("/api/order-items", async (req, res) => {
    const items = await storage.getOrderItems();
    res.json(items);
  });

  app.get("/api/notifications", async (req, res) => {
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });

  app.post("/api/notifications/read/:id", async (req, res) => {
    await storage.markNotificationAsRead(parseInt(req.params.id));
    res.status(204).end();
  });


  const httpServer = createServer(app);
  return httpServer;
}