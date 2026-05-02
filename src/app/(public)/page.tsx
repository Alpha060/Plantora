import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME, ROLE_DASHBOARDS } from "@/lib/constants";
import { 
  ArrowRight, Truck, CheckCircle, ShieldCheck, MapPin, Leaf, Phone,
  MessageCircle, Gift, Star, ShoppingCart, Search, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shared/product-grid";
import type { ProductCardData } from "@/types";

// Do not cache the homepage, fetch fresh data
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const supabase = await createClient();
  
  // Role-based redirection for logged-in users
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();
    
    if (user && user.role !== "buyer") {
      redirect(ROLE_DASHBOARDS[user.role as keyof typeof ROLE_DASHBOARDS] || "/");
    }
  }

  const [categoriesResult, productsResult, reviewsResult, galleryResult, contactResult] = await Promise.allSettled([
    supabase
      .from("categories")
      .select("*")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("sort_order")
      .abortSignal(AbortSignal.timeout(2500)),
    supabase
      .from("products")
      .select("id, name, slug, price, sale_price, avg_rating, total_reviews, is_featured, store_id, product_images(image_url, is_primary), stores(store_name), categories(slug)")
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(10)
      .abortSignal(AbortSignal.timeout(2500)),
    supabase
      .from("reviews")
      .select("*, users(full_name, avatar_url)")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .abortSignal(AbortSignal.timeout(2500)),
    supabase
      .from("landscape_gallery")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .abortSignal(AbortSignal.timeout(2500)),
    supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "contact_info")
      .single(),
  ]);

  const dbCategories = categoriesResult.status === "fulfilled" ? categoriesResult.value.data ?? [] : [];
  const dbProducts = productsResult.status === "fulfilled" ? productsResult.value.data ?? [] : [];
  // Use 'any' here as Supabase type generation for joined tables can be tricky in the template
  const dbReviews = (reviewsResult.status === "fulfilled" ? reviewsResult.value.data ?? [] : []) as any[];
  const dbGallery = galleryResult.status === "fulfilled" ? galleryResult.value.data ?? [] : [];
  
  const rawContact = contactResult.status === "fulfilled" ? contactResult.value.data?.value as { phone: string; whatsapp: string; email: string } : null;
  const contactInfo = rawContact || { phone: "9304612345", whatsapp: "9304612345" };

  const formatPhone = (number: string) => {
    const cleaned = (number || "").replace(/\D/g, "");
    if (cleaned.startsWith("91") && cleaned.length > 10) return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    if (cleaned.length === 10) return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    return number ? `+91 ${number}` : "";
  };
  
  // Fallbacks if no gallery images are featured
  const fallbackImages = [
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800",
    "https://images.unsplash.com/photo-1558171813-4c088753af8f?q=80&w=800",
    "https://images.unsplash.com/photo-1524247108137-732e0f642303?q=80&w=800"
  ];
  
  const gardenImages = [
    dbGallery[0]?.image_url || fallbackImages[0],
    dbGallery[1]?.image_url || fallbackImages[1],
    dbGallery[2]?.image_url || fallbackImages[2],
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-0">
      {/* =========== Section 1: Hero Banner =========== */}
      <section className="relative w-full min-h-[350px] md:min-h-[400px] flex items-center overflow-hidden">
        {/* Background Image - Real flowers image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-banner.png" 
            alt="Beautiful flowers and plants background" 
            fill
            sizes="100vw"
            className="object-cover object-right"
            priority
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 py-6">
          <div className="max-w-xl">
            {/* Delivery Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-xs tracking-wider mb-4">
              <Truck className="h-4 w-4" />
              24 HOURS DELIVERY
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-3">
              Fresh Flowers & Plants<br />
              <span className="text-emerald-800">Delivered in 24 Hours!</span>
            </h1>
            
            <p className="text-gray-700 text-sm md:text-base mb-6 max-w-md">
              Make every moment special with beautiful blooms and lush greenery.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href="/shop/flowers-bouquets">
                <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-md px-6 font-medium shadow-sm h-11">
                  <Leaf className="h-4 w-4 mr-2" /> Shop Flowers
                </Button>
              </Link>
              <Link href="/shop/plants">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-6 font-medium shadow-sm h-11">
                  <Leaf className="h-4 w-4 mr-2" /> Shop Plants
                </Button>
              </Link>
              <Link href="/landscape">
                <Button className="bg-emerald-900 hover:bg-emerald-950 text-white rounded-md px-6 font-medium shadow-sm h-11">
                  <Leaf className="h-4 w-4 mr-2" /> Book Landscaping
                </Button>
              </Link>
            </div>
            
            {/* Features Row */}
            <div className="flex items-center gap-6 text-sm text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                Fresh & Healthy
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Secure Packaging
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                On-time Delivery
              </div>
            </div>
          </div>
        </div>

        {/* Floating Location Badge */}
        <div className="hidden md:flex absolute right-12 bottom-12 bg-white rounded-lg shadow-lg p-3 items-center gap-3 z-10">
          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Proudly Serving</p>
            <p className="text-sm font-bold text-gray-900">Daltonganj &<br/>Nearby Areas</p>
          </div>
        </div>
      </section>

      {/* =========== Section 2: Shop by Category =========== */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        </div>
        <p className="text-gray-500 mb-8 text-sm">Explore our wide range of flowers, plants & more</p>
        
        {dbCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dbCategories.map((cat) => (
              <Link key={cat.id} href={`/shop/${cat.slug}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="aspect-4/3 relative p-4 bg-gray-50/50">
                  <div className="absolute inset-4 flex items-center justify-center">
                    {cat.image_url ? (
                      <Image src={cat.image_url} alt={cat.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw" className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Leaf className="h-8 w-8 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 text-center border-t border-gray-50">
                  <h3 className="font-semibold text-gray-800 text-sm">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500">Categories will appear here once added to the store.</p>
          </div>
        )}
      </section>

      {/* =========== Section 3: Value Props Row =========== */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-emerald-50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-emerald-200">
          <div className="flex items-center gap-4 px-4">
            <Truck className="h-10 w-10 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">24 Hour Delivery</h4>
              <p className="text-xs text-gray-600">Fast & reliable delivery across Daltonganj</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 pt-4 md:pt-0">
            <Leaf className="h-10 w-10 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Fresh & Healthy</h4>
              <p className="text-xs text-gray-600">Carefully handpicked flowers & plants</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 pt-4 md:pt-0">
            <MapPin className="h-10 w-10 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Expert Landscaping</h4>
              <p className="text-xs text-gray-600">Beautiful garden design for your home</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 pt-4 md:pt-0">
            <ShieldCheck className="h-10 w-10 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4>
              <p className="text-xs text-gray-600">Multiple payment options UPI, COD, Cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========== Section 4: Featured Products =========== */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            </div>
          </div>
          <Link href="/shop" className="text-emerald-700 text-sm font-semibold flex items-center hover:underline">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {dbProducts.length > 0 ? (
          <ProductGrid
            products={dbProducts.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              sale_price: p.sale_price,
              avg_rating: p.avg_rating ?? 0,
              total_reviews: p.total_reviews ?? 0,
              is_featured: p.is_featured ?? false,
              store_id: p.store_id,
              primary_image: p.product_images?.find((img: any) => img.is_primary)?.image_url || p.product_images?.[0]?.image_url || null,
              store_name: p.stores?.store_name || null,
              category_slug: p.categories?.slug || null,
            } as ProductCardData))}
            columns={4}
          />
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500">Looks like there are no products added to the store yet.</p>
          </div>
        )}
      </section>

      {/* =========== Section 5: Landscaping Banner =========== */}
      <section className="py-8 container mx-auto px-4">
        <div className="bg-emerald-50 rounded-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Content */}
          <div className="flex-1 p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-3xl font-bold text-emerald-900">Design Your Dream Garden</h2>
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-gray-700 mb-8 max-w-md text-sm md:text-base">
              Our landscaping experts will transform your space into a beautiful green paradise.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {["Terrace Garden", "Front Yard Design", "Balcony Garden", "Garden Maintenance"].map(feature => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-emerald-200 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-emerald-700" />
                  </div>
                  <span className="text-sm font-medium text-emerald-900">{feature}</span>
                </div>
              ))}
            </div>
            
            <Link href="/landscape">
              <Button className="bg-emerald-900 hover:bg-emerald-950 text-white px-8">
                <Search className="h-4 w-4 mr-2" /> Book Free Visit
              </Button>
            </Link>
          </div>
          
          {/* Right Images */}
          <div className="flex-1 relative min-h-[300px] md:min-h-full p-4 md:p-6 grid grid-cols-2 gap-4">
            <div className="relative rounded-xl overflow-hidden">
              <Image src={gardenImages[0]} alt="Garden 1" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="grid grid-rows-2 gap-4">
              <div className="relative rounded-xl overflow-hidden">
                <Image src={gardenImages[1]} alt="Garden 2" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <div className="relative rounded-xl overflow-hidden">
                <Image src={gardenImages[2]} alt="Garden 3" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
            </div>
            {/* Floating Banner */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg text-center shadow-lg transform rotate-[-5deg]">
              Custom Designs<br/>for Your Home
            </div>
          </div>
        </div>
      </section>

      {/* =========== Section 6: Testimonials =========== */}
      <section className="py-16 container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>
        
        {dbReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dbReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-left">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-gray-700 text-sm mb-6">&quot;{review.review_text}&quot;</p>
                <div className="flex items-center gap-3">
                  {review.users?.avatar_url ? (
                    <Image src={review.users.avatar_url} alt={review.users.full_name || 'Customer'} width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {(review.users?.full_name || 'C').charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{review.users?.full_name || 'Verified Customer'}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No reviews yet. Be the first to leave a review when you purchase!</p>
          </div>
        )}
      </section>

      {/* =========== Bottom Info Banner =========== */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Call Now</p>
                <p className="text-xs text-gray-500">{formatPhone(contactInfo.phone)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">WhatsApp</p>
                <a href={`https://wa.me/91${(contactInfo.whatsapp || contactInfo.phone).replace(/\D/g, "").replace(/^91/, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-emerald-700">Chat with us</a>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Track Your Order</p>
                <Link href="/track-order" className="text-xs text-gray-500 hover:text-emerald-700">Click here</Link>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Gift className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Offers & Deals</p>
                <Link href="/offers" className="text-xs text-gray-500 hover:text-emerald-700">View all offers</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
