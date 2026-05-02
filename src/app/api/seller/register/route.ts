import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

/**
 * POST /api/seller/register
 *
 * Creates a new seller account using the admin/service-role client
 * to bypass RLS. This ensures:
 *  1. auth.users entry is created (with auto-confirm so no email link needed)
 *  2. public.users entry is created (role = "seller")
 *  3. stores entry is created (status = "pending")
 *
 * The frontend sends a JSON payload with all the form fields.
 */
export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      full_name,
      phone,
      store_name,
      store_tagline,
      store_description,
      alternate_phone,
      business_type,
      gst_number,
      years_in_business,
      employee_count,
      categories,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      google_maps_link,
    } = body as {
      email: string;
      password: string;
      full_name: string;
      phone: string;
      store_name: string;
      store_tagline?: string;
      store_description: string;
      alternate_phone?: string;
      business_type: string;
      gst_number?: string;
      years_in_business?: string;
      employee_count?: string;
      categories: string[];
      address_line1: string;
      address_line2?: string;
      city: string;
      state: string;
      pincode: string;
      google_maps_link?: string;
    };

    // Basic validation
    if (!email || !password || !full_name || !phone || !store_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Find the auth user (signUp on the frontend already created them)
    //    or create one if not found.
    let userId: string;

    const { data: existingUsers } =
      await supabase.auth.admin.listUsers();

    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    // Check if this user already has a store (prevent duplicate registrations)
    if (existingUser) {
      const { data: existingStore } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", existingUser.id)
        .maybeSingle();

      if (existingStore) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please login instead." },
          { status: 409 }
        );
      }

      // If the existing user hasn't confirmed their email, auto-confirm it now
      // since seller registration handles identity differently and we want to prevent login blocks
      if (!existingUser.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true,
        });
      }

      userId = existingUser.id;
    } else {
      // No auth user found — create one (auto-confirmed)
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name,
            role: "seller",
          },
        });

      if (authError) {
        console.error("Auth create error:", authError);
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        );
      }

      userId = authData.user.id;
    }

    // 3. Create or update public.users entry (upsert handles triggers/retries)
    const { error: usersError } = await supabase.from("users").upsert({
      id: userId,
      full_name,
      email,
      phone,
      role: "seller",
      is_active: true,
      is_blocked: false,
    }, { onConflict: "id" });

    if (usersError) {
      console.error("Users upsert error:", usersError);
      // Only delete auth user if we just created it (no pre-existing user)
      if (!existingUser) {
        await supabase.auth.admin.deleteUser(userId);
      }
      return NextResponse.json(
        { error: "Failed to create user profile. Please try again." },
        { status: 500 }
      );
    }

    // 4. Generate store slug
    const storeSlug = store_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      + "-" + Date.now().toString(36);

    // 5. Combine address
    const fullAddress = [address_line1, address_line2, city, state]
      .filter(Boolean)
      .join(", ");

    // 6. Create store with status "pending"
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .insert({
        user_id: userId,
        store_name,
        slug: storeSlug,
        description: store_description,
        phone,
        email,
        address: fullAddress,
        pin_code: pincode,
        gst_number: gst_number || null,
        metadata: {
          store_tagline: store_tagline || null,
          alternate_phone: alternate_phone || null,
          business_type,
          years_in_business: years_in_business || null,
          employee_count: employee_count || null,
          categories: categories || [],
          google_maps_link: google_maps_link || null,
        },
        status: "pending",
        is_active: false,
      })
      .select("id")
      .single();

    if (storeError || !storeData) {
      console.error("Store insert error:", storeError);
      // Rollback
      await supabase.from("users").delete().eq("id", userId);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Failed to create store. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      storeId: storeData.id,
      message: "Registration successful! Your application is under review.",
    });
  } catch (error: unknown) {
    console.error("Seller Register API Error:", getErrorMessage(error));
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
