# MoodSync (মুডসিঙ্ক) — Deployment Guide

This guide covers deploying **MoodSync** to production for free using the **Supabase Free Tier** and **Vercel Free Tier** (or any lightweight Node.js/Docker host).

---

## 1. Architecture Overview

```text
┌───────────────────────────────────────────────────────────┐
│                   Couples Mobile PWA                      │
│            (iOS Safari / Android Chrome Standalone)       │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTPS / WebSockets
                              ▼
┌───────────────────────────────────────────────────────────┐
│               Next.js Frontend (Vercel)                   │
│   - React 19 App Router & Tailwind CSS v4                 │
│   - PWA Service Worker & Web Push Dispatcher              │
│   - Bengali Typography with Hind Siliguri                 │
└─────────────────────────────┬─────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
┌──────────────────────────────┐ ┌──────────────────────────┐
│    Supabase Managed Cloud    │ │   Standard Web Push      │
│ - PostgreSQL with strict RLS │ │   (VAPID / Browser Push) │
│ - Supabase Auth (Cookie/JWT) │ └──────────────────────────┘
│ - Supabase Realtime (WS)     │
└──────────────────────────────┘
```

**Cost & Resource Footprint:**
* **Frontend:** $0 / month on Vercel Hobby Free Tier.
* **Database & Auth & Realtime:** $0 / month on Supabase Free Tier (500 MB DB, 50k MAU, 2 GB egress).
* **Push Notifications:** $0 / month (native browser Web Push endpoints via `web-push`).

---

## 2. Supabase Setup (Step-by-Step)

### Step 2.1: Create a Free Project
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **New Project**.
3. Set:
   * **Name:** `moodsync`
   * **Database Password:** (generate a strong password and save it)
   * **Region:** Select the region closest to you and your partner (e.g., `Singapore` or `Frankfurt`).
   * **Pricing Plan:** Free Tier.

### Step 2.2: Apply Database Schema & Migrations
1. In your Supabase project dashboard, navigate to the **SQL Editor** on the left menu.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](file:///mnt/01DAAF995C961E10/personal_projects/Fun%20Projects/moodsync/supabase/schema.sql) in this repository.
4. Copy the entire contents of `supabase/schema.sql` into the Supabase SQL editor.
5. Click **Run** (or `Ctrl+Enter`).
6. You will see `Success: No rows returned`. All tables, triggers, indexes, seed definitions, security definer functions, and RLS policies are now initialized.

### Step 2.3: Verify Realtime Publication
Under **Database** → **Replication**:
* Confirm that `mood_events` and `couple_members` are included in the `supabase_realtime` publication.
* If not, run:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_members;
  ```

### Step 2.4: Auth Configuration
1. In Supabase, go to **Authentication** → **Providers** → **Email**:
   * Ensure **Email provider** is enabled.
   * If you want instant signup without waiting for email verification, turn OFF **Confirm email** (recommended for private couple apps).
2. Go to **Authentication** → **URL Configuration**:
   * **Site URL:** Enter your production URL (e.g. `https://moodsync.vercel.app` or `http://localhost:3000` for development).
   * **Redirect URLs:** Add `https://your-domain.vercel.app/**`.

### Step 2.5: Retrieve API Credentials
Go to **Project Settings** → **API**:
1. Copy the **Project URL** (`https://<project-ref>.supabase.co`).
2. Copy the **anon / public** key.
3. Copy the **service_role** key (keep this secret; used only on the server for Web Push notifications).

---

## 3. Web Push (VAPID) Setup

Web Push enables native push notifications on mobile and desktop without requiring any third-party push platform.

### Generate VAPID Keys:
You can generate a pair of keys anytime using Node:
```bash
npx web-push generate-vapid-keys --json
```

Output:
```json
{
  "publicKey": "...",
  "privateKey": "..."
}
```

Save these keys for your environment variables.

---

## 4. Environment Variables Checklist

Set the following variables in your hosting provider (Vercel) or in `.env.local` for local testing:

| Variable Name | Description | Visibility |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Server Only (Secret) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID Public Key for Web Push | Public |
| `VAPID_PRIVATE_KEY` | VAPID Private Key for Web Push | Server Only (Secret) |
| `VAPID_SUBJECT` | Admin contact (e.g. `mailto:partner@example.com`) | Server Only |
| `CRON_SECRET` | Secret token for retention maintenance job | Server Only (Secret) |

---

## 5. Deploying to Vercel (Recommended)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete MoodSync V1 application"
   git push origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `moodsync` GitHub repository.
4. In the **Environment Variables** section, add all variables from the checklist above.
5. Click **Deploy**.
6. Within ~60 seconds, your site will be live at `https://moodsync-<your-username>.vercel.app` with automated HTTPS and global edge CDN caching.

---

## 6. Self-Hosted / Docker Alternative

If you prefer hosting on your own lightweight VPS (e.g., $3/mo Hetzner or digital ocean droplet):

### Standalone Node.js:
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm run start
   ```
3. Use a reverse proxy (Caddy or Nginx) with HTTPS:
   ```caddy
   moodsync.yourdomain.com {
       reverse_proxy 127.0.0.1:3000
   }
   ```

---

## 7. Installing as a PWA on Mobile Devices

MoodSync is a Progressive Web App (PWA) with full offline resilience, standalone status bar theming, and Web Push notifications.

### On iOS (Safari):
1. Open Safari and navigate to your deployed URL.
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen** (হোম স্ক্রিনে যোগ করুন).
4. Tap **Add**.
5. Launch MoodSync from your home screen as a native full-screen app.
6. In Settings, enable **নোটিফিকেশন চালু করো** to receive Web Push alerts (supported on iOS 16.4+).

### On Android (Chrome / Brave / Firefox):
1. Open Chrome and navigate to your deployed URL.
2. Tap the three-dot menu icon in the top right.
3. Tap **Install app** or **Add to Home Screen**.
4. Launch the app and grant notification permission when prompted.

---

## 8. Supabase Free Tier Inactivity & Maintenance

Supabase Free Tier projects pause if they receive zero database requests for 7 consecutive days.

### Keep-Alive Solution:
Because MoodSync is used regularly by both partners to communicate daily moods, normal usage prevents pausing. If you are away on vacation:
* Configure a free cron trigger (e.g., using GitHub Actions or cron-job.org) to ping your maintenance endpoint once a week:
  ```text
  GET https://your-moodsync.vercel.app/api/cron/cleanup?secret=YOUR_CRON_SECRET
  ```
* This triggers `cleanup_expired_mood_events()`, which removes mood records older than 30 days while resetting the Supabase activity timer.

---

## 9. Security & Verification Checklist

- [x] **Row Level Security (RLS):** Verified in `supabase/schema.sql`. Users can only select/insert mood events belonging to their specific couple.
- [x] **Service Role Key:** Kept strictly server-side (`lib/supabase/admin.ts` and API routes). Never prefixed with `NEXT_PUBLIC_`.
- [x] **Couple Limit:** Enforced at the database level via trigger `trg_check_couple_member_limit` — maximum 2 members per couple.
- [x] **Invite Code Expiration:** Codes automatically expire after 7 days and are invalidated once the second partner joins.
- [x] **Zero Third-Party Tracking:** No Google Analytics, no Facebook Pixel, no external AI services.
