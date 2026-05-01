import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: servicesData, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Landscape fetch error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Count bookings per service
    const { data: bookings } = await supabase.from("service_bookings").select("service_id");
    const bookingMap: Record<string, number> = {};
    if (bookings) {
      for (const b of bookings) {
        bookingMap[b.service_id] = (bookingMap[b.service_id] || 0) + 1;
      }
    }

    const formatted = (servicesData || []).map((s) => ({
      ...s,
      price_starts_at: s.price_starts_at ? Number(s.price_starts_at) : null,
      booking_count: bookingMap[s.id] || 0,
    }));

    return NextResponse.json({ services: formatted });
  } catch (err) {
    console.error("Admin Landscape API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
