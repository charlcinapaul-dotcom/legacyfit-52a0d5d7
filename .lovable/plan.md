
# Seed Remaining 7 Challenges into Database

## Overview
Add the remaining 7 challenges from the Women's History Edition (plus Pride) to the database, following the established data patterns from Malala, Maya, and Toni Morrison journeys.

## Challenges to Seed

| Challenge | Total Miles | Edition |
|-----------|-------------|---------|
| Wilma Rudolph | 42 mi | 2026 |
| Eleanor Roosevelt | 50 mi | 2026 |
| Sojourner Truth | 35 mi | 2026 |
| Ida B. Wells | 40 mi | 2026 |
| Fannie Lou Hamer | 32 mi | 2026 |
| Katherine Johnson | 38 mi | 2026 |
| Pride History | 50 mi | 2026 |

## Data Structure (Following Existing Pattern)

### Challenge Fields
- `title`: Full journey name
- `slug`: URL-friendly identifier (e.g., "wilma", "eleanor")
- `edition`: "2026"
- `total_miles`: Journey total distance
- `description`: Journey overview text
- `is_active`: true

### Milestone Fields (6 per challenge)
- `title`: Short milestone name
- `stamp_title`: Display title for stamp
- `location_name`: Physical historical location
- `miles_required`: Cumulative miles to reach
- `order_index`: Sequence (1-6)
- `stamp_copy`: Descriptive text for stamp

## Implementation Steps

### Step 1: Insert Challenges
Insert 7 new challenge records with appropriate slugs, descriptions, and total miles.

### Step 2: Insert Milestones
Create 6 milestones per challenge (42 total new milestones) with historically accurate locations:

**Wilma Rudolph (42 mi)** - Olympic track & field champion
1. Clarksville, Tennessee (1 mi) - Birthplace
2. Tennessee State University (8 mi) - Athletic training
3. Melbourne, Australia (18 mi) - 1956 Olympics
4. Rome, Italy (28 mi) - 1960 Olympics bronze relay
5. Rome Olympic Stadium (36 mi) - First American woman with 3 gold medals
6. Clarksville, Tennessee (42 mi) - Return as champion

**Eleanor Roosevelt (50 mi)** - First Lady & human rights advocate
1. New York City (1 mi) - Birthplace
2. London, England (10 mi) - Allenswood Academy education
3. Washington, D.C. (20 mi) - First Lady activism
4. Val-Kill, NY (30 mi) - Personal retreat & independence
5. Paris, France (40 mi) - UN Human Rights Commission
6. United Nations, NYC (50 mi) - Universal Declaration of Human Rights

**Sojourner Truth (35 mi)** - Abolitionist & women's rights activist
1. Swartekill, New York (1 mi) - Born into slavery
2. New Paltz, New York (7 mi) - Escaped to freedom
3. New York City (14 mi) - Successful lawsuit for son's freedom
4. Northampton, Massachusetts (21 mi) - Utopian community & activism
5. Akron, Ohio (28 mi) - "Ain't I a Woman?" speech
6. Battle Creek, Michigan (35 mi) - Final home & legacy

**Ida B. Wells (40 mi)** - Journalist & anti-lynching crusader
1. Holly Springs, Mississippi (1 mi) - Birthplace
2. Memphis, Tennessee (8 mi) - Teaching career begins
3. Memphis Free Speech (16 mi) - Investigative journalism
4. New York City (24 mi) - National anti-lynching campaign
5. Chicago, Illinois (32 mi) - Co-founder NAACP
6. Chicago, Illinois (40 mi) - Lasting civil rights legacy

**Fannie Lou Hamer (32 mi)** - Voting rights activist
1. Montgomery County, Mississippi (1 mi) - Born into sharecropping
2. Ruleville, Mississippi (6 mi) - First voter registration attempt
3. Winona, Mississippi (12 mi) - Surviving brutal arrest
4. Atlantic City, NJ (18 mi) - Democratic National Convention testimony
5. Sunflower County, MS (25 mi) - Freedom Farm Cooperative
6. Ruleville, Mississippi (32 mi) - "Sick and tired of being sick and tired"

**Katherine Johnson (38 mi)** - NASA mathematician
1. White Sulphur Springs, WV (1 mi) - Birthplace
2. West Virginia State College (7 mi) - Mathematics prodigy
3. Hampton, Virginia (15 mi) - NACA "Computer" pool
4. Langley Research Center (23 mi) - Mercury orbital calculations
5. Houston, Texas (30 mi) - Apollo 11 trajectory
6. Washington, D.C. (38 mi) - Presidential Medal of Freedom

**Pride History (50 mi)** - LGBTQ+ rights movement
1. San Francisco, CA (1 mi) - Early LGBTQ+ community
2. New York City (10 mi) - Stonewall Inn uprising
3. San Francisco, CA (20 mi) - Harvey Milk elected
4. Washington, D.C. (30 mi) - First National March
5. Obergefell v. Hodges (40 mi) - Marriage equality
6. Nationwide (50 mi) - Continuing progress

### Step 3: Verify Integration
After seeding, the challenges will automatically appear at:
- `/challenge/wilma`
- `/challenge/eleanor`
- `/challenge/sojourner`
- `/challenge/ida`
- `/challenge/fannie`
- `/challenge/katherine`
- `/challenge/pride`

---

## Technical Details

### SQL Execution
Use SQL INSERT statements to add data. The migration tool will handle:
- Challenge records (7 inserts)
- Milestone records (42 inserts)

### Stamp Images
Milestones will be created without `stamp_image_url` initially. AI-generated images can be added later using the existing `generate-stamp-image` edge function.

### Data Validation
- All slugs are unique and URL-safe
- Miles distribute evenly across 6 milestones per journey
- Location names reference real historical places
- Order indices sequential (1-6) per challenge

---

## Expected Outcome
- 10 total challenges in database (3 existing + 7 new)
- 60 total milestones (18 existing + 42 new)
- All routes functional via dynamic `useChallengeBySlug` hook
- Landing page links to all 10 challenges will work
