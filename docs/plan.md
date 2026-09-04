# Couples Mood App — V1 Plan

## 1. Product Vision

A private, ultra-lightweight, two-person Progressive Web App (PWA) designed for a couple to communicate their current emotional state in a simple, immediate, and visually pleasant way.

The app is **not a surveillance or monitoring system**.

Its purpose is:

> **“I can quickly tell my partner how I feel, and my partner can understand what is happening with me without needing to constantly ask.”**

Both partners use the same app.

All intentionally submitted mood information is shared equally between the two partners.

---

# 2. Core Principles

### Simple

A mood update should take only a few seconds.

### Real-time & Responsive

When one person changes their mood, the other person's screen updates immediately without refreshing. When the app resumes from background sleep, it automatically re-syncs.

### Shared

There are no private mood entries in V1.

If a person submits a mood, their partner can see it.

### Consent-based

The app only knows what a person explicitly enters.

It must never secretly monitor:

* Location
* Messages
* Calls
* Contacts
* Microphone
* Camera
* Other apps
* Browser activity
* Device activity

### Private & Zero-Cost

The application is built to run on the **Supabase Free Tier** with strict Row Level Security (RLS) and zero third-party tracking.

No advertising.

No third-party analytics.

No tracking SDKs.

No external AI service receives relationship or mood data.

### Low-Resource & Lightweight

The app footprint is kept strictly minimal:
* Sub-150KB frontend bundle.
* Minimal database egress and zero heavy background jobs.
* Runs 100% within free-tier resource limits.

### Calm

The interface should feel warm, peaceful, modern, and intimate.

It should never feel like:

* A medical app
* A productivity dashboard
* A surveillance tool
* A social network
* A game

---

# 3. Users

V1 supports exactly two people.

Example:

* Partner A
* Partner B

Both accounts have equal permissions.

There is no concept of:

* Husband admin
* Wife admin
* Superior account
* Hidden administrator access

The server owner may technically control the infrastructure, but the application itself must enforce equal authorization.

---

# 4. Main User Experience

The primary interaction is:

## Question → Answer → Next Question

Never show a huge questionnaire.

Example:

### Screen 1

> **এখন কেমন লাগছে?**

Large emoji choices:

* 😄 খুব ভালো
* 🙂 ভালো
* 😌 শান্ত
* 😐 মোটামুটি
* 😔 মন খারাপ
* 😣 খুব খারাপ
* 😡 রাগ লাগছে
* 🥺 কষ্ট লাগছে

The user taps one.

The selection is saved immediately.

Then the next question appears.

---

# 5. Emoji Meaning

Emoji must not rely only on visual interpretation.

Every mood has:

* Emoji
* Bangla name
* Short explanation
* Optional longer explanation

Example:

### 😔 মন খারাপ

> মনটা একটু ভার লাগছে। হয়তো কোনো নির্দিষ্ট কারণ আছে, হয়তো নেই।

### 😌 শান্ত

> এখন মনটা বেশ স্থির ও স্বস্তিতে আছে।

### 😡 রাগ লাগছে

> কোনো কিছু নিয়ে বিরক্ত, রাগ বা ক্ষোভ অনুভব করছি।

The explanation should appear subtly when the user taps/holds an emoji or when appropriate.

---

# 6. Second Question — What Do I Need?

After choosing a mood:

> **এই মুহূর্তে তোমার কী দরকার?**

Options:

### 🫂 একটু আদর

> কাছে আসতে বা একটু affection পেতে ইচ্ছে করছে।

### 💬 কথা বলতে চাই

> আমার সাথে কথা বলতে ভালো লাগবে।

### 👂 শুধু শুনো

> সমাধান নয়, শুধু চাই তুমি আমাকে শুনো।

### 🧘 একটু space

> এখন কিছুটা একা থাকতে চাই।

### 🤍 পাশে থাকো

> কিছু বলতে হবে না, শুধু পাশে থাকলেই ভালো লাগবে।

### 🤷 জানি না

> নিজেরও ঠিক বুঝতে পারছি না কী দরকার।

This question is optional.

The user can skip it.

---

# 7. Intimacy / Sexual Mood

This can exist as an optional category because both partners explicitly want transparency.

It should never be automatically inferred.

Example:

> **আজ একটু closeness-এর mood কেমন?**

Options:

* 🤍 আদর চাই
* 🫂 কাছে থাকতে চাই
* ❤️ রোমান্টিক লাগছে
* 🔥 Intimate mood
* 😐 বিশেষ কিছু না
* — বলতে চাই না

The app records exactly what the person chooses.

It does not infer sexual intent from ordinary moods.

Do not use sexual mood as a score or performance metric.

---

# 8. Instant Mood Update

The latest mood is always visible on the main screen.

Example:

## ওর এখনকার মুড

### 😔

**মন খারাপ**

> ২ মিনিট আগে

Then if the partner updates:

### 🙂

**একটু ভালো লাগছে**

The UI should transition smoothly from 😔 → 🙂.

No page refresh.

No loading screen.

No manual synchronization.

---

# 9. Realtime Behavior

Use a Supabase realtime connection between clients and the database.

When Partner A submits a mood:

1. Client sends event to database with user auth.
2. Supabase verifies authentication and Row Level Security (RLS).
3. Database inserts record into `mood_events`.
4. Supabase Realtime broadcasts change on the filtered `couple_id` channel.
5. Partner B's app receives the event.
6. UI updates smoothly with subtle transition.

Target:

> Normally visible to the other user within approximately 1 second when both apps are active.

### Mobile Lifecycle & Sleep/Wake Handling (Critical for PWAs)

Mobile browsers (especially iOS Safari and Android Chrome PWA) aggressively throttle or kill background WebSocket connections when the screen is locked or the app is minimized.

To ensure state is never stale:
* **`visibilitychange` listener:** When `document.visibilityState === 'visible'` (user brings the app back to foreground), the client checks socket health and immediately executes a fast, lightweight fetch for the latest mood snapshot.
* **Auto-reconnect:** Supabase client automatically reconnects the channel if dropped.
* **Bandwidth & resource efficiency:** Clients only subscribe to events matching `filter: 'couple_id=eq.<ID>'`, ensuring zero unnecessary database egress or data leakage across couples.

If the connection is lost:

* Show a small `অফলাইন` indicator.
* Save the update locally when safe.
* Synchronize when connection returns.
* Never silently lose a mood update.

---

# 10. Today's Timeline

The timeline is one of the main features.

Example:

## আজ

**20:42**

😔
মন খারাপ

↓

**20:51**

🧘
একটু space

↓

**21:27**

🙂
একটু ভালো লাগছে

↓

**22:04**

🫂
একটু আদর চাই

Timeline entries should show:

* Time
* Mood
* Need/action if selected
* Optional short note

Keep the visual design extremely clean.

---

# 11. Mood Change

A user can update their mood at any time.

Do not overwrite previous mood events.

Instead:

```text
Mood Event 1
    ↓
Mood Event 2
    ↓
Mood Event 3
```

This allows the application to represent how the person's mood changed throughout the day.

The latest event becomes the current mood.

---

# 12. Optional Note

After mood selection, optionally allow:

> **কিছু বলতে চাও?**

Text box:

> আজকে অফিসে একটু খারাপ লাগছিল...

This should be optional.

Do not force writing.

The user should be able to complete the mood update without typing anything.

---

# 13. Fight / Difficult Moment

Add a simple action:

> **কিছু একটা হয়েছে**

This allows an immediate mood update after an argument or difficult event.

Example:

> **এখন কী অনুভব করছো?**

😡 রাগ
😔 কষ্ট
🥺 অভিমান
😶 চুপ থাকতে চাই
🧘 একটু সময় চাই
💬 কথা বলতে চাই

The system should not attempt to determine who is right or wrong.

No relationship scoring.

No “fight score.”

No AI psychological interpretation.

It simply records what the person chose to communicate.

---

# 14. Main Screens

V1 should have approximately four primary areas.

## 14.1 এখন

The current state of both people.

Example:

```text
আজ রাত

তুমি
🙂
ভালো

ও
😔
মন খারাপ

────────────

[ আমার মুড বদলাও ]

────────────

আজকের আপডেট
4টি
```

This should be the default/home screen.

---

## 14.2 আজ

Today's full timeline.

Show mood changes chronologically.

---

## 14.3 এই সপ্তাহ

A lightweight visual summary.

Example:

```text
এই সপ্তাহ

সোম  🙂 
মঙ্গল 😄
বুধ  😔
বৃহস্পতি 😐
শুক্র 🙂 
```

Do not create complicated analytics.

---

## 14.4 সেটিংস

Include:

* Profile
* Partner connection
* Language
* Data retention
* Account security
* Export data
* Delete my data
* Sign out

---

# 15. History / Data Retention

Detailed history should not accumulate indefinitely.

Recommended V1:

### Detailed timeline

Keep for:

**30 days**

### Older data

Delete automatically unless both partners explicitly choose a longer retention period later.

Potential settings:

* 7 days
* 14 days
* 30 days

Default:

**30 days**

The goal is to remember recent context, not build a permanent psychological archive.

---

# 16. Long-Term Summary

Instead of showing hundreds of historical events, older information can eventually become aggregate statistics.

For V1, this can be minimal.

Example:

> **এই সপ্তাহ**

🙂 ভালো — 3 দিন
😐 মোটামুটি — 2 দিন
😔 মন খারাপ — 1 দিন

Do not label someone:

> “You are usually depressed.”

Do not make medical or psychological claims.

The app shows observations, not diagnoses.

---

# 17. Bangla-First Interface & Typography

The primary UI language is Bangla.

Use natural conversational Bangla rather than formal/robotic translations.

Examples:

Use:

> এখন কেমন লাগছে?

Instead of:

> আপনার বর্তমান মানসিক অবস্থা নির্বাচন করুন।

Use:

> একটু কথা বলতে চাও?

Instead of:

> আপনি কি কথোপকথনে অংশগ্রহণ করতে ইচ্ছুক?

### Bengali Font & Conjunct Rendering (যুক্তবর্ণ)

To prevent broken or misaligned Bengali conjuncts on iOS Safari, Android Chrome, and various desktop platforms:
* Use a web font with robust Bengali Unicode support (e.g., **`Hind Siliguri`** or **`Noto Sans Bengali`**).
* Load via `next/font/google` with `subsets: ['bengali', 'latin']` and `display: 'swap'` for zero Layout Shift (CLS) and zero external CDN latency.
* Centralize all Bangla strings in a single dictionary file (e.g., `lib/constants/strings.bn.ts`) for clean maintenance and future localization.

---

# 18. Visual Design

Design direction:

**Simple + Light + Cool + Warm (Ultra-Low Overhead)**

Characteristics:

* Crisp typography with proper Bengali line-height
* Large emoji & large touch targets (minimum 48x48px for mobile thumbs)
* Lots of whitespace & calm visual hierarchy
* Rounded cards & soft shadows
* Minimal navigation (single-page or bottom tab bar with 3 tabs max)
* Smooth, low-computation CSS transitions
* Gentle micro-interactions
* Mobile-first
* Native dark/light mode with CSS variables (zero runtime overhead)
* Zero heavy assets: Use native system emojis and lightweight SVGs (Lucide icons) instead of raster images

Avoid:

* Dense dashboards
* Tiny buttons
* Excessive colors
* Excessive charts
* Gamification
* Streaks
* Badges
* Points
* Competitive elements
* Loud animations

The app should feel good to open when someone is having a difficult day.

---

# 19. Interaction Design

Mood selection should feel tactile.

Example:

User taps 😔.

The emoji gently enlarges.

The card settles.

Then:

> **মন খারাপ**
> মনটা একটু ভার লাগছে।

Then the next question slides/fades in.

Realtime changes from the partner should have a subtle animation.

Example:

```text
😔
মন খারাপ

       ↓

🙂
একটু ভালো লাগছে
```

Do not use aggressive notification animations.

---

# 20. PWA & Web Push

The application must be a proper Progressive Web App (PWA).

Requirements:

* Installable (home screen bookmark / standalone mode)
* Mobile-first responsive layout
* App icons (192x192, 512x512, maskable)
* Web App Manifest (`manifest.json`)
* Service Worker for caching app shell & offline fallback
* **Lightweight Web Push Notifications:**
  * Uses standard Web Push API via Service Worker with VAPID keys.
  * When one partner updates their mood, the other partner receives a gentle native push notification (*“ওর মুড আপডেট হয়েছে”* or custom subtle text).
  * Solves the passive-checking problem without requiring either partner to leave the app running 24/7.
  * Zero third-party push services (runs via standard browser push endpoints and Node `web-push`).
* Fast startup (< 1.5s on mobile)
* Standalone app mode with custom theme color for mobile status bar

---

# 21. Recommended Technical Architecture

Designed to be **ultra-low resource, zero-cost, and virtually zero-maintenance**.

### Frontend

* **Next.js (App Router, React 19 / 18, TypeScript)**
* **Tailwind CSS** (utility-first, purged CSS, minimal runtime overhead)
* **PWA / Service Worker** (via `@ducanh2912/next-pwa` or custom lightweight service worker)
* **Font:** `next/font/google` (`Hind Siliguri`) with zero runtime fetch
* **Bundle Budget:** Under 150 KB initial JS payload

### Backend / Database

**Supabase Free Tier (Managed Cloud)**

Why Supabase Free Tier over Self-Hosted:
* **Zero server resource overhead:** Running self-hosted Supabase containers requires 2–3 GB of dedicated RAM; the Supabase Free Tier completely offloads this to Supabase's managed infrastructure at $0/month.
* **Built-in features:**
  * **Supabase Auth:** Secure cookie/JWT authentication without custom token hashing.
  * **PostgreSQL:** Production-grade SQL with Row Level Security (RLS).
  * **Supabase Realtime:** Instant WebSocket broadcasts filtered strictly by `couple_id`.
* **Resource footprint:** A 2-person couple generating ~10-20 mood events per day consumes < 1 MB of storage per year and negligible bandwidth—well within the free limits (500 MB DB, 2 GB egress, 50k MAU).
* **Inactivity handling:** A periodic lightweight interaction or weekly check ensures the free project stays unpaused.

---

# 22. Database Concept

Core tables:

## users

```text
id
name
created_at
updated_at
```

## couples

```text
id
created_at
```

## couple_members

```text
couple_id
user_id
joined_at
```

Constraint:

> Maximum 2 members per couple.

## mood_events

```text
id
couple_id
user_id
mood_id
need_id
intimacy_mood_id
note
created_at
```

## mood_definitions

```text
id
emoji
name_bn
description_bn
sort_order
```

## need_definitions

```text
id
emoji
name_bn
description_bn
sort_order
```

## intimacy_definitions

```text
id
emoji
name_bn
description_bn
sort_order
```

Use IDs instead of storing arbitrary emoji/text repeatedly.

---

# 23. Security Model

Security is a core requirement.

### Authentication

Use a mature authentication system.

Never implement password hashing manually.

Requirements:

* Strong authentication
* Secure session handling
* Secure cookies where applicable
* Session expiration/rotation
* Rate limiting
* Brute-force protection
* Password reset protection

---

# 24. Authorization

Every database request must be authorized server-side.

Never trust:

* User ID from the client
* Couple ID from the client
* Visibility information from the client
* Any hidden frontend field

The server determines whether a user belongs to the couple.

A user can only access data belonging to their own couple.

---

# 25. Row Level Security

If using Supabase/Postgres:

Enable RLS.

Rules must guarantee:

> A user can only read mood events belonging to a couple they are a member of.

And:

> A user can only create mood events as themselves.

A client must never be able to submit:

```text
user_id = partner_id
```

and impersonate their partner.

The authenticated identity from the server/auth system must determine ownership.

---

# 26. Equal Access

Both partners have equal permissions.

Neither partner should have an application-level administrator role that allows them to silently read or modify the other's identity.

Each person can:

* Create their own mood events.
* Read shared couple mood events.
* Update/delete their own events where appropriate.
* Manage their own account.

---

# 27. Data Protection

Use:

* HTTPS everywhere
* HSTS
* Secure headers
* CSP
* Secure cookies
* CSRF protection where applicable
* Parameterized queries
* Server-side input validation
* Output encoding
* XSS protection
* SQL injection protection
* Rate limiting
* Dependency security scanning
* Secure environment variables

Never place:

* Database passwords
* API secrets
* Service-role keys
* Encryption keys

inside frontend code.

---

# 28. Supabase Service Role

If Supabase is used:

The Supabase service-role key must NEVER be exposed to the browser.

It belongs only on the server.

The browser should use the public/anonymous key together with strict RLS.

---

# 29. Network Security

Database should not be directly exposed unnecessarily.

Preferred architecture:

```text
Internet
   ↓
HTTPS
   ↓
Reverse Proxy
   ↓
Application
   ↓
Internal Database
```

Use a firewall to expose only required ports.

Disable unnecessary services.

Use automatic security updates where appropriate.

---

# 30. Secrets

Use environment variables.

Example:

```text
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET
```

Never commit `.env` files containing real secrets.

Provide:

```text
.env.example
```

with placeholders.

---

# 31. No External Data Sharing

V1 must not send mood information to:

* Google Analytics
* Facebook/Meta
* TikTok
* Advertising networks
* Telegram
* OpenAI
* Anthropic
* Gemini
* Other external AI providers

No third party should receive the couple's mood data.

---

# 32. Logging

Logs must not contain sensitive information.

Never log:

* Mood notes
* Intimacy mood
* Personal messages
* Full request bodies
* Authentication tokens
* Passwords
* Session cookies

Logs can contain technical information such as:

```text
request_id
timestamp
endpoint
status_code
latency
error_code
```

---

# 33. Backups

Database backups should be:

* Automated
* Encrypted
* Access controlled

Document:

* How to restore
* How to rotate credentials
* How to delete backups

Important:

> Deleted data should not remain indefinitely in accessible application storage.

Backup retention should therefore be documented separately.

---

# 34. Privacy Philosophy

The application follows this principle:

> **Nothing is secretly collected. Everything intentionally shared through the app is shared between the two partners.**

The app should clearly communicate this during onboarding.

Example:

> **এই অ্যাপ তোমাদের দুজনের জন্য।**
>
> এখানে তুমি যা শেয়ার করবে, তোমার partner সেটা দেখতে পারবে।
>
> অ্যাপ তোমার location, phone activity বা অন্য কোনো ব্যক্তিগত তথ্য track করে না।

---

# 35. No AI Interpretation in V1

Do not add AI-generated psychological analysis.

Do not generate statements such as:

> “Your wife is emotionally distant.”

or:

> “Her sexual interest has decreased this week.”

The application should record and display what the user explicitly reports.

Future analytics can be considered later, but V1 should remain simple.

---

# 36. Realtime Presence

Optional but desirable.

Show:

> 🟢 এখন online

or:

> শেষ দেখা ৫ মিনিট আগে

However, presence should only indicate app presence.

Do not track background device activity.

Do not show exact location.

---

# 37. Connection Status

Small status indicator:

> 🟢 Connected

If disconnected:

> ⚠️ Offline

If an update is waiting to sync:

> Syncing...

Never silently pretend an update was saved if it was not.

---

# 38. Error Handling

Errors should be written in friendly Bangla.

Instead of:

> WebSocket Error 1006

show:

> **কিছু একটা সমস্যা হয়েছে।**
>
> আবার চেষ্টা করছি...

Technical details go to logs, not the user.

---

# 39. Accessibility

Support:

* Large touch targets
* Keyboard navigation
* Screen readers where practical
* Sufficient contrast
* Reduced-motion preference
* Clear text labels in addition to emoji

Emoji must never be the only semantic indicator.

For example:

Bad:

> 😔

Good:

> 😔 মন খারাপ

---

# 40. Performance

Target:

* Fast initial load
* Small bundle
* Optimized images
* Lazy loading where appropriate
* Minimal dependencies
* Realtime connection only when needed
* No unnecessary polling

Do not refresh the entire page for a mood change.

---

# 41. MVP Feature List

### Must have (Core & Lean)

* [ ] Two-user authentication (Supabase Auth)
* [ ] Couple pairing via unique invite code
* [ ] Bangla conversational UI with proper Bengali web font (`Hind Siliguri`)
* [ ] Mood selection with emoji & Bangla descriptions
* [ ] Need selection (*“এই মুহূর্তে তোমার কী দরকার?”*)
* [ ] Optional intimacy mood
* [ ] Optional short note (*“কিছু বলতে চাও?”*)
* [ ] Append-only mood event history & Today's timeline
* [ ] Current mood display with smooth transition
* [ ] Supabase Realtime synchronization (filtered by `couple_id`)
* [ ] Mobile lifecycle re-sync on `visibilitychange` (waking from sleep)
* [ ] Lightweight Web Push notification (alert partner when mood is updated)
* [ ] PWA (manifest, service worker, installable, mobile-first)
* [ ] Ultra-low resource footprint (< 150 KB initial JS, minimal DB queries)
* [ ] 30-day automatic data retention cleanup
* [ ] Supabase Row Level Security (RLS) ensuring strict couple isolation
* [ ] HTTPS and secure deployment on Vercel / lightweight host + Supabase Free Tier

### Nice to have

* [ ] Online presence (lightweight app presence only)
* [ ] Weekly summary view (simple aggregate count)
* [ ] Offline update queue (resync on reconnect)
* [ ] Reduced-motion mode preference
* [ ] Data export (JSON download)
* [ ] Install prompt banner

### Do NOT build in V1

* [ ] AI therapist or psychological diagnostics
* [ ] AI relationship analysis or advice
* [ ] Chat / messaging system (use existing messaging apps for long talks)
* [ ] Social features / public profiles / feed
* [ ] Location tracking / device activity monitoring
* [ ] Telegram / WhatsApp bot integrations
* [ ] Gamification / streaks / points / scores
* [ ] Relationship ranking or guilt metrics
* [ ] Complex analytics or heavy charting libraries
* [ ] Heavy native app wrappers (Capacitor/React Native)
* [ ] Third-party advertising or analytics SDKs

---

# 42. Onboarding

First launch:

### Screen 1

> **আমাদের মুড**
> দুজনের মনের খবর একটু সহজভাবে জানার জন্য।

### Screen 2

> **কীভাবে কাজ করে?**
>
> তুমি তোমার মুড update করবে।
>
> তোমার partner সেটা সঙ্গে সঙ্গে দেখতে পারবে।
>
> তুমিও তার update দেখতে পারবে।

### Screen 3

> **Privacy**
>
> অ্যাপ শুধু তুমি যা share করবে সেটাই জানবে।
>
> কোনো location tracking নেই।
> কোনো hidden monitoring নেই।

Then:

> **শুরু করি ❤️**

---

# 43. Couple Pairing

One partner creates a couple.

Generate a short pairing code or secure invitation.

Example:

> **তোমার invite code**
>
> `K7M4Q9`

Other partner enters the code.

After pairing:

> **তোমরা connected ❤️**

Do not use predictable sequential invitation codes.

Codes must be:

* Random
* Short enough to type
* Rate limited
* Expirable

---

# 44. Data Ownership

Each user should be able to:

* See their submitted events
* Delete their events
* Export their data
* Delete their account

Deleting an account must have clearly defined behavior for associated mood events.

The behavior must be documented before implementation.

---

# 45. Testing Requirements

Before deployment, test:

### Authentication

* Invalid password
* Brute-force attempts
* Session expiry
* Logout
* Password reset
* Unauthorized access

### Authorization

* User A cannot access another couple
* User A cannot create events as User B
* User A cannot modify User B's identity
* User A cannot bypass RLS

### Realtime

* A updates → B sees update
* B updates → A sees update
* Disconnect/reconnect
* Duplicate event prevention
* Offline synchronization

### Security

Test for:

* XSS
* SQL injection
* CSRF
* IDOR
* Authentication bypass
* Privilege escalation
* Token leakage
* Secret exposure

### Data retention

Verify that old detailed events are actually removed according to policy.

---

# 46. Deployment & Low-Resource Operations

Recommended deployment topology:

```text
Mobile / Desktop Client (PWA)
   ↓ HTTPS
Next.js Frontend (Vercel Free Tier or lightweight Node container)
   ↓ HTTPS / WSS
Supabase Free Tier (Managed Auth, PostgreSQL, Realtime)
```

Why this setup requires minimal resources:

* **Zero infrastructure cost:** Both Vercel and Supabase have robust, reliable free tiers.
* **Low memory footprint:** No need to run heavy Docker containers on a home server or VPS.
* **Global edge CDN:** Fast static asset delivery (< 100ms) with zero server configuration.
* **Automated SSL/TLS:** Handled automatically by the hosting provider.
* **Database backups & health:** Managed automatically by Supabase.
* **Environment variables required:**
  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * `SUPABASE_SERVICE_ROLE_KEY` (server-side only, for Web Push triggers)
  * `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  * `VAPID_PRIVATE_KEY`

---

# 47. Development Philosophy

The AI coding agent must prioritize:

1. Security & strict RLS
2. Privacy & zero third-party leakage
3. Simplicity & ultra-low resource usage
4. Reliability & PWA mobile lifecycle resilience
5. Realtime experience & Bengali typographic polish

Do not introduce a library or service merely because it is popular.

Every dependency should have a reason.

Do not over-engineer.

Do not build features not specified in the plan.

---

# 48. Definition of Done

V1 is complete when:

1. Two people can securely create accounts via Supabase Auth.
2. They can securely pair with each other using a random code.
3. Either person can update their mood in seconds.
4. Mood explanations are available in natural Bangla with proper font rendering (`Hind Siliguri`).
5. Both partners immediately see intentional mood updates via Supabase Realtime.
6. The PWA automatically checks socket health and re-syncs when waking from mobile sleep (`visibilitychange`).
7. A lightweight Web Push notification alerts the partner when a mood is logged.
8. A complete daily mood timeline is maintained with append-only events.
9. Previous mood events are not overwritten.
10. Optional needs/intimacy information can be recorded.
11. The PWA installs and works smoothly on mobile with an ultra-light bundle (< 150 KB initial JS).
12. The interface feels simple, light, modern, and warm.
13. Detailed history is automatically removed according to the 30-day retention policy.
14. Authentication and authorization have been tested.
15. RLS strictly prevents cross-couple data access.
16. Service-role secrets are never exposed to the client.
17. No external service receives mood data.
18. The application does not secretly monitor either person.
19. The entire app operates reliably within Supabase and frontend free tiers with minimal maintenance.

---

# 49. Product Motto

> **মুড লুকানোর জন্য নয়।
> মুড বোঝার জন্য। ❤️**

The application should make it easier for two people who love each other to notice:

> “তুমি এখন কেমন আছো?”

without requiring either person to constantly ask.

