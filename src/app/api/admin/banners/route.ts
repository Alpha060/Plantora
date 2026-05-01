import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const bannerSchema = z.object({
  title: z.string().nullish(),
  image_url: z.string().min(1),
  link_url: z.string().nullish(),
  position: z.enum(["hero", "middle", "bottom"]).default("hero"),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  starts_at: z.string().nullish(),
  ends_at: z.string().nullish(),
});

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: banners, error } = await supabase
      .from("banners")
      .select("*")
      .order("position")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Banners fetch error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ banners: banners || [] });
  } catch (err) {
    console.error("Admin Banners API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const body = await request.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    const { starts_at, ends_at, ...rest } = parsed.data;
    const insertData = {
      ...rest,
      starts_at: starts_at ? new Date(starts_at).toISOString() : null,
      ends_at: ends_at ? new Date(ends_at).toISOString() : null,
    };

    const { data: banner, error } = await supabase.from("banners").insert(insertData).select().single();
    if (error) {
      console.error("Create banner error:", error);
      return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
    }

    return NextResponse.json({ banner }, { status: 201 });
  } catch (err) {
    console.error("Admin Banners POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
