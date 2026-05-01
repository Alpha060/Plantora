-- Plantora Database Schema
-- Run via: node scripts/setup-db.js

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  role text NOT NULL DEFAULT 'buyer',
  is_active boolean NOT NULL DEFAULT true,
  is_blocked boolean NOT NULL DEFAULT false,
  blocked_reason text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. STANDALONE TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  link_url text,
  position text NOT NULL DEFAULT 'home_top',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  max_orders integer NOT NULL DEFAULT 50,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_code text NOT NULL UNIQUE,
  area_name text,
  delivery_fee numeric NOT NULL DEFAULT 0,
  min_order_free_delivery numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text,
  images text[],
  price_starts_at numeric,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. TABLES DEPENDING ON USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  full_address text NOT NULL,
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  pin_code text NOT NULL,
  landmark text,
  label text,
  lat numeric,
  lng numeric,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text,
  vehicle_number text,
  is_available boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  current_lat numeric,
  current_lng numeric,
  total_deliveries integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. STORES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  address text NOT NULL,
  phone text,
  email text,
  logo_url text,
  banner_url text,
  pin_code text,
  lat numeric,
  lng numeric,
  gst_number text,
  status text NOT NULL DEFAULT 'pending',
  is_active boolean NOT NULL DEFAULT true,
  rating numeric NOT NULL DEFAULT 0,
  total_products integer NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  commission_rate numeric,
  approval_note text,
  approved_at timestamptz,
  approved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL,
  value numeric NOT NULL,
  min_order_amount numeric,
  max_discount numeric,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  per_user_limit integer NOT NULL DEFAULT 1,
  applicable_to text NOT NULL DEFAULT 'all',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  valid_from timestamptz,
  valid_to timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  price numeric NOT NULL,
  sale_price numeric,
  stock_qty integer NOT NULL DEFAULT 0,
  sku text,
  unit text NOT NULL DEFAULT 'piece',
  tags text[],
  occasion text[],
  care_instructions text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  deleted_reason text,
  avg_rating numeric NOT NULL DEFAULT 0,
  total_reviews integer NOT NULL DEFAULT 0,
  total_sold integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name text NOT NULL,
  price numeric NOT NULL,
  sale_price numeric,
  stock_qty integer NOT NULL DEFAULT 0,
  sku text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. CART & WISHLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- 9. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL,
  discount numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  delivery_address jsonb NOT NULL,
  delivery_date timestamptz,
  delivery_slot_id uuid REFERENCES public.delivery_slots(id) ON DELETE SET NULL,
  delivery_otp text,
  otp_verified boolean NOT NULL DEFAULT false,
  otp_verified_at timestamptz,
  coupon_id uuid,
  coupon_code text,
  gift_message text,
  special_instructions text,
  razorpay_order_id text,
  razorpay_payment_id text,
  cancel_reason text,
  cancelled_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  rider_id uuid REFERENCES public.riders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  seller_amount numeric NOT NULL,
  settlement_status text NOT NULL DEFAULT 'pending',
  settlement_id text,
  pickup_address jsonb,
  delivery_result text,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_seller_id uuid NOT NULL REFERENCES public.order_sellers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  variant_name text,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  is_reviewed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_seller_id uuid REFERENCES public.order_sellers(id) ON DELETE SET NULL,
  status text NOT NULL,
  note text,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  discount_amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. DELIVERY & COD
-- ============================================================
CREATE TABLE IF NOT EXISTS public.delivery_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_seller_id uuid NOT NULL REFERENCES public.order_sellers(id) ON DELETE CASCADE,
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  otp_entered text,
  otp_verified boolean NOT NULL DEFAULT false,
  otp_attempts integer NOT NULL DEFAULT 0,
  verified_at timestamptz,
  delivery_photo text,
  delivered_at timestamptz,
  cod_collected boolean NOT NULL DEFAULT false,
  cod_amount numeric,
  inspection_result text,
  rejection_reason text,
  rejection_notes text,
  rejection_photos text[],
  returned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cod_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_seller_id uuid REFERENCES public.order_sellers(id) ON DELETE SET NULL,
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'collected',
  collected_at timestamptz,
  deposit_method text,
  deposit_reference text,
  deposited_at timestamptz,
  verified_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  discrepancy_amount numeric,
  discrepancy_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rider_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. RETURNS & REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_seller_id uuid NOT NULL REFERENCES public.order_sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  return_number text NOT NULL UNIQUE,
  reason text NOT NULL,
  description text,
  photos text[],
  status text NOT NULL DEFAULT 'requested',
  resolution_type text,
  refund_amount numeric,
  admin_notes text,
  rider_id uuid REFERENCES public.riders(id) ON DELETE SET NULL,
  resolved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_verified_purchase boolean NOT NULL DEFAULT true,
  is_visible boolean NOT NULL DEFAULT true,
  hidden_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  hidden_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. SELLER MANAGEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seller_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_holder text NOT NULL,
  account_number text NOT NULL,
  ifsc_code text NOT NULL,
  upi_id text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seller_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_url text NOT NULL,
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seller_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seller_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  settlement_number text NOT NULL UNIQUE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_orders integer NOT NULL DEFAULT 0,
  total_delivered integer NOT NULL DEFAULT 0,
  total_returned integer NOT NULL DEFAULT 0,
  gross_sales numeric NOT NULL DEFAULT 0,
  total_commission numeric NOT NULL DEFAULT 0,
  total_returns_deduction numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_reference text,
  paid_at timestamptz,
  approved_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settlement_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id uuid NOT NULL REFERENCES public.seller_settlements(id) ON DELETE CASCADE,
  order_seller_id uuid NOT NULL REFERENCES public.order_sellers(id) ON DELETE CASCADE,
  order_number text,
  order_date timestamptz,
  order_amount numeric,
  commission_amount numeric,
  return_deduction numeric NOT NULL DEFAULT 0,
  net_amount numeric
);

-- ============================================================
-- 13. LANDSCAPE & SERVICE BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.landscape_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  booking_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  service_type text NOT NULL DEFAULT 'general',
  address text NOT NULL,
  area_size text,
  budget_range text,
  description text,
  preferred_date timestamptz,
  status text NOT NULL DEFAULT 'pending',
  quoted_price numeric,
  final_price numeric,
  scheduled_visit_date timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  address jsonb,
  customer_notes text,
  preferred_date timestamptz,
  preferred_time text,
  reference_photos text[],
  site_visit_date timestamptz,
  site_visit_time text,
  assessment_notes text,
  assessment_photos text[],
  quote_description text,
  quoted_price numeric,
  final_price numeric,
  assigned_team_member uuid REFERENCES public.users(id) ON DELETE SET NULL,
  before_photos text[],
  after_photos text[],
  completed_at timestamptz,
  cancelled_reason text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. DATABASE FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE
AS $$ SELECT role FROM public.users WHERE id = user_id; $$;

CREATE OR REPLACE FUNCTION public.get_user_store_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE
AS $$ SELECT id FROM public.stores WHERE user_id = auth.uid() LIMIT 1; $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
AS $$ SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'); $$;

-- ============================================================
-- 15. AUTH TRIGGER: auto-create public.users row on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 16. ENABLE ROW LEVEL SECURITY
-- ============================================================
DO $$ 
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Basic RLS: service_role bypasses RLS, so the app works via API routes.
-- Admin full access policy (applied to all tables):
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('
      CREATE POLICY IF NOT EXISTS admin_full_access ON public.%I
        FOR ALL USING (public.is_admin())
        WITH CHECK (public.is_admin())
    ', t);
  END LOOP;
END $$;

-- Users can read/update their own row
CREATE POLICY IF NOT EXISTS users_self_read ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS users_self_update ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 17. LANDSCAPE GALLERY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.landscape_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Basic RLS for gallery
ALTER TABLE public.landscape_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS landscape_gallery_read_all ON public.landscape_gallery
  FOR SELECT USING (true);
-- Write access is handled by admin_full_access policy above.
