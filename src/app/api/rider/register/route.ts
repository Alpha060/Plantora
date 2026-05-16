import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone, vehicle_type, vehicle_number } = body;

    if (!email || !password || !full_name || !phone || !vehicle_type || !vehicle_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    let userId: string;

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      const { data: existingRider } = await supabase
        .from("riders")
        .select("id")
        .eq("user_id", existingUser.id)
        .maybeSingle();

      if (existingRider) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }

      if (!existingUser.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(existingUser.id, { email_confirm: true });
      }
      userId = existingUser.id;
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: "rider" },
      });

      if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
      userId = authData.user.id;
    }

    await supabase.from("users").upsert({
      id: userId,
      full_name,
      email,
      phone,
      role: "rider",
      is_active: true,
      is_blocked: false,
    }, { onConflict: "id" });

    const { error: riderError } = await supabase.from("riders").insert({
      user_id: userId,
      name: full_name,
      phone,
      vehicle_type,
      vehicle_number: vehicle_number.toUpperCase(),
      is_available: false,
      is_active: false,
      total_deliveries: 0,
    });

    if (riderError) {
      console.error("Rider insert error:", riderError);
      return NextResponse.json({ error: "Failed to create rider profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Registration successful!" });
  } catch (error: unknown) {
    console.error("Rider Register API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
