import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");

  const supabase = await createClient();
  let query = supabase.from("landscape_gallery").select("*").order("created_at", { ascending: false });
  
  if (featured === "true") {
    query = query.eq("is_featured", true).limit(3);
  }

  const { data, error } = await query;
  if (error) {
    // If table doesn't exist yet, return empty array gracefully
    if (error.code === '42P01') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Check if admin
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (userData?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { image_url, title, is_featured } = body;

    if (!image_url) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("landscape_gallery")
      .insert([{ image_url, title, is_featured }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
