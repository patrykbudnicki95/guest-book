"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, HardDrive, Calendar, Upload, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { UserEvent } from "@/app/actions/dashboard-actions";

interface OverviewTabProps {
  stats: {
    totalPhotos: number;
    totalStorage: string;
    activeEvents: number;
    recentUploads: number;
  };
  events: UserEvent[];
}

export function OverviewTab({ stats, events }: OverviewTabProps) {
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  const copyToClipboard = async (eventId: string, eventName: string) => {
    const url = `${window.location.origin}/e/${eventId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedEventId(eventId);
      toast.success(`Link copied for ${eventName}`);
      setTimeout(() => setCopiedEventId(null), 2000);
    } catch (error) {
      console.error("[copyToClipboard] Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <Camera className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStorage}</div>
            <p className="text-xs text-muted-foreground">
              Total storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Upload className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Share Your Event Links</CardTitle>
            <CardDescription>
              Copy and share these links with your guests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => {
              const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/e/${event.id}`;
              const isCopied = copiedEventId === event.id;

              return (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{event.names}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(event.id, event.names)}
                      className="gap-2"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={eventUrl}
                      readOnly
                      className="font-mono text-sm"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>
            Manage your wedding events and view guest uploads from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the navigation above to access different sections of your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

