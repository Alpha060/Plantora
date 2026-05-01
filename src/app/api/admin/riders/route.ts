import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/riders — All riders
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: riders, error } = await supabase
      .from("riders")
      .select("id, user_id, name, phone, vehicle_type, vehicle_number, is_available, is_active, total_deliveries, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin riders error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Get pending COD for each rider
    const riderIds = (riders || []).map((r) => r.id);
    const codPending: Record<string, number> = {};

    if (riderIds.length > 0) {
      const { data: codData } = await supabase
        .from("cod_collections")
        .select("rider_id, amount")
        .in("rider_id", riderIds)
        .eq("status", "collected");

      if (codData) {
        for (const c of codData) {
          codPending[c.rider_id] = (codPending[c.rider_id] || 0) + Number(c.amount);
        }
      }
    }

    const formatted = (riders || []).map((r) => ({
      ...r,
      cod_pending: codPending[r.id] || 0,
    }));

    return NextResponse.json({ riders: formatted });
  } catch (err) {
    console.error("Admin Riders API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/riders — Update rider status (activate/deactivate)
 */
export async function PUT(req: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const body = await req.json();
    const { rider_id, is_active } = body;

    if (!rider_id || typeof is_active !== "boolean") {
      return NextResponse.json({ error: "rider_id and is_active required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("riders")
      .update({ is_active })
      .eq("id", rider_id);

    if (error) {
      console.error("Rider status update error:", error);
      return NextResponse.json({ error: "Failed to update rider" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Rider PUT error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
