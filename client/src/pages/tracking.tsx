import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Order, type OrderShippingUpdate } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function Tracking() {
  const [, params] = useLocation();
  const orderId = parseInt(params.id);

  const { data: order } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`]
  });

  const { data: shippingUpdates } = useQuery<OrderShippingUpdate[]>({
    queryKey: [`/api/orders/${orderId}/shipping-updates`]
  });

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">لم يتم العثور على الطلب</h1>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-500";
      case "shipped":
        return "bg-blue-500";
      case "in_transit":
        return "bg-purple-500";
      case "out_for_delivery":
        return "bg-orange-500";
      case "delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "preparing":
        return "جاري التجهيز";
      case "shipped":
        return "تم الشحن";
      case "in_transit":
        return "في الطريق";
      case "out_for_delivery":
        return "خارج للتوصيل";
      case "delivered":
        return "تم التوصيل";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">تتبع الشحنة</h1>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">رقم الطلب</div>
                <div className="font-medium">#{order.id}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">رقم التتبع</div>
                <div className="font-medium">{order.trackingNumber || "غير متوفر"}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">عنوان التوصيل</div>
                <div className="font-medium">
                  {order.shippingAddress}
                  <br />
                  {order.shippingCity}, {order.shippingCountry}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">حالة الشحن</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(order.shippingStatus)}`} />
                  <div className="font-medium">{getStatusText(order.shippingStatus)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {shippingUpdates?.map((update) => (
            <Card key={update.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(update.status)}`} />
                  
                  <div className="flex-1">
                    <div className="font-medium">{getStatusText(update.status)}</div>
                    {update.location && (
                      <div className="text-sm text-muted-foreground">
                        {update.location}
                      </div>
                    )}
                    <div className="text-sm">{update.description}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(update.timestamp), "dd/MM/yyyy HH:mm")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
