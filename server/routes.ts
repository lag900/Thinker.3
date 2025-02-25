import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCustomerSchema, insertSupplierSchema, insertCategorySchema } from "@shared/schema";

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
  app.get("/api/orders", async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    const { customerId, items, discount = 0 } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const total = subtotal - ((subtotal * discount) / 100);
    let totalProfit = 0;

    const order = await storage.createOrder({
      customerId,
      status: "pending",
      subtotal: subtotal.toString(),
      discount: discount.toString(),
      total: total.toString(),
      profit: "0", // Will be updated after creating order items
    });

    // Create order items and calculate profit
    for (const item of items) {
      const product = await storage.getProduct(item.productId);
      if (product) {
        const itemProfit = (item.price - Number(product.wholesalePrice)) * item.quantity;
        totalProfit += itemProfit;

        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          wholesalePrice: product.wholesalePrice,
          price: item.price.toString(),
          profit: itemProfit.toString()
        });

        // Update product stock
        await storage.updateProduct(item.productId, {
          stock: product.stock - item.quantity
        });
      }
    }

    // Update order with total profit
    const updatedOrder = await storage.updateOrder(order.id, {
      profit: totalProfit.toString()
    });

    // Create notification for new order
    await storage.createNotification({
      type: "new_order",
      message: `طلب جديد #${order.id} بقيمة $${total.toFixed(2)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    res.json(updatedOrder);
  });

  app.patch("/api/orders/:id", async (req, res) => {
    const order = await storage.updateOrder(parseInt(req.params.id), req.body);

    // Create notification for order status change
    if (req.body.status) {
      let statusText = "";
      switch (req.body.status) {
        case "processing":
          statusText = "قيد المعالجة";
          break;
        case "completed":
          statusText = "مكتمل";
          break;
        case "cancelled":
          statusText = "ملغي";
          break;
      }

      await storage.createNotification({
        type: "order_status",
        message: `تم تغيير حالة الطلب #${order.id} إلى ${statusText}`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    res.json(order);
  });

  app.get("/api/order-items", async (req, res) => {
    const items = await storage.getAllOrderItems();
    res.json(items);
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:id", async (req, res) => {
    const category = await storage.getCategory(parseInt(req.params.id));
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  });

  app.post("/api/categories", async (req, res) => {
    const result = insertCategorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid category data" });
    }
    const category = await storage.createCategory(result.data);
    res.json(category);
  });

  app.patch("/api/categories/:id", async (req, res) => {
    const category = await storage.updateCategory(parseInt(req.params.id), req.body);
    res.json(category);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    await storage.deleteCategory(parseInt(req.params.id));
    res.status(204).end();
  });

  app.get("/api/orders/:id", async (req, res) => {
    const order = await storage.getOrder(parseInt(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.get("/api/orders/:id/shipping-updates", async (req, res) => {
    const updates = await storage.getOrderShippingUpdates(parseInt(req.params.id));
    res.json(updates);
  });

  app.post("/api/orders/:id/shipping-updates", async (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrder(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const update = await storage.createOrderShippingUpdate({
      orderId,
      status: req.body.status,
      location: req.body.location,
      description: req.body.description,
      timestamp: new Date()
    });

    // Update order shipping status
    await storage.updateOrderShippingStatus(orderId, req.body.status);

    res.json(update);
  });


  // Expenses
  app.get("/api/expenses", async (req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.post("/api/expenses", async (req, res) => {
    const expense = await storage.createExpense(req.body);
    res.json(expense);
  });

  // Notifications
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