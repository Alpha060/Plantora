"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    primary_image: string | null;
    store_id?: string | null;
    store_name?: string | null;
  };
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // prevent parent links from triggering

    useCartStore.getState().addItem({
      product_id: product.id,
      variant_id: null,
      quantity: 1,
      price: product.sale_price ?? product.price,
      name: product.name,
      image: product.primary_image,
      store_id: product.store_id || "default",
      store_name: product.store_name || "Plantora Store",
    });

    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Button 
      className={className}
      onClick={handleAddToCart}
    >
      Add to Cart <ShoppingCart className="h-4 w-4 ml-2" />
    </Button>
  );
}
