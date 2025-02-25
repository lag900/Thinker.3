import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { type Order, type OrderItem, type Product } from "@shared/schema";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"daily" | "monthly" | "yearly">("daily");
  
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"]
  });

  const { data: orderItems } = useQuery<OrderItem[]>({
    queryKey: ["/api/order-items"]
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  // Calculate sales data based on time range
  const salesData = orders?.reduce((acc: any[], order) => {
    const date = new Date(order.createdAt);
    let key = "";
    
    switch (timeRange) {
      case "daily":
        key = date.toLocaleDateString();
        break;
      case "monthly":
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        break;
      case "yearly":
        key = date.getFullYear().toString();
        break;
    }

    const existingData = acc.find(item => item.date === key);
    if (existingData) {
      existingData.sales += Number(order.total);
      existingData.orders += 1;
    } else {
      acc.push({ date: key, sales: Number(order.total), orders: 1 });
    }
    
    return acc;
  }, []) || [];

  // Calculate top selling products
  const topProducts = orderItems?.reduce((acc: any, item) => {
    const product = products?.find(p => p.id === item.productId);
    if (!product) return acc;

    const existingProduct = acc.find((p: any) => p.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += item.quantity;
      existingProduct.revenue += Number(item.price) * item.quantity;
    } else {
      acc.push({
        id: product.id,
        name: product.name,
        quantity: item.quantity,
        revenue: Number(item.price) * item.quantity
      });
    }
    
    return acc;
  }, [])
    ?.sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 5) || [];

  // Products with low stock
  const lowStockProducts = products?.filter(
    product => product.stock <= product.minStockLevel
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">التحليلات والتقارير</h1>
        
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">يومي</SelectItem>
            <SelectItem value="monthly">شهري</SelectItem>
            <SelectItem value="yearly">سنوي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="المبيعات" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>عدد الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" name="الطلبات" stroke="#16a34a" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" name="الكمية" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle>تنبيهات المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-muted-foreground">لا توجد منتجات منخفضة المخزون</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        كود: {product.code}
                      </div>
                    </div>
                    <div className="text-red-500 font-medium">
                      المخزون: {product.stock}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
