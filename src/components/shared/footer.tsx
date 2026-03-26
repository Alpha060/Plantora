import Link from "next/link";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const quickLinks = [
  { name: "Shop All", href: "/shop" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Track Order", href: "/track-order" },
  { name: "Become a Seller", href: "/become-a-seller" },
];

const categories = [
  { name: "Flowers & Bouquets", href: "/shop/flowers-bouquets" },
  { name: "Plants", href: "/shop/plants" },
  { name: "Pots & Accessories", href: "/shop/pots-accessories" },
  { name: "Indoor Plants", href: "/shop/indoor-plants" },
  { name: "Birthday Bouquets", href: "/shop/birthday-bouquets" },
  { name: "Wedding Flowers", href: "/shop/wedding-flowers" },
];

const policies = [
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Refund Policy", href: "/refund-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-emerald-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-emerald-300" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                {APP_NAME}
              </span>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Daltonganj&apos;s premier online marketplace for fresh flowers,
              plants, bouquets, and professional garden services. Bringing
              nature closer to you.
            </p>
            <div className="flex gap-3 pt-2">
              {["facebook", "instagram", "twitter", "youtube"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-xs font-bold uppercase"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-emerald-300">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-emerald-100 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-emerald-300">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-emerald-100 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-emerald-300">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-emerald-100">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                <span>Daltonganj, Palamu, Jharkhand 822101</span>
              </li>
              <li>
                <a
                  href="tel:+91XXXXXXXXXX"
                  className="flex items-center gap-2.5 text-sm text-emerald-100 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  +91 XXXXXXXXXX
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@plantora.in"
                  className="flex items-center gap-2.5 text-sm text-emerald-100 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-emerald-400" />
                  hello@plantora.in
                </a>
              </li>
            </ul>

            {/* WhatsApp */}
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-emerald-300">
            <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {policies.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="hover:text-white transition-colors"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
