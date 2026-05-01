export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          full_address: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          landmark: string | null
          lat: number | null
          lng: number | null
          phone: string
          pin_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string
          created_at?: string
          full_address: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          phone: string
          pin_code: string
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          full_address?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string
          pin_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          position: string
          sort_order: number
          starts_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          starts_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          position?: string
          sort_order?: number
          starts_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_collections: {
        Row: {
          amount: number
          collected_at: string | null
          created_at: string
          deposit_method: string | null
          deposit_reference: string | null
          deposited_at: string | null
          discrepancy_amount: number | null
          discrepancy_note: string | null
          id: string
          order_id: string
          order_seller_id: string | null
          rider_id: string
          status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          collected_at?: string | null
          created_at?: string
          deposit_method?: string | null
          deposit_reference?: string | null
          deposited_at?: string | null
          discrepancy_amount?: number | null
          discrepancy_note?: string | null
          id?: string
          order_id: string
          order_seller_id?: string | null
          rider_id: string
          status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          collected_at?: string | null
          created_at?: string
          deposit_method?: string | null
          deposit_reference?: string | null
          deposited_at?: string | null
          discrepancy_amount?: number | null
          discrepancy_note?: string | null
          id?: string
          order_id?: string
          order_seller_id?: string | null
          rider_id?: string
          status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cod_collections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cod_collections_order_seller_id_fkey"
            columns: ["order_seller_id"]
            isOneToOne: false
            referencedRelation: "order_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cod_collections_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cod_collections_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          created_at: string
          discount_amount: number
          id: string
          order_id: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_amount: number
          id?: string
          order_id: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_to: string
          category_id: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          max_discount: number | null
          min_order_amount: number | null
          per_user_limit: number
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number
          valid_from: string | null
          valid_to: string | null
          value: number
        }
        Insert: {
          applicable_to?: string
          category_id?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_amount?: number | null
          per_user_limit?: number
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string | null
          valid_to?: string | null
          value: number
        }
        Update: {
          applicable_to?: string
          category_id?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_amount?: number | null
          per_user_limit?: number
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string | null
          valid_to?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          label: string
          max_orders: number
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          label: string
          max_orders?: number
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          label?: string
          max_orders?: number
          start_time?: string
        }
        Relationships: []
      }
      delivery_verifications: {
        Row: {
          cod_amount: number | null
          cod_collected: boolean
          created_at: string
          delivered_at: string | null
          delivery_photo: string | null
          id: string
          inspection_result: string | null
          order_id: string
          order_seller_id: string
          otp_attempts: number
          otp_entered: string | null
          otp_verified: boolean
          rejection_notes: string | null
          rejection_photos: string[] | null
          rejection_reason: string | null
          returned_at: string | null
          rider_id: string
          verified_at: string | null
        }
        Insert: {
          cod_amount?: number | null
          cod_collected?: boolean
          created_at?: string
          delivered_at?: string | null
          delivery_photo?: string | null
          id?: string
          inspection_result?: string | null
          order_id: string
          order_seller_id: string
          otp_attempts?: number
          otp_entered?: string | null
          otp_verified?: boolean
          rejection_notes?: string | null
          rejection_photos?: string[] | null
          rejection_reason?: string | null
          returned_at?: string | null
          rider_id: string
          verified_at?: string | null
        }
        Update: {
          cod_amount?: number | null
          cod_collected?: boolean
          created_at?: string
          delivered_at?: string | null
          delivery_photo?: string | null
          id?: string
          inspection_result?: string | null
          order_id?: string
          order_seller_id?: string
          otp_attempts?: number
          otp_entered?: string | null
          otp_verified?: boolean
          rejection_notes?: string | null
          rejection_photos?: string[] | null
          rejection_reason?: string | null
          returned_at?: string | null
          rider_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_verifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_verifications_order_seller_id_fkey"
            columns: ["order_seller_id"]
            isOneToOne: false
            referencedRelation: "order_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_verifications_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          area_name: string | null
          created_at: string
          delivery_fee: number
          id: string
          is_active: boolean
          min_order_free_delivery: number | null
          pin_code: string
        }
        Insert: {
          area_name?: string | null
          created_at?: string
          delivery_fee?: number
          id?: string
          is_active?: boolean
          min_order_free_delivery?: number | null
          pin_code: string
        }
        Update: {
          area_name?: string | null
          created_at?: string
          delivery_fee?: number
          id?: string
          is_active?: boolean
          min_order_free_delivery?: number | null
          pin_code?: string
        }
        Relationships: []
      }
      landscape_bookings: {
        Row: {
          address: string
          admin_notes: string | null
          area_size: string | null
          booking_number: string
          budget_range: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          description: string | null
          final_price: number | null
          id: string
          preferred_date: string | null
          quoted_price: number | null
          scheduled_visit_date: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          area_size?: string | null
          booking_number: string
          budget_range?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          description?: string | null
          final_price?: number | null
          id?: string
          preferred_date?: string | null
          quoted_price?: number | null
          scheduled_visit_date?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          area_size?: string | null
          booking_number?: string
          budget_range?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          description?: string | null
          final_price?: number | null
          id?: string
          preferred_date?: string | null
          quoted_price?: number | null
          scheduled_visit_date?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landscape_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      landscape_gallery: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          title?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          is_reviewed: boolean
          order_id: string
          order_seller_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_reviewed?: boolean
          order_id: string
          order_seller_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_reviewed?: boolean
          order_id?: string
          order_seller_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_seller_id_fkey"
            columns: ["order_seller_id"]
            isOneToOne: false
            referencedRelation: "order_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_sellers: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string
          delivery_result: string | null
          id: string
          order_id: string
          pickup_address: Json | null
          rejection_reason: string | null
          rider_id: string | null
          seller_amount: number
          settlement_id: string | null
          settlement_status: string
          status: string
          store_id: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string
          delivery_result?: string | null
          id?: string
          order_id: string
          pickup_address?: Json | null
          rejection_reason?: string | null
          rider_id?: string | null
          seller_amount: number
          settlement_id?: string | null
          settlement_status?: string
          status?: string
          store_id: string
          subtotal: number
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          delivery_result?: string | null
          id?: string
          order_id?: string
          pickup_address?: Json | null
          rejection_reason?: string | null
          rider_id?: string | null
          seller_amount?: number
          settlement_id?: string | null
          settlement_status?: string
          status?: string
          store_id?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_sellers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_sellers_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_sellers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string
          order_seller_id: string | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          order_seller_id?: string | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          order_seller_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_seller_id_fkey"
            columns: ["order_seller_id"]
            isOneToOne: false
            referencedRelation: "order_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancel_reason: string | null
          cancelled_by: string | null
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          delivery_address: Json
          delivery_date: string | null
          delivery_fee: number
          delivery_otp: string | null
          delivery_slot_id: string | null
          discount: number
          gift_message: string | null
          id: string
          order_number: string
          otp_verified: boolean
          otp_verified_at: string | null
          payment_method: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          special_instructions: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_reason?: string | null
          cancelled_by?: string | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          delivery_address: Json
          delivery_date?: string | null
          delivery_fee?: number
          delivery_otp?: string | null
          delivery_slot_id?: string | null
          discount?: number
          gift_message?: string | null
          id?: string
          order_number: string
          otp_verified?: boolean
          otp_verified_at?: string | null
          payment_method: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          special_instructions?: string | null
          status?: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_reason?: string | null
          cancelled_by?: string | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          delivery_address?: Json
          delivery_date?: string | null
          delivery_fee?: number
          delivery_otp?: string | null
          delivery_slot_id?: string | null
          discount?: number
          gift_message?: string | null
          id?: string
          order_number?: string
          otp_verified?: boolean
          otp_verified_at?: string | null
          payment_method?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_slot_id_fkey"
            columns: ["delivery_slot_id"]
            isOneToOne: false
            referencedRelation: "delivery_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          product_id: string
          reason: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          product_id: string
          reason?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          product_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_admin_actions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          price: number
          product_id: string
          sale_price: number | null
          sku: string | null
          stock_qty: number
          variant_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          price: number
          product_id: string
          sale_price?: number | null
          sku?: string | null
          stock_qty?: number
          variant_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number
          product_id?: string
          sale_price?: number | null
          sku?: string | null
          stock_qty?: number
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_rating: number
          care_instructions: string | null
          category_id: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deleted_reason: string | null
          description: string | null
          id: string
          is_active: boolean
          is_deleted: boolean
          is_featured: boolean
          name: string
          occasion: string[] | null
          price: number
          sale_price: number | null
          short_description: string | null
          sku: string | null
          slug: string
          stock_qty: number
          store_id: string
          tags: string[] | null
          total_reviews: number
          total_sold: number
          unit: string
          updated_at: string
        }
        Insert: {
          avg_rating?: number
          care_instructions?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          is_featured?: boolean
          name: string
          occasion?: string[] | null
          price: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock_qty?: number
          store_id: string
          tags?: string[] | null
          total_reviews?: number
          total_sold?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          avg_rating?: number
          care_instructions?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          is_featured?: boolean
          name?: string
          occasion?: string[] | null
          price?: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock_qty?: number
          store_id?: string
          tags?: string[] | null
          total_reviews?: number
          total_sold?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          order_id: string
          order_seller_id: string
          photos: string[] | null
          reason: string
          refund_amount: number | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          return_number: string
          rider_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_id: string
          order_seller_id: string
          photos?: string[] | null
          reason: string
          refund_amount?: number | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          return_number: string
          rider_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string
          order_seller_id?: string
          photos?: string[] | null
          reason?: string
          refund_amount?: number | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          return_number?: string
          rider_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_seller_id_fkey"
            columns: ["order_seller_id"]
            isOneToOne: false
            referencedRelation: "order_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          hidden_by: string | null
          hidden_reason: string | null
          id: string
          is_verified_purchase: boolean
          is_visible: boolean
          order_id: string
          order_item_id: string
          product_id: string
          rating: number
          review_text: string | null
          store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_verified_purchase?: boolean
          is_visible?: boolean
          order_id: string
          order_item_id: string
          product_id: string
          rating: number
          review_text?: string | null
          store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_verified_purchase?: boolean
          is_visible?: boolean
          order_id?: string
          order_item_id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_hidden_by_fkey"
            columns: ["hidden_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_earnings: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          rider_id: string
          status: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id?: string | null
          rider_id: string
          status?: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          rider_id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rider_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rider_earnings_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          created_at: string
          current_lat: number | null
          current_lng: number | null
          id: string
          is_active: boolean
          is_available: boolean
          name: string
          phone: string
          total_deliveries: number
          updated_at: string
          user_id: string
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_active?: boolean
          is_available?: boolean
          name: string
          phone: string
          total_deliveries?: number
          updated_at?: string
          user_id: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_active?: boolean
          is_available?: boolean
          name?: string
          phone?: string
          total_deliveries?: number
          updated_at?: string
          user_id?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_bank_details: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          ifsc_code: string
          is_verified: boolean
          store_id: string
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          ifsc_code: string
          is_verified?: boolean
          store_id: string
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          ifsc_code?: string
          is_verified?: boolean
          store_id?: string
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_bank_details_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_documents: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          is_verified: boolean
          store_id: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          is_verified?: boolean
          store_id: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          is_verified?: boolean
          store_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_documents_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          store_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          store_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          store_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_notifications_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_settlements: {
        Row: {
          approved_by: string | null
          created_at: string
          gross_sales: number
          id: string
          net_amount: number
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          settlement_number: string
          status: string
          store_id: string
          total_commission: number
          total_delivered: number
          total_orders: number
          total_returned: number
          total_returns_deduction: number
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          gross_sales?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          settlement_number: string
          status?: string
          store_id: string
          total_commission?: number
          total_delivered?: number
          total_orders?: number
          total_returned?: number
          total_returns_deduction?: number
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          gross_sales?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          settlement_number?: string
          status?: string
          store_id?: string
          total_commission?: number
          total_delivered?: number
          total_orders?: number
          total_returned?: number
          total_returns_deduction?: number
        }
        Relationships: [
          {
            foreignKeyName: "seller_settlements_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_settlements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          address: Json | null
          admin_notes: string | null
          after_photos: string[] | null
          assessment_notes: string | null
          assessment_photos: string[] | null
          assigned_team_member: string | null
          before_photos: string[] | null
          booking_number: string
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string
          customer_notes: string | null
          final_price: number | null
          id: string
          preferred_date: string | null
          preferred_time: string | null
          quote_description: string | null
          quoted_price: number | null
          reference_photos: string[] | null
          service_id: string
          site_visit_date: string | null
          site_visit_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          admin_notes?: string | null
          after_photos?: string[] | null
          assessment_notes?: string | null
          assessment_photos?: string[] | null
          assigned_team_member?: string | null
          before_photos?: string[] | null
          booking_number: string
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          final_price?: number | null
          id?: string
          preferred_date?: string | null
          preferred_time?: string | null
          quote_description?: string | null
          quoted_price?: number | null
          reference_photos?: string[] | null
          service_id: string
          site_visit_date?: string | null
          site_visit_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          admin_notes?: string | null
          after_photos?: string[] | null
          assessment_notes?: string | null
          assessment_photos?: string[] | null
          assigned_team_member?: string | null
          before_photos?: string[] | null
          booking_number?: string
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string
          customer_notes?: string | null
          final_price?: number | null
          id?: string
          preferred_date?: string | null
          preferred_time?: string | null
          quote_description?: string | null
          quoted_price?: number | null
          reference_photos?: string[] | null
          service_id?: string
          site_visit_date?: string | null
          site_visit_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_assigned_team_member_fkey"
            columns: ["assigned_team_member"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          name: string
          price_starts_at: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          name: string
          price_starts_at?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          name?: string
          price_starts_at?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      settlement_items: {
        Row: {
          commission_amount: number | null
          id: string
          net_amount: number | null
          order_amount: number | null
          order_date: string | null
          order_number: string | null
          order_seller_id: string
          return_deduction: number
          settlement_id: string
        }
        Insert: {
          commission_amount?: number | null
          id?: string
          net_amount?: number | null
          order_amount?: number | null
          order_date?: string | null
          order_number?: string | null
          order_seller_id: string
          return_deduction?: number
          settlement_id: string
        }
        Update: {
          commission_amount?: number | null
          id?: string
          net_amount?: number | null
          order_amount?: number | null
          order_date?: string | null
          order_number?: string | null
          order_seller_id?: string
          return_deduction?: number
          settlement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_items_order_seller_id_fkey"
            columns: ["order_seller_id"]
            isOneToOne: false
            referencedRelation: "order_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_items_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "seller_settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          approval_note: string | null
          approved_at: string | null
          approved_by: string | null
          banner_url: string | null
          commission_rate: number | null
          created_at: string
          description: string | null
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          logo_url: string | null
          metadata: Json | null
          phone: string | null
          pin_code: string | null
          rating: number
          slug: string
          status: string
          store_name: string
          total_orders: number
          total_products: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          approval_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          banner_url?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          pin_code?: string | null
          rating?: number
          slug: string
          status?: string
          store_name: string
          total_orders?: number
          total_products?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          approval_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          banner_url?: string | null
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          metadata?: Json | null
          phone?: string | null
          pin_code?: string | null
          rating?: number
          slug?: string
          status?: string
          store_name?: string
          total_orders?: number
          total_products?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          blocked_reason: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          is_blocked: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          blocked_reason?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean
          is_blocked?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          blocked_reason?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          is_blocked?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
      get_user_store_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

