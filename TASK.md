# PLANTORA — Deployment-Ready Task Breakdown

> **Part 1 Completed:** Project setup, DB schema (32 tables), Supabase auth, buyer storefront (home, shop, category, product detail, search, cart, wishlist, checkout, order-success, account pages), seller product CRUD, admin category management, proxy/middleware, static pages, and full Supabase security/performance optimization (9 production migrations).

---

## Phase 1: Seller Panel — Complete Build ✅
> Seller registration, dashboard, product management enhancement, order management, earnings, store settings

- [x] **Seller Registration Flow**
  - [x] Multi-step registration form (Personal → Store → Documents → Bank)
  - [x] Document upload (Aadhaar, PAN, GST, Shop License) via Supabase Storage
  - [x] Bank details form with validation
  - [x] Registration API route with store + documents + bank creation
  - [x] Pending approval waiting screen (`/seller/pending-approval`)
  - [x] Email/SMS notification on approval/rejection

- [x] **Seller Dashboard** (`/seller/dashboard`)
  - [x] Quick stats cards (New Orders, Revenue Today/Month, Products, Pending Orders, Avg Rating)
  - [x] Recent orders list (last 10)
  - [x] Revenue chart (weekly/monthly — bar/line chart)
  - [x] Low stock alerts
  - [x] Quick actions: "Add Product", "View Orders"

- [x] **Product Management Enhancement**
  - [x] Product image upload with drag-and-drop, reorder, set primary
  - [x] Product variant support (Size, Pot Type with variant price/stock)
  - [x] Bulk stock update page
  - [x] Admin-deleted product notification section ("Removed Products")
  - [x] Product status toggle (active/inactive)
  - [x] Product search, filter, sort on list page

- [x] **Seller Order Management** (`/seller/orders`)
  - [x] Order list with filters (status, date range, search)
  - [x] Order detail view (items, customer address, delivery slot, payment method)
  - [x] Order actions: Confirm → Pack → Cancel (with reason)
  - [x] Financial breakdown per order (amount, commission, seller earning)
  - [x] Sound alert / push notification for new orders
  - [x] Order status timeline

- [x] **Seller Earnings & Settlements**
  - [x] Earnings overview page (all-time, weekly, monthly, pending settlement)
  - [x] Per-order breakdown table
  - [x] Settlement history list (period, gross, commission, net, status)
  - [x] CSV export for earnings data

- [x] **Seller Reviews** (`/seller/reviews`)
  - [x] List all reviews on seller's products
  - [x] Average rating + distribution chart
  - [x] Sort/filter by product, rating, date
  - [x] Low rating alerts

- [x] **Seller Store Settings** (`/seller/store-settings`)
  - [x] Store profile edit (name, description, logo, banner, address)
  - [x] Bank details view/update
  - [x] Notification preferences

---

## Phase 2: Admin Panel — Core Management ✅
> Dashboard, seller management, product oversight, order management

- [x] **Admin Dashboard** (`/admin/dashboard`)
  - [x] Today's stats: Orders, Revenue, Commission, New Customers, Active Sellers/Riders
  - [x] Revenue chart (daily/weekly/monthly)
  - [x] Orders volume chart
  - [x] Recent orders (last 10)
  - [x] Pending seller approvals queue
  - [x] Pending return requests
  - [x] Low stock product alerts
  - [x] Quick action buttons

- [x] **Seller Management**
  - [x] All sellers table with filters (status, search, sort)
  - [x] Pending approvals queue with full application review
  - [x] Approve/Reject with reason + notification
  - [x] Autopilot toggle (auto-approve)
  - [x] Seller detail page: stats, products, orders, earnings, documents
  - [x] Custom commission rate per seller
  - [x] Suspend/Reactivate/Delete seller

- [x] **Admin Product Management** (`/admin/products`)
  - [x] All products table (cross-seller) with filters/search/sort
  - [x] Feature/Unfeature product
  - [x] Delete product with mandatory reason + seller notification
  - [x] Restore deleted products
  - [x] Product admin actions log
  - [x] Product reports (top selling, low stock, low rating)

- [x] **Admin Category Management Enhancement**
  - [x] Category tree view with parent → child hierarchy
  - [x] Drag-and-drop reorder
  - [x] Category image upload
  - [x] Active/Inactive toggle

- [x] **Admin Order Management** (`/admin/orders`)
  - [x] All orders table (cross-seller) with filters/search
  - [x] Order detail with sub-orders grouped by seller
  - [x] Assign/reassign rider to sub-orders
  - [x] Manual status override
  - [x] Cancel order with reason + refund initiation
  - [x] View delivery/return proof photos

---

## Phase 3: Rider Panel — Complete Build ✅
> Dashboard, delivery flow, OTP verification, open-box inspection, COD management

- [x] **Rider Login & Auth**
  - [x] Phone OTP login (rider accounts created by admin only)
  - [x] Rider login page (`/rider/login`)

- [x] **Rider Dashboard** (`/rider/dashboard`)
  - [x] Availability toggle (Online/Offline)
  - [x] Today's summary: Assigned, Completed, Pending, COD collected, Earnings
  - [x] Active delivery card (current assignment)
  - [x] Quick navigation to active order

- [x] **Assigned Orders** (`/rider/orders`)
  - [x] List of all assigned deliveries with order cards
  - [x] Order card: Order #, pickup/drop address, items, payment method, COD amount, slot
  - [x] Sort by time slot, priority

- [x] **Delivery Flow** (step-by-step per order)
  - [x] Step 1: Navigate to Seller → Google Maps deep link, "Reached Seller" button
  - [x] Step 2: Pickup → Item checklist, verify with seller, "Items Picked Up"
  - [x] Step 3: Navigate to Customer → Maps link, "Reached Customer"
  - [x] Step 4: OTP Verification → 6-digit input, max 3 attempts
  - [x] Step 5: Open Box Delivery
    - [x] Accept flow: Photo proof capture, COD collection prompt, "Complete Delivery"
    - [x] Reject flow: Reason selection, notes, photo capture, "Confirm Return"

- [x] **COD Management** (`/rider/cod-collections`)
  - [x] Total COD collected today (running total)
  - [x] Per-order COD details
  - [x] "Deposit COD" feature (amount, method, reference)
  - [x] Deposit history

- [x] **Rider Earnings** (`/rider/earnings`)
  - [x] Today/week/month earnings
  - [x] Per-delivery breakdown
  - [x] Payout history

- [x] **Rider Profile** (`/rider/profile`)
  - [x] Name, phone, vehicle type/number
  - [x] Availability status
  - [x] Profile update

- [x] **Delivery History** (`/rider/deliveries`)
  - [x] Past deliveries with date filter
  - [x] Status, delivery time, payment method, COD amount

---

## Phase 4: Multi-Seller Checkout & Payment ✅
> Complete checkout flow with multi-seller cart splitting, Razorpay UPI, COD, order placement

- [x] **Multi-Seller Cart Enhancement**
  - [x] Cart grouped by seller (subtle separator, "Shipped by: Store" text)
  - [x] Per-seller subtotal calculation
  - [x] Cart validation (stock check, active product check per seller)
  - [x] Handle seller-wise delivery feasibility

- [x] **Checkout Flow — Full Build**
  - [x] Step 1: Address selection/creation with Daltonganj pin code validation
  - [x] Step 2: Delivery date picker + time slot selection (configurable slots)
  - [x] Step 3: Payment method selection (UPI via Razorpay / COD)
  - [x] Step 4: Order summary — items, subtotal, coupon, delivery fee, total
  - [x] Gift message + special delivery instructions fields
  - [x] "Place Order" with loading + error handling

- [x] **Razorpay Integration**
  - [x] Server: Create Razorpay order API route (`/api/payments/create-order`)
  - [x] Client: Razorpay checkout popup (UPI, Cards, Wallets)
  - [x] Server: Payment verification webhook (`/api/webhooks/razorpay`)
  - [x] Payment status handling (success → order confirm, failure → retry/cancel)
  - [x] Razorpay test mode toggle for development

- [x] **COD Implementation**
  - [x] COD option in checkout with confirmation message
  - [x] COD order placement (skip payment gateway)
  - [x] COD extra charge (configurable, default ₹0)

- [x] **Multi-Seller Order Placement Logic**
  - [x] Create 1 master order from cart
  - [x] Split into N sub-orders (one per seller) in `order_sellers`
  - [x] Snapshot commission rate per sub-order at order time
  - [x] Calculate commission_amount + seller_amount per sub-order
  - [x] Snapshot seller pickup address per sub-order
  - [x] Generate 6-digit delivery OTP (hashed in DB)
  - [x] Reduce product stock atomically (handle race conditions)
  - [x] Clear buyer's cart after successful order
  - [x] Create order_items linked to correct order_seller_id
  - [x] Insert order_status_history entry

- [x] **Post-Order Notifications**
  - [x] Notify each seller of their sub-order (push + sound)
  - [x] Buyer order confirmation page with OTP display
  - [ ] SMS to buyer: order confirmation + delivery OTP
  - [ ] WhatsApp to buyer: order details + OTP

- [x] **Coupon System**
  - [x] Admin: Coupon CRUD (code, type, value, min order, max discount, validity, limits)
  - [x] Buyer: Apply coupon field at checkout
  - [x] Server: Coupon validation API (`/api/coupons/validate`)
  - [x] Track coupon usage in `coupon_usage` table
  - [x] Prevent exceeding per-user and global limits

---

## Phase 5: Order Lifecycle & Returns ✅
> Full order status flow, buyer tracking, multi-seller sub-order tracking, return/refund

- [ ] **Order Status State Machine**
  - [ ] Master order statuses: placed → confirmed → processing → out_for_delivery → delivered / partially_delivered / cancelled / return_initiated / returned
  - [ ] Sub-order statuses: placed → confirmed → packed → rider_assigned → picked_up → out_for_delivery → delivered / cancelled / return_initiated / returned
  - [ ] Status change APIs with validation (only valid transitions)
  - [ ] Auto-update master order status based on sub-order statuses
  - [ ] Order status history logging with timestamps + actor

- [ ] **Seller Order Flow Integration**
  - [ ] Seller receives new sub-order notification (real-time via Supabase Realtime)
  - [ ] Seller confirms sub-order → status: confirmed
  - [ ] Seller marks as packed → status: packed → triggers admin "assign rider" queue
  - [ ] Seller cancels sub-order → reason required → buyer notified → refund if UPI

- [ ] **Admin Rider Assignment**
  - [ ] Admin sees packed sub-orders in assignment queue
  - [ ] Assign available rider from dropdown (shows current rider load)
  - [ ] Rider assignment → sub-order status: rider_assigned → rider notified
  - [ ] Reassign rider (if needed)

- [ ] **Rider Delivery Flow Integration**
  - [ ] Rider picks up → status: picked_up
  - [ ] Rider marks out for delivery → status: out_for_delivery → buyer notified with rider info
  - [ ] OTP verification → delivery verification record created
  - [ ] Accept → delivery photo → COD collection (if COD) → status: delivered
  - [ ] Reject → reason + photos → status: return_initiated → return record created

- [ ] **Buyer Order Tracking** (`/account/orders/[id]`)
  - [ ] Visual order status timeline (progress bar with timestamps)
  - [ ] Sub-order tabs/sections for multi-seller orders
  - [ ] Delivery OTP display with copy button
  - [ ] Rider info when out for delivery (name, phone, "Call Rider")
  - [ ] Real-time status updates via Supabase Realtime subscription

- [ ] **Buyer My Orders** (`/account/orders`)
  - [ ] Order list with status badges (color-coded)
  - [ ] Filter by status: All, Active, Delivered, Cancelled
  - [ ] Search by order number
  - [ ] "Write Review" button per delivered item
  - [ ] "Reorder" button (add same items to cart)

- [ ] **Return & Refund System**
  - [ ] Return initiated by rider on customer rejection (photos + reason)
  - [ ] Return record created in `returns` table
  - [ ] Admin return review page (`/admin/returns`)
    - [ ] View evidence: rejection photos, reason, rider notes
    - [ ] Resolution: Full refund / Partial refund / Replacement / Reject
  - [ ] Refund processing for UPI orders (Razorpay refund API)
  - [ ] COD returns: no cash collected, so no refund needed
  - [ ] Buyer notification on return resolution
  - [ ] Return status tracking in buyer's account

---

## Phase 6: Review System ✅
> Star ratings, text reviews, product display, seller view, admin moderation

- [ ] **Buyer: Write Review**
  - [ ] "Write a Review" button on delivered order items (order detail + product page)
  - [ ] Star rating selector (1-5 stars, required)
  - [ ] Text review textarea (optional, encouraged)
  - [ ] Submit review API (`/api/reviews`)
  - [ ] Validation: only verified purchases, order status = delivered, within 30 days
  - [ ] One review per product per order (can edit within 48 hours)
  - [ ] Auto-recalculate product `avg_rating` and `total_reviews` via DB trigger or API

- [ ] **Product Review Display**
  - [ ] Rating summary section on product detail page:
    - [ ] Average rating (large number + stars)
    - [ ] Total review count
    - [ ] Star distribution bar chart (5→1)
  - [ ] Individual review cards: reviewer name (first + last initial), stars, date, text, "Verified Purchase" badge
  - [ ] Sort reviews: Most Recent, Highest, Lowest
  - [ ] Pagination / Load More

- [ ] **Seller: Review Dashboard** (`/seller/reviews`)
  - [ ] Already built in Phase 1 — connect to live review data

- [ ] **Admin: Review Moderation** (`/admin/reviews`)
  - [ ] All reviews table with filters (rating, product, seller, date, visibility)
  - [ ] Hide review with reason (spam, inappropriate)
  - [ ] Restore hidden review
  - [ ] Delete review (permanent)
  - [ ] Review analytics: platform avg rating, volume trends, lowest-rated products/sellers

---

## Phase 7: Finance & Settlements ✅
> Seller settlements, COD reconciliation, revenue dashboard

- [ ] **Settlement System**
  - [ ] Admin: Generate weekly settlement for each seller (Mon-Sun period)
  - [ ] Settlement calculation: sum delivered sub-orders, deduct commission + returns
  - [ ] Settlement queue: Generated → Pending Approval → Approved → Paid
  - [ ] "Mark as Paid" with payment method + reference number + date
  - [ ] Seller notification on settlement payment
  - [ ] Seller: View settlement history with per-order breakdown

- [ ] **COD Reconciliation** (`/admin/finance/cod`)
  - [ ] Today's COD summary: total collected, deposited, pending
  - [ ] Per-rider COD status breakdown
  - [ ] Verify rider deposits (match amount vs collected)
  - [ ] Flag discrepancies with admin notes
  - [ ] Discrepancy report

- [ ] **Admin Revenue Dashboard** (`/admin/finance`)
  - [ ] Total revenue, commission earned, delivery fees, refunds issued, net profit
  - [ ] Revenue chart (daily/weekly/monthly with period selector)
  - [ ] Revenue breakdown: UPI vs COD
  - [ ] Revenue by category, by seller (top sellers)

- [ ] **Financial Reports** (CSV exportable)
  - [ ] Daily/weekly/monthly revenue report
  - [ ] Commission report
  - [ ] Settlement report
  - [ ] Refund report

---

## Phase 8: Admin — Riders, Customers, Platform Settings
> Rider CRUD, customer management, full platform configuration

- [ ] **Admin Rider Management** (`/admin/riders`)
  - [ ] All riders table: name, phone, vehicle, status (online/offline), active deliveries, COD pending
  - [ ] Add new rider form → creates user (role=rider) + rider record
  - [ ] Rider detail page: performance stats, delivery history, COD status
  - [ ] Activate/Deactivate rider

- [ ] **Admin Customer Management** (`/admin/customers`)
  - [ ] All customers table: name, phone, email, orders count, total spent
  - [ ] Customer detail page: profile, order history, addresses, reviews written
  - [ ] Block/Unblock customer with reason

- [ ] **Platform Settings** (`/admin/settings`)
  - [ ] General: Platform name, tagline, logo, favicon, contact info, social links
  - [ ] Commission: Default rate editor (global)
  - [ ] Delivery: Zones/pin codes CRUD, delivery fee per zone, free delivery threshold
  - [ ] Delivery: Time slots CRUD (label, start/end time, max orders per slot)
  - [ ] Payment: Enable/Disable UPI/COD, COD extra charge, Razorpay key configuration
  - [ ] Seller Approval: Autopilot toggle, required documents config
  - [ ] Order: Min order amount, OTP toggle, open-box toggle
  - [ ] SEO: Default meta title/description, OG image, Google Analytics ID

---

## Phase 9: Landscape Design Landscape ✅
> Custom landscape design consultation, proposal, execution flow for Roof, Balcony, Open Area

- [ ] **Buyer Landscape Portal** (`/landscape`)
  - [ ] Landscape Landscape landing page:
    - [ ] Hero section with before/after garden transformation showcase
    - [ ] Service types: Roof Garden, Balcony Garden, Open Area/Backyard Garden
    - [ ] Each type card with description, sample images, starting price
    - [ ] "How It Works" section: Request → Visit → Design → Execute → Enjoy
  - [ ] Service detail pages per type (roof, balcony, open-area)
    - [ ] Photo gallery of past projects (before/after)
    - [ ] What's included breakdown
    - [ ] Pricing guide (starting from)
    - [ ] FAQ specific to that service type
  - [ ] "Request Consultation" form:
    - [ ] Name, Phone, Email
    - [ ] Service type dropdown (Roof / Balcony / Open Area / Full Home)
    - [ ] Property address + area size (approximate)
    - [ ] Preferred date for site visit
    - [ ] Description of requirements (textarea)
    - [ ] Upload reference photos (up to 5 images)
    - [ ] Budget range selector (optional)
    - [ ] Submit → booking created in DB
  - [ ] Booking confirmation page/message
  - [ ] Buyer consultation tracker (`/account/landscape`):
    - [ ] Pipeline status: Requested → Visit Scheduled → Visited → Proposal Sent → Accepted/Rejected → Work in Progress → Completed
    - [ ] View uploaded proposal/design documents (PDF/images)
    - [ ] Accept/Reject proposal with notes
    - [ ] View before/after photos once completed
    - [ ] Chat notes / timeline of interactions

- [ ] **Admin Landscape Management** (`/admin/landscape`)
  - [ ] Incoming requests queue (Kanban board or filterable list)
  - [ ] Request detail view:
    - [ ] Customer info, address, service type, area details
    - [ ] Reference photos uploaded by customer
    - [ ] Schedule site visit (set date/time, assign team member)
  - [ ] Site visit management:
    - [ ] Mark as visited
    - [ ] Add assessment notes + upload assessment photos
    - [ ] Record site measurements / conditions
  - [ ] Proposal creation:
    - [ ] Upload multiple design options (images/PDFs)
    - [ ] Enter quoted price + description of work
    - [ ] Send proposal to customer → customer notified
  - [ ] Execution tracking:
    - [ ] Mark client approved → assign execution team
    - [ ] Work in Progress status with notes
    - [ ] Upload progress photos
    - [ ] Upload before/after completion photos
    - [ ] Enter final price (may differ from quote)
    - [ ] Mark as completed → customer notified
  - [ ] Cancel/Reject inquiry with reason
  - [ ] Landscape service analytics:
    - [ ] Total inquiries, conversion rate, avg project value
    - [ ] Revenue from landscape Landscape

- [ ] **Landscape Service Listings Management** (`/admin/Landscape`)
  - [ ] Service CRUD (name, description, images, starting price, category)
  - [ ] Service types: Roof Garden Setup, Balcony Garden, Open Area Garden, Event Decoration, Plant Maintenance
  - [ ] Upload past project showcase images (before/after)
  - [ ] Active/Inactive toggle
  - [ ] Sort order management

---

## Phase 10: Marketing & Notifications
> Banners, push notifications, SMS/WhatsApp, email

- [ ] **Banner Management** (`/admin/cms/banners`)
  - [ ] Banner CRUD: image upload, link URL, position (hero/middle/bottom), scheduling, sort order
  - [ ] Preview banners
  - [ ] Connect banners to homepage hero slider

- [ ] **Push Notification System**
  - [ ] Firebase FCM setup
  - [ ] PWA push registration + service worker
  - [ ] Auto-triggered: Order status changes, delivery OTP reminder
  - [ ] Admin: Send notification tool (target segment, title, message, link)
  - [ ] Notification history

- [ ] **SMS Integration**
  - [ ] OTP sending (registration + login + delivery)
  - [ ] Order confirmation SMS
  - [ ] Delivery update SMS

- [ ] **WhatsApp Integration**
  - [ ] Order confirmation message with OTP
  - [ ] Delivery update messages
  - [ ] WhatsApp button on website (floating)

- [ ] **Email (Transactional)**
  - [ ] Order confirmation email
  - [ ] Seller registration/approval email
  - [ ] Settlement payment email

---

## Phase 11: Admin Reports & Analytics
> Comprehensive reporting for all business metrics

- [ ] **Reports Dashboard** (`/admin/reports`)
  - [ ] Sales report: date range selector, total sales, order count, avg order value
  - [ ] Seller performance: orders, revenue, commission earned, avg rating, return rate
  - [ ] Rider performance: total deliveries, avg delivery time, returns handled, COD accuracy
  - [ ] Product performance: top selling, most reviewed, highest/lowest rated, low stock
  - [ ] Customer analytics: new vs returning, avg order value, top customers by spend
  - [ ] Return report: return rate, common reasons, resolution types breakdown
  - [ ] Review report: rating trends over time, review volume, lowest-rated items
  - [ ] All reports exportable as CSV

---

## Phase 12: Buyer Experience Polish
> Complete buyer account pages, static page content, public tracking

- [ ] **Account Pages Completion**
  - [ ] `/account` overview page (summary: recent orders, saved addresses, wishlist count)
  - [ ] `/account/profile` — View/edit name, email, phone, avatar upload
  - [ ] `/account/addresses` — Full CRUD for addresses, set default, pin code validation
  - [ ] `/account/notifications` — Notification list, mark as read, click to navigate

- [ ] **Static Pages Content**
  - [ ] About Us (`/about`) — Platform story, mission, team, Daltonganj focus
  - [ ] Contact Us (`/contact`) — WhatsApp button, contact form, address, phone, map
  - [ ] FAQ (`/faq`) — Collapsible Q&A (buyer, seller, delivery, payment sections)
  - [ ] Terms & Conditions (`/terms`)
  - [ ] Privacy Policy (`/privacy`)
  - [ ] Refund & Return Policy (`/refund-policy`)

- [ ] **Become a Seller** (`/become-a-seller`)
  - [ ] Benefits showcase, step-by-step process, registration CTA

- [ ] **Track Order** (`/track-order`)
  - [ ] Public order tracking with order number input (no login required)

---

## Phase 13: PWA & SEO
> Progressive Web App, service worker, search engine optimization

- [ ] **PWA Implementation**
  - [ ] `manifest.json` (app name, icons, theme colors, display: standalone)
  - [ ] Service worker: caching strategies (cache-first for assets, network-first for API)
  - [ ] Offline fallback page
  - [ ] Install prompt ("Add to Home Screen")
  - [ ] App-like splash screen
  - [ ] Bottom navigation on mobile (buyer pages)

- [ ] **SEO Optimization**
  - [ ] Meta tags (title, description) for every page
  - [ ] Open Graph tags for social sharing
  - [ ] Structured data / JSON-LD: Products, Reviews, Organization, LocalBusiness
  - [ ] Dynamic `sitemap.xml` generation (products, categories, Landscape)
  - [ ] `robots.txt`
  - [ ] Canonical URLs
  - [ ] Local SEO focus: "flower delivery in daltonganj", "plants daltonganj"

- [ ] **Performance Optimization**
  - [ ] Image optimization (`next/image`, WebP, Cloudinary transforms)
  - [ ] Code splitting & lazy loading
  - [ ] API response caching (SWR / React Query patterns)
  - [ ] Core Web Vitals compliance

---

## Phase 14: Testing & QA
> End-to-end flow testing, edge cases, cross-browser

- [ ] **Buyer Flow Testing**
  - [ ] Browse → Cart → Checkout → Pay (UPI) → Track → Review
  - [ ] Browse → Cart → Checkout → COD → Deliver → Review
  - [ ] Multi-seller cart → single checkout → sub-orders split correctly
  - [ ] Wishlist, address CRUD, coupon application
  - [ ] Landscape consultation request → tracker

- [ ] **Seller Flow Testing**
  - [ ] Register → Pending → Approved → Add Product → Receive Order → Confirm → Pack
  - [ ] Earnings dashboard, settlement view accuracy
  - [ ] Multiple sellers handling same order

- [ ] **Rider Flow Testing**
  - [ ] Login → Assigned Orders → Pickup → OTP → Accept/Reject → COD deposit
  - [ ] Multi-pickup (same rider, multiple sub-orders)

- [ ] **Admin Flow Testing**
  - [ ] Approve seller → Manage products → Assign rider → Process settlement
  - [ ] Returns, reviews moderation, reports accuracy
  - [ ] Landscape request pipeline → proposal → completion
  - [ ] Platform settings changes propagate correctly

- [ ] **Edge Cases**
  - [ ] Empty states (no orders, no products, no reviews)
  - [ ] Error handling (network failures, payment failures, timeout)
  - [ ] Pin code validation (reject outside Daltonganj)
  - [ ] OTP max attempts lockout
  - [ ] Out-of-stock during checkout (race condition)
  - [ ] Seller suspended mid-order

- [ ] **Cross-Browser Testing**
  - [ ] Chrome, Firefox, Safari, Edge (desktop)
  - [ ] Mobile Chrome, Mobile Safari

---

## Phase 15: Deployment & Launch
> Production deployment, platform configuration, seed data

- [ ] **Production Deployment**
  - [ ] Vercel production setup with environment variables
  - [ ] Domain configuration + SSL
  - [ ] Razorpay live mode activation
  - [ ] SMS/WhatsApp production API keys
  - [ ] Supabase production project (if separate from dev)

- [ ] **Platform Setup**
  - [ ] Create admin account
  - [ ] Configure all platform settings (commission, delivery, payment, SEO)
  - [ ] Set up delivery zones (Daltonganj pin codes + fees)
  - [ ] Configure delivery time slots
  - [ ] Upload platform logo, favicon, banners

- [ ] **Seed Data**
  - [ ] All product categories with images
  - [ ] Demo products with real images (platform's own store)
  - [ ] Homepage banners
  - [ ] Landscape service listings with showcase photos
  - [ ] Platform settings defaults
  - [ ] FAQ content

- [ ] **Documentation**
  - [ ] Seller onboarding guide (how to register, add products, manage orders)
  - [ ] Rider usage guide (delivery flow, OTP, COD deposit)
  - [ ] Admin operations guide (settlements, returns, settings)
