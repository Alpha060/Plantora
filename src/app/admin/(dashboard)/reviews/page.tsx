"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Eye, EyeOff, Store, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  is_verified_purchase: boolean;
  is_visible: boolean;
  hidden_reason: string | null;
  customer_name: string;
  product_name: string;
  store_name: string;
  date: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (res.ok) {
        setReviews(json.reviews);
      } else {
        toast.error(json.error || "Failed to load reviews");
      }
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggle = async (reviewId: string, action: "hide" | "restore") => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, action }),
      });
      if (res.ok) {
        toast.success(action === "hide" ? "Review hidden" : "Review restored");
        fetchReviews();
      } else {
        toast.error("Failed to update review");
      }
    } catch {
      toast.error("Failed to update review");
    }
  };

  const filtered =
    filter === "all"
      ? reviews
      : filter === "visible"
        ? reviews.filter((r) => r.is_visible)
        : reviews.filter((r) => !r.is_visible);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderate customer reviews across the platform</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600 flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />{avgRating}
            </p>
            <p className="text-xs text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{reviews.filter((r) => !r.is_visible).length}</p>
            <p className="text-xs text-muted-foreground">Hidden Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "visible", "hidden"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {f === "all" ? "All" : f === "visible" ? "Visible" : "Hidden"} ({f === "all" ? reviews.length : f === "visible" ? reviews.filter((r) => r.is_visible).length : reviews.filter((r) => !r.is_visible).length})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading reviews..." className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews found"
          description="No reviews match the current filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card
              key={review.id}
              className={`shadow-sm transition-colors ${!review.is_visible ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{review.customer_name}</span>
                      {review.is_verified_purchase && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 rounded-full">
                          <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />Verified
                        </Badge>
                      )}
                      {!review.is_visible && (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0 rounded-full">
                          <EyeOff className="h-2.5 w-2.5 mr-0.5" />Hidden
                        </Badge>
                      )}
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-gray-700 mt-1">{review.review_text}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-gray-600">{review.product_name}</span>
                      <span className="flex items-center gap-1">
                        <Store className="h-3 w-3" />{review.store_name}
                      </span>
                      <span>
                        {new Date(review.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    {review.is_visible ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                        onClick={() => handleToggle(review.id, "hide")}
                      >
                        <EyeOff className="h-3.5 w-3.5 mr-1" />Hide
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs"
                        onClick={() => handleToggle(review.id, "restore")}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />Restore
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
