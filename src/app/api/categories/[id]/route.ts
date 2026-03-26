import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/categories/[id] — Get single category
 * PUT /api/categories/[id] — Update category (admin only)
 * DELETE /api/categories/[id] — Delete category (admin only)
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Category GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check admin
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

    // Check slug uniqueness (excluding self)
    if (slug) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (parent_id !== undefined) updateData.parent_id = parent_id;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updated, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Category update error:", error);
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("Category PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check admin
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

    // Check for child categories
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", id);

    if (children && children.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories. Remove subcategories first." },
        { status: 400 }
      );
    }

    // Check for products
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with products. Reassign products first." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Category delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
