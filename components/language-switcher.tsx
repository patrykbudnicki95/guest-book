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

const locales = [
  { value: "pl", label: "Polski" },
  { value: "en", label: "English" },
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
      <SelectTrigger className="w-[120px]">
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
