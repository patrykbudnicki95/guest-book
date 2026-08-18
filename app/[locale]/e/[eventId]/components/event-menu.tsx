"use client";

import { useTranslations } from "next-intl";
import type { MenuSection } from "@/lib/schemas/database";

interface EventMenuProps {
  menu: MenuSection[] | null;
}

export function EventMenu({ menu }: EventMenuProps) {
  const t = useTranslations("guestView.menu");

  if (!menu || menu.length === 0) return null;

  return (
    <section className="bg-muted/30 px-4 py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">{t("title")}</h2>
      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        {menu.map((section, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <h3 className="mb-3 text-center font-script text-lg italic text-primary">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item, iIndex) => (
                <li
                  key={iIndex}
                  className="text-center text-sm text-foreground/80"
                >
                  {item.name}
                  {item.description && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
