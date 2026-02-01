
# Complete Payment, Referral & Challenge Images System

## Overview
Implement a complete payment flow with referral discounts and generate unique challenge images for all 10 journeys.

## Part 1: Payment Flow

### When Payment is Triggered
The payment prompt will appear when a user clicks "Start This Challenge" on any challenge page. The flow will be:

1. User clicks "Start This Challenge"
2. If not logged in → Redirect to auth, then back to challenge
3. If logged in → Check if already enrolled
4. If not enrolled → Show payment modal with Stripe Checkout
5. After successful payment → Create user_challenges record with payment_status = 'paid'

### Technical Implementation
- Create `create-checkout-session` edge function for Stripe
- Create `stripe-webhook` edge function to handle payment confirmation
- Add payment modal component
- Update ChallengeRoute to check enrollment status
- Gate MileLogger behind payment_status = 'paid'

## Part 2: Referral Discount System

### How It Works
1. When a user completes payment, they get a unique referral code
2. They can share this code with friends
3. New users entering the code at checkout get a discount (e.g., 20% off)
4. Referrer earns credits or discount on future purchases

### Database Changes
```text
referral_codes table:
- id, user_id, code (unique), uses_count, max_uses, discount_percent, created_at

referral_redemptions table:
- id, code_id, redeemed_by, challenge_id, discount_applied, created_at
```

### Implementation
- Generate referral code after first payment
- Add referral code input to checkout flow
- Create Stripe coupon/promotion codes via API
- Track redemptions in database

## Part 3: Challenge Images

### Approach
Generate AI images for each challenge that visually represent the theme:

| Challenge | Image Theme |
|-----------|-------------|
| Eleanor Roosevelt | UN building, human rights symbols, diplomatic setting |
| Fannie Lou Hamer | Mississippi delta, voting rights march, civil rights era |
| Ida B. Wells | Journalism, anti-lynching activism, newspaper printing |
| Katherine Johnson | NASA, space, mathematical equations, rockets |
| Malala Yousafzai | Education, books, Pakistani landscape, advocacy |
| Maya Angelou | Poetry, literature, stage performance, artistic expression |
| Pride History | Rainbow colors, Stonewall, LGBTQ+ activism symbols |
| Sojourner Truth | Freedom trail, abolitionist era, powerful speech imagery |
| Toni Morrison | Books, literary awards, Princeton university setting |
| Wilma Rudolph | Olympic track, gold medals, 1960 Rome Olympics |

### Implementation
- Create edge function to generate challenge cover images
- Store in Supabase storage bucket
- Update challenges.image_url in database

## Part 4: Share/Invite Enhancements

### Current State
- Basic Web Share API for stamps exists
- Teams have invite codes (unused)

### Enhancements
- Add "Invite Friends" button on Dashboard with referral code
- Show referral stats (how many signups, credits earned)
- Deep link support: `/invite/CODE` that pre-fills checkout discount

## Implementation Order

### Phase 1: Enable Stripe (Required First)
- Enable Stripe integration via Lovable
- Set challenge prices in database

### Phase 2: Payment Flow
- Create checkout edge functions
- Add payment modal to ChallengeRoute
- Gate challenge access behind payment

### Phase 3: Referral System
- Create referral tables
- Generate codes post-payment
- Integrate with Stripe coupons

### Phase 4: Challenge Images
- Generate 10 unique AI images
- Upload to storage
- Update database

## Files to Create/Modify

### New Files
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `src/components/PaymentModal.tsx`
- `src/components/ReferralShare.tsx`
- `src/hooks/useUserChallengeAccess.ts`
- `supabase/functions/generate-challenge-images/index.ts`

### Modified Files
- `src/pages/ChallengeRoute.tsx` - Add payment check
- `src/pages/ChallengePassport.tsx` - Gate behind payment
- `src/pages/Dashboard.tsx` - Add referral section

### Database Migrations
- Add referral_codes table
- Add referral_redemptions table
- Set price_cents for all challenges
