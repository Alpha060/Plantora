"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Clock, CreditCard, FileText, Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/helpers/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Address {
  full_name: string; phone: string; address_line1: string;
  address_line2: string; city: string; state: string;
  pincode: string; landmark: string;
}

const DELIVERY_SLOTS = [
  { id: "morning", label: "Morning", time: "9 AM – 12 PM", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", time: "12 PM – 4 PM", icon: "☀️" },
  { id: "evening", label: "Evening", time: "4 PM – 8 PM", icon: "🌇" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [address, setAddress] = useState<Address | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("morning");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  // Address form state
  const [formData, setFormData] = useState<Address>({
    full_name: "", phone: "", address_line1: "", address_line2: "",
    city: "Daltonganj", state: "Jharkhand", pincode: "", landmark: "",
  });

  const deliveryFee = subtotal() >= 500 ? 0 : 49;
  const total = subtotal() + deliveryFee;

  const handleSaveAddress = () => {
    if (!formData.full_name || !formData.phone || !formData.address_line1 || !formData.pincode) {
      toast.error("Fill all required fields");
      return;
    }
    setAddress(formData);
    setAddressOpen(false);
    toast.success("Address saved");
  };

  const handlePlaceOrder = async () => {
    if (!address) { toast.error("Add a delivery address"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id, variant_id: i.variant_id,
            quantity: i.quantity, price: i.price, name: i.name,
            image: i.image, store_id: i.store_id,
          })),
          address, payment_method: paymentMethod,
          delivery_slot: selectedSlot, note,
          subtotal: subtotal(), delivery_fee: deliveryFee, total,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      clearCart();
      router.push(`/order-success?order=${json.data.order_number}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally { setIsSubmitting(false); }
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
                    <p className="font-medium text-on-surface">{address.full_name}</p>
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    <p>📞 {address.phone}</p>
                  </div>
                  <button onClick={() => setAddressOpen(true)} className="text-xs text-botanical font-medium hover:underline shrink-0">Change</button>
                </div>
              ) : (
                <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
                  <DialogTrigger className="w-full py-10 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-botanical/40 transition-colors text-sm text-on-surface-variant">
                    <MapPin className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    + Add Delivery Address
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-surface-lowest">
                    <DialogHeader><DialogTitle className="font-heading">Delivery Address</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="sm:col-span-2"><Label className="text-xs">Full Name *</Label><Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                      <div className="sm:col-span-2"><Label className="text-xs">Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                      <div className="sm:col-span-2"><Label className="text-xs">Address Line 1 *</Label><Input value={formData.address_line1} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                      <div className="sm:col-span-2"><Label className="text-xs">Address Line 2</Label><Input value={formData.address_line2} onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                      <div><Label className="text-xs">City</Label><Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                      <div><Label className="text-xs">State</Label><Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                      <div><Label className="text-xs">Pincode *</Label><Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                      <div><Label className="text-xs">Landmark</Label><Input value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
                    </div>
                    <button onClick={handleSaveAddress} className="mt-4 w-full h-10 rounded-full bg-botanical-gradient text-white font-medium text-sm">Save Address</button>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* 2. Delivery Slot */}
            <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-on-surface">Delivery Slot</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DELIVERY_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedSlot === slot.id
                        ? "bg-botanical-gradient text-white shadow-ambient-sm"
                        : "bg-surface-low text-on-surface-variant hover:bg-surface-high"
                    }`}
                  >
                    <span className="text-lg">{slot.icon}</span>
                    <p className="text-sm font-medium mt-1">{slot.label}</p>
                    <p className={`text-xs mt-0.5 ${selectedSlot === slot.id ? "text-white/80" : "text-on-surface-variant"}`}>{slot.time}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Payment */}
            <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-on-surface">Payment Method</h3>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left ${
                    paymentMethod === "cod"
                      ? "bg-botanical-gradient text-white shadow-ambient-sm"
                      : "bg-surface-low text-on-surface hover:bg-surface-high"
                  }`}
                >
                  <span className="text-lg">💵</span>
                  <div>
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className={`text-xs ${paymentMethod === "cod" ? "text-white/70" : "text-on-surface-variant"}`}>Pay when your order arrives</p>
                  </div>
                </button>
                <button
                  disabled
                  className="w-full p-4 rounded-xl flex items-center gap-3 bg-surface-low text-on-surface-variant/50 cursor-not-allowed text-left"
                >
                  <span className="text-lg">💳</span>
                  <div>
                    <p className="text-sm font-medium">UPI / Online Payment</p>
                    <p className="text-xs">Coming soon</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. Note */}
            <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-botanical-gradient flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-on-surface">Delivery Note</h3>
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special instructions for delivery..."
                className="bg-surface-high border-0 min-h-[80px] text-sm resize-none rounded-xl"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-24 bg-surface-lowest rounded-2xl shadow-ambient p-6 space-y-5">
              <h3 className="font-heading font-semibold text-on-surface text-lg">Order Summary</h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant truncate mr-2">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-on-surface shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-surface-high" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium text-on-surface">{formatPrice(subtotal())}</span>
                </div>
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

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !address}
                className="w-full h-12 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center gap-2 shadow-ambient-sm hover:shadow-ambient transition-shadow disabled:opacity-40"
              >
                {isSubmitting ? "Placing order..." : "Place Order"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
