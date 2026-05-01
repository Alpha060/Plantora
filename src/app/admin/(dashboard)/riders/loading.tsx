import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminListLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border-gray-100">
            <CardContent className="p-4 text-center">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50 py-3"><Skeleton className="h-4 w-32" /></CardHeader>
        <CardContent className="p-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
