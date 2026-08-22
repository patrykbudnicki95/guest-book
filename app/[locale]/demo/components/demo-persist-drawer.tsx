"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export function DemoPersistDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("demo");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("persistTitle")}</DrawerTitle>
          <DrawerDescription>{t("persistBody")}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button asChild className="w-full rounded-full" size="lg">
            <Link href="/pricing">{t("persistPricing")}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/signup">{t("persistSignup")}</Link>
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" className="rounded-full">
              {t("persistClose")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
