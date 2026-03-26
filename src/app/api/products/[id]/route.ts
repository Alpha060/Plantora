import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id] — Get product with images, variants
 * PUT /api/products/[id] — Update product (seller/admin)
 * DELETE /api/products/[id] — Soft delete product
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        "*, product_images(*), product_variants(*), stores(id, store_name, slug, rating), categories(id, name, slug)"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Product GET error:", error);
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership or admin
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const { data: product } = await supabase
      .from("products")
      .select("store_id, stores!inner(user_id)")
      .eq("id", id)
      .single();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const store = product.stores as unknown as { user_id: string };
    if (profile?.role !== "admin" && store.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      sale_price,
      sku,
      stock_qty,
      unit,
      category_id,
      occasion,
      care_instructions,
      tags,
      is_featured,
      is_active,
      images,
      variants,
    } = body;

    // Update product fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (sale_price !== undefined) updateData.sale_price = sale_price;
    if (sku !== undefined) updateData.sku = sku;
    if (stock_qty !== undefined) updateData.stock_qty = stock_qty;
    if (unit !== undefined) updateData.unit = unit;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (occasion !== undefined) updateData.occasion = occasion;
    if (care_instructions !== undefined)
      updateData.care_instructions = care_instructions;
    if (tags !== undefined) updateData.tags = tags;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updated, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Product update error:", error);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await supabase.from("product_images").delete().eq("product_id", id);

      // Insert new images
      if (images.length > 0) {
        const imageRecords = images.map((url: string, index: number) => ({
          product_id: id,
          image_url: url,
          is_primary: index === 0,
          sort_order: index,
        }));
        await supabase.from("product_images").insert(imageRecords);
      }
    }

    // Update variants if provided
    if (variants !== undefined) {
      await supabase.from("product_variants").delete().eq("product_id", id);

      if (variants.length > 0) {
        const variantRecords = variants.map(
          (v: { variant_name: string; price: number; sale_price?: number; stock_qty: number; sku?: string }) => ({
            product_id: id,
            variant_name: v.variant_name,
            price: v.price,
            sale_price: v.sale_price || null,
            stock_qty: v.stock_qty ?? 0,
            sku: v.sku || null,
            is_active: true,
          })
        );
        await supabase.from("product_variants").insert(variantRecords);
      }
    }

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("Product PUT error:", error);
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Soft delete — set is_active = false
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
