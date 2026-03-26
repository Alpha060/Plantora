import { Suspense } from "react";
import ShopPage from "./page-client";

export default function ShopPageWrapper() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading shop...</div>}>
      <ShopPage />
    </Suspense>
  );
}
