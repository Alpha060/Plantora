import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border-gray-100">
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-32 mt-2" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm border-gray-100">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div><Skeleton className="h-7 w-12" /><Skeleton className="h-3 w-16 mt-1" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm border-gray-100"><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        <Card className="shadow-sm border-gray-100"><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}
