import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/categories — List all categories with children count
 * POST /api/categories — Create a new category (admin only)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*, children:categories!parent_id(id)")
      .is("parent_id", null)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also fetch subcategories for each parent
    const { data: allCategories, error: allError } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (allError) {
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    // Build tree structure
    const tree = allCategories
      .filter((c) => c.parent_id === null)
      .map((parent) => ({
        ...parent,
        children: allCategories.filter((c) => c.parent_id === parent.id),
      }));

    return NextResponse.json({ data: tree }, { status: 200 });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, image_url, parent_id, sort_order, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    const { data: newCategory, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        parent_id: parent_id || null,
        sort_order: sort_order ?? 0,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Category create error:", error);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
