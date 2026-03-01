"use client";

import { useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { signOut } from "@/app/actions/auth-actions";
import { toast } from "sonner";

export function SettingsTab() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
        // Redirect is handled in the server action
      } catch (error: unknown) {
        const err = error as { message?: string; name?: string; digest?: string };
        
        // Check if this is a Next.js redirect (which is expected)
        if (err?.digest?.includes('NEXT_REDIRECT')) {
          return; // Don't show error for redirects
        }
        
        toast.error("Failed to sign out");
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Settings</CardTitle>
          <CardDescription>
            Manage your event configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input id="event-name" defaultValue="John & Jane's Wedding" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-date">Event Date</Label>
            <Input id="event-date" type="date" defaultValue="2025-06-15" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Venue name or address" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control who can view and upload to your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-viewing">Public Viewing</Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone with the link to view photos
              </p>
            </div>
            <Switch id="public-viewing" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="moderation">Require Moderation</Label>
              <p className="text-sm text-muted-foreground">
                Review uploads before they appear publicly
              </p>
            </div>
            <Switch id="moderation" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isPending}
          >
            {isPending ? "Signing out..." : "Sign Out"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete Event</Button>
        </CardContent>
      </Card>
    </div>
  );
}

