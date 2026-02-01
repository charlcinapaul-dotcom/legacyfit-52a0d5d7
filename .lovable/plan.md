
# Seed Malala Yousafzai and Maya Angelou Challenge Milestones

## Overview
Add two new challenges with their complete milestone data, then generate unique AI stamp images for each milestone using the existing `generate-stamp-image` edge function.

## Current State
- Database has 1 challenge: "Toni Morrison Literary Journey" (44 miles, 6 milestones with generated stamps)
- Need to add: Malala Yousafzai Journey (26.2 miles) and Maya Angelou Journey (31+ miles)

## Implementation Steps

### Step 1: Create Challenges
Insert two new challenge records:

| Challenge | Total Miles | Edition |
|-----------|-------------|---------|
| Malala Yousafzai Journey | 26 | 2026 |
| Maya Angelou Journey | 31 | 2026 |

### Step 2: Insert Malala Yousafzai Milestones (6 stamps)

| Miles | Stamp Title | Location | Stamp Copy |
|-------|-------------|----------|------------|
| 1 | Mingora | Mingora, Pakistan | Starting Point - Where Malala's journey began |
| 5 | Swat Valley | Swat Valley, Pakistan | First School - Her first steps into education |
| 10 | Blog Begins | BBC Urdu | BBC Urdu Blog - Speaking truth through words |
| 15 | Recovery | Birmingham, UK | Renewed Strength - Courage through recovery |
| 20 | United Nations | New York City | Addressed the UN - Education for every child |
| 26 | Nobel Peace Prize | Oslo, Norway | Youngest Nobel Laureate - Peace through education |

### Step 3: Insert Maya Angelou Milestones (6 stamps)

| Miles | Stamp Title | Location | Stamp Copy |
|-------|-------------|----------|------------|
| 1 | St. Louis, Missouri | St. Louis, Missouri | Birthplace - The beginning of a powerful voice |
| 6 | Public Voice | San Francisco, CA | Poet & Performer - Words that demanded to be heard |
| 12 | Broadway | New York City | Artist & Performer - Owning her presence |
| 18 | I Know Why the Caged Bird Sings | New York City | Bestselling Author - Truth told without fear |
| 24 | Civil Rights | Atlanta, Georgia | Movement Leader - Using voice for justice |
| 31 | Presidential Medal of Freedom | Washington, D.C. | Highest Civilian Honor - A life of impact and grace |

### Step 4: Generate AI Stamp Images
Call the `generate-stamp-image` edge function for all 12 new milestones to create unique vintage passport-style stamp artwork.

## Technical Details
- Uses existing `generate-stamp-image` edge function with Lovable AI (google/gemini-2.5-flash-image)
- Each stamp will be stored as base64 PNG in `stamp_image_url` column
- Stamps feature vintage passport aesthetic with milestone title, location, and mileage

## Summary
- 2 new challenges created
- 12 new milestones inserted with exact copy provided
- 12 AI-generated stamp images produced
- Total challenges after completion: 3
- Total milestones after completion: 18
