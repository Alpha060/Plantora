"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, MessageSquare, User, ShieldCheck, Package } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  is_verified_purchase: boolean;
  customer_name: string;
  customer_avatar: string | null;
  product_name: string;
  product_slug: string;
  date: string;
}

interface ReviewsData {
  summary: ReviewSummary;
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function SellerReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/reviews");
      const json = await res.json();
      if (res.ok) {
        setData(json);
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

  if (isLoading) {
    return <LoadingSpinner text="Loading reviews..." className="h-64" />;
  }

  if (!data || data.summary.totalReviews === 0) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <PageHeader
          title="Reviews"
          description="Customer feedback on your products."
          breadcrumbs={[
            { label: "Dashboard", href: "/seller/dashboard" },
            { label: "Reviews" },
          ]}
        />
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Reviews will appear here when customers rate your products after delivery."
        />
      </div>
    );
  }

  const { summary, reviews } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Reviews"
        description="Customer feedback on your products."
        breadcrumbs={[
          { label: "Dashboard", href: "/seller/dashboard" },
          { label: "Reviews" },
        ]}
      />

      {/* Rating Summary */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Average Rating Card */}
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {summary.averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(summary.averageRating)} />
            <p className="text-sm text-muted-foreground mt-2">
              Based on {summary.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="lg:col-span-2 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-6 text-right">{star}</span>
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <div className="flex-1">
                    <Progress
                      value={percentage}
                      className="h-2.5 bg-gray-100"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-base font-semibold">All Reviews ({summary.totalReviews})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{review.customer_name}</span>
                      {review.is_verified_purchase && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0 rounded-full">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs px-2.5 py-1 rounded-full shrink-0">
                  <Package className="h-3 w-3 mr-1" />
                  {review.product_name}
                </Badge>
              </div>
              {review.review_text && (
                <p className="text-sm text-gray-700 mt-3 ml-[52px] leading-relaxed">
                  &ldquo;{review.review_text}&rdquo;
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
