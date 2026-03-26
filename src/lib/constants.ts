// App constants
export const APP_NAME = "Plantora";
export const APP_TAGLINE = "Fresh Flowers & Plants Marketplace";
export const APP_CITY = "Daltonganj";
export const APP_STATE = "Jharkhand";

// Commission
export const DEFAULT_COMMISSION_RATE = 15;

// Pagination
export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 10;
export const REVIEWS_PER_PAGE = 5;
export const ADMIN_TABLE_PAGE_SIZE = 20;

// Image limits
export const MAX_PRODUCT_IMAGES = 8;
export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Order statuses
export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "partially_delivered",
  "cancelled",
  "return_initiated",
  "returned",
  "refunded",
] as const;

export const SUB_ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "rider_assigned",
  "picked_up",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "return_initiated",
  "returned",
  "refunded",
] as const;

// Product units
export const PRODUCT_UNITS = [
  { value: "piece", label: "Piece" },
  { value: "bunch", label: "Bunch" },
  { value: "kg", label: "Kg" },
  { value: "pot", label: "Pot" },
  { value: "packet", label: "Packet" },
  { value: "pair", label: "Pair" },
] as const;

// Occasions
export const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Diwali",
  "Holi",
  "Christmas",
  "Valentine's Day",
  "Mother's Day",
  "Father's Day",
  "Raksha Bandhan",
  "Puja",
  "House Warming",
  "Congratulations",
  "Get Well Soon",
  "Sympathy",
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  { value: "upi", label: "UPI / Online Payment" },
  { value: "cod", label: "Cash on Delivery" },
] as const;

// Store statuses
export const STORE_STATUSES = ["pending", "approved", "rejected", "suspended"] as const;

// User roles
export const USER_ROLES = ["buyer", "seller", "rider", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Routes
export const PUBLIC_ROUTES = ["/", "/shop", "/product", "/services", "/about", "/contact", "/faq", "/terms", "/privacy", "/refund-policy", "/track-order", "/become-a-seller"];
export const AUTH_ROUTES = ["/login", "/register"];
export const BUYER_ROUTES = ["/cart", "/checkout", "/order-success", "/account"];
export const SELLER_ROUTES = ["/seller"];
export const RIDER_ROUTES = ["/rider"];
export const ADMIN_ROUTES = ["/admin"];

// Role-based dashboard redirects
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  buyer: "/",
  seller: "/seller/dashboard",
  rider: "/rider/dashboard",
  admin: "/admin/dashboard",
};

// Supabase storage buckets
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: "product-images",
  STORE_ASSETS: "store-assets",
  SELLER_DOCUMENTS: "seller-documents",
  DELIVERY_PROOFS: "delivery-proofs",
  SERVICE_IMAGES: "service-images",
  BANNERS: "banners",
  AVATARS: "avatars",
} as const;

// Named routes for navigation
export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  SELLER: {
    REGISTER: "/seller/register",
    LOGIN: "/seller/login",
    DASHBOARD: "/seller/dashboard",
    PRODUCTS: "/seller/products",
    ORDERS: "/seller/orders",
    EARNINGS: "/seller/earnings",
    SETTLEMENTS: "/seller/settlements",
    REVIEWS: "/seller/reviews",
    STORE_SETTINGS: "/seller/store-settings",
    PROFILE: "/seller/profile",
    NOTIFICATIONS: "/seller/notifications",
  },
  RIDER: {
    LOGIN: "/rider/login",
    DASHBOARD: "/rider/dashboard",
    ORDERS: "/rider/orders",
    DELIVERIES: "/rider/deliveries",
    COD: "/rider/cod-collections",
    EARNINGS: "/rider/earnings",
    PROFILE: "/rider/profile",
    NOTIFICATIONS: "/rider/notifications",
  },
  ADMIN: {
    LOGIN: "/admin/login",
    DASHBOARD: "/admin/dashboard",
    SELLERS: "/admin/sellers",
    PRODUCTS: "/admin/products",
    CATEGORIES: "/admin/categories",
    ORDERS: "/admin/orders",
    CUSTOMERS: "/admin/customers",
    RIDERS: "/admin/riders",
    SERVICES: "/admin/services",
    RETURNS: "/admin/returns",
    REVIEWS: "/admin/reviews",
    FINANCE: "/admin/finance",
    COUPONS: "/admin/coupons",
    CMS: "/admin/cms",
    REPORTS: "/admin/reports",
    SETTINGS: "/admin/settings",
  },
  BUYER: {
    CART: "/cart",
    CHECKOUT: "/checkout",
    ORDER_SUCCESS: "/order-success",
    ACCOUNT: "/account",
    ORDERS: "/account/orders",
    ADDRESSES: "/account/addresses",
    WISHLIST: "/account/wishlist",
    NOTIFICATIONS: "/account/notifications",
    PROFILE: "/account/profile",
  },
} as const;

