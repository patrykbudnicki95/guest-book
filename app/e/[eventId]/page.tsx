import { Suspense } from "react";
import { GuestViewContent } from "./guest-view-content";
import { Skeleton } from "@/components/ui/skeleton";

interface GuestViewPageProps {
  params: Promise<{ eventId: string }>;
}

function GuestViewSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b bg-background p-4">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
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
    <div className="min-h-screen bg-background">
      <Suspense fallback={<GuestViewSkeleton />}>
        <GuestViewPageContent params={params} />
      </Suspense>
    </div>
  );
}

