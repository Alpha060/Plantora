"use client";

import { useEffect, useState, useCallback } from "react";
import { Truck, Phone, Bike, MapPin, CheckCircle2, XCircle, Wallet, Shield, ShieldOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Rider {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string | null;
  vehicle_number: string | null;
  is_available: boolean;
  is_active: boolean;
  total_deliveries: number;
  cod_pending: number;
  created_at: string;
}

type StatusFilter = "all" | "active" | "inactive";

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ rider: Rider; newStatus: boolean } | null>(null);

  const fetchRiders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/riders");
      const json = await res.json();
      if (res.ok) {
        setRiders(json.riders);
      } else {
        toast.error(json.error || "Failed to load riders");
      }
    } catch {
      toast.error("Failed to load riders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const updateRiderStatus = async (riderId: string, isActive: boolean) => {
    setUpdatingId(riderId);
    try {
      const res = await fetch("/api/admin/riders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rider_id: riderId, is_active: isActive }),
      });
      if (res.ok) {
        toast.success(`Rider ${isActive ? "activated" : "deactivated"} successfully`);
        fetchRiders();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update rider");
    } finally {
      setUpdatingId(null);
      setConfirmAction(null);
    }
  };

  const activeCount = riders.filter((r) => r.is_active).length;
  const inactiveCount = riders.filter((r) => !r.is_active).length;
  const availableCount = riders.filter((r) => r.is_available && r.is_active).length;
  const totalDeliveries = riders.reduce((s, r) => s + r.total_deliveries, 0);

  const filtered = filter === "all" ? riders :
    filter === "active" ? riders.filter((r) => r.is_active) :
    riders.filter((r) => !r.is_active);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Rider Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve, manage, and monitor the delivery fleet</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-gray-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{riders.length}</p>
            <p className="text-xs text-muted-foreground">Total Riders</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm cursor-pointer hover:shadow-md transition-shadow ${filter === "active" ? "border-emerald-300 bg-emerald-50/30" : "border-gray-100"}`} onClick={() => setFilter("active")}>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm cursor-pointer hover:shadow-md transition-shadow ${filter === "inactive" ? "border-red-300 bg-red-50/30" : "border-gray-100"}`} onClick={() => setFilter("inactive")}>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{inactiveCount}</p>
            <p className="text-xs text-muted-foreground">Pending / Inactive</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Online Now</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading riders..." className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No riders found"
          description={filter !== "all" ? `No ${filter} riders.` : "No riders have been onboarded yet."}
        />
      ) : (
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="border-b bg-gray-50/50 py-3 px-5">
            <CardTitle className="text-sm font-semibold text-gray-600">
              {filter === "all" ? "All Riders" : filter === "active" ? "Active Riders" : "Pending / Inactive Riders"} ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/30">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Rider</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Vehicle</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Deliveries</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">COD Pending</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Availability</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                            <Truck className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{rider.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />{rider.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {rider.vehicle_type ? (
                          <span className="flex items-center gap-1 text-gray-600">
                            <Bike className="h-3.5 w-3.5" />
                            {rider.vehicle_type}
                            {rider.vehicle_number && (
                              <span className="text-xs text-muted-foreground ml-1">({rider.vehicle_number})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">
                        {rider.total_deliveries}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rider.cod_pending > 0 ? (
                          <span className="flex items-center justify-center gap-1 text-amber-700 font-semibold">
                            <Wallet className="h-3.5 w-3.5" />{formatCurrency(rider.cod_pending)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Nil</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rider.is_available ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                            <MapPin className="h-3 w-3 mr-0.5" />Online
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] px-2 py-0.5 rounded-full">
                            Offline
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rider.is_active ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-2 py-0.5 rounded-full">
                            <XCircle className="h-3 w-3 mr-0.5" />Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(rider.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {updatingId === rider.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-400" />
                        ) : rider.is_active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 rounded-full text-xs h-8"
                            onClick={() => setConfirmAction({ rider, newStatus: false })}
                          >
                            <ShieldOff className="h-3.5 w-3.5 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs h-8"
                            onClick={() => setConfirmAction({ rider, newStatus: true })}
                          >
                            <Shield className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.newStatus ? "Approve Rider" : "Deactivate Rider"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.newStatus
                ? `Are you sure you want to approve "${confirmAction.rider.name}"? They will be able to accept delivery assignments.`
                : `Are you sure you want to deactivate "${confirmAction?.rider.name}"? They will no longer receive delivery assignments.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.newStatus ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
              onClick={() => {
                if (confirmAction) {
                  updateRiderStatus(confirmAction.rider.id, confirmAction.newStatus);
                }
              }}
            >
              {confirmAction?.newStatus ? "Approve" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
