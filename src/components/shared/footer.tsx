"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ArrowRight, CheckCircle2, Leaf } from "lucide-react";
import { useContact } from "@/hooks/use-contact";
import { APP_NAME } from "@/lib/constants";

const quickLinks = [
  { name: "Shop All", href: "/shop" },
  { name: "Landscape", href: "/landscape" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Track Order", href: "/track-order" },
  { name: "Become a Seller", href: "/seller/register" },
  { name: "Seller Login", href: "/seller/login" },
  { name: "Become a Rider", href: "/rider/register" },
  { name: "Rider Login", href: "/rider/login" },
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
  const { contact, formatPhone, getWhatsappLink } = useContact();
  
  return (
    <footer className="bg-emerald-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:w-1/3 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-emerald-300" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                {APP_NAME}
              </span>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed max-w-sm">
              Daltonganj&apos;s premier online marketplace for fresh flowers,
              plants, bouquets, and professional garden Landscape. Bringing
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

          {/* Links Section */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-emerald-300">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.name}>
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
            <div className="col-span-2 md:col-span-1">
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
                    href={`tel:${formatPhone(contact.phone).replace(/ /g, "")}`}
                    className="flex items-center gap-2.5 text-sm text-emerald-100 hover:text-white transition-colors"
                  >
                    <Phone className="h-4 w-4 text-emerald-400" />
                    {formatPhone(contact.phone)}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2.5 text-sm text-emerald-100 hover:text-white transition-colors"
                  >
                    <Mail className="h-4 w-4 text-emerald-400" />
                    {contact.email}
                  </a>
                </li>
              </ul>

              {/* WhatsApp */}
              <a
                href={getWhatsappLink(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-800">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-300">
            <p className="text-center md:text-left">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
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
