import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SellerBankDetails } from "@/types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get seller's store id
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Please complete previous steps first." }, { status: 400 });
    }

    const payload = (await request.json()) as {
      account_holder?: unknown;
      account_number?: unknown;
      ifsc_code?: unknown;
      bank_name?: unknown;
      upi_id?: unknown;
    };
    const {
      account_holder,
      account_number,
      ifsc_code,
      bank_name,
      upi_id,
    } = payload;

    if (
      typeof account_holder !== "string" ||
      typeof account_number !== "string" ||
      typeof ifsc_code !== "string" ||
      typeof bank_name !== "string"
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Delete existing if re-submitting
    await supabase.from("seller_bank_details").delete().eq("store_id", store.id);

    const bankDetails: SellerBankDetails = {
      id: crypto.randomUUID(),
      store_id: store.id,
      account_holder,
      account_number,
      ifsc_code,
      bank_name,
      upi_id: typeof upi_id === "string" ? upi_id : null,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("seller_bank_details")
      .insert(bankDetails);

    if (insertError) {
      console.error("Bank insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Mark store as completely submitted for review (status = pending)
    // It's already pending from the `store` step, but we can update updated_at
    await supabase.from("stores").update({ updated_at: new Date().toISOString() }).eq("id", store.id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Bank API Error:", getErrorMessage(err));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
