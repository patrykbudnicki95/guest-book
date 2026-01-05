# Project: Virtual Wedding Guestbook

## Core Value Proposition

A QR-code based web app where wedding guests can upload photos/videos and leave wishes directly to a digital album without installing any app. Focus on speed, simplicity, and low cost for the owner.

## User Flows

### 1. The Guest (Mobile User)

- Scans QR Code -> Lands on Event Page (Next.js).
- Does NOT create an account.
- Clicks "Add Memory" -> Opens Drawer.
- Selects Photos/Video -> Client requests Presigned URL -> Uploads directly to Cloudflare R2.
- Adds a text wish (optional).
- Sees a feed of photos from other guests (Masonry Layout).

### 2. The Couple (Admin User)

- Registers/Logs in via Supabase Auth.
- Creates an Event (Date, Names, Location).
- Generates QR Code (downloadable PDF).
- **Payment**: Free tier (demo) vs Paid tiers (via Stripe).
- **Dashboard**:
  - View all uploads.
  - Delete unwanted content (moderation).
  - Download all media as ZIP (handled via background job/client-side generator).

## Database Schema (Draft)

- `profiles` (Couples): id, email, subscription_status.
- `events`: id (UUID), owner_id, names, date, qr_code_url, theme_color, is_active.
- `uploads`: id, event_id, file_url (R2), thumbnail_url, media_type (image/video), guest_name (optional), caption, created_at.

## Critical Technical Constraints

- **Zero Egress Fees**: Essential. Must use Cloudflare R2 public bucket or custom domain for viewing images to avoid AWS/Vercel bandwidth costs.
- **Large Files**: Guests upload 4K video. UI must show progress bars and handle timeouts gracefully.
