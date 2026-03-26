import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/seller/product-form";

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Create a new product listing"
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Products", href: "/seller/products" },
          { label: "Add Product" },
        ]}
      />
      <ProductForm mode="create" />
    </div>
  );
}
