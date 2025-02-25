import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";

import Home from "@/pages/home";
import Product from "@/pages/product";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Tracking from "@/pages/tracking";
import Invoice from "@/pages/admin/invoice";
import Analytics from "@/pages/admin/analytics";
import Orders from "@/pages/admin/orders";
import Inventory from "@/pages/admin/inventory";
import Customers from "@/pages/admin/customers";
import Suppliers from "@/pages/admin/suppliers";
import Expenses from "@/pages/admin/expenses";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={Product} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/tracking/:id" component={Tracking} />
      <Route path="/admin/invoice" component={Invoice} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/orders" component={Orders} />
      <Route path="/admin/inventory" component={Inventory} />
      <Route path="/admin/customers" component={Customers} />
      <Route path="/admin/suppliers" component={Suppliers} />
      <Route path="/admin/expenses" component={Expenses} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;