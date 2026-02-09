-- Add Ruth Bader Ginsburg challenge
INSERT INTO public.challenges (title, edition, description, total_miles, slug, is_active)
VALUES (
  'Ruth Bader Ginsburg',
  'Women''s History',
  'Walk in the footsteps of the legendary Supreme Court Justice who fought for gender equality and became a cultural icon. Journey through 6 milestones spanning her groundbreaking legal career.',
  40,
  'ruth-bader-ginsburg',
  true
);

-- Add Jane Goodall challenge
INSERT INTO public.challenges (title, edition, description, total_miles, slug, is_active)
VALUES (
  'Jane Goodall',
  'Women''s History',
  'Follow the path of the world''s foremost primatologist and conservationist. Travel through 6 milestones that shaped her revolutionary understanding of chimpanzees and commitment to environmental activism.',
  45,
  'jane-goodall',
  true
);

-- Add milestones for Ruth Bader Ginsburg
INSERT INTO public.milestones (challenge_id, title, stamp_title, stamp_copy, stamp_mileage_display, miles_required, location_name, description, historical_event, order_index, latitude, longitude)
SELECT 
  c.id,
  m.title,
  m.stamp_title,
  m.stamp_copy,
  m.stamp_mileage_display,
  m.miles_required,
  m.location_name,
  m.description,
  m.historical_event,
  m.order_index,
  m.latitude,
  m.longitude
FROM public.challenges c
CROSS JOIN (VALUES
  ('James Madison High School', 'Brooklyn Roots', 'Where justice began', '1 mi', 1, 'Brooklyn, NY', 'Ruth graduated from James Madison High School in Brooklyn, where she developed her passion for learning.', '1950 - High school graduation', 1, 40.6095, -73.9480),
  ('Cornell University', 'Cornell Scholar', 'Pursuit of knowledge', '7 mi', 7, 'Ithaca, NY', 'She attended Cornell University, where she met her husband Martin and graduated with high honors.', '1954 - BA from Cornell', 2, 42.4534, -76.4735),
  ('Harvard Law School', 'Harvard Pioneer', 'Breaking barriers', '15 mi', 15, 'Cambridge, MA', 'One of only 9 women in a class of 500, Ruth excelled at Harvard Law while caring for her husband during his cancer treatment.', '1956-1958 - Harvard Law', 3, 42.3770, -71.1167),
  ('Columbia Law School', 'Columbia Graduate', 'First in class', '22 mi', 22, 'New York, NY', 'She transferred to Columbia Law School, graduating first in her class despite facing gender discrimination.', '1959 - JD from Columbia', 4, 40.8075, -73.9626),
  ('ACLU Women''s Rights Project', 'ACLU Champion', 'Fighting for equality', '32 mi', 32, 'New York, NY', 'Ruth co-founded the ACLU Women''s Rights Project and argued six landmark cases before the Supreme Court.', '1972 - Founded WRP', 5, 40.7527, -73.9772),
  ('U.S. Supreme Court', 'Justice RBG', 'Notorious and legendary', '40 mi', 40, 'Washington, D.C.', 'Appointed by President Clinton, she served 27 years on the Supreme Court, becoming a cultural icon for justice and equality.', '1993 - Supreme Court Justice', 6, 38.8907, -77.0044)
) AS m(title, stamp_title, stamp_copy, stamp_mileage_display, miles_required, location_name, description, historical_event, order_index, latitude, longitude)
WHERE c.slug = 'ruth-bader-ginsburg';

-- Add milestones for Jane Goodall
INSERT INTO public.milestones (challenge_id, title, stamp_title, stamp_copy, stamp_mileage_display, miles_required, location_name, description, historical_event, order_index, latitude, longitude)
SELECT 
  c.id,
  m.title,
  m.stamp_title,
  m.stamp_copy,
  m.stamp_mileage_display,
  m.miles_required,
  m.location_name,
  m.description,
  m.historical_event,
  m.order_index,
  m.latitude,
  m.longitude
FROM public.challenges c
CROSS JOIN (VALUES
  ('Bournemouth, England', 'English Origins', 'Where curiosity began', '1 mi', 1, 'Bournemouth, UK', 'Jane grew up in Bournemouth, where her love for animals began with observing local wildlife.', '1934 - Born in London, raised in Bournemouth', 1, 50.7192, -1.8808),
  ('Nairobi, Kenya', 'African Dreams', 'Journey to Africa', '8 mi', 8, 'Nairobi, Kenya', 'At 23, Jane traveled to Kenya where she met Louis Leakey, who would change the course of her life.', '1957 - Arrived in Kenya', 2, -1.2921, 36.8219),
  ('Gombe Stream Reserve', 'Gombe Pioneer', 'Into the wild', '18 mi', 18, 'Gombe, Tanzania', 'Jane began her groundbreaking research on wild chimpanzees at Gombe Stream, revolutionizing our understanding of primates.', '1960 - Started chimp research', 3, -4.6688, 29.6355),
  ('Cambridge University', 'Cambridge PhD', 'Scientific recognition', '28 mi', 28, 'Cambridge, UK', 'Despite having no undergraduate degree, Jane earned her PhD in Ethology from Cambridge, one of only 8 people to do so.', '1965 - Earned PhD', 4, 52.2053, 0.1218),
  ('Jane Goodall Institute', 'Institute Founder', 'Global mission', '38 mi', 38, 'Washington, D.C.', 'She founded the Jane Goodall Institute to advance her research and conservation efforts worldwide.', '1977 - Founded JGI', 5, 38.9072, -77.0369),
  ('Roots & Shoots Global', 'Roots & Shoots', 'Inspiring generations', '45 mi', 45, 'Dar es Salaam, Tanzania', 'Jane launched Roots & Shoots, a youth program now active in over 60 countries, empowering young people to create positive change.', '1991 - Launched Roots & Shoots', 6, -6.7924, 39.2083)
) AS m(title, stamp_title, stamp_copy, stamp_mileage_display, miles_required, location_name, description, historical_event, order_index, latitude, longitude)
WHERE c.slug = 'jane-goodall';