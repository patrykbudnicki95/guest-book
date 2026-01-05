"use server";

/**
 * Mock Server Actions for development/testing
 * All functions simulate network latency with delays
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface MockUploadResult {
  success: boolean;
  id: string;
  url: string;
  message?: string;
}

export interface MockEvent {
  id: string;
  names: string;
  date: string;
  photoCount: number;
  storageUsed: string;
}

export interface MockPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  guestName?: string;
  createdAt: string;
}

/**
 * Mock login action
 */
export async function mockLogin(email: string, password: string): Promise<{ success: boolean; userId?: string }> {
  console.log("[MOCK] Login attempt:", { email, password: "***" });
  await delay(1000);
  
  // Simulate successful login
  return {
    success: true,
    userId: "mock-user-123",
  };
}

/**
 * Mock upload action
 */
export async function mockUpload(
  eventId: string,
  file: File,
  caption?: string,
  guestName?: string
): Promise<MockUploadResult> {
  console.log("[MOCK] Upload:", {
    eventId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    caption,
    guestName,
  });
  
  await delay(2000); // Simulate upload time
  
  return {
    success: true,
    id: `mock-upload-${Date.now()}`,
    url: `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`,
  };
}

/**
 * Mock delete photo action
 */
export async function mockDeletePhoto(photoId: string): Promise<{ success: boolean }> {
  console.log("[MOCK] Delete photo:", photoId);
  await delay(800);
  
  return { success: true };
}

/**
 * Mock create event action
 */
export async function mockCreateEvent(
  names: string,
  date: string,
  location?: string
): Promise<{ success: boolean; eventId?: string }> {
  console.log("[MOCK] Create event:", { names, date, location });
  await delay(1200);
  
  return {
    success: true,
    eventId: `mock-event-${Date.now()}`,
  };
}

/**
 * Mock get event data
 */
export async function mockGetEvent(eventId: string): Promise<MockEvent | null> {
  console.log("[MOCK] Get event:", eventId);
  await delay(500);
  
  return {
    id: eventId,
    names: "John & Jane",
    date: "2025-06-15",
    photoCount: 150,
    storageUsed: "1.2 GB",
  };
}

/**
 * Mock get event photos
 */
export async function mockGetEventPhotos(eventId: string): Promise<MockPhoto[]> {
  console.log("[MOCK] Get event photos:", eventId);
  await delay(600);
  
  // Return mock photos with placeholder images
  return Array.from({ length: 12 }, (_, i) => ({
    id: `photo-${i + 1}`,
    url: `https://placehold.co/600x400?text=Photo+${i + 1}`,
    thumbnailUrl: `https://placehold.co/300x200?text=Photo+${i + 1}`,
    caption: i % 3 === 0 ? `Beautiful memory ${i + 1}` : undefined,
    guestName: i % 2 === 0 ? `Guest ${i + 1}` : undefined,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}

/**
 * Mock get dashboard stats
 */
export async function mockGetDashboardStats(): Promise<{
  totalPhotos: number;
  totalStorage: string;
  activeEvents: number;
  recentUploads: number;
}> {
  console.log("[MOCK] Get dashboard stats");
  await delay(400);
  
  return {
    totalPhotos: 150,
    totalStorage: "1.2 GB",
    activeEvents: 3,
    recentUploads: 12,
  };
}

/**
 * Mock generate QR code PDF
 */
export async function mockGenerateQRCode(eventId: string): Promise<{ success: boolean; pdfUrl?: string }> {
  console.log("[MOCK] Generate QR Code PDF:", eventId);
  await delay(1500);
  
  return {
    success: true,
    pdfUrl: `https://placehold.co/400x400?text=QR+Code+${eventId}`,
  };
}

