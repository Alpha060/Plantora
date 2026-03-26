import type { Database } from "./database.types";

// ── Base Table Row Types ──────────────────────────────────────────────
type Tables = Database["public"]["Tables"];

export type User = Tables["users"]["Row"];
export type Address = Tables["addresses"]["Row"];
export type Store = Tables["stores"]["Row"];
export type SellerDocument = Tables["seller_documents"]["Row"];
export type SellerBankDetails = Tables["seller_bank_details"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Product = Tables["products"]["Row"];
export type ProductImage = Tables["product_images"]["Row"];
export type ProductVariant = Tables["product_variants"]["Row"];
export type ProductAdminAction = Tables["product_admin_actions"]["Row"];
export type CartItem = Tables["cart_items"]["Row"];
export type Wishlist = Tables["wishlists"]["Row"];
export type Order = Tables["orders"]["Row"];
export type OrderSeller = Tables["order_sellers"]["Row"];
export type OrderItem = Tables["order_items"]["Row"];
export type OrderStatusHistory = Tables["order_status_history"]["Row"];
export type Rider = Tables["riders"]["Row"];
export type DeliveryZone = Tables["delivery_zones"]["Row"];
export type DeliverySlot = Tables["delivery_slots"]["Row"];
export type DeliveryVerification = Tables["delivery_verifications"]["Row"];
export type Return = Tables["returns"]["Row"];
export type Review = Tables["reviews"]["Row"];
export type Service = Tables["services"]["Row"];
export type ServiceBooking = Tables["service_bookings"]["Row"];
export type SellerSettlement = Tables["seller_settlements"]["Row"];
export type SettlementItem = Tables["settlement_items"]["Row"];
export type CodCollection = Tables["cod_collections"]["Row"];
export type RiderEarning = Tables["rider_earnings"]["Row"];
export type Coupon = Tables["coupons"]["Row"];
export type CouponUsage = Tables["coupon_usage"]["Row"];
export type Banner = Tables["banners"]["Row"];
export type Notification = Tables["notifications"]["Row"];
export type SellerNotification = Tables["seller_notifications"]["Row"];
export type PlatformSetting = Tables["platform_settings"]["Row"];

// ── Insert Types ──────────────────────────────────────────────────────
export type UserInsert = Tables["users"]["Insert"];
export type AddressInsert = Tables["addresses"]["Insert"];
export type StoreInsert = Tables["stores"]["Insert"];
export type ProductInsert = Tables["products"]["Insert"];
export type ProductImageInsert = Tables["product_images"]["Insert"];
export type ProductVariantInsert = Tables["product_variants"]["Insert"];
export type OrderInsert = Tables["orders"]["Insert"];
export type OrderSellerInsert = Tables["order_sellers"]["Insert"];
export type OrderItemInsert = Tables["order_items"]["Insert"];
export type ReviewInsert = Tables["reviews"]["Insert"];
export type CartItemInsert = Tables["cart_items"]["Insert"];
export type CouponInsert = Tables["coupons"]["Insert"];
export type BannerInsert = Tables["banners"]["Insert"];
export type ServiceBookingInsert = Tables["service_bookings"]["Insert"];

// ── Update Types ──────────────────────────────────────────────────────
export type UserUpdate = Tables["users"]["Update"];
export type StoreUpdate = Tables["stores"]["Update"];
export type ProductUpdate = Tables["products"]["Update"];
export type OrderUpdate = Tables["orders"]["Update"];
export type OrderSellerUpdate = Tables["order_sellers"]["Update"];
export type RiderUpdate = Tables["riders"]["Update"];
export type CouponUpdate = Tables["coupons"]["Update"];

// ── Extended / Join Types ─────────────────────────────────────────────

/** Product with its images array */
export type ProductWithImages = Product & {
  product_images: ProductImage[];
};

/** Product card data for listing pages (minimal) */
export type ProductCardData = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "sale_price"
  | "avg_rating"
  | "total_reviews"
  | "is_featured"
  | "store_id"
> & {
  primary_image: string | null;
  store_name: string | null;
};

/** Full product detail page data */
export type ProductWithDetails = Product & {
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  store: Pick<Store, "id" | "store_name" | "slug" | "rating"> | null;
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

/** Category with its subcategories */
export type CategoryWithChildren = Category & {
  children: Category[];
};

/** Store with owner user info */
export type StoreWithOwner = Store & {
  user: Pick<User, "id" | "full_name" | "phone" | "email"> | null;
};

/** Store with all related data for admin detail view */
export type StoreWithDetails = Store & {
  user: Pick<User, "id" | "full_name" | "phone" | "email" | "avatar_url"> | null;
  seller_documents: SellerDocument[];
  seller_bank_details: SellerBankDetails[];
};

/** Cart item with joined product, variant, and store data */
export type CartItemWithProduct = CartItem & {
  product: Pick<
    Product,
    "id" | "name" | "slug" | "price" | "sale_price" | "stock_qty" | "is_active" | "store_id"
  > & {
    primary_image: string | null;
    store: Pick<Store, "id" | "store_name"> | null;
  };
  variant: Pick<ProductVariant, "id" | "variant_name" | "price" | "sale_price" | "stock_qty"> | null;
};

/** Order with its seller sub-orders */
export type OrderWithSellers = Order & {
  order_sellers: OrderSeller[];
};

/** Full order detail with all nested data */
export type OrderWithDetails = Order & {
  order_sellers: (OrderSeller & {
    order_items: OrderItem[];
    store: Pick<Store, "id" | "store_name" | "phone" | "address"> | null;
    rider: Pick<Rider, "id" | "name" | "phone"> | null;
  })[];
  user: Pick<User, "id" | "full_name" | "phone"> | null;
};

/** Sub-order with items and store/rider info */
export type OrderSellerWithItems = OrderSeller & {
  order_items: OrderItem[];
  store: Pick<Store, "id" | "store_name" | "slug"> | null;
  rider: Pick<Rider, "id" | "name" | "phone" | "vehicle_type"> | null;
};

/** Review with reviewer info */
export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "full_name" | "avatar_url"> | null;
  product: Pick<Product, "id" | "name" | "slug"> | null;
};

/** Service booking with service details */
export type ServiceBookingWithService = ServiceBooking & {
  service: Pick<Service, "id" | "name" | "slug" | "price_starts_at"> | null;
  user: Pick<User, "id" | "full_name" | "phone" | "email"> | null;
};

/** Settlement with line items */
export type SettlementWithItems = SellerSettlement & {
  settlement_items: SettlementItem[];
  store: Pick<Store, "id" | "store_name"> | null;
};

/** Return with all context */
export type ReturnWithDetails = Return & {
  order: Pick<Order, "id" | "order_number"> | null;
  order_seller: (OrderSeller & {
    store: Pick<Store, "id" | "store_name"> | null;
  }) | null;
  user: Pick<User, "id" | "full_name" | "phone"> | null;
  rider: Pick<Rider, "id" | "name" | "phone"> | null;
};

/** Rider with current stats */
export type RiderWithStats = Rider & {
  user: Pick<User, "id" | "full_name" | "avatar_url"> | null;
  pending_cod: number;
  active_deliveries: number;
};

/** Notification with type-safe data payload */
export type NotificationWithData = Notification & {
  data: {
    order_id?: string;
    product_id?: string;
    store_id?: string;
    url?: string;
  } | null;
};

// ── API Response Types ────────────────────────────────────────────────

/** Standard API response wrapper */
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string };

/** Paginated list response */
export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
};

/** Auth user profile (what we store in Zustand) */
export type AuthUser = Pick<
  User,
  "id" | "full_name" | "phone" | "email" | "avatar_url" | "role" | "is_active"
>;

// ── Enum-like types for type safety ───────────────────────────────────

export type UserRole = "buyer" | "seller" | "rider" | "admin";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "partially_delivered"
  | "cancelled"
  | "return_initiated"
  | "returned"
  | "refunded";

export type SubOrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "rider_assigned"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_initiated"
  | "returned"
  | "refunded";

export type PaymentMethod = "upi" | "cod";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type StoreStatus = "pending" | "approved" | "rejected" | "suspended";

export type SettlementStatus =
  | "calculated"
  | "pending_approval"
  | "approved"
  | "processing"
  | "paid"
  | "disputed";

export type ReturnStatus =
  | "initiated"
  | "rider_returning"
  | "returned_to_seller"
  | "admin_review"
  | "refund_approved"
  | "refund_processed"
  | "replacement_sent"
  | "resolved"
  | "rejected";

export type InspectionResult = "accepted" | "rejected";

export type BannerPosition = "hero" | "middle" | "bottom";

export type CouponType = "percentage" | "fixed";

export type ServiceBookingStatus =
  | "inquiry"
  | "site_visit_scheduled"
  | "site_visit_done"
  | "quote_sent"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

// Re-export Database type
export type { Database } from "./database.types";
