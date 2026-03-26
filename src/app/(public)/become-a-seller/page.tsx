import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, ShieldCheck, Zap, Globe, Leaf } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function BecomeASellerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-emerald-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Grow Your Business with {APP_NAME}
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto mb-10">
            Join Jharkhand's largest marketplace for flowers and plants. Reach thousands of customers in Daltonganj and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/seller/register">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 w-full sm:w-auto">
                Register as Seller
              </Button>
            </Link>
            <Link href="/seller/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Seller Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why sell on {APP_NAME}?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-6">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Hyper-Local Reach</h3>
              <p className="text-slate-600">
                Connect directly with customers in your city. Our hyper-local delivery ensures your plants stay fresh.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure Payments</h3>
              <p className="text-slate-600">
                Weekly automated settlements directly to your bank account. Transparent fee structure with no hidden charges.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Easy Dashboard</h3>
              <p className="text-slate-600">
                Powerful tools to manage your inventory, track orders, and monitor your business growth from any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Get started in 3 easy steps</h2>
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Register Your Store</h3>
                  <p className="text-slate-600">Fill out a simple form with your basic shop details and GST/PAN information.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Upload Products</h3>
                  <p className="text-slate-600">Use our easy product uploader to add photos and descriptions for your plants and flowers.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 h-10 w-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Start Selling</h3>
                  <p className="text-slate-600">Your products will go live on {APP_NAME}. Receive orders and let our riders handle the rest.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to reach more customers?</h2>
          <Link href="/seller/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
              Open Your Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
