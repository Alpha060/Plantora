"use client";

import { useEffect, useState, useCallback } from "react";
import { Store, Save, Building2, CreditCard, MapPin, Phone, Mail, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface StoreData {
  id: string;
  store_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  pin_code: string | null;
  gst_number: string | null;
  commission_rate: number | null;
  status: string;
  is_active: boolean;
  rating: number;
  total_orders: number;
  total_products: number;
  created_at: string;
}

interface BankData {
  account_holder: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  upi_id: string | null;
  is_verified: boolean;
}

export default function SellerStoreSettingsPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [bank, setBank] = useState<BankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);

  // Store form state
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePinCode, setStorePinCode] = useState("");
  const [storeGst, setStoreGst] = useState("");

  // Bank form state
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");

  const fetchStoreData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/store");
      const json = await res.json();
      if (res.ok) {
        setStore(json.store);
        setBank(json.bank);
        // Populate store form
        setStoreName(json.store.store_name || "");
        setStoreDescription(json.store.description || "");
        setStorePhone(json.store.phone || "");
        setStoreEmail(json.store.email || "");
        setStoreAddress(json.store.address || "");
        setStorePinCode(json.store.pin_code || "");
        setStoreGst(json.store.gst_number || "");
        // Populate bank form
        if (json.bank) {
          setAccountHolder(json.bank.account_holder || "");
          setAccountNumber(json.bank.account_number || "");
          setIfscCode(json.bank.ifsc_code || "");
          setBankName(json.bank.bank_name || "");
          setUpiId(json.bank.upi_id || "");
        }
      } else {
        toast.error(json.error || "Failed to load store data");
      }
    } catch {
      toast.error("Failed to load store data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  const handleSaveStore = async () => {
    if (!storeName.trim() || !storeAddress.trim() || !storePhone.trim()) {
      toast.error("Store name, address, and phone are required");
      return;
    }
    setIsSavingStore(true);
    try {
      const res = await fetch("/api/seller/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName,
          description: storeDescription,
          phone: storePhone,
          email: storeEmail,
          address: storeAddress,
          pin_code: storePinCode,
          gst_number: storeGst,
          logo_url: store?.logo_url,
          banner_url: store?.banner_url,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Store settings saved successfully!");
      } else {
        toast.error(json.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save store settings");
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleSaveBank = async () => {
    if (!accountHolder.trim() || !accountNumber.trim() || !ifscCode.trim() || !bankName.trim()) {
      toast.error("All bank fields (except UPI) are required");
      return;
    }
    setIsSavingBank(true);
    try {
      const res = await fetch("/api/seller/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_holder: accountHolder,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          bank_name: bankName,
          upi_id: upiId,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Bank details saved successfully!");
      } else {
        toast.error(json.error || "Failed to save bank details");
      }
    } catch {
      toast.error("Failed to save bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading store settings..." className="h-64" />;
  }

  if (!store) {
    return <div className="p-12 text-center text-gray-500">Store not found</div>;
  }

  const statusBadgeClass =
    store.status === "approved"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : store.status === "suspended"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Store Settings"
        description="Manage your store profile and banking information."
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Store Settings" },
        ]}
      />

      {/* Store Status Banner */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{store.store_name}</p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(store.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                {" · "}{store.total_products} products · {store.total_orders} orders
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusBadgeClass}`}>
            {store.status}
          </Badge>
        </CardContent>
      </Card>

      {/* Store Profile Form */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            Store Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="store-name" className="text-sm font-medium">Store Name *</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Your store name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-gst" className="text-sm font-medium">GST Number</Label>
              <Input
                id="store-gst"
                value={storeGst}
                onChange={(e) => setStoreGst(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="store-desc"
              rows={3}
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="Tell customers about your store..."
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="store-phone" className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone *
              </Label>
              <Input
                id="store-phone"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email" className="text-sm font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                id="store-email"
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                placeholder="store@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-address" className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Address *
            </Label>
            <Textarea
              id="store-address"
              rows={2}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="Full store address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="store-pin" className="text-sm font-medium">PIN Code</Label>
              <Input
                id="store-pin"
                value={storePinCode}
                onChange={(e) => setStorePinCode(e.target.value)}
                placeholder="6-digit PIN"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveStore}
              disabled={isSavingStore}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSavingStore ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Store Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details Form */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Bank Details
            </CardTitle>
            {bank?.is_verified && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-1 rounded-full">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="bank-holder" className="text-sm font-medium">Account Holder *</Label>
              <Input
                id="bank-holder"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="As per bank records"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-name" className="text-sm font-medium">Bank Name *</Label>
              <Input
                id="bank-name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., State Bank of India"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="bank-account" className="text-sm font-medium">Account Number *</Label>
              <Input
                id="bank-account"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Bank account number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-ifsc" className="text-sm font-medium">IFSC Code *</Label>
              <Input
                id="bank-ifsc"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g., SBIN0001234"
                maxLength={11}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="bank-upi" className="text-sm font-medium">UPI ID (Optional)</Label>
              <Input
                id="bank-upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@paytm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveBank}
              disabled={isSavingBank}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSavingBank ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Bank Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
