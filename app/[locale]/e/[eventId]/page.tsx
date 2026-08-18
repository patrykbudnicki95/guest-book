import { Suspense } from "react";
import { GuestViewContent } from "./guest-view-content";
import { Skeleton } from "@/components/ui/skeleton";

interface GuestViewPageProps {
  params: Promise<{ eventId: string }>;
}

function GuestViewSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function GuestViewPageContent({ params }: GuestViewPageProps) {
  const { eventId } = await params;

  return <GuestViewContent eventId={eventId} />;
}

export default function GuestViewPage({ params }: GuestViewPageProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Suspense fallback={<GuestViewSkeleton />}>
        <GuestViewPageContent params={params} />
      </Suspense>
    </div>
  );
}
