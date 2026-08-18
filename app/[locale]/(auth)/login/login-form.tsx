"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { login } from "@/app/actions/auth-actions";
import { toast } from "sonner";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tErrors = useTranslations("auth.errors");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error(tErrors("fillAll"));
      return;
    }

    startTransition(async () => {
      try {
        const result = await login(email, password);

        if (result && !result.success) {
          toast.error(result.error || tErrors("invalidCredentials"));
        }
      } catch (error: unknown) {
        const err = error as { message?: string; name?: string; digest?: string };

        if (err?.digest?.includes("NEXT_REDIRECT")) {
          return;
        }

        toast.error(tErrors("loginError"));
        console.error(error);
      }
    });
  };

  return (
    <Card className="rounded-2xl border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              required
              disabled={isPending}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              className="rounded-lg"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            {t("noAccount")}{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {t("signUp")}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
