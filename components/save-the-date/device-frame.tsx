import { cn } from "@/lib/utils";

/**
 * Both frames are size containers (so `100cqh` in the page means "the screen")
 * and carry a transform (so `position: fixed` inside sticks to the screen,
 * not to the browser window).
 */
const SCREEN = "relative overflow-hidden [container-type:size] [transform:translateZ(0)]";

export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[min(100%,360px)] rounded-[3rem] bg-neutral-900 p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] ring-1 ring-black/10",
        className,
      )}
    >
      <div className={cn(SCREEN, "aspect-[9/19] rounded-[2.4rem] bg-white")}>
        <div className="pointer-events-none absolute left-1/2 top-2.5 z-[60] h-6 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
        <div className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function BrowserFrame({
  children,
  url,
  className,
}: {
  children: React.ReactNode;
  url: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full overflow-hidden rounded-2xl border bg-neutral-100 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b bg-neutral-50 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-neutral-300" />
          <span className="size-3 rounded-full bg-neutral-300" />
          <span className="size-3 rounded-full bg-neutral-300" />
        </div>
        <span className="mx-auto truncate rounded-full border bg-white px-6 py-1 text-xs text-muted-foreground">
          {url}
        </span>
      </div>
      <div className={cn(SCREEN, "h-[min(70vh,720px)] bg-white")}>
        <div className="h-full overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
