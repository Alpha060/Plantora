"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Mail, Phone, Save, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ChangePasswordDialog } from "@/components/shared/change-password-dialog";

interface UserProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

export default function SellerProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (res.ok) {
        setProfile(json.user);
        setFullName(json.user.full_name || "");
        setEmail(json.user.email || "");
      } else {
        toast.error(json.error || "Failed to load profile");
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
        setProfile((prev) => prev ? { ...prev, full_name: fullName, email } : prev);
      } else {
        toast.error(json.error || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading profile..." className="h-64" />;
  }

  if (!profile) {
    return <div className="p-12 text-center text-gray-500">Profile not found</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <PageHeader
        title="Profile"
        description="Manage your personal account details."
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Profile" },
        ]}
      />

      {/* Account Info Card */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{profile.full_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">
                {profile.role}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Member since {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="mt-3">
              <ChangePasswordDialog />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Full Name *
            </Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-phone" className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone
            </Label>
            <Input
              id="profile-phone"
              value={profile.phone || ""}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Phone number cannot be changed (used for login)</p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
