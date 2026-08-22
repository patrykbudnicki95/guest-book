import { Link } from "@/i18n/navigation";
import type { StaticAppPathname } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";

export type BreadcrumbLink = {
  label: string;
  href?: StaticAppPathname;
};

type BreadcrumbsProps = {
  items: BreadcrumbLink[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
