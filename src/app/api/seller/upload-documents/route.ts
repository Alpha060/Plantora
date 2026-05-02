import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

/**
 * POST /api/seller/upload-documents
 *
 * Accepts FormData with document files and a storeId.
 * Uses admin client to upload to storage and insert document records,
 * bypassing any RLS/auth issues since the user may not have a session.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const storeId = formData.get("storeId") as string;

    if (!storeId) {
      return NextResponse.json(
        { error: "Missing storeId" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify the store exists
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .single();

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const uploadResults: { type: string; success: boolean }[] = [];

    // Helper: upload a file to storage and insert document record
    const processFile = async (file: File, docType: string, folder: string) => {
      try {
        const ext = file.name.split(".").pop() || "bin";
        const filePath = `${folder}/${storeId}-${Date.now()}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from("seller-documents")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${docType}:`, uploadError);
          uploadResults.push({ type: docType, success: false });
          return;
        }

        const { data: urlData } = supabase.storage
          .from("seller-documents")
          .getPublicUrl(filePath);

        await supabase.from("seller_documents").insert({
          store_id: storeId,
          document_type: docType,
          document_url: urlData.publicUrl,
        });

        uploadResults.push({ type: docType, success: true });
      } catch (err) {
        console.error(`Failed to process ${docType}:`, err);
        uploadResults.push({ type: docType, success: false });
      }
    };

    // Process each document type
    const panCard = formData.get("pan_card") as File | null;
    const gstCert = formData.get("gst_certificate") as File | null;
    const shopPhoto = formData.get("shop_photo") as File | null;

    const uploads: Promise<void>[] = [];
    if (panCard && panCard.size > 0) uploads.push(processFile(panCard, "pan", "pan"));
    if (gstCert && gstCert.size > 0) uploads.push(processFile(gstCert, "gst", "gst"));
    if (shopPhoto && shopPhoto.size > 0) uploads.push(processFile(shopPhoto, "shop_license", "shop"));

    await Promise.all(uploads);

    return NextResponse.json({ success: true, results: uploadResults });
  } catch (error: unknown) {
    console.error("Document Upload API Error:", getErrorMessage(error));
    return NextResponse.json(
      { error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}
