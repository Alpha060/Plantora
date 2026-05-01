import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBookingNumber } from "@/lib/helpers/order";

/**
 * POST /api/Landscape/bookings — Create a landscape consultation booking
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please login to request a consultation" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, service_type, address, area_size, preferred_date, description, budget } = body;

    if (!name || !phone || !service_type || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Look up the service by slug/type or get the first landscape service
    const { data: service } = await supabase
      .from("services")
      .select("id")
      .or(`slug.eq.${service_type},name.ilike.%${service_type.replace(/-/g, " ")}%`)
      .limit(1)
      .maybeSingle();

    // If no service found, get any active service
    let serviceId = service?.id;
    if (!serviceId) {
      const { data: anyService } = await supabase
        .from("services")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      serviceId = anyService?.id;
    }

    if (!serviceId) {
      return NextResponse.json({ error: "No landscape services configured. Please contact admin." }, { status: 400 });
    }

    const bookingNumber = generateBookingNumber();

    const { data, error } = await supabase
      .from("service_bookings")
      .insert({
        booking_number: bookingNumber,
        user_id: user.id,
        service_id: serviceId,
        address: {
          full_address: address,
          customer_name: name,
          customer_phone: phone,
          customer_email: email || null,
          area_size: area_size || null,
          budget_range: budget || null,
          service_type_label: service_type,
        },
        customer_notes: description || null,
        preferred_date: preferred_date || null,
        status: "inquiry",
      })
      .select("id, booking_number")
      .single();

    if (error) {
      console.error("Service booking error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Service booking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/Landscape/bookings — List bookings (admin: all, user: own)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if admin
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("service_bookings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Non-admin sees only their own
    if (userData?.role !== "admin") {
      query = query.eq("user_id", user.id);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Flatten address JSON for admin page compatibility
    const flattened = (data || []).map((b: Record<string, unknown>) => {
      const addr = (b.address || {}) as Record<string, string | null>;
      return {
        id: b.id,
        booking_number: b.booking_number,
        customer_name: addr.customer_name || "N/A",
        customer_phone: addr.customer_phone || "",
        customer_email: addr.customer_email || null,
        service_type: addr.service_type_label || "landscape",
        address: addr.full_address || "",
        area_size: addr.area_size || null,
        budget_range: addr.budget_range || null,
        preferred_date: b.preferred_date,
        description: b.customer_notes,
        status: b.status,
        admin_notes: b.admin_notes,
        quoted_price: b.quoted_price,
        final_price: b.final_price,
        scheduled_visit_date: b.site_visit_date,
        created_at: b.created_at,
      };
    });

    return NextResponse.json({ data: flattened, count: count || 0 });
  } catch (error) {
    console.error("Service bookings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
