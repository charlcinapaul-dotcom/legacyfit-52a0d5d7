
# Plan: Update Challenge Milestones with Accurate Historical Locations

## Overview
Review and correct all milestone locations in `src/pages/ChallengeRoute.tsx` to reflect the actual physical locations where each historical event occurred.

## Changes Required

### 1. Malala Yousafzai Challenge (line 77)
| Milestone | Current Location | Corrected Location |
|-----------|------------------|-------------------|
| Blog Begins (10 mi) | "Pakistan" | "Mingora, Swat Valley, Pakistan" |

### 2. Wilma Rudolph Challenge (lines 93-94)
| Milestone | Current Location | Corrected Location |
|-----------|------------------|-------------------|
| First Steps (8 mi) | "Home" | "Clarksville, Tennessee" |
| Basketball Star (16 mi) | "High School" | "Burt High School, Clarksville, TN" |

### 3. Ida B. Wells Challenge (line 147)
| Milestone | Current Location | Corrected Location |
|-----------|------------------|-------------------|
| Crusade Begins (32 mi) | "New York/Chicago" | "New York City, NY" |

The anti-lynching pamphlet "Southern Horrors" was published in New York in 1892.

### 4. Maya Angelou Challenge (line 164)
| Milestone | Current Location | Corrected Location |
|-----------|------------------|-------------------|
| I Know Why (36 mi) | "Worldwide" | "New York City, NY" |

"I Know Why the Caged Bird Sings" was published by Random House in New York City in 1969.

### 5. Katherine Johnson Challenge (lines 197-198)
| Milestone | Current Location | Corrected Location |
|-----------|------------------|-------------------|
| Mercury Calculations (22 mi) | "Langley" | "Langley Research Center, Hampton, VA" |
| Apollo 11 (30 mi) | "Mission Control" | "NASA Mission Control, Houston, TX" |

### 6. Toni Morrison Challenge (lines 214-215)
| Milestone | Current Location | Corrected Location |
|-----------|------------------|-------------------|
| The Bluest Eye (27 mi) | "Published" | "New York City, NY" |
| Beloved/Pulitzer (36 mi) | "Pulitzer Prize" | "Columbia University, New York City" |

"The Bluest Eye" was published by Holt, Rinehart and Winston in NYC. The Pulitzer Prize ceremony was held at Columbia University.

## Implementation

### File to Modify
- `src/pages/ChallengeRoute.tsx`

### Technical Details
Update the `location` field for each affected milestone in the `challengeData` object (lines 66-236). Each change is a simple string replacement within the milestone objects.

**Total changes:** 9 location corrections across 6 challenges

## Verification
After implementation, visually verify each challenge route page to confirm the updated locations display correctly in the milestone cards.
