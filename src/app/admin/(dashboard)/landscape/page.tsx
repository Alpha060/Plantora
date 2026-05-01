"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Leaf, CheckCircle2, Phone, Loader2, XCircle, Calendar, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_type: string;
  address: string;
  area_size: string | null;
  preferred_date: string | null;
  description: string | null;
  budget_range: string | null;
  status: string;
  admin_notes: string | null;
  quoted_price: number | null;
  final_price: number | null;
  scheduled_visit_date: string | null;
  created_at: string;
}

const STATUS_ACTIONS: Record<string, { next: string; label: string }> = {
  inquiry: { next: "site_visit_scheduled", label: "Schedule Visit" },
  site_visit_scheduled: { next: "site_visit_done", label: "Mark Visited" },
  site_visit_done: { next: "quote_sent", label: "Send Quote" },
  quote_sent: { next: "accepted", label: "Mark Accepted" },
  accepted: { next: "in_progress", label: "Start Work" },
  in_progress: { next: "completed", label: "Mark Completed" },
};

const STATUS_COLORS: Record<string, string> = {
  inquiry: "bg-blue-100 text-blue-700 border-blue-200",
  site_visit_scheduled: "bg-indigo-100 text-indigo-700 border-indigo-200",
  site_visit_done: "bg-purple-100 text-purple-700 border-purple-200",
  quote_sent: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-teal-100 text-teal-700 border-teal-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function AdminLandscapePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields for status actions
  const [visitDate, setVisitDate] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      const res = await fetch(`/api/services/bookings?${params}`);
      const json = await res.json();
      if (res.ok) setBookings(json.data || []);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string, extraData: Record<string, unknown> = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/services/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, admin_notes: adminNotes, ...extraData }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Status updated to ${formatStatus(newStatus)}`);
      fetchBookings();
      setDetailOpen(false);
    } catch {
      toast.error("Failed to update");
    } finally { setActionLoading(false); }
  };

  const openDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || "");
    setVisitDate(booking.scheduled_visit_date || "");
    setQuotedPrice(booking.quoted_price?.toString() || "");
    setDetailOpen(true);
  };

  const tabs = ["all", "inquiry", "site_visit_scheduled", "site_visit_done", "quote_sent", "accepted", "in_progress", "completed"];

  const inquiryCount = bookings.filter((b) => b.status === "inquiry").length;
  const activeCount = bookings.filter((b) => ["accepted", "in_progress"].includes(b.status)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Landscape Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage consultation requests and garden projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">{bookings.length} bookings</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-blue-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{inquiryCount}</p>
            <p className="text-xs text-muted-foreground">New Inquiries</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {bookings.filter((b) => b.status === "completed").length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
              activeTab === tab
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab === "all" ? "All" : formatStatus(tab)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <Leaf className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No bookings found</p>
        </div>
      ) : (
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Booking</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Service</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Quote</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => openDetail(b)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-semibold text-gray-900">{b.booking_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{b.customer_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />{b.customer_phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 capitalize">{b.service_type.replace(/-/g, " ")}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-600"}`}>
                          {formatStatus(b.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {b.quoted_price ? (
                          <span className="font-semibold text-emerald-700">₹{b.quoted_price.toLocaleString("en-IN")}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(b.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif">Booking Details</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm font-semibold">{selectedBooking.booking_number}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedBooking.customer_name}</p>
                </div>
                <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[selectedBooking.status] || "bg-gray-100"}`}>
                  {formatStatus(selectedBooking.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />Phone</span>
                  <p className="font-medium">{selectedBooking.customer_phone}</p>
                </div>
                {selectedBooking.customer_email && (
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />Email</span>
                    <p className="font-medium">{selectedBooking.customer_email}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-muted-foreground">Service</span>
                  <p className="font-medium capitalize">{selectedBooking.service_type.replace(/-/g, " ")}</p>
                </div>
                {selectedBooking.area_size && (
                  <div><span className="text-xs text-muted-foreground">Area</span><p className="font-medium">{selectedBooking.area_size}</p></div>
                )}
                {selectedBooking.budget_range && (
                  <div><span className="text-xs text-muted-foreground">Budget</span><p className="font-medium">{selectedBooking.budget_range}</p></div>
                )}
                {selectedBooking.preferred_date && (
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Preferred Date</span>
                    <p className="font-medium">{selectedBooking.preferred_date}</p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Address</span>
                <p className="text-sm">{selectedBooking.address}</p>
              </div>

              {selectedBooking.description && (
                <div>
                  <span className="text-xs text-muted-foreground">Requirements</span>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg border mt-1">{selectedBooking.description}</p>
                </div>
              )}

              <hr className="border-gray-200" />

              {/* Admin notes */}
              <div>
                <span className="text-xs text-muted-foreground">Admin Notes</span>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="mt-1 min-h-[60px] text-sm" placeholder="Internal notes..." />
              </div>

              {/* Schedule visit date */}
              {selectedBooking.status === "inquiry" && (
                <div>
                  <span className="text-xs text-muted-foreground">Schedule Visit Date</span>
                  <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="mt-1" />
                </div>
              )}

              {/* Quote price */}
              {selectedBooking.status === "site_visit_done" && (
                <div>
                  <span className="text-xs text-muted-foreground">Quoted Price (₹)</span>
                  <Input type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} className="mt-1" placeholder="25000" />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {STATUS_ACTIONS[selectedBooking.status] && (
                  <Button
                    onClick={() => {
                      const extra: Record<string, unknown> = {};
                      if (selectedBooking.status === "inquiry") extra.scheduled_visit_date = visitDate;
                      if (selectedBooking.status === "site_visit_done") extra.quoted_price = Number(quotedPrice);
                      handleStatusUpdate(selectedBooking.id, STATUS_ACTIONS[selectedBooking.status].next, extra);
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {STATUS_ACTIONS[selectedBooking.status].label}
                  </Button>
                )}
                {selectedBooking.status !== "completed" && selectedBooking.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedBooking.id, "cancelled")}
                    disabled={actionLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50 rounded-full"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
