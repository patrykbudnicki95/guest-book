"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/actions/auth-actions";
import { toast } from "sonner";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    startTransition(async () => {
      try {
        const result = await login(email, password);
        
        // If result exists and login failed, show error
        // If redirect() was called, result will be undefined and exception will be caught below
        if (result && !result.success) {
          toast.error(result.error || "Invalid credentials");
        }
        // Success redirect is handled in the server action
      } catch (error: unknown) {
        const err = error as { message?: string; name?: string; digest?: string };
        
        // Check if this is a Next.js redirect (which is expected)
        if (err?.digest?.includes('NEXT_REDIRECT')) {
          return; // Don't show error for redirects
        }
        
        toast.error("An error occurred during login");
        console.error(error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email and password to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-primary underline">
              Sign up
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

