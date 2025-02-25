import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <a>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        </a>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <a className="text-lg font-semibold hover:underline">{product.name}</a>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Code: {product.code}</p>
        <p className="text-xl font-bold mt-2">${product.price}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
