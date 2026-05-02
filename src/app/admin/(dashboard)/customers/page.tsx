"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, ChevronLeft, ChevronRight, User, Phone, Mail,
  ShoppingBag, MoreHorizontal, ShieldBan, ShieldCheck, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Customer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  avatar_url: string | null;
  order_count: number;
  date: string;
}

type DialogAction = {
  type: "suspend" | "activate" | "delete";
  customer: Customer;
} | null;

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<DialogAction>(null);
  const perPage = 20;

  const fetchCustomers = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?page=${page}`);
      const json = await res.json();
      if (res.ok) {
        setCustomers(json.customers);
        setTotal(json.total);
      }
    } catch {
      // silent on poll errors
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(() => fetchCustomers(false), 20000);
    return () => clearInterval(interval);
  }, [fetchCustomers]);

  const handleSuspendActivate = async (customerId: string, activate: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customerId, is_active: activate }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(activate ? "Account activated" : "Account suspended");
        fetchCustomers();
      } else {
        toast.error(json.error || "Failed to update account");
      }
    } catch {
      toast.error("Failed to update account");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async (customerId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?id=${customerId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Account deleted permanently");
        fetchCustomers();
      } else {
        toast.error(json.error || "Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const executeConfirmAction = () => {
    if (!confirmAction) return;
    const { type, customer } = confirmAction;
    if (type === "suspend") handleSuspendActivate(customer.id, false);
    else if (type === "activate") handleSuspendActivate(customer.id, true);
    else if (type === "delete") handleDelete(customer.id);
  };

  const totalPages = Math.ceil(total / perPage);

  const filtered = searchQuery
    ? customers.filter(
        (c) =>
          c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone?.includes(searchQuery) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : customers;

  const dialogConfig = confirmAction
    ? {
        suspend: {
          title: "Suspend Account",
          description: `Are you sure you want to suspend "${confirmAction.customer.full_name}"? They will not be able to log in or place orders until reactivated.`,
          actionLabel: "Suspend Account",
          actionClass: "bg-amber-600 hover:bg-amber-700 text-white",
        },
        activate: {
          title: "Reactivate Account",
          description: `Are you sure you want to reactivate "${confirmAction.customer.full_name}"? They will regain full access to their account.`,
          actionLabel: "Reactivate Account",
          actionClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
        },
        delete: {
          title: "Delete Account Permanently",
          description: `This will permanently delete "${confirmAction.customer.full_name}" and all associated data. This action cannot be undone.`,
          actionLabel: "Delete Permanently",
          actionClass: "bg-red-600 hover:bg-red-700 text-white",
        },
      }[confirmAction.type]
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage customer accounts</p>
      </div>

      {/* Search */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner text="Loading customers..." className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="No customers match your search."
        />
      ) : (
        <>
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Orders</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600 w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-sky-600" />
                            </div>
                            <span className="font-semibold text-gray-900">{customer.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            {customer.phone && (
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <Phone className="h-3 w-3" />{customer.phone}
                              </p>
                            )}
                            {customer.email && (
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <Mail className="h-3 w-3" />{customer.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="flex items-center justify-center gap-1 font-semibold text-gray-900">
                            <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                            {customer.order_count}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {customer.is_active ? (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 rounded-full">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5 rounded-full">
                              Suspended
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(customer.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" sideOffset={4}>
                              {customer.is_active ? (
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onSelect={() =>
                                    setConfirmAction({ type: "suspend", customer })
                                  }
                                >
                                  <ShieldBan className="h-4 w-4 text-amber-600" />
                                  <span>Suspend Account</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onSelect={() =>
                                    setConfirmAction({ type: "activate", customer })
                                  }
                                >
                                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                  <span>Reactivate Account</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                className="gap-2 cursor-pointer"
                                onSelect={() =>
                                  setConfirmAction({ type: "delete", customer })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Account</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{page}/{totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialogConfig?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={dialogConfig?.actionClass}
              onClick={executeConfirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : dialogConfig?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
