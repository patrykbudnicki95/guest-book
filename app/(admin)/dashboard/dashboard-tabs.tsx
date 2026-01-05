"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./overview-tab";
import { GalleryTab } from "./gallery-tab";
import { QRCodeTab } from "./qr-code-tab";
import { SettingsTab } from "./settings-tab";
import type { DashboardUpload } from "@/app/actions/dashboard-actions";

interface DashboardTabsProps {
  stats: {
    totalPhotos: number;
    totalStorage: string;
    activeEvents: number;
    recentUploads: number;
  };
  uploads: DashboardUpload[];
  userEmail: string;
}

export function DashboardTabs({ stats, uploads, userEmail }: DashboardTabsProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Signed in <span className="font-medium text-foreground">{userEmail}</span>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="qr-code">QR Code</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <OverviewTab stats={stats} />
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-6">
          <GalleryTab uploads={uploads} />
        </TabsContent>
        
        <TabsContent value="qr-code" className="mt-6">
          <QRCodeTab />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

