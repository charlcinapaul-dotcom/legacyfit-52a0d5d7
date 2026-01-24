
# LegacyFit - Complete Implementation Plan

## Overview

LegacyFit is a mobile-first social fitness platform where users log miles to unlock historical milestones, earn digital passport stamps, and collect legacy coins. This plan covers the complete implementation from branding to payments.

---

## Phase 1: Foundation and Branding

### 1.1 Design System Setup

Update the color scheme to match LegacyFit branding:

- **Background (Black)**: `#000000` - Primary app background
- **Gold**: `#D4AF37` - Achievements, coins, titles, accent elements
- **Cyan Glow**: `#00C9FF` - Progress indicators, digital accents, interactive elements
- **Supporting colors**: Dark grays for cards, white for text

Add custom animations for:
- Stamp unlock animation (stamp appearing with glow effect)
- Progress ring animations
- Coin reveal animation
- Map pin drop animation

### 1.2 Enable Supabase Backend

Connect Lovable Cloud for:
- User authentication
- Database storage
- Real-time subscriptions
- Edge functions for business logic

---

## Phase 2: Database Architecture

### 2.1 Core Tables

```text
+------------------+     +------------------+     +------------------+
|     profiles     |     |    challenges    |     |    milestones    |
+------------------+     +------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)    |     | id (uuid, PK)    |
| user_id (FK)     |     | title            |     | challenge_id (FK)|
| display_name     |     | description      |     | title            |
| avatar_url       |     | edition          |     | description      |
| bib_number       |     | total_miles      |     | historical_event |
| created_at       |     | price_cents      |     | latitude         |
+------------------+     | stripe_product_id|     | longitude        |
                         | is_active        |     | order_index      |
                         | created_at       |     | miles_required   |
                         +------------------+     | stamp_image_url  |
                                                  +------------------+

+------------------+     +------------------+     +------------------+
| user_challenges  |     | user_milestones  |     | user_passports   |
+------------------+     +------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)    |     | id (uuid, PK)    |
| user_id (FK)     |     | user_id (FK)     |     | user_id (FK)     |
| challenge_id (FK)|     | milestone_id (FK)|     | challenge_id (FK)|
| miles_logged     |     | unlocked_at      |     | stamp_id (FK)    |
| is_completed     |     +------------------+     | unlocked_at      |
| completed_at     |                              +------------------+
| payment_status   |
+------------------+

+------------------+     +------------------+     +------------------+
|   mile_entries   |     |   legacy_coins   |     |  coin_fulfillment|
+------------------+     +------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)    |     | id (uuid, PK)    |
| user_id (FK)     |     | challenge_id (FK)|     | user_id (FK)     |
| challenge_id (FK)|     | name             |     | coin_id (FK)     |
| miles            |     | description      |     | shipping_address |
| source           |     | image_url        |     | status           |
| logged_at        |     +------------------+     | flagged_at       |
+------------------+                              | shipped_at       |
                                                  +------------------+
```

### 2.2 Social Features Tables

```text
+------------------+     +------------------+     +------------------+
|      teams       |     |   team_members   |     |   group_walks    |
+------------------+     +------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)    |     | id (uuid, PK)    |
| name             |     | team_id (FK)     |     | name             |
| challenge_id (FK)|     | user_id (FK)     |     | challenge_id (FK)|
| created_by (FK)  |     | joined_at        |     | created_by (FK)  |
| invite_code      |     +------------------+     | invite_code      |
+------------------+                              | is_active        |
                                                  +------------------+

+------------------+     +------------------+
| group_walk_members|    |    user_roles    |
+------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)    |
| group_walk_id (FK)|    | user_id (FK)     |
| user_id (FK)     |     | role (enum)      |
| joined_at        |     +------------------+
+------------------+     (admin, moderator, user)
```

### 2.3 Payment Tables

```text
+------------------+     +------------------+
|  subscriptions   |     |   payments       |
+------------------+     +------------------+
| id (uuid, PK)    |     | id (uuid, PK)    |
| user_id (FK)     |     | user_id (FK)     |
| stripe_sub_id    |     | challenge_id (FK)|
| status           |     | stripe_payment_id|
| plan_type        |     | amount_cents     |
| current_period_end|    | status           |
+------------------+     | created_at       |
                         +------------------+
```

### 2.4 Row Level Security

- Users can only read/write their own progress data
- Challenges and milestones are publicly readable
- Admin role required for challenge management
- Team data visible to team members only
- Leaderboards use security-definer functions

---

## Phase 3: Authentication System

### 3.1 Auth Page (`/auth`)

- Email/password signup and login
- Social login with Google and Apple
- Password reset functionality
- Terms of service and privacy policy links
- Branded with LegacyFit styling (black background, gold accents)

### 3.2 User Onboarding Flow

1. User signs up/logs in
2. Create profile with display name
3. Auto-generate unique bib number
4. Show available challenges
5. Prompt to purchase first challenge

### 3.3 Protected Routes

- All routes except `/auth` and `/` require authentication
- Redirect unauthenticated users to login
- Admin routes require admin role verification

---

## Phase 4: Core Pages and Components

### 4.1 Page Structure

```text
/                    - Landing page (public)
/auth                - Login/Signup
/dashboard           - User's main hub
/challenge/:id       - Individual challenge view
/passport            - Digital passport with stamps
/leaderboard         - Rankings and teams
/profile             - User settings
/admin               - Admin panel (protected)
```

### 4.2 Landing Page

- Hero section with LegacyFit branding
- "Every Mile Unlocks History" tagline
- Featured challenge showcase
- How it works section
- Social proof / testimonials area
- CTA to join

### 4.3 Dashboard

- Current challenges with progress rings
- Recent activity feed
- Miles logged this week
- Next milestone preview
- Quick log miles button
- Notification center

### 4.4 Challenge View

- Challenge overview and description
- Interactive progress map with Google Maps
- Milestone list (locked/unlocked states)
- Log miles interface
- Share progress button
- Group walk option

### 4.5 Digital Passport

- Passport book visual design
- Pages with earned stamps
- Each stamp shows:
  - Historical figure/event
  - Location name
  - Date unlocked
  - Description
- Share individual stamps

### 4.6 Leaderboard

- Individual rankings (miles, completion %)
- Team leaderboards
- Filter by challenge
- Real-time updates via Supabase subscriptions

---

## Phase 5: Fitness Tracking Integration

### 5.1 Manual Entry

- Simple form to log miles
- Date picker for past entries
- Notes field (optional)
- Quick presets (1 mi, 3 mi, 5 mi, 10 mi)

### 5.2 Apple Health Integration

- Use Apple HealthKit via web bridge
- Sync walking/running distance
- Background sync option
- Convert steps to miles (2,000 steps ~ 1 mile)

### 5.3 Google Fit Integration

- OAuth connection to Google Fit API
- Sync walking/running activities
- Daily automatic sync
- Manual sync button

### 5.4 Edge Function: Process Miles

```text
Trigger: New mile entry
Actions:
1. Update user_challenges.miles_logged
2. Check milestone thresholds
3. Unlock milestones if reached
4. Award passport stamps
5. Check challenge completion
6. Issue coin if completed
7. Update leaderboard cache
8. Send real-time notification
```

---

## Phase 6: Milestones and Maps

### 6.1 Milestone System

- Milestones unlock sequentially
- Each has:
  - Historical title and description
  - Real-world coordinates
  - Associated stamp image
  - Miles threshold

### 6.2 Google Maps Integration

- Interactive route visualization
- Pins for completed milestones
- Auto-zoom to newly unlocked location
- Virtual route line showing progress

### 6.3 Milestone Unlock Animation

1. Progress reaches threshold
2. Screen overlay appears
3. Map zooms to location
4. Pin drops with animation
5. Stamp slides in from side
6. Confetti effect
7. "Add to Passport" confirmation

---

## Phase 7: Rewards System

### 7.1 Legacy Coins

- Digital coin stored in user's collection
- Unique design per challenge edition
- High-quality 3D visualization
- Shareable achievement card

### 7.2 Physical Coin Fulfillment

Upon challenge completion:
1. Congratulations modal appears
2. Show digital coin earned
3. Prompt for shipping address
4. Validate address format
5. Save to `coin_fulfillment` table
6. Flag for admin review
7. Send confirmation email

### 7.3 Admin Fulfillment Dashboard

- List of pending fulfillments
- User details and address
- Mark as shipped
- Track fulfillment status

---

## Phase 8: Social Features

### 8.1 Bib Numbers

- Auto-generated on signup (e.g., "LF-00001")
- Displayed on profile and leaderboard
- Can be used for team invites

### 8.2 Group Walks

- Create virtual walking groups
- See group members' progress
- Real-time updates
- Group chat (optional v2)

### 8.3 Teams

- Create or join teams
- Team leaderboard
- Combined team miles
- Team challenges

### 8.4 Social Sharing

- Share to Facebook and Instagram
- Shareable cards for:
  - Milestone unlocks
  - Stamp earned
  - Challenge completion
  - Coin earned
- Referral tracking (optional v2)

---

## Phase 9: Payments with Stripe

### 9.1 One-Time Purchases

- Each challenge has a price
- Stripe Checkout for purchase
- Success redirects to challenge unlock
- Failed payment shows error

### 9.2 Subscription Model

- Monthly/yearly plans
- Access to all current and future challenges
- Stripe subscription management
- Handle upgrades/downgrades

### 9.3 Webhook Handler (Edge Function)

Events to handle:
- `checkout.session.completed` - Unlock challenge
- `invoice.paid` - Renew subscription access
- `customer.subscription.deleted` - Revoke access
- `charge.refunded` - Revoke challenge access

### 9.4 Access Control

- Frontend checks `user_challenges` for access
- Backend validates on every data request
- No client-side guessing

---

## Phase 10: Admin Panel

### 10.1 Challenge Management

- Create/edit/delete challenges
- Set pricing
- Toggle active status
- Preview challenge

### 10.2 Milestone Management

- Add/edit/remove milestones
- Set coordinates
- Upload stamp images
- Order milestones

### 10.3 User Management

- View all users
- Search by email/bib number
- Manual access grants
- View user progress

### 10.4 Coin Fulfillment

- Pending fulfillment queue
- Mark as shipped
- Track inventory
- Export shipping list

### 10.5 Analytics Dashboard

- Active users
- Challenge completions
- Revenue tracking
- Popular challenges

---

## Phase 11: Real-Time Features

### 11.1 Supabase Realtime Subscriptions

- Leaderboard updates
- Group walk progress
- Milestone notifications
- Team activity

### 11.2 Notifications

- In-app notification center
- Milestone unlock alerts
- Team invites
- Challenge announcements

---

## Phase 12: Mobile Optimization

### 12.1 Responsive Design

- Mobile-first layouts
- Touch-friendly controls
- No horizontal scrolling
- Proper text wrapping
- Bottom navigation for mobile

### 12.2 PWA Features (v2)

- Add to home screen
- Offline progress viewing
- Push notifications

---

## Implementation Order

### Sprint 1: Foundation (Week 1)
1. Enable Supabase backend
2. Set up LegacyFit branding/colors
3. Create database schema (core tables)
4. Implement authentication with email + social login
5. Create landing page

### Sprint 2: Core Features (Week 2)
1. Build dashboard
2. Create challenge view with progress
3. Implement manual mile logging
4. Build milestone unlock system
5. Create digital passport

### Sprint 3: Payments and Access (Week 3)
1. Enable Stripe integration
2. Implement one-time purchase flow
3. Add subscription support
4. Build webhook handlers
5. Implement access control

### Sprint 4: Social and Maps (Week 4)
1. Add Google Maps integration
2. Build leaderboards
3. Implement teams
4. Add group walks
5. Social sharing

### Sprint 5: Admin and Polish (Week 5)
1. Build admin panel
2. Implement coin fulfillment
3. Add Apple Health / Google Fit
4. Polish animations
5. Testing and bug fixes

---

## Women's History Edition - Initial Challenge Data

**Challenge**: LegacyFit: Women's History Edition

**Sub-Challenges**:
1. **Malala Yousafzai** - Milestones TBD
2. **Wilma Rudolph** - Milestones TBD
3. **Eleanor Roosevelt** - Milestones TBD
4. *(Slot for future addition)*
5. *(Slot for future addition)*

Each sub-challenge will have 3-4 milestones with:
- Historical event/achievement
- Location coordinates
- Unique passport stamp
- Required miles to unlock

---

## Technical Notes

### Security Considerations
- Admin role stored in separate `user_roles` table (not in profiles)
- Server-side validation for all payments
- RLS policies on all user data tables
- Stripe webhook signature verification
- No sensitive data in client-side storage

### Performance Optimizations
- Real-time subscriptions only on active pages
- Lazy load map components
- Image optimization for stamps/coins
- Cached leaderboard calculations

### Future Editions Architecture
The database is designed to easily add:
- Black History Edition
- Pride Edition
- Any future themed challenges

Each edition uses the same structure with unique:
- Challenge record
- Milestone set
- Stamps
- Coin design
