import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database.types";

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${parsed.data.phone}`,
      token: parsed.data.otp,
      type: "sms",
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Invalid OTP" },
        { status: 400 }
      );
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { error: "Session was not created after OTP verification" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
        user: {
          id: data.user.id,
          phone: data.user.phone,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
