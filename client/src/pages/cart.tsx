import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item => {
        if (item.productId === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeItem = (productId: number) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.productId !== productId);
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">السلة فارغة</h1>
          <Button onClick={() => navigate("/")}>متابعة التسوق</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">سلة المشتريات</h1>

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="text-sm text-muted-foreground">
                  ${item.price} للوحدة
                </div>
              </div>

              <div className="flex items-center gap-4">
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
                </div>

                <div className="w-24 text-right font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 border rounded-lg">
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

              <div className="flex justify-between items-center text-lg font-bold">
                <div>الإجمالي</div>
                <div>${total.toFixed(2)}</div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                localStorage.setItem('cartDiscount', discount.toString());
                navigate("/checkout");
              }}
            >
              متابعة الشراء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}