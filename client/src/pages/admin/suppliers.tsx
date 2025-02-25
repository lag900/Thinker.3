import { useQuery } from "@tanstack/react-query";
import { type Supplier } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function Suppliers() {
  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"]
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Supplier Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers?.map((supplier) => (
          <Card key={supplier.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <h3 className="font-medium">{supplier.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {supplier.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {supplier.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
