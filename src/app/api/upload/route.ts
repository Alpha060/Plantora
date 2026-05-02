import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/upload
 * Uploads an image to Supabase Storage and returns the public URL.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check via session client
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;
    const folder = (formData.get("folder") as string) || "";

    if (!file || !bucket) {
      return NextResponse.json(
        { error: "File and bucket are required" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filePath = folder
      ? `${folder}/${timestamp}-${randomStr}.${ext}`
      : `${timestamp}-${randomStr}.${ext}`;

    // Upload via admin client to bypass storage RLS
    const adminSupabase = createAdminClient();
    const { error: uploadError } = await adminSupabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Upload failed" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = adminSupabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, path: filePath }, { status: 200 });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
