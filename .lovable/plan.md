

# Updated Plan: Passport Checkpoint Map + Landing Page Preview

## Overview
Implement the interactive map feature for the Challenge Passport AND add a visual preview/illustration to the Landing page "Unlock Milestones" section.

## Part 1: Landing Page Enhancement

### Current State
The "Unlock Milestones" card in "How It Works" shows:
- MapPin icon
- Static text description

### Enhancement
Add a mini-map preview or animated illustration showing:
- A stylized map with sample pins
- Route line connecting locations
- Visual demonstration of the unlock experience

### Implementation Options

**Option A: Static Illustration**
- Add a decorative SVG/image showing a stylized map with pins
- Simpler, faster to implement

**Option B: Interactive Mini-Map**
- Small Leaflet map with sample milestone locations
- Hover animations showing lock/unlock states
- More engaging but heavier

**Recommended: Option A** - Static illustration for the landing page keeps it lightweight while the full interactive experience lives in the actual Passport Checkpoint tab.

## Part 2: Passport Checkpoint (Full Feature)

### Tabbed Interface in ChallengePassport
Two tabs:
1. **Journey Stamps** - Existing stamp grid
2. **Passport Checkpoint** - Interactive map

### Map Features
- World map centered on challenge locations
- Pin markers for each of 6 milestones
- Unlocked pins: Amber/gold with checkmark
- Locked pins: Gray with lock icon
- Route line: Solid for completed, dashed for upcoming
- Click pin to view milestone details

## Technical Implementation

### Dependencies
- `leaflet` - Core map library (free, open-source)
- `react-leaflet` - React wrapper

### Database Update
Populate latitude/longitude for all 60 milestones using geocoding edge function.

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/PassportCheckpointMap.tsx` | Full interactive Leaflet map |
| `src/components/MilestoneMarker.tsx` | Custom pin markers |
| `src/components/MapPreview.tsx` | Stylized SVG illustration for landing |
| `supabase/functions/geocode-milestones/index.ts` | Populate coordinates |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Landing.tsx` | Add MapPreview to "Unlock Milestones" card |
| `src/pages/ChallengePassport.tsx` | Add Tabs with map view |
| `src/hooks/usePassportStamps.ts` | Include lat/lng in data |
| `src/index.css` | Add Leaflet CSS |
| `package.json` | Add leaflet dependencies |

## Implementation Order

1. Install Leaflet dependencies
2. Create geocode-milestones edge function
3. Run geocoding to populate coordinates
4. Create PassportCheckpointMap component
5. Create MilestoneMarker component
6. Update ChallengePassport with tabs
7. Create MapPreview illustration component
8. Add MapPreview to Landing page
9. Add Leaflet CSS styles
10. Test and refine

## Credit Considerations

Credit consumption cannot be accurately estimated as it depends on:
- Number of iterations needed
- Debugging complexity
- Edge function testing cycles

Each chat message = 1 credit. The implementation likely requires multiple messages for:
- Creating components
- Database updates
- Testing and debugging
- Refinements

