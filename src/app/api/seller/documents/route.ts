import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SellerDocumentPayload {
  document_type: string;
  document_url: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get seller's store id
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Please complete store profile first." }, { status: 400 });
    }

    const { documents } = (await request.json()) as { documents?: unknown };
    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json({ error: "Invalid document data" }, { status: 400 });
    }

    // Insert documents
    // First, maybe delete old ones if re-submitting
    await supabase.from("seller_documents").delete().eq("store_id", store.id);

    const docsToInsert = documents
      .filter(
        (doc): doc is SellerDocumentPayload =>
          typeof doc === "object" &&
          doc !== null &&
          typeof (doc as SellerDocumentPayload).document_type === "string" &&
          typeof (doc as SellerDocumentPayload).document_url === "string"
      )
      .map((doc) => ({
      store_id: store.id,
      document_type: doc.document_type,
      document_url: doc.document_url,
      is_verified: false,
      }));

    if (docsToInsert.length !== documents.length) {
      return NextResponse.json({ error: "Invalid document data" }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from("seller_documents")
      .insert(docsToInsert);

    if (insertError) {
      console.error("Document insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Documents API Error:", getErrorMessage(err));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
