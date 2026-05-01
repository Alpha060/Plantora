import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("stores")
      .select("id, store_name, email, phone, status, created_at, logo_url")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: sellers, error } = await query;

    if (error) {
      console.error("Fetch Sellers Error:", error);
      return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
    }

    return NextResponse.json(sellers);

  } catch (error: unknown) {
    console.error("Admin Sellers API Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
