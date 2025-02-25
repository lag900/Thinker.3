import { Link } from "wouter";
import { ShoppingCart, Package, Users, Truck, FileText, BarChart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold">E-Commerce</a>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost">
              <ShoppingCart className="h-5 w-5 mr-2" />
              السلة
            </Button>
          </Link>

          <div className="border-l h-6 mx-2" />

          <Link href="/admin/analytics">
            <Button variant="ghost">
              <BarChart className="h-5 w-5 mr-2" />
              التحليلات
            </Button>
          </Link>

          <Link href="/admin/invoice">
            <Button variant="ghost">
              <FileText className="h-5 w-5 mr-2" />
              الفواتير
            </Button>
          </Link>

          <Link href="/admin/inventory">
            <Button variant="ghost">
              <Package className="h-5 w-5 mr-2" />
              المخزون
            </Button>
          </Link>

          <Link href="/admin/customers">
            <Button variant="ghost">
              <Users className="h-5 w-5 mr-2" />
              العملاء
            </Button>
          </Link>

          <Link href="/admin/suppliers">
            <Button variant="ghost">
              <Truck className="h-5 w-5 mr-2" />
              الموردين
            </Button>
          </Link>

          <Link href="/admin/expenses">
            <Button variant="ghost">
              <DollarSign className="h-5 w-5 mr-2" />
              المصروفات
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}