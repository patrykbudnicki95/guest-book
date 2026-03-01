import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserEvents } from "@/app/actions/dashboard-actions";
import { QRCodeTab } from "./components/qr-code-tab";
import { Skeleton } from "@/components/ui/skeleton";

function QRCodeSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}

async function QRCodeContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const events = await getUserEvents(user.id);

  return <QRCodeTab events={events} />;
}

export default function QRCodePage() {
  return (
    <Suspense fallback={<QRCodeSkeleton />}>
      <QRCodeContent />
    </Suspense>
  );
}

