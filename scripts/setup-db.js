/**
 * Plantora Database Setup Script
 * ==============================
 * Creates all tables, functions, triggers, RLS policies + admin user.
 *
 * Usage:
 *   node scripts/setup-db.js
 *   node scripts/setup-db.js "admin@email.com" "Password123" "Admin Name"
 *
 * Required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_ACCESS_TOKEN   ← generate at https://supabase.com/dashboard/account/tokens
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// ---------- Load env ----------
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error("Could not read .env.local");
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!ACCESS_TOKEN) {
  console.error(
    "\nMissing SUPABASE_ACCESS_TOKEN in .env.local!\n" +
    "Generate one at: https://supabase.com/dashboard/account/tokens\n" +
    "Then add to .env.local:\n  SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxx\n"
  );
  process.exit(1);
}

// Extract project ref from URL: https://<ref>.supabase.co
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0];

const ADMIN_EMAIL = process.argv[2] || "admin@plantora.com";
const ADMIN_PASSWORD = process.argv[3] || "Admin@1234";
const ADMIN_NAME = process.argv[4] || "System Admin";

// ---------- Helpers ----------
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SQL API error (${res.status}): ${text}`);
  }
  return res.json();
}

// ---------- Main ----------
async function main() {
  // ── Step 1: Create tables ──────────────────────────────────
  console.log("📦 Step 1: Creating database schema...");
  const schemaPath = path.join(__dirname, "schema.sql");

  if (!fs.existsSync(schemaPath)) {
    console.error("schema.sql not found in scripts/ folder!");
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  try {
    await runSQL(schemaSql);
    console.log("   ✅ All tables, functions, triggers & RLS created.\n");
  } catch (err) {
    console.error("   ❌ Schema creation failed:", err.message);
    console.error("   Make sure your SUPABASE_ACCESS_TOKEN is valid.\n");
    process.exit(1);
  }

  // ── Step 2: Create admin user ──────────────────────────────
  console.log(`👤 Step 2: Setting up admin user (${ADMIN_EMAIL})...`);

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("   Failed to list users:", listError.message);
    return;
  }

  let user = listData.users.find((u) => u.email === ADMIN_EMAIL);

  if (!user) {
    console.log("   Creating auth user...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });

    if (createError) {
      console.error("   Failed to create auth user:", createError.message);
      return;
    }
    user = newUser.user;
    console.log("   Auth user created.");

    // Wait for the trigger to create the public.users row
    await new Promise((r) => setTimeout(r, 2000));
  } else {
    console.log("   Auth user already exists.");
  }

  // Promote to admin
  const { error: updateError } = await supabase
    .from("users")
    .update({ role: "admin", is_active: true, is_blocked: false })
    .eq("id", user.id);

  if (updateError) {
    console.error("   Failed to set admin role:", updateError.message);
  } else {
    console.log("   Admin role set.\n");
    console.log("━".repeat(50));
    console.log("✅ Database setup complete!\n");
    console.log("   Admin Login:");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("━".repeat(50));
  }
}

main().catch(console.error);
