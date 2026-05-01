import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "contact_info")
      .single();

    if (error && error.code !== "PGRST116") { // Ignore not found
      console.error("Public contact settings fetch error:", error);
    }

    const contactInfo = data?.value || {
      phone: "9304612345",
      whatsapp: "9304612345",
      email: "hello@plantora.in",
    };

    return NextResponse.json({ contact: contactInfo });
  } catch (err) {
    console.error("Public Contact API Error:", err);
    return NextResponse.json({ 
      contact: { phone: "9304612345", whatsapp: "9304612345", email: "hello@plantora.in" } 
    });
  }
}
