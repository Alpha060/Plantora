# PLANTORA — Part 2 Task Breakdown

> **Part 1 Completed:** Project setup, DB schema (32 tables), Supabase auth, buyer storefront (home, shop, category, product detail, search, cart, wishlist, checkout, order-success, account pages), seller product CRUD, admin category management, proxy/middleware, static pages, and full Supabase security/performance optimization (9 production migrations).

---

## Phase 1: Seller Panel — Complete Build
> Seller registration, dashboard, product management enhancement, order management, earnings, store settings

- [ ] **Seller Registration Flow**
  - [ ] Multi-step registration form (Personal → Store → Documents → Bank)
  - [ ] Document upload (Aadhaar, PAN, GST, Shop License) via Supabase Storage
  - [ ] Bank details form with validation
  - [ ] Registration API route with store + documents + bank creation
  - [ ] Pending approval waiting screen (`/seller/pending-approval`)
  - [ ] Email/SMS notification on approval/rejection

- [ ] **Seller Dashboard** (`/seller/dashboard`)
  - [ ] Quick stats cards (New Orders, Revenue Today/Month, Products, Pending Orders, Avg Rating)
  - [ ] Recent orders list (last 10)
  - [ ] Revenue chart (weekly/monthly — bar/line chart)
  - [ ] Low stock alerts
  - [ ] Quick actions: "Add Product", "View Orders"

- [ ] **Product Management Enhancement**
  - [ ] Product image upload with drag-and-drop, reorder, set primary
  - [ ] Product variant support (Size, Pot Type with variant price/stock)
  - [ ] Bulk stock update page
  - [ ] Admin-deleted product notification section ("Removed Products")
  - [ ] Product status toggle (active/inactive)
  - [ ] Product search, filter, sort on list page

- [ ] **Seller Order Management** (`/seller/orders`)
  - [ ] Order list with filters (status, date range, search)
  - [ ] Order detail view (items, customer address, delivery slot, payment method)
  - [ ] Order actions: Confirm → Pack → Cancel (with reason)
  - [ ] Financial breakdown per order (amount, commission, seller earning)
  - [ ] Sound alert / push notification for new orders
  - [ ] Order status timeline

- [ ] **Seller Earnings & Settlements**
  - [ ] Earnings overview page (all-time, weekly, monthly, pending settlement)
  - [ ] Per-order breakdown table
  - [ ] Settlement history list (period, gross, commission, net, status)
  - [ ] CSV export for earnings data

- [ ] **Seller Reviews** (`/seller/reviews`)
  - [ ] List all reviews on seller's products
  - [ ] Average rating + distribution chart
  - [ ] Sort/filter by product, rating, date
  - [ ] Low rating alerts

- [ ] **Seller Store Settings** (`/seller/store-settings`)
  - [ ] Store profile edit (name, description, logo, banner, address)
  - [ ] Bank details view/update
  - [ ] Notification preferences

---

## Phase 2: Admin Panel — Core Management
> Dashboard, seller management, product oversight, order management

- [ ] **Admin Dashboard** (`/admin/dashboard`)
  - [ ] Today's stats: Orders, Revenue, Commission, New Customers, Active Sellers/Riders
  - [ ] Revenue chart (daily/weekly/monthly)
  - [ ] Orders volume chart
  - [ ] Recent orders (last 10)
  - [ ] Pending seller approvals queue
  - [ ] Pending return requests
  - [ ] Low stock product alerts
  - [ ] Quick action buttons

- [ ] **Seller Management**
  - [ ] All sellers table with filters (status, search, sort)
  - [ ] Pending approvals queue with full application review
  - [ ] Approve/Reject with reason + notification
  - [ ] Autopilot toggle (auto-approve)
  - [ ] Seller detail page: stats, products, orders, earnings, documents
  - [ ] Custom commission rate per seller
  - [ ] Suspend/Reactivate/Delete seller

- [ ] **Admin Product Management** (`/admin/products`)
  - [ ] All products table (cross-seller) with filters/search/sort
  - [ ] Feature/Unfeature product
  - [ ] Delete product with mandatory reason + seller notification
  - [ ] Restore deleted products
  - [ ] Product admin actions log
  - [ ] Product reports (top selling, low stock, low rating)

- [ ] **Admin Category Management Enhancement**
  - [ ] Category tree view with parent → child hierarchy
  - [ ] Drag-and-drop reorder
  - [ ] Category image upload
  - [ ] Active/Inactive toggle

- [ ] **Admin Order Management** (`/admin/orders`)
  - [ ] All orders table (cross-seller) with filters/search
  - [ ] Order detail with sub-orders grouped by seller
  - [ ] Assign/reassign rider to sub-orders
  - [ ] Manual status override
  - [ ] Cancel order with reason + refund initiation
  - [ ] View delivery/return proof photos

---

## Phase 3: Rider Panel — Complete Build
> Dashboard, delivery flow, OTP verification, open-box inspection, COD management

- [ ] **Rider Login & Auth**
  - [ ] Phone OTP login (rider accounts created by admin only)
  - [ ] Rider login page (`/rider/login`)

- [ ] **Rider Dashboard** (`/rider/dashboard`)
  - [ ] Availability toggle (Online/Offline)
  - [ ] Today's summary: Assigned, Completed, Pending, COD collected, Earnings
  - [ ] Active delivery card (current assignment)
  - [ ] Quick navigation to active order

- [ ] **Assigned Orders** (`/rider/orders`)
  - [ ] List of all assigned deliveries with order cards
  - [ ] Order card: Order #, pickup/drop address, items, payment method, COD amount, slot
  - [ ] Sort by time slot, priority

- [ ] **Delivery Flow** (step-by-step per order)
  - [ ] Step 1: Navigate to Seller → Google Maps deep link, "Reached Seller" button
  - [ ] Step 2: Pickup → Item checklist, verify with seller, "Items Picked Up"
  - [ ] Step 3: Navigate to Customer → Maps link, "Reached Customer"
  - [ ] Step 4: OTP Verification → 6-digit input, max 3 attempts
  - [ ] Step 5: Open Box Delivery
    - [ ] Accept flow: Photo proof capture, COD collection prompt, "Complete Delivery"
    - [ ] Reject flow: Reason selection, notes, photo capture, "Confirm Return"

- [ ] **COD Management** (`/rider/cod-collections`)
  - [ ] Total COD collected today (running total)
  - [ ] Per-order COD details
  - [ ] "Deposit COD" feature (amount, method, reference)
  - [ ] Deposit history

- [ ] **Rider Earnings** (`/rider/earnings`)
  - [ ] Today/week/month earnings
  - [ ] Per-delivery breakdown
  - [ ] Payout history

- [ ] **Rider Profile** (`/rider/profile`)
  - [ ] Name, phone, vehicle type/number
  - [ ] Availability status
  - [ ] Profile update

- [ ] **Delivery History** (`/rider/deliveries`)
  - [ ] Past deliveries with date filter
  - [ ] Status, delivery time, payment method, COD amount

---

## Phase 4: Checkout & Payment Integration
> Complete checkout flow, Razorpay UPI, COD, order placement with sub-orders

- [ ] **Checkout Flow Enhancement**
  - [ ] Step 1: Address selection/creation with pin code validation (Daltonganj only)
  - [ ] Step 2: Delivery date picker + time slot selection
  - [ ] Step 3: Payment method (UPI via Razorpay / COD)
  - [ ] Step 4: Order summary with coupon, delivery fee, total
  - [ ] "Place Order" button

- [ ] **Razorpay Integration**
  - [ ] Create Razorpay order API route
  - [ ] Razorpay checkout popup (UPI)
  - [ ] Payment verification webhook
  - [ ] Payment status handling (success/failure)

- [ ] **COD Implementation**
  - [ ] COD option in checkout
  - [ ] COD order flow (no payment gateway)

- [ ] **Order Placement Logic**
  - [ ] Create master order from cart
  - [ ] Split into sub-orders per seller
  - [ ] Calculate commission per sub-order (snapshot rate)
  - [ ] Generate 6-digit delivery OTP
  - [ ] Reduce product stock
  - [ ] Clear cart after order
  - [ ] Notify seller(s) of new order
  - [ ] SMS/WhatsApp OTP to buyer

- [ ] **Coupon System**
  - [ ] Admin: Coupon CRUD (code, type, value, min order, validity, limits)
  - [ ] Buyer: Apply coupon at checkout with validation
  - [ ] Coupon usage tracking

---

## Phase 5: Order Lifecycle & Returns
> Full order status flow, buyer tracking, return/refund system

- [ ] **Order Status Flow**
  - [ ] Status transitions: Placed → Confirmed → Packed → Rider Assigned → Picked Up → Out for Delivery → Delivered / Return Initiated
  - [ ] Status change APIs with validation
  - [ ] Order status history logging
  - [ ] Real-time updates via Supabase Realtime

- [ ] **Buyer Order Tracking** (`/account/orders/[id]`)
  - [ ] Order status timeline (visual progress bar)
  - [ ] Sub-order tabs for multi-seller orders
  - [ ] Delivery OTP display with copy button
  - [ ] Rider info when out for delivery (name, phone, call button)
  - [ ] Real-time status updates

- [ ] **Buyer My Orders** (`/account/orders`)
  - [ ] Order list with status badges
  - [ ] Filter by status (All, Active, Delivered, Cancelled)
  - [ ] Search by order number
  - [ ] "Write Review" button per delivered item

- [ ] **Return & Refund System**
  - [ ] Return initiation by rider (on customer rejection)
  - [ ] Admin return review page (`/admin/returns`)
  - [ ] Resolution actions: Full refund, Partial refund, Replacement, Reject
  - [ ] Refund processing (UPI → Razorpay refund)
  - [ ] Return notifications to buyer
  - [ ] Return analytics

---

## Phase 6: Review System
> Star ratings, text reviews, display, moderation

- [ ] **Buyer: Write Review**
  - [ ] "Write a Review" button on delivered order items
  - [ ] Star rating selector (1-5, required)
  - [ ] Text review input (optional)
  - [ ] Submit review API
  - [ ] Auto-recalculate product avg_rating and total_reviews

- [ ] **Product Review Display**
  - [ ] Rating summary: average, total count, star distribution bar chart
  - [ ] Individual review cards: name, stars, date, text, "Verified Purchase" badge
  - [ ] Sort reviews: Most Recent, Highest, Lowest
  - [ ] Pagination / Load More

- [ ] **Admin: Review Moderation** (`/admin/reviews`)
  - [ ] All reviews table with filters/search
  - [ ] Hide review with reason
  - [ ] Restore hidden review
  - [ ] Delete review (permanent)
  - [ ] Review analytics

---

## Phase 7: Finance & Settlements
> Seller settlements, COD reconciliation, revenue dashboard

- [ ] **Settlement System**
  - [ ] Admin: Generate weekly settlement (Mon-Sun period)
  - [ ] Settlement calculation: delivered orders, commission, returns, net payout
  - [ ] Settlement queue: Review → Approve → Mark as Paid
  - [ ] Payment details: method, reference number, date
  - [ ] Seller notification on payment
  - [ ] Seller: View settlement history

- [ ] **COD Reconciliation** (`/admin/finance/cod`)
  - [ ] Today's COD summary (collected, deposited, pending)
  - [ ] Per-rider COD status
  - [ ] Verify rider deposits (match/mismatch flagging)
  - [ ] Discrepancy report

- [ ] **Admin Revenue Dashboard** (`/admin/finance`)
  - [ ] Total revenue, commission earned, delivery fees, refunds, net profit
  - [ ] Revenue chart (daily/weekly/monthly)
  - [ ] Revenue breakdown: UPI vs COD
  - [ ] Revenue by category / by seller

- [ ] **Financial Reports** (exportable as CSV)
  - [ ] Daily/weekly/monthly revenue report
  - [ ] Commission report
  - [ ] Settlement report
  - [ ] Refund report

---

## Phase 8: Admin — Riders, Customers, Settings
> Rider management, customer management, platform settings

- [ ] **Admin Rider Management** (`/admin/riders`)
  - [ ] All riders table: name, phone, vehicle, status, deliveries, COD pending
  - [ ] Add new rider form (name, phone, vehicle details → creates user + rider)
  - [ ] Rider detail page: performance stats, delivery history, COD status
  - [ ] Assign rider to sub-orders
  - [ ] Activate/Deactivate rider

- [ ] **Admin Customer Management** (`/admin/customers`)
  - [ ] All customers table: name, phone, email, orders, total spent
  - [ ] Customer detail page: profile, order history, addresses, reviews
  - [ ] Block/Unblock customer with reason

- [ ] **Platform Settings** (`/admin/settings`)
  - [ ] General: Platform name, tagline, logo, favicon, contact info, social links
  - [ ] Commission: Default rate editor
  - [ ] Delivery: Zones/pin codes CRUD, delivery fee per zone, free delivery threshold
  - [ ] Delivery: Time slots CRUD (label, start/end time, max orders)
  - [ ] Payment: Enable/Disable UPI/COD, COD extra charge, Razorpay keys
  - [ ] Seller Approval: Autopilot toggle, required documents config
  - [ ] Order: Min order amount, OTP toggle, open-box toggle
  - [ ] SEO: Default meta title/description, OG image, GA ID

---

## Phase 9: Services & Bookings
> Service pages (buyer), service management (admin), booking pipeline

- [ ] **Buyer Service Pages**
  - [ ] Service listing page (`/services`)
  - [ ] Service detail page with gallery, pricing, inclusions
  - [ ] Service inquiry/booking form (name, phone, address, date, notes, photos)
  - [ ] Booking confirmation
  - [ ] Booking status tracking in account section

- [ ] **Admin Service Management** (`/admin/services`)
  - [ ] Service CRUD (name, description, images, price, category, sort order)
  - [ ] Service bookings pipeline (kanban or list view)
  - [ ] Booking detail: schedule visit, assessment, quote, acceptance, execution, completion
  - [ ] Before/after photo upload
  - [ ] Cancel booking with reason

---

## Phase 10: Marketing & Notifications
> Banners, push notifications, SMS/WhatsApp, email

- [ ] **Banner Management** (`/admin/cms/banners`)
  - [ ] Banner CRUD: image upload, link URL, position, scheduling, sort order
  - [ ] Preview banners
  - [ ] Connect banners to homepage hero slider

- [ ] **Push Notification System**
  - [ ] Firebase FCM setup
  - [ ] PWA push registration + service worker
  - [ ] Order status notifications (auto-triggered)
  - [ ] Admin: Send notification tool (target segment, title, message, link)
  - [ ] Notification history

- [ ] **SMS Integration**
  - [ ] OTP sending (registration + login + delivery)
  - [ ] Order confirmation SMS
  - [ ] Delivery update SMS

- [ ] **WhatsApp Integration**
  - [ ] Order confirmation message
  - [ ] Delivery OTP message
  - [ ] WhatsApp button on website

- [ ] **Email Setup (Transactional)**
  - [ ] Order confirmation email
  - [ ] Seller registration/approval email
  - [ ] Settlement payment email

---

## Phase 11: Admin Reports & Analytics
> Sales, seller, rider, product, customer, return, review reports

- [ ] **Reports Dashboard** (`/admin/reports`)
  - [ ] Sales report: date range, total sales, order count, avg order value
  - [ ] Seller performance: orders, revenue, commission, rating, returns
  - [ ] Rider performance: deliveries, avg time, returns handled, COD accuracy
  - [ ] Product performance: top selling, most reviewed, highest rated, low stock
  - [ ] Customer analytics: new vs returning, avg order value, top customers
  - [ ] Return report: rate, reasons, resolution types
  - [ ] Review report: rating trends, volume, sentiment
  - [ ] All reports exportable as CSV

---

## Phase 12: Buyer Experience Polish
> Account pages, static pages, become-a-seller, track order

- [ ] **Account Pages Completion**
  - [ ] `/account` overview page
  - [ ] `/account/profile` — View/edit name, email, phone, avatar
  - [ ] `/account/addresses` — CRUD addresses, set default
  - [ ] `/account/notifications` — Notification list, mark as read

- [ ] **Static Pages Content**
  - [ ] About Us (`/about`)
  - [ ] Contact Us (`/contact`) — WhatsApp button, form, address
  - [ ] FAQ (`/faq`) — Collapsible Q&A
  - [ ] Terms & Conditions (`/terms`)
  - [ ] Privacy Policy (`/privacy`)
  - [ ] Refund & Return Policy (`/refund-policy`)

- [ ] **Become a Seller** (`/become-a-seller`)
  - [ ] Benefits, process, registration CTA page

- [ ] **Track Order** (`/track-order`)
  - [ ] Public order tracking with order number

---

## Phase 13: PWA & SEO
> Progressive Web App, service worker, SEO optimization

- [ ] **PWA Implementation**
  - [ ] `manifest.json` (app name, icons, colors, display: standalone)
  - [ ] Service worker: caching strategies, offline fallback page
  - [ ] Install prompt ("Add to Home Screen")
  - [ ] App-like splash screen
  - [ ] Background sync for failed requests
  - [ ] Bottom navigation on mobile

- [ ] **SEO Optimization**
  - [ ] Meta tags for all pages (title, description)
  - [ ] Open Graph tags (social sharing)
  - [ ] Structured data / JSON-LD: Products, Reviews, Organization
  - [ ] Dynamic `sitemap.xml` generation
  - [ ] `robots.txt`
  - [ ] Canonical URLs
  - [ ] Local SEO: "flower delivery in daltonganj"

- [ ] **Performance Optimization**
  - [ ] Image optimization (`next/image`, WebP)
  - [ ] Code splitting & lazy loading
  - [ ] API response caching
  - [ ] Core Web Vitals compliance

---

## Phase 14: Testing & QA
> End-to-end flow testing, edge cases, cross-browser

- [ ] **Buyer Flow Testing**
  - [ ] Browse → Cart → Checkout → Pay (UPI) → Track → Review
  - [ ] Browse → Cart → Checkout → COD → Deliver → Review
  - [ ] Wishlist, address CRUD, coupon application

- [ ] **Seller Flow Testing**
  - [ ] Register → Pending → Approved → Add Product → Receive Order → Confirm → Pack
  - [ ] Earnings dashboard, settlement view

- [ ] **Rider Flow Testing**
  - [ ] Login → Assigned Orders → Pickup → OTP → Accept/Reject → COD
  - [ ] COD deposit flow

- [ ] **Admin Flow Testing**
  - [ ] Approve seller → Manage products → Assign rider → Process settlement
  - [ ] Returns, reviews, reports, settings

- [ ] **Edge Cases**
  - [ ] Empty states (no orders, no products, no reviews)
  - [ ] Error handling (network, payment failures)
  - [ ] Pin code validation (outside Daltonganj)
  - [ ] OTP max attempts

- [ ] **Cross-Browser Testing**
  - [ ] Chrome, Firefox, Safari, Edge
  - [ ] Mobile Chrome, Mobile Safari

---

## Phase 15: Deployment & Launch
> Production deployment, platform setup, initial data

- [ ] **Production Deployment**
  - [ ] Vercel production setup
  - [ ] Environment variables (production)
  - [ ] Domain configuration + SSL
  - [ ] Razorpay live mode activation
  - [ ] SMS/WhatsApp production keys

- [ ] **Platform Setup**
  - [ ] Create admin account
  - [ ] Configure platform settings
  - [ ] Set up delivery zones (Daltonganj pin codes)
  - [ ] Configure delivery slots
  - [ ] Set commission rate (15%)
  - [ ] Upload platform logo and banners

- [ ] **Seed Data**
  - [ ] Demo categories with images
  - [ ] Demo products with images
  - [ ] Demo banners
  - [ ] Platform settings defaults

- [ ] **Documentation**
  - [ ] Seller onboarding guide
  - [ ] Rider usage guide
  - [ ] Admin operations guide
