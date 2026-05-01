import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().nullish(),
  image_url: z.string().nullish(),
  parent_id: z.string().uuid().nullish(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Categories fetch error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Count products per category
    const { data: productCounts } = await supabase
      .from("products")
      .select("category_id")
      .eq("is_deleted", false);

    const countMap: Record<string, number> = {};
    if (productCounts) {
      for (const p of productCounts) {
        if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      }
    }

    const formatted = (categories || []).map((c) => ({
      ...c,
      product_count: countMap[c.id] || 0,
    }));

    return NextResponse.json({ categories: formatted });
  } catch (err) {
    console.error("Admin Categories API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    const { data: category, error } = await supabase.from("categories").insert(parsed.data).select().single();
    if (error) {
      console.error("Create category error:", error);
      return NextResponse.json({ error: error.message.includes("duplicate") ? "Slug already exists" : "Failed to create category" }, { status: 500 });
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("Admin Categories POST Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "Category ID is required" }, { status: 400 });

    const parsed = categorySchema.partial().safeParse(updateData);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });

    const { data: category, error } = await supabase
      .from("categories")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update category error:", error);
      return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }

    return NextResponse.json({ category });
  } catch (err) {
    console.error("Admin Categories PATCH Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Category ID is required" }, { status: 400 });

    const supabase = await createClient();
    
    // Check if category has products
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("category_id", id);
    if (count && count > 0) {
      return NextResponse.json({ error: "Cannot delete category with products. Reassign products first." }, { status: 400 });
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Delete category error:", error);
      return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin Categories DELETE Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
