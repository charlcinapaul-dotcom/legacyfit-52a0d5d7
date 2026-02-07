-- Create the three Women's History Edition umbrella challenges

-- 1. Courage & Change (Ida B. Wells, Sojourner Truth, Eleanor Roosevelt, Fannie Lou Hamer)
-- Total miles: 40 + 35 + 50 + 32 = 157 miles
INSERT INTO public.challenges (title, edition, slug, description, total_miles, is_active, image_url)
VALUES (
  'Women''s History Edition — Courage & Change',
  '2026',
  'womens-history-courage',
  'Walk alongside trailblazing women who fought for justice, freedom, and human rights. From Ida B. Wells'' fearless journalism to Eleanor Roosevelt''s championing of human rights, these journeys celebrate courage in the face of adversity.',
  157,
  true,
  NULL
);

-- 2. Voice & Vision (Maya Angelou, Toni Morrison, Katherine Johnson)
-- Total miles: 31 + 44 + 38 = 113 miles
INSERT INTO public.challenges (title, edition, slug, description, total_miles, is_active, image_url)
VALUES (
  'Women''s History Edition — Voice & Vision',
  '2026',
  'womens-history-voice',
  'Journey through the lives of visionary women who shaped our world through words, ideas, and groundbreaking achievements. From Maya Angelou''s poetry to Katherine Johnson''s calculations that sent astronauts to the moon.',
  113,
  true,
  NULL
);

-- 3. Strength & Endurance (Wilma Rudolph, Malala Yousafzai)
-- Total miles: 42 + 26 = 68 miles
INSERT INTO public.challenges (title, edition, slug, description, total_miles, is_active, image_url)
VALUES (
  'Women''s History Edition — Strength & Endurance',
  '2026',
  'womens-history-strength',
  'Follow the inspiring paths of women who overcame extraordinary obstacles through sheer determination. From Wilma Rudolph''s Olympic triumph over childhood illness to Malala''s unwavering fight for education.',
  68,
  true,
  NULL
);