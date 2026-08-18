"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

const locales = [
  { value: "pl", label: "PL" },
  { value: "en", label: "EN" },
] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (value: string) => {
    router.replace(pathname, { locale: value as "pl" | "en" });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-[72px] gap-1.5 rounded-full border-border/50 text-xs">
        <Globe className="size-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc.value} value={loc.value}>
            {loc.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
