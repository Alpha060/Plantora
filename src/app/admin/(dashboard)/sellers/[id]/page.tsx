"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Store, FileText, CheckCircle2, XCircle, Clock, Anchor, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SellerStatus = "pending" | "approved" | "rejected" | "suspended";

interface SellerStoreDetail {
  id: string;
  status: SellerStatus;
  store_name: string;
  slug: string;
  banner_url: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: string;
  pin_code: string | null;
  gst_number: string | null;
  description: string | null;
}

interface SellerBankDetail {
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
}

interface SellerDocument {
  id: string;
  document_type: string;
  document_url: string;
  view_url: string;
  created_at: string;
}

interface SellerApprovalData {
  store: SellerStoreDetail;
  bankDetails: SellerBankDetail | null;
  documents: SellerDocument[];
}

export default function AdminSellerApprovalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [data, setData] = useState<SellerApprovalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSellerData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sellers/${id}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load seller");
        router.push("/admin/sellers");
      }
    } catch {
      toast.error("Failed to load seller");
      router.push("/admin/sellers");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  const updateStatus = async (newStatus: SellerStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          approval_note: newStatus === "rejected" ? "Rejected after review." : "Welcome to Plantora!"
        })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Seller marked as ${newStatus}`);
        fetchSellerData();
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading application...</div>;
  }

  if (!data) return null;

  const { store, bankDetails, documents } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/sellers")} className="shrink-0 bg-white shadow-sm border border-gray-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight flex items-center gap-3">
              Application Review
              <Badge
                variant="outline"
                className={`px-3 py-1 rounded-full font-medium uppercase tracking-wider text-[10px] shadow-sm
                  ${
                    store.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                    store.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                    store.status === "suspended" ? "bg-red-100 text-red-700 border-red-200" :
                    store.status === "rejected" ? "bg-gray-100 text-gray-700 border-gray-200" :
                    "bg-gray-50 text-gray-600"
                  }
                `}
              >
                {store.status}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Store ID: {store.id}</p>
          </div>
        </div>

        {/* Top-level actions */}
        <div className="flex items-center gap-3">
          {store.status === "pending" && (
            <>
              <Button 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => updateStatus("rejected")}
                disabled={isUpdating}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => updateStatus("approved")}
                disabled={isUpdating}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Seller
              </Button>
            </>
          )}
          {store.status === "approved" && (
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => updateStatus("suspended")}
              disabled={isUpdating}
            >
              Suspend Store
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Store Profile & Bank Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-video relative bg-emerald-50">
              {store.banner_url ? (
                <Image src={store.banner_url} alt="Banner" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-emerald-200">
                  <Anchor className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="p-6 relative">
              <div className="absolute -top-10 left-6 h-16 w-16 bg-white rounded-xl shadow-sm border overflow-hidden">
                {store.logo_url ? (
                  <Image src={store.logo_url} alt="Logo" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Store className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="mt-8 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{store.store_name}</h2>
                  <p className="text-sm text-emerald-600 font-medium">/{store.slug}</p>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Email:</strong> {store.email}</p>
                  <p><strong>Phone:</strong> {store.phone}</p>
                  <p><strong>Address:</strong> {store.address}, {store.pin_code}</p>
                  <p><strong>GST:</strong> {store.gst_number || "Not Provided"}</p>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border italic">
                  &ldquo;{store.description}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Bank Details
            </h3>
            {bankDetails ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">Account Name</p>
                  <p className="font-medium text-gray-900">{bankDetails.account_holder}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">Bank Name</p>
                  <p className="font-medium text-gray-900">{bankDetails.bank_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">Account Number</p>
                  <p className="font-mono text-gray-900 tracking-wider">
                    {bankDetails.account_number}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-0.5">IFSC Code</p>
                  <p className="font-mono text-gray-900 tracking-wider">
                    {bankDetails.ifsc_code}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">No bank details provided.</div>
            )}
          </div>
        </div>

        {/* Right Column: Documents */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                KYC Documents
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 capitalize text-lg">{doc.document_type.replace(/_/g, " ")}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <a 
                        href={doc.view_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        Open Original <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    {/* Document Preview */}
                    <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative" style={{ minHeight: '300px' }}>
                      {doc.view_url?.includes(".pdf") || doc.document_url?.includes(".pdf") ? (
                        <iframe src={doc.view_url} className="w-full h-[500px]" title={doc.document_type} />
                      ) : (
                        <div className="w-full relative aspect-4/3 bg-gray-900/5 flex items-center justify-center">
                          {doc.view_url ? (
                            <Image src={doc.view_url} alt={doc.document_type} fill className="object-contain p-4" unoptimized />
                          ) : (
                            <span className="text-gray-400">File not accessible</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  No KYC documents uploaded.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
