import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import type { SellerDocument } from "@/types";

type AdminSellerStatus = "approved" | "rejected" | "suspended";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();
    const { id: storeId } = await params;

    // 1. Fetch Store Profile
    const { data: store } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 2. Fetch Bank Details
    const { data: bankResult } = await supabase
      .from("seller_bank_details")
      .select("*")
      .eq("store_id", storeId)
      .single();

    // 3. Fetch Documents
    const { data: docs } = await supabase
      .from("seller_documents")
      .select("*")
      .eq("store_id", storeId);

    // 4. Generate Signed URLs for documents using admin client (bypasses storage RLS)
    const adminSupabase = createAdminClient();
    const documentsWithUrls = await Promise.all((docs || []).map(async (doc: SellerDocument) => {
      let viewUrl = doc.document_url;
      
      if (!viewUrl) {
        return { ...doc, view_url: null };
      }

      // Extract storage path from full public URL if needed
      // Public URLs look like: https://xxx.supabase.co/storage/v1/object/public/seller-documents/pan/xxx.jpg
      let storagePath = viewUrl;
      if (viewUrl.startsWith("http")) {
        const bucketMarker = "/seller-documents/";
        const idx = viewUrl.indexOf(bucketMarker);
        if (idx !== -1) {
          storagePath = viewUrl.substring(idx + bucketMarker.length);
        }
      }

      // Generate a signed URL for the extracted path using admin client
      const { data: signedData, error: signError } = await adminSupabase.storage
        .from("seller-documents")
        .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry
      
      if (signError) {
        console.error(`Failed to sign URL for ${doc.document_type}:`, signError.message);
      }

      if (signedData?.signedUrl) {
        viewUrl = signedData.signedUrl;
      }
      // If signing fails, fall back to the original public URL

      return {
        ...doc,
        view_url: viewUrl,
      };
    }));

    return NextResponse.json({
      store,
      bankDetails: bankResult || null,
      documents: documentsWithUrls
    });

  } catch (error: unknown) {
    console.error("Admin Sellers Detail GET Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const supabase = await createClient();
    const { id: storeId } = await params;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const {
      status,
      approval_note,
    } = (payload as { status?: unknown; approval_note?: unknown });

    if (
      !status ||
      !["approved", "rejected", "suspended"].includes(String(status))
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const nextStatus = status as AdminSellerStatus;
    const nextApprovalNote =
      typeof approval_note === "string" && approval_note.trim().length > 0
        ? approval_note
        : null;

    const { error: updateError } = await supabase
      .from("stores")
      .update({
        status: nextStatus,
        approval_note: nextApprovalNote,
        approved_at: nextStatus === "approved" ? new Date().toISOString() : null,
        approved_by: nextStatus === "approved" ? guard.ctx.userId : null,
        is_active: nextStatus === "approved"
      })
      .eq("id", storeId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: nextStatus });

  } catch (error: unknown) {
    console.error("Admin Sellers Detail PUT Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
