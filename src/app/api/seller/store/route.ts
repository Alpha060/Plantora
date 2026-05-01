import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

/**
 * GET /api/seller/store
 * Returns the current seller's store profile and bank details
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: store, error } = await supabase
      .from("stores")
      .select(`
        id,
        store_name,
        slug,
        description,
        logo_url,
        banner_url,
        phone,
        email,
        address,
        pin_code,
        gst_number,
        commission_rate,
        status,
        is_active,
        rating,
        total_orders,
        total_products,
        created_at
      `)
      .eq("user_id", user.id)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get bank details
    const { data: bank } = await supabase
      .from("seller_bank_details")
      .select("account_holder, account_number, ifsc_code, bank_name, upi_id, is_verified")
      .eq("store_id", store.id)
      .single();

    return NextResponse.json({ store, bank: bank || null });
  } catch (err) {
    console.error("Store GET Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "seller" && userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Not a seller" }, { status: 403 });
    }

    const payload = (await request.json()) as {
      store_name?: unknown;
      description?: unknown;
      phone?: unknown;
      email?: unknown;
      address?: unknown;
      pin_code?: unknown;
      gst_number?: unknown;
      logo_url?: unknown;
      banner_url?: unknown;
    };
    const {
      store_name,
      description,
      phone,
      email,
      address,
      pin_code,
      gst_number,
      logo_url,
      banner_url,
    } = payload;

    if (
      typeof store_name !== "string" ||
      typeof address !== "string" ||
      typeof phone !== "string"
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedDescription = typeof description === "string" ? description : null;
    const normalizedEmail = typeof email === "string" ? email : null;
    const normalizedPinCode = typeof pin_code === "string" ? pin_code : null;
    const normalizedGstNumber = typeof gst_number === "string" ? gst_number : null;
    const normalizedLogoUrl = typeof logo_url === "string" ? logo_url : null;
    const normalizedBannerUrl = typeof banner_url === "string" ? banner_url : null;

    // Generate slug from store name
    const slug = store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    // Ensure slug uniqueness (simple implementation, append random numbers if exists)
    // For a robust system, we would check the DB first.
    const finalSlug = slug + "-" + Math.floor(1000 + Math.random() * 9000);

    // Upsert store (a user should only have 1 store)
    // To do an upsert safely, let's see if one exists first.
    const { data: existingStore } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingStore) {
      // Update existing
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          store_name,
          description: normalizedDescription,
          phone,
          email: normalizedEmail,
          address,
          pin_code: normalizedPinCode,
          gst_number: normalizedGstNumber,
          logo_url: normalizedLogoUrl,
          banner_url: normalizedBannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingStore.id);

      if (updateError) {
         console.error("Store update error:", updateError);
         return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, storeId: existingStore.id });
    } else {
      // Insert new
      const { data: newStore, error: insertError } = await supabase
        .from("stores")
        .insert({
          user_id: user.id,
          store_name,
          slug: finalSlug,
          description: normalizedDescription,
          phone,
          email: normalizedEmail,
          address,
          pin_code: normalizedPinCode,
          gst_number: normalizedGstNumber,
          logo_url: normalizedLogoUrl,
          banner_url: normalizedBannerUrl,
          status: "pending",
          is_active: false,
          rating: 0,
          total_orders: 0,
          total_products: 0,
        })
        .select("id")
        .single();
        
      if (insertError) {
         console.error("Store insert error:", insertError);
         return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, storeId: newStore.id });
    }
  } catch (err: unknown) {
    console.error("Store API Error:", getErrorMessage(err));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
