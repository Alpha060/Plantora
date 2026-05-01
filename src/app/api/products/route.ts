import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateUniqueSlug } from "@/lib/helpers/slug";

/**
 * GET /api/products — List products with filtering, sorting, pagination
 * POST /api/products — Create a new product (seller only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const storeId = searchParams.get("store_id");
    const categoryId = searchParams.get("category_id");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select(
        "*, product_images!inner(id, image_url, is_primary), stores!inner(id, store_name, slug)",
        { count: "exact" }
      );

    if (storeId) query = query.eq("store_id", storeId);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (status === "active") query = query.eq("is_active", true);
    if (status === "inactive") query = query.eq("is_active", false);
    if (search) query = query.ilike("name", `%${search}%`);

    query = query
      .abortSignal(AbortSignal.timeout(2500))
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Products GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { data: data || [], count: count || 0, page, pageSize },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get seller's store
    const { data: store } = await supabase
      .from("stores")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (!store || store.status !== "approved") {
      return NextResponse.json(
        { error: "You need an approved store to add products" },
        { status: 403 }
      );
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

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const slug = generateUniqueSlug(name);

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description: description || null,
        price,
        sale_price: sale_price || null,
        sku: sku || null,
        stock_qty: stock_qty ?? 0,
        unit: unit || "piece",
        category_id,
        store_id: store.id,
        occasion: occasion || null,
        care_instructions: care_instructions || null,
        tags: tags || [],
        is_featured: is_featured ?? false,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (productError) {
      console.error("Product create error:", productError);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    // Insert images
    if (images && images.length > 0) {
      const imageRecords = images.map((url: string, index: number) => ({
        product_id: product.id,
        image_url: url,
        is_primary: index === 0,
        sort_order: index,
      }));

      await supabase.from("product_images").insert(imageRecords);
    }

    // Insert variants
    if (variants && variants.length > 0) {
      const variantRecords = variants.map(
        (v: { variant_name: string; price: number; sale_price?: number; stock_qty: number; sku?: string }) => ({
          product_id: product.id,
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

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
