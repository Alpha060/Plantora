"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Ticket,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  valid_from: string | null;
  valid_to: string | null;
  usage_limit: number | null;
  per_user_limit: number;
  used_count: number;
  applicable_to: string;
  category_name: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (res.ok) {
        setCoupons(json.coupons);
      } else {
        toast.error(json.error || "Failed to load coupons");
      }
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setCode("");
    setType("percentage");
    setValue("");
    setMinOrder("");
    setMaxDiscount("");
    setValidFrom("");
    setValidTo("");
    setUsageLimit("");
    setPerUserLimit("1");
  };

  const handleCreate = async () => {
    if (!code.trim() || !value) {
      toast.error("Code and value are required");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        per_user_limit: parseInt(perUserLimit, 10) || 1,
      };
      if (minOrder) payload.min_order_amount = parseFloat(minOrder);
      if (maxDiscount) payload.max_discount = parseFloat(maxDiscount);
      if (validFrom) payload.valid_from = new Date(validFrom).toISOString();
      if (validTo) payload.valid_to = new Date(validTo).toISOString();
      if (usageLimit) payload.usage_limit = parseInt(usageLimit, 10);

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok) {
        toast.success("Coupon created successfully");
        setDialogOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(json.error || "Failed to create coupon");
      }
    } catch {
      toast.error("Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_to) return false;
    return new Date(coupon.valid_to) < new Date();
  };

  const isExhausted = (coupon: Coupon) => {
    if (!coupon.usage_limit) return false;
    return coupon.used_count >= coupon.usage_limit;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount codes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            }
          />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coupon Code *</Label>
                  <Input
                    placeholder="e.g. SAVE20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="uppercase font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Type *</Label>
                  <Select value={type} onValueChange={(v) => { if (v) setType(v as "percentage" | "fixed"); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    placeholder={type === "percentage" ? "e.g. 20" : "e.g. 100"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Order Amount</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                  />
                </div>
              </div>

              {type === "percentage" && (
                <div className="space-y-2">
                  <Label>Max Discount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 200"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid To</Label>
                  <Input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Usage Limit</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Per User Limit</Label>
                  <Input
                    type="number"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading coupons..." className="h-64" />
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create your first discount coupon to get started."
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon);
            const exhausted = isExhausted(coupon);
            const inactive = !coupon.is_active || expired || exhausted;

            return (
              <Card
                key={coupon.id}
                className={`shadow-sm transition-colors ${inactive ? "opacity-60 border-gray-200" : "border-emerald-100/50"}`}
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${coupon.type === "percentage" ? "bg-purple-50" : "bg-emerald-50"}`}>
                      {coupon.type === "percentage" ? (
                        <Percent className="h-4 w-4 text-purple-600" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold font-mono text-gray-900 text-lg tracking-wide">{coupon.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {coupon.type === "percentage"
                          ? `${coupon.value}% off`
                          : `${formatCurrency(coupon.value)} off`}
                        {coupon.max_discount && ` (max ${formatCurrency(coupon.max_discount)})`}
                      </p>
                    </div>
                  </div>
                  {inactive ? (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-2 py-0.5 rounded-full">
                      <XCircle className="h-3 w-3 mr-1" />
                      {expired ? "Expired" : exhausted ? "Exhausted" : "Inactive"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Active
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs text-gray-600">
                    {coupon.min_order_amount && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <span>Min order: {formatCurrency(coupon.min_order_amount)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span>
                        Used {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""} times
                        {" · "}{coupon.per_user_limit}/user
                      </span>
                    </div>
                    {(coupon.valid_from || coupon.valid_to) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>
                          {coupon.valid_from
                            ? new Date(coupon.valid_from).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                            : "–"}{" "}
                          →{" "}
                          {coupon.valid_to
                            ? new Date(coupon.valid_to).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "∞"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
