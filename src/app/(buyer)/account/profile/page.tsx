"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail, Save, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ChangePasswordDialog } from "@/components/shared/change-password-dialog";

interface Profile {
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "", email: "", avatar_url: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const json = await res.json();
      if (res.ok && json.data) setProfile(json.data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!profile.full_name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: profile.full_name, email: profile.email }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Profile updated");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-botanical" /></div>;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Breadcrumbs items={[{ label: "Account", href: "/account" }, { label: "Profile" }]} />
        <h1 className="font-heading text-3xl font-bold text-on-surface tracking-tight mt-6 mb-8">My Profile</h1>

        <div className="bg-surface-lowest rounded-2xl shadow-ambient-sm p-6 sm:p-8 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-botanical-gradient flex items-center justify-center text-white text-2xl font-bold">
                {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-on-surface">{profile.full_name || "User"}</p>
              <p className="text-sm text-on-surface-variant mb-2">{profile.phone}</p>
              <ChangePasswordDialog />
            </div>
          </div>

          <div className="h-px bg-surface-high" />

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-on-surface-variant">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="bg-surface-high border-0 pl-10" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-on-surface-variant">Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                <Input value={profile.phone} disabled className="bg-surface-high border-0 pl-10 opacity-60" />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">Phone number cannot be changed</p>
            </div>

            <div>
              <Label className="text-xs text-on-surface-variant">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bg-surface-high border-0 pl-10" placeholder="your@email.com" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-full bg-botanical-gradient text-white font-medium text-sm flex items-center justify-center gap-2 shadow-ambient-sm hover:shadow-ambient transition-shadow disabled:opacity-40">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
