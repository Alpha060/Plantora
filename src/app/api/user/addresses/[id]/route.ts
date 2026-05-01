import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/user/addresses/[id] — Update an address
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

    const body = await request.json();

    // If setting as default, unset others first
    if (body.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const updateData: Record<string, unknown> = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address_line1 !== undefined) updateData.full_address = body.address_line1;
    if (body.full_address !== undefined) updateData.full_address = body.full_address;
    if (body.pin_code !== undefined) updateData.pin_code = body.pin_code;
    if (body.landmark !== undefined) updateData.landmark = body.landmark;
    if (body.is_default !== undefined) updateData.is_default = body.is_default;

    const { data, error } = await supabase
      .from("addresses")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Address PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/user/addresses/[id] — Delete an address
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
