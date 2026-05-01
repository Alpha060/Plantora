import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/Landscape/bookings/[id] — Update booking status (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.status) updateData.status = body.status;
    if (body.admin_notes !== undefined) updateData.admin_notes = body.admin_notes;
    if (body.scheduled_visit_date) {
      updateData.site_visit_date = body.scheduled_visit_date;
      updateData.site_visit_time = "10:00";
    }
    if (body.quoted_price) updateData.quoted_price = body.quoted_price;
    if (body.final_price) updateData.final_price = body.final_price;

    const { data, error } = await supabase
      .from("service_bookings")
      .update(updateData)
      .eq("id", id)
      .select("id, booking_number, status")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Service booking update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/Landscape/bookings/[id] — Get booking detail
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("service_bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Service booking GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
