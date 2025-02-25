import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Order, type Customer } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function Orders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"]
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"]
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "تم تحديث حالة الطلب" });
    }
  });

  const pendingOrders = orders?.filter(order => order.status === "pending") || [];
  const processingOrders = orders?.filter(order => order.status === "processing") || [];
  const completedOrders = orders?.filter(order => order.status === "completed") || [];

  const pendingTotal = pendingOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const processingTotal = processingOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const completedTotal = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);

  const renderOrder = (order: Order) => {
    const customer = customers?.find(c => c.id === order.customerId);

    return (
      <Card key={order.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium mb-2">
                طلب #{order.id} - {customer?.name}
              </h3>
              <div className="text-sm text-muted-foreground">
                {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
              </div>
              <div className="text-sm text-muted-foreground">
                هاتف: {customer?.phone}
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium mb-2">
                المجموع: ${Number(order.total).toFixed(2)}
              </div>
              <div className="text-sm text-green-600">
                الربح: ${Number(order.profit).toFixed(2)}
              </div>
              {order.discount !== "0" && (
                <div className="text-sm text-muted-foreground">
                  خصم: ${Number(order.discount).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm font-medium">الحالة:</label>
            <Select
              value={order.status}
              onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">إدارة الطلبات</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-2">قيد الانتظار</h3>
            <div className="text-2xl font-bold">${pendingTotal.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {pendingOrders.length} طلبات
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-2">قيد المعالجة</h3>
            <div className="text-2xl font-bold">${processingTotal.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {processingOrders.length} طلبات
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-2">مكتملة</h3>
            <div className="text-2xl font-bold">${completedTotal.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {completedOrders.length} طلبات
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">الطلبات قيد الانتظار</h2>
        {pendingOrders.map(renderOrder)}

        <h2 className="text-lg font-semibold mb-4">الطلبات قيد المعالجة</h2>
        {processingOrders.map(renderOrder)}

        <h2 className="text-lg font-semibold mb-4">الطلبات المكتملة</h2>
        {completedOrders.map(renderOrder)}
      </div>
    </div>
  );
}
