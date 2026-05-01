import { z } from "zod";

// Auth
export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const passwordLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Address
export const addressSchema = z.object({
  full_name: z.string().min(2, "Name is required").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid phone number"),
  full_address: z.string().min(10, "Address must be at least 10 characters").max(500),
  landmark: z.string().max(200).optional(),
  pin_code: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pin code"),
  city: z.string().default("Daltonganj"),
  state: z.string().default("Jharkhand"),
  label: z.enum(["Home", "Office", "Other"]).default("Home"),
  is_default: z.boolean().default(false),
});

// Product
export const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(200),
  category_id: z.string().uuid("Select a category"),
  description: z.string().min(20, "Description must be at least 20 characters").optional(),
  short_description: z.string().max(200).optional(),
  price: z.coerce.number().min(1, "Price must be at least ₹1"),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  stock_qty: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().max(50).optional(),
  unit: z.enum(["piece", "bunch", "kg", "pot", "packet", "pair"]).default("piece"),
  tags: z.array(z.string()).default([]),
  occasion: z.array(z.string()).default([]),
  care_instructions: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const productVariantSchema = z.object({
  variant_name: z.string().min(1, "Variant name is required"),
  price: z.coerce.number().min(1),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  stock_qty: z.coerce.number().int().min(0),
  sku: z.string().optional(),
});

// Review
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(10, "Review must be at least 10 characters").max(1000).optional(),
});

// Category (Admin)
export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().max(500).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

// Seller Registration
export const sellerRegistrationSchema = z.object({
  store_name: z.string().min(3, "Store name must be at least 3 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(10, "Address is required").max(500),
  pin_code: z.string().regex(/^\d{6}$/, "Enter a valid pin code"),
  gst_number: z.string().max(15).optional(),
});

// Coupon
export const couponSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(1, "Value must be at least 1"),
  min_order_amount: z.coerce.number().min(0).optional().nullable(),
  max_discount: z.coerce.number().min(0).optional().nullable(),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
  usage_limit: z.coerce.number().int().min(1).optional().nullable(),
  per_user_limit: z.coerce.number().int().min(1).default(1),
  is_active: z.boolean().default(true),
});

// Service Booking
export const serviceBookingSchema = z.object({
  service_id: z.string().uuid(),
  preferred_date: z.string().min(1, "Select a date"),
  preferred_time: z.string().min(1, "Select a time"),
  address: addressSchema,
  customer_notes: z.string().max(500).optional(),
});

// Export types inferred from schemas
export type OtpFormData = z.infer<typeof otpSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordLoginFormData = z.infer<typeof passwordLoginSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type SellerRegistrationFormData = z.infer<typeof sellerRegistrationSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type ServiceBookingFormData = z.infer<typeof serviceBookingSchema>;
