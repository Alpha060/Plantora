import { redirect } from "next/navigation";

type ShopCategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ShopCategoryPage({
  params,
}: ShopCategoryPageProps) {
  const { slug } = await params;

  redirect(`/shop?category=${encodeURIComponent(slug)}`);
}
