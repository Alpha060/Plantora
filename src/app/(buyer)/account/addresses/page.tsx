"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Home, Building, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pin_code: string;
  landmark: string | null;
  is_default: boolean;
}

const EMPTY_FORM = {
  label: "Home", full_name: "", phone: "", address_line1: "",
  address_line2: "", city: "Daltonganj", state: "Jharkhand", pin_code: "", landmark: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      const json = await res.json();
      if (res.ok) setAddresses(json.data || []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setFormData({
      label: addr.label, full_name: addr.full_name, phone: addr.phone,
      address_line1: addr.address_line1, address_line2: addr.address_line2 || "",
      city: addr.city, state: addr.state, pin_code: addr.pin_code, landmark: addr.landmark || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone || !formData.address_line1 || !formData.pin_code) {
      toast.error("Fill all required fields"); return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/user/addresses/${editingId}` : "/api/user/addresses";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error("Failed");
      toast.success(editingId ? "Address updated" : "Address added");
      setDialogOpen(false);
      fetchAddresses();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      toast.success("Address removed");
      fetchAddresses();
    } catch { toast.error("Failed"); }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      });
      toast.success("Default address updated");
      fetchAddresses();
    } catch { toast.error("Failed"); }
  };

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-botanical" /></div>;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Addresses" }]} />
        <div className="flex items-center justify-between mt-6 mb-6">
          <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight">My Addresses</h1>
          <button onClick={openAdd} className="px-4 py-2 rounded-full bg-botanical-gradient text-white text-sm font-medium flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-20 bg-surface-lowest rounded-2xl shadow-ambient-sm">
            <MapPin className="h-12 w-12 mx-auto text-on-surface-variant/30 mb-3" />
            <p className="text-on-surface-variant mb-4">No saved addresses</p>
            <button onClick={openAdd} className="px-6 py-2.5 rounded-full bg-botanical-gradient text-white text-sm font-medium">Add Address</button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className={`bg-surface-lowest rounded-2xl shadow-ambient-sm p-5 relative ${addr.is_default ? "ring-2 ring-botanical/30" : ""}`}>
                {addr.is_default && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-botanical/10 text-botanical text-[10px] font-semibold uppercase">Default</span>
                )}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-low flex items-center justify-center shrink-0">
                    {addr.label === "Office" ? <Building className="h-4 w-4 text-on-surface-variant" /> : <Home className="h-4 w-4 text-on-surface-variant" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-on-surface">{addr.full_name}</span>
                      <span className="text-[10px] bg-surface-high px-2 py-0.5 rounded-full text-on-surface-variant">{addr.label}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{addr.address_line1}</p>
                    {addr.landmark && <p className="text-xs text-on-surface-variant">Near: {addr.landmark}</p>}
                    <p className="text-sm text-on-surface-variant">{addr.city}, {addr.state} - {addr.pin_code}</p>
                    <p className="text-xs text-on-surface-variant mt-1">📞 {addr.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-surface-high">
                  <button onClick={() => openEdit(addr)} className="text-xs font-medium text-botanical flex items-center gap-1 hover:underline"><Edit2 className="h-3 w-3" /> Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs font-medium text-red-500 flex items-center gap-1 hover:underline"><Trash2 className="h-3 w-3" /> Delete</button>
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-medium text-on-surface-variant flex items-center gap-1 hover:underline ml-auto"><Check className="h-3 w-3" /> Set Default</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md bg-surface-lowest">
            <DialogHeader><DialogTitle className="font-heading">{editingId ? "Edit" : "Add"} Address</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="sm:col-span-2"><Label className="text-xs">Full Name *</Label><Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Address *</Label><Textarea value={formData.address_line1} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} className="bg-surface-high border-0 mt-1 min-h-[60px]" /></div>
              <div><Label className="text-xs">Pin Code *</Label><Input value={formData.pin_code} onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })} className="bg-surface-high border-0 mt-1" maxLength={6} /></div>
              <div><Label className="text-xs">Landmark</Label><Input value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="bg-surface-high border-0 mt-1" /></div>
              <div><Label className="text-xs">City</Label><Input value={formData.city} disabled className="bg-surface-high border-0 mt-1 opacity-60" /></div>
              <div><Label className="text-xs">State</Label><Input value={formData.state} disabled className="bg-surface-high border-0 mt-1 opacity-60" /></div>
              <div className="sm:col-span-2 flex gap-2">
                {["Home", "Office", "Other"].map((l) => (
                  <button key={l} onClick={() => setFormData({ ...formData, label: l })} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${formData.label === l ? "bg-botanical-gradient text-white" : "bg-surface-high text-on-surface-variant"}`}>{l}</button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="mt-4 w-full h-10 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {editingId ? "Update" : "Save"} Address
            </button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
