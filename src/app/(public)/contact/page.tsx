import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Mail, Phone, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: contactSetting } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "contact_info")
    .single();

  const contactInfo = (contactSetting?.value as { phone: string; email: string }) || { phone: "9304612345", email: "hello@plantora.in" };

  const formatPhone = (number: string) => {
    const cleaned = (number || "").replace(/\D/g, "");
    if (cleaned.startsWith("91") && cleaned.length > 10) return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    if (cleaned.length === 10) return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    return number ? `+91 ${number}` : "";
  };
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: "Contact Us" }]} />
        <div className="mt-8 bg-white p-8 md:p-12 rounded-2xl shadow-ambient-sm border text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-emerald-900 mb-6">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Have a question about an order or want to partner with us? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Phone className="h-6 w-6" />
              </div>
              <p className="font-semibold">{formatPhone(contactInfo.phone)}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Mail className="h-6 w-6" />
              </div>
              <p className="font-semibold">{contactInfo.email}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <MapPin className="h-6 w-6" />
              </div>
              <p className="font-semibold">Daltonganj, Jharkhand</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
