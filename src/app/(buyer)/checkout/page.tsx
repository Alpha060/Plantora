"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  MapPin, Clock, CreditCard, FileText, ArrowRight,
  Tag, Gift, Calendar, ChevronRight, Loader2, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/helpers/format";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

/* ---------- types ---------- */
interface CheckoutAddress {
  id?: string;
  full_name: string;
  phone: string;
  full_address: string;
  address_line2?: string;
  city: string;
  state: string;
  pin_code: string;
  landmark?: string | null;
  label?: string | null;
}

interface CouponResult {
  coupon_id: string;
  code: string;
  discount_amount: number;
  message: string;
}

/* Razorpay global type */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/* ---------- constants ---------- */
const DELIVERY_SLOTS = [
  { id: "morning", label: "Morning", time: "9 AM – 12 PM", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", time: "12 PM – 4 PM", icon: "☀️" },
  { id: "evening", label: "Evening", time: "4 PM – 8 PM", icon: "🌇" },
];

const DALTONGANJ_PINS = ["822101", "822102", "822110", "822111", "822112", "822113", "822114", "822115", "822116", "822118", "822119", "822120", "822121", "822122", "822123", "822124", "822125", "822126", "822127", "822128", "822129", "822130", "822131", "822132", "822133"];

function getNext7Days(): { label: string; value: string; isToday: boolean }[] {
  const days: { label: string; value: string; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      value: d.toISOString().split("T")[0],
      isToday: i === 0,
    });
  }
  return days;
}

/* ========== COMPONENT ========== */
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, itemsByStore } = useCartStore();

  // State
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("morning");
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].value);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [note, setNote] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Address form
  const [formData, setFormData] = useState<CheckoutAddress>({
    full_name: "", phone: "", full_address: "", address_line2: "",
    city: "Daltonganj", state: "Jharkhand", pin_code: "", landmark: "", label: "Home",
  });

  const dates = getNext7Days();
  const sub = subtotal();
  const discount = couponResult?.discount_amount || 0;
  const deliveryFee = sub >= 500 ? 0 : 49;
  const total = sub - discount + deliveryFee;

  // Seller grouping for summary
  const storeGroups = itemsByStore();

  // Fetch saved addresses via API route (uses server-side auth, consistent field names)
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/user/addresses");
      const json = await res.json();
      if (res.ok && json.data?.length > 0) {
        setSavedAddresses(json.data as CheckoutAddress[]);
        if (!address) setAddress(json.data[0] as CheckoutAddress);
      }
    } catch { /* silent */ }
  }, [address]);

  useEffect(() => {
    fetchAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveAddress = async () => {
    if (!formData.full_name || !formData.phone || !formData.full_address || !formData.pin_code) {
      toast.error("Fill all required fields");
      return;
    }
    if (!DALTONGANJ_PINS.includes(formData.pin_code)) {
      toast.error("We only deliver within Daltonganj area. Check pin code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          address_line1: formData.full_address,
          pin_code: formData.pin_code,
          city: "Daltonganj",
          state: "Jharkhand",
          landmark: formData.landmark || null,
          label: formData.label || "Home",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to save address");
        return;
      }
      // Refresh address list from API to get normalized fields
      await fetchAddresses();
      setAddressOpen(false);
      setFormData({
        full_name: "", phone: "", full_address: "",
        city: "Daltonganj", state: "Jharkhand", pin_code: "", landmark: "", label: "Home",
      });
      toast.success("Address saved!");
    } catch {
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, order_total: sub }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCouponResult(json.data);
      toast.success(json.data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid coupon");
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponCode("");
  };

  /* ---------- Razorpay UPI flow ---------- */
  const initiateRazorpayPayment = useCallback(async (): Promise<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  } | null> => {
    // Create Razorpay order
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total, receipt: `rcpt_${Date.now()}` }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Payment init failed");

    const { id: orderId, key_id } = json.data;

    return new Promise((resolve, reject) => {
      const options = {
        key: key_id,
        amount: json.data.amount,
        currency: json.data.currency,
        name: "Plantora",
        description: "Order Payment",
        order_id: orderId,
        handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          resolve(response);
        },
        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        prefill: { contact: address?.phone || "" },
        theme: { color: "#16a34a" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }, [total, address]);

  /* ---------- Place order ---------- */
  const handlePlaceOrder = async () => {
    if (!address) { toast.error("Add a delivery address"); return; }
    setIsSubmitting(true);

    try {
      let razorpayData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      } | null = null;

      if (paymentMethod === "upi") {
        if (!razorpayLoaded) {
          toast.error("Payment system loading. Try again.");
          setIsSubmitting(false);
          return;
        }
        razorpayData = await initiateRazorpayPayment();
        if (!razorpayData) { setIsSubmitting(false); return; }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            variant_id: i.variant_id,
            quantity: i.quantity,
            price: i.price,
            name: i.name,
            image: i.image,
            store_id: i.store_id,
          })),
          address,
          payment_method: paymentMethod,
          delivery_slot: selectedSlot,
          delivery_date: selectedDate,
          note,
          gift_message: giftMessage || null,
          subtotal: sub,
          delivery_fee: deliveryFee,
          discount,
          total,
          coupon_code: couponResult?.code || null,
          coupon_id: couponResult?.coupon_id || null,
          ...(razorpayData || {}),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      clearCart();
      const otp = json.data.delivery_otp || "";
      router.push(`/order-success?order=${json.data.order_number}&otp=${otp}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-on-surface-variant">Your cart is empty</p>
          <Link href="/shop" className="inline-block px-6 py-2.5 rounded-full bg-botanical-gradient text-white text-sm font-medium">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayLoaded(true)} />

      <div className="min-h-screen bg-surface">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
          <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight mt-6 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">

              {/* 1. Address */}
              <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-on-surface">Delivery Address</h3>
                </div>
                {address ? (
                  <div className="bg-surface-low rounded-xl p-4 flex justify-between items-start">
                    <div className="text-sm text-on-surface-variant space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-on-surface">{address.full_name}</p>
                        {address.label && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-lowest shadow-ambient-sm text-[10px] font-semibold text-botanical uppercase">
                            {address.label}
                          </span>
                        )}
                      </div>
                      <p>{address.full_address}</p>
                      {address.landmark && <p>Near: {address.landmark}</p>}
                      <p>{address.city}, {address.state} - {address.pin_code}</p>
                      <p>📞 {address.phone}</p>
                    </div>
                    <button onClick={() => setAddressOpen(true)} className="text-xs text-botanical font-medium hover:underline shrink-0">Change</button>
                  </div>
                ) : (
                  <button onClick={() => setAddressOpen(true)} className="w-full py-10 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-botanical/40 transition-colors text-sm text-on-surface-variant">
                    <MapPin className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    + Add Delivery Address
                  </button>
                )}

                <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
                  <DialogContent className="max-w-md bg-surface-lowest max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-heading">Delivery Address</DialogTitle></DialogHeader>
                    
                    {savedAddresses.length > 0 && (
                      <div className="mb-6 space-y-3">
                        <Label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Saved Addresses</Label>
                        <div className="space-y-2">
                          {savedAddresses.map((saved) => (
                            <div 
                              key={saved.id}
                              onClick={() => { setAddress(saved); setAddressOpen(false); }}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${address?.id === saved.id ? 'border-botanical bg-green-50/50 dark:bg-green-950/20' : 'border-outline-variant/30 hover:border-botanical/50'}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-on-surface">{saved.full_name}</p>
                                    {saved.label && <span className="text-[10px] bg-surface text-botanical px-2 py-0.5 rounded-full">{saved.label}</span>}
                                  </div>
                                  <p className="text-xs text-on-surface-variant mt-1">{saved.full_address}, {saved.pin_code}</p>
                                  <p className="text-xs text-on-surface-variant mt-0.5">{saved.phone}</p>
                                </div>
                                {address?.id === saved.id && <Check className="h-4 w-4 text-botanical shrink-0" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-surface-high">
                      <Label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-3 block">Add New Address</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2"><Label className="text-xs">Full Name *</Label><Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                        <div className="sm:col-span-2"><Label className="text-xs">Full Address *</Label><Textarea value={formData.full_address} onChange={(e) => setFormData({ ...formData, full_address: e.target.value })} className="bg-surface-high border-0 mt-1 min-h-[70px]" /></div>
                        <div><Label className="text-xs">Pin Code *</Label><Input value={formData.pin_code} onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })} className="bg-surface-high border-0 mt-1" maxLength={6} /></div>
                        <div><Label className="text-xs">Landmark</Label><Input value={formData.landmark || ""} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                        <div><Label className="text-xs">City</Label><Input value={formData.city} disabled className="bg-surface-high border-0 mt-1 opacity-60" /></div>
                        <div><Label className="text-xs">State</Label><Input value={formData.state} disabled className="bg-surface-high border-0 mt-1 opacity-60" /></div>
                        {/* Label selector */}
                        <div className="sm:col-span-2 flex gap-2 mt-1">
                          {["Home", "Office", "Other"].map((l) => (
                            <button key={l} onClick={() => setFormData({ ...formData, label: l })} className={`px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-all ${formData.label === l ? "bg-botanical-gradient text-white" : "bg-surface-high text-on-surface-variant"}`}>{l}</button>
                          ))}
                        </div>
                      </div>
                      <button onClick={handleSaveAddress} disabled={isSubmitting} className="mt-5 w-full h-10 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save New Address"}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* 2. Delivery Date */}
              <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-on-surface">Delivery Date</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d) => (
                    <button key={d.value} onClick={() => setSelectedDate(d.value)} className={`shrink-0 px-4 py-3 rounded-xl text-center transition-all min-w-[80px] ${selectedDate === d.value ? "bg-botanical-gradient text-white shadow-ambient-sm" : "bg-surface-low text-on-surface-variant hover:bg-surface-high"}`}>
                      <p className="text-xs font-medium">{d.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Delivery Slot */}
              <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-on-surface">Delivery Slot</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DELIVERY_SLOTS.map((slot) => (
                    <button key={slot.id} onClick={() => setSelectedSlot(slot.id)} className={`p-4 rounded-xl text-center transition-all ${selectedSlot === slot.id ? "bg-botanical-gradient text-white shadow-ambient-sm" : "bg-surface-low text-on-surface-variant hover:bg-surface-high"}`}>
                      <span className="text-lg">{slot.icon}</span>
                      <p className="text-sm font-medium mt-1">{slot.label}</p>
                      <p className={`text-xs mt-0.5 ${selectedSlot === slot.id ? "text-white/80" : "text-on-surface-variant"}`}>{slot.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Payment */}
              <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-on-surface">Payment Method</h3>
                </div>
                <div className="space-y-3">
                  <button onClick={() => setPaymentMethod("upi")} className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left ${paymentMethod === "upi" ? "bg-botanical-gradient text-white shadow-ambient-sm" : "bg-surface-low text-on-surface hover:bg-surface-high"}`}>
                    <span className="text-lg">💳</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">UPI / Online Payment</p>
                      <p className={`text-xs ${paymentMethod === "upi" ? "text-white/70" : "text-on-surface-variant"}`}>Pay via UPI, Cards, Wallets</p>
                    </div>
                    {paymentMethod === "upi" && <Check className="h-5 w-5" />}
                  </button>
                  <button onClick={() => setPaymentMethod("cod")} className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left ${paymentMethod === "cod" ? "bg-botanical-gradient text-white shadow-ambient-sm" : "bg-surface-low text-on-surface hover:bg-surface-high"}`}>
                    <span className="text-lg">💵</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cash on Delivery</p>
                      <p className={`text-xs ${paymentMethod === "cod" ? "text-white/70" : "text-on-surface-variant"}`}>Pay when your order arrives</p>
                    </div>
                    {paymentMethod === "cod" && <Check className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* 5. Coupon */}
              <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                    <Tag className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-on-surface">Coupon Code</h3>
                </div>
                {couponResult ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">{couponResult.code} applied!</p>
                      <p className="text-xs text-green-600 dark:text-green-500">You save {formatPrice(couponResult.discount_amount)}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="bg-surface-high border-0 flex-1 uppercase" />
                    <button onClick={handleApplyCoupon} disabled={couponLoading} className="px-5 rounded-xl bg-botanical-gradient text-white text-sm font-medium disabled:opacity-50 shrink-0">
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Gift Message & Note */}
              <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                    <Gift className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-on-surface">Gift & Notes</h3>
                </div>
                <div>
                  <Label className="text-xs text-on-surface-variant">Gift Message (optional)</Label>
                  <Input value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Happy Birthday! 🎂" className="bg-surface-high border-0 mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-on-surface-variant">Delivery Instructions (optional)</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ring the bell, leave at door..." className="bg-surface-high border-0 min-h-[60px] text-sm resize-none rounded-xl mt-1" />
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div>
              <div className="sticky top-24 bg-surface-lowest rounded-2xl shadow-ambient p-6 space-y-5">
                <h3 className="font-heading font-semibold text-on-surface text-lg">Order Summary</h3>

                {/* Items grouped by seller */}
                <div className="space-y-4 max-h-56 overflow-y-auto">
                  {Array.from(storeGroups.entries()).map(([storeId, group]) => (
                    <div key={storeId}>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 mb-1.5">Shipped by: {group.storeName}</p>
                      {group.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm mb-1">
                          <span className="text-on-surface-variant truncate mr-2">{item.name} × {item.quantity}</span>
                          <span className="font-medium text-on-surface shrink-0">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="h-px bg-surface-high" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-medium text-on-surface">{formatPrice(sub)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Delivery</span>
                    <span className={`font-medium ${deliveryFee === 0 ? "text-botanical" : "text-on-surface"}`}>
                      {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-surface-high" />

                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-on-surface">Total</span>
                  <span className="text-botanical">{formatPrice(total)}</span>
                </div>

                <button onClick={handlePlaceOrder} disabled={isSubmitting || !address} className="w-full h-12 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center gap-2 shadow-ambient-sm hover:shadow-ambient transition-shadow disabled:opacity-40">
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : paymentMethod === "upi" ? (
                    <><CreditCard className="h-4 w-4" /> Pay {formatPrice(total)}</>
                  ) : (
                    <>Place Order <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                {deliveryFee > 0 && (
                  <p className="text-[11px] text-center text-on-surface-variant">
                    Add {formatPrice(500 - sub)} more for free delivery
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
