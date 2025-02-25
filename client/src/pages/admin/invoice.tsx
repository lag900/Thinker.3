import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import { type Product, type Customer } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Minus, Trash2 } from "lucide-react";

interface InvoiceItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function Invoice() {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"]
  });

  const customerForm = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  const customerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/customers", data);
      return res.json();
    }
  });

  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/orders", data);
    },
    onSuccess: () => {
      toast({ title: "تم إنشاء الفاتورة بنجاح" });
      setItems([]);
      customerForm.reset();
      setDiscount(0);
    }
  });

  const addItem = () => {
    const product = products?.find(p => p.id.toString() === selectedProduct);
    if (!product) return;

    const existingItem = items.find(item => item.productId === product.id);
    if (existingItem) {
      setItems(items.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setItems(items.map(item => 
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const removeItem = (productId: number) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleSubmit = async () => {
    try {
      let customerId;

      if (isNewCustomer) {
        const result = customerForm.handleSubmit(async (data) => {
          const customer = await customerMutation.mutateAsync(data);
          return customer.id;
        })();

        customerId = await result;
      } else {
        if (!selectedCustomer) {
          toast({
            title: "خطأ",
            description: "الرجاء اختيار عميل",
            variant: "destructive"
          });
          return;
        }
        customerId = parseInt(selectedCustomer);
      }

      await orderMutation.mutateAsync({
        customerId,
        items: items,
        discount
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الفاتورة",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">إنشاء فاتورة جديدة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={isNewCustomer ? "default" : "outline"}
                    onClick={() => setIsNewCustomer(true)}
                  >
                    عميل جديد
                  </Button>
                  <Button
                    variant={!isNewCustomer ? "default" : "outline"}
                    onClick={() => setIsNewCustomer(false)}
                  >
                    عميل حالي
                  </Button>
                </div>

                {isNewCustomer ? (
                  <Form {...customerForm}>
                    <div className="space-y-4">
                      <FormField
                        control={customerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم العميل</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={customerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={customerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الهاتف</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                ) : (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      اختر العميل
                    </label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map(customer => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    المنتج
                  </label>
                  <div className="flex gap-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - ${product.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSubmit}
              disabled={items.length === 0 || customerMutation.isPending || orderMutation.isPending}
            >
              إنشاء الفاتورة
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">تفاصيل الفاتورة</h2>

          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        ${item.price} للوحدة
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        type="number"
                        value={item.quantity}
                        className="w-20 text-center"
                        readOnly
                      />

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 text-right font-medium">
                    المجموع: ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))}

            {items.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium flex-1">نسبة الخصم (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-24 text-center"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-muted-foreground">المجموع الفرعي</div>
                        <div className="font-medium">${subtotal.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-muted-foreground">الخصم</div>
                        <div className="font-medium text-green-600">-${discountAmount.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between text-lg font-bold">
                        <div>الإجمالي</div>
                        <div>${total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}