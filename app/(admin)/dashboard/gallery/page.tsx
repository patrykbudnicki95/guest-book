import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserUploads } from "@/app/actions/dashboard-actions";
import { GalleryTab } from "../gallery-tab";
import { Skeleton } from "@/components/ui/skeleton";

function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

async function GalleryContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const uploads = await getUserUploads(user.id);

  return <GalleryTab uploads={uploads} />;
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryContent />
    </Suspense>
  );
}

