import {
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Customer, type InsertCustomer,
  type Supplier, type InsertSupplier,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Expense, type InsertExpense,
  type Notification, type InsertNotification,
  type OrderShippingUpdate, type InsertOrderShippingUpdate,
  type Category, type InsertCategory
} from "@shared/schema";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getAllOrderItems(): Promise<OrderItem[]>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;

  // Analytics
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;

  // Shipping Updates
  getOrderShippingUpdates(orderId: number): Promise<OrderShippingUpdate[]>;
  createOrderShippingUpdate(update: InsertOrderShippingUpdate): Promise<OrderShippingUpdate>;
  updateOrderShippingStatus(orderId: number, status: string): Promise<Order>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByCode(code: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private customers: Map<number, Customer>;
  private suppliers: Map<number, Supplier>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private expenses: Map<number, Expense>;
  private notifications: Map<number, Notification>;
  private orderShippingUpdates: Map<number, OrderShippingUpdate>;
  private categories: Map<number, Category>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.customers = new Map();
    this.suppliers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.expenses = new Map();
    this.notifications = new Map();
    this.orderShippingUpdates = new Map();
    this.categories = new Map();
    this.currentId = {
      users: 1,
      products: 1,
      customers: 1,
      suppliers: 1,
      orders: 1,
      orderItems: 1,
      expenses: 1,
      notifications: 1,
      orderShippingUpdates: 1,
      categories: 1
    };

    // Add sample admin user
    this.createUser({
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin"
    });

    // Add some sample data
    this.createProduct({
      name: "Sample Product",
      code: "SP001",
      description: "A sample product description",
      wholesalePrice: "20.00",
      price: "29.99",
      stock: 100,
      image: "https://source.unsplash.com/400x400/?product",
      minStockLevel: 10
    });

    // Add sample categories
    this.createCategory({
      name: "الإلكترونيات",
      code: "electronics",
      description: "الأجهزة الإلكترونية والكهربائية"
    });

    this.createCategory({
      name: "الملابس",
      code: "clothing",
      description: "الملابس والأزياء"
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Product not found");
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.currentId.customers++;
    const newCustomer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const existing = await this.getCustomer(id);
    if (!existing) throw new Error("Customer not found");
    const updated = { ...existing, ...customer };
    this.customers.set(id, updated);
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    this.customers.delete(id);
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentId.suppliers++;
    const newSupplier = { ...supplier, id };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const existing = await this.getSupplier(id);
    if (!existing) throw new Error("Supplier not found");
    const updated = { ...existing, ...supplier };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: number): Promise<void> {
    this.suppliers.delete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentId.orders++;
    const newOrder = { ...order, id, createdAt: new Date() };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentId.orderItems++;
    const newOrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values());
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.currentId.expenses++;
    const newExpense = { ...expense, id };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentId.notifications++;
    const newNotification = { ...notification, id, createdAt: new Date() };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, isRead: true });
    }
  }

  async getOrderShippingUpdates(orderId: number): Promise<OrderShippingUpdate[]> {
    return Array.from(this.orderShippingUpdates.values())
      .filter(update => update.orderId === orderId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createOrderShippingUpdate(update: InsertOrderShippingUpdate): Promise<OrderShippingUpdate> {
    const id = this.currentId.orderShippingUpdates++;
    const newUpdate = { ...update, id };
    this.orderShippingUpdates.set(id, newUpdate);

    // Create notification for shipping update
    await this.createNotification({
      type: "shipping_update",
      message: `تحديث الشحن للطلب #${update.orderId}: ${update.description}`,
      isRead: false,
      createdAt: new Date()
    });

    return newUpdate;
  }

  async updateOrderShippingStatus(orderId: number, status: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");

    const updatedOrder = {
      ...order,
      shippingStatus: status,
      updatedAt: new Date()
    };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByCode(code: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.code === code);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentId.categories++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const existing = await this.getCategory(id);
    if (!existing) throw new Error("Category not found");
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
  }
}

export const storage = new MemStorage();