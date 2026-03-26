import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME } from "@/lib/constants";
import { ArrowRight, Truck, CheckCircle, Sparkles, Heart, Leaf, ChevronRight, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .eq("is_active", true)
    .order("sort_order");

  // Fetch services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .limit(6);

  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* =========== Section 1: Hero Banner =========== */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6">
        {/* Soft emerald aesthetic background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-fixed/30 to-surface z-0 pointer-events-none" />
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none" />
        
        <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-lowest shadow-ambient">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-on-surface-variant">Daltonganj's Premium Botanic Archive</span>
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-on-surface leading-[1.1] tracking-tight">
              Nature's Art for<br />
              <span className="text-primary">Your Living Space</span>
            </h1>
            
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-lg">
              Curate your sanctuary with our hand-selected indoor plants and fresh floral arrangements. Delivered with care.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/shop">
                <Button size="lg" className="bg-gradient-premium text-on-primary rounded-full px-8 hover:-translate-y-0.5 transition-transform shadow-ambient">
                  Shop the Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="ghost" className="rounded-full px-8 border border-outline-variant/30 text-primary hover:bg-primary/5">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md md:max-w-none relative">
            <div className="relative aspect-[4/5] md:aspect-square w-full rounded-[2rem] overflow-hidden shadow-ambient bg-surface-container-highest">
              {/* Image Placeholder representing lush Monstera */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-primary/10 flex items-center justify-center">
                <Leaf className="h-32 w-32 text-primary/20" />
              </div>
            </div>
            {/* Floating decorative elements */}
            <div className="absolute -bottom-6 -left-6 bg-surface-lowest p-5 rounded-2xl shadow-ambient backdrop-blur-md flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface font-serif">Same-Day</p>
                <p className="text-sm text-on-surface-variant">Delivery Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========== Section 2: Categories (Horizontal Scroll) =========== */}
      <section className="py-16 bg-surface-container-low pl-4 sm:pl-6 lg:pl-0">
        <div className="container mx-auto">
          <div className="flex items-end justify-between pr-4 sm:pr-6 mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mb-3">
                Curated Categories
              </h2>
              <p className="text-on-surface-variant text-lg">
                Find exactly what your space needs
              </p>
            </div>
          </div>
          
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 gap-6 snap-x hide-scrollbar">
            {(categories || []).map((cat) => {
              const icons: Record<string, React.ReactNode> = {
                "flowers-bouquets": <Sparkles className="h-8 w-8 text-primary" />,
                "plants": <Leaf className="h-8 w-8 text-primary" />,
                "pots-accessories": <Droplets className="h-8 w-8 text-primary" />,
              };
              return (
                <Link 
                  key={cat.id} 
                  href={`/shop/${cat.slug}`}
                  className="snap-start shrink-0 w-[280px] group block"
                >
                  <div className="h-[360px] relative rounded-[1.5rem] overflow-hidden bg-surface-lowest shadow-ambient flex flex-col items-center justify-center p-8 transition-transform duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-low/50" />
                    <div className="h-24 w-24 rounded-full bg-primary/5 mb-6 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      {icons[cat.slug] || <Leaf className="h-8 w-8 text-primary" />}
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-on-surface text-center mb-3">
                      {cat.name}
                    </h3>
                    <p className="text-on-surface-variant text-center text-sm line-clamp-2">
                      {cat.description}
                    </p>
                    <div className="mt-8 flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                      Browse Collection <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========== Section 3: Featured Collection =========== */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mb-4">
                The Featured Collection
              </h2>
              <p className="text-on-surface-variant text-lg">
                Uncommon specimens and stunning arrangements handpicked by our botanists.
              </p>
            </div>
            <Link href="/shop?featured=true">
              <Button variant="outline" className="rounded-full self-start md:self-auto border-outline-variant/50 text-on-surface hover:bg-surface-high">
                View Entire Collection
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group relative rounded-[1.5rem] overflow-hidden bg-surface-lowest shadow-ambient flex flex-col">
                <div className="aspect-[4/5] bg-surface-container-high relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf className="h-16 w-16 text-primary/10" />
                  </div>
                  {/* Floating Action */}
                  <div className="absolute top-4 right-4 h-10 w-10 bg-surface-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 text-primary shadow-sm cursor-pointer">
                    <Heart className="h-5 w-5" />
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="h-4 bg-surface-container-high rounded w-3/4 animate-pulse mb-3" />
                  <div className="h-3 bg-surface-container rounded w-1/2 animate-pulse mb-4" />
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="h-5 bg-primary/10 rounded w-20 animate-pulse" />
                    <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                      <span className="text-primary text-xl leading-none">+</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========== Section 4: Trust / Features =========== */}
      <section className="py-20 bg-primary text-on-primary">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-primary-container">
            {[
              {
                icon: <Truck className="h-8 w-8" />,
                title: "Same-Day Delivery",
                desc: "Swift, careful delivery across Daltonganj to ensure your plants arrive in pristine condition.",
              },
              {
                icon: <Leaf className="h-8 w-8" />,
                title: "Freshness Guarantee",
                desc: "Sourced directly from premium growers. Only the healthiest specimens make it to your door.",
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Expert Curation",
                desc: "Every plant comes with detailed care instructions authored by our botanical experts.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center pt-10 md:pt-0 first:pt-0 md:px-8">
                <div className="h-16 w-16 rounded-2xl bg-primary-container flex items-center justify-center mb-6 text-primary-fixed">
                  {item.icon}
                </div>
                <h3 className="font-serif font-bold text-2xl mb-3">{item.title}</h3>
                <p className="text-primary-fixed-dim max-w-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========== Section 5: Services =========== */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Botanical Consultations
            </h2>
            <p className="text-on-surface-variant text-lg">
              Beyond delivery, {APP_NAME} offers expert garden design, maintenance, and event styling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services || []).map((svc) => (
              <Link key={svc.id} href={`/services/${svc.slug}`} className="group block">
                <div className="bg-surface-lowest shadow-ambient rounded-[1.5rem] p-8 h-full flex flex-col transition-transform duration-300 hover:-translate-y-1">
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-on-surface mb-3 group-hover:text-primary transition-colors">
                    {svc.name}
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {svc.description}
                  </p>
                  {svc.price_starts_at && (
                    <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Starting at</span>
                      <span className="font-bold text-primary">₹{svc.price_starts_at.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* =========== Section 6: Newsletter =========== */}
      <section className="py-20 mx-4 sm:mx-6 md:mx-auto max-w-5xl mb-10">
        <div className="bg-surface-container-low rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mb-4">
              Join the Archive
            </h2>
            <p className="text-on-surface-variant text-lg mb-8">
              Subscribe to receive weekly care tips, early access to rare specimens, and exclusive aesthetic inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-14 px-6 rounded-full bg-surface-lowest border-0 shadow-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
              <Button className="h-14 bg-gradient-premium text-on-primary rounded-full px-8 font-medium shadow-ambient hover:-translate-y-0.5 transition-transform w-full sm:w-auto">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

