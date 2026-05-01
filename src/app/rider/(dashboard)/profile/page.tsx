"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Truck, Phone, Mail, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ChangePasswordDialog } from "@/components/shared/change-password-dialog";

interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  vehicle_number: string;
  is_available: boolean;
  is_active: boolean;
  total_deliveries: number;
  current_lat: number | null;
  current_lng: number | null;
  created_at: string;
}

export default function RiderProfilePage() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rider/profile");
      const json = await res.json();
      if (res.ok) setProfile(json.profile);
      else toast.error(json.error || "Failed to load");
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <LoadingSpinner text="Loading profile..." className="h-64" />;
  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and vehicle details</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full ${profile.is_available ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {profile.is_available ? "Available" : "Offline"}
                </Badge>
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full ${profile.is_active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-600 border-red-200"}`}>
                  {profile.is_active ? "Active Account" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-3">
                <ChangePasswordDialog />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50"><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium text-gray-900">{profile.phone || "Not set"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-gray-900">{profile.email || "Not set"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium text-gray-900">{profile.current_lat && profile.current_lng ? `${profile.current_lat}, ${profile.current_lng}` : "Location not shared"}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50"><CardTitle className="text-base">Vehicle Details</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="h-4 w-4 text-gray-400" />
            <div><p className="text-xs text-muted-foreground">Vehicle Type</p><p className="font-medium text-gray-900 capitalize">{profile.vehicle_type || "Not set"}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-4 w-4 text-gray-400" />
            <div><p className="text-xs text-muted-foreground">Vehicle Number</p><p className="font-medium font-mono text-gray-900">{profile.vehicle_number || "Not set"}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50"><CardTitle className="text-base">Performance</CardTitle></CardHeader>
        <CardContent className="p-5 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{profile.total_deliveries}</p>
            <p className="text-xs text-muted-foreground">Total Deliveries</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{profile.is_active ? "Yes" : "No"}</p>
            <p className="text-xs text-muted-foreground">Active Status</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg col-span-2">
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="font-medium text-gray-900">{new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
