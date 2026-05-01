"use client";

import { useState, useEffect, useCallback } from "react";
import { Phone, Save, Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface ContactSettings {
  phone: string;
  whatsapp: string;
  email: string;
}

export default function AdminContactSettingsPage() {
  const [settings, setSettings] = useState<ContactSettings>({
    phone: "",
    whatsapp: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (res.ok && json.settings) {
        const contactSetting = json.settings.find(
          (s: { key: string; value: unknown }) => s.key === "contact_info"
        );
        if (contactSetting?.value) {
          const val = contactSetting.value as ContactSettings;
          setSettings({
            phone: val.phone || "",
            whatsapp: val.whatsapp || "",
            email: val.email || "",
          });
        }
      }
    } catch {
      toast.error("Failed to load contact settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "contact_info",
          value: {
            phone: settings.phone.trim(),
            whatsapp: settings.whatsapp.trim() || settings.phone.trim(),
            email: settings.email.trim(),
          },
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save");
      }

      toast.success("Contact settings updated successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading contact settings..." className="h-64" />;

  const whatsappPreview = settings.whatsapp || settings.phone;
  const whatsappLink = whatsappPreview
    ? `https://wa.me/91${whatsappPreview.replace(/\D/g, "").replace(/^91/, "")}`
    : "#";

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Settings</h1>
          <p className="text-sm text-muted-foreground">
            Update the phone number displayed on the website and WhatsApp chat button
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-emerald-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-lg border">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="93046 12345"
                maxLength={10}
                value={settings.phone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, phone: e.target.value }))
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This number appears in the header, footer, and contact pages
            </p>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp Number
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-lg border">
                +91
              </span>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="Same as phone if left blank"
                maxLength={10}
                value={settings.whatsapp}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, whatsapp: e.target.value }))
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Used for the floating WhatsApp chat button. Leave empty to use the phone number above.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Support Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@plantora.in"
              value={settings.email}
              onChange={(e) =>
                setSettings((s) => ({ ...s, email: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Displayed in the footer and contact page
            </p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Preview */}
      {whatsappPreview && (
        <Card className="shadow-sm border-green-100 bg-green-50/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">WhatsApp Preview</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">
                💬
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  +91 {whatsappPreview}
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 hover:underline"
                >
                  {whatsappLink}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Contact Settings
        </Button>
      </div>
    </div>
  );
}
