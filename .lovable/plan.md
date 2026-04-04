

## Add Dedicated Refund Policy Page

### What changes

1. **New file: `src/pages/RefundPolicy.tsx`**
   - Create a new page styled identically to `src/pages/Legal.tsx` (same header with back arrow, same card sections, same typography)
   - Render the full refund policy text provided by the user, using the same `bg-card rounded-xl border border-border p-6` section cards
   - Organize content into logical sections: All Sales Are Final, Lost Shipments, App Store Purchases, Billing Errors, Fraud/Abuse, Regional Rights, Contact
   - Use the same icon style (lucide icons) and heading patterns as Legal.tsx

2. **Update `src/App.tsx`**
   - Add lazy import for `RefundPolicy`
   - Add route: `<Route path="/refund-policy" element={<RefundPolicy />} />`

3. **Update `src/pages/Contact.tsx`**
   - Change the Refund Policy `<Link to="/legal">` to `<Link to="/refund-policy">`

4. **Update `src/components/SiteFooter.tsx`**
   - Add a "Refund Policy" link pointing to `/refund-policy` in the Legal column (optional, if desired for discoverability)

### No changes to
- Legal.tsx page
- Terms of Service link
- FAQ card or any other element on Contact page
- Any styling or colors

