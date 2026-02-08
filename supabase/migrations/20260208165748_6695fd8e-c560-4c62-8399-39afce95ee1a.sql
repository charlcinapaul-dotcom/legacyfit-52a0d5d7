-- Create milestones for Women's History Edition — Courage & Change (157 miles total)
-- Combines: Ida B. Wells (40mi), Sojourner Truth (35mi), Eleanor Roosevelt (50mi), Fannie Lou Hamer (32mi)

INSERT INTO public.milestones (challenge_id, title, stamp_title, stamp_copy, location_name, miles_required, order_index, description)
VALUES
-- Ida B. Wells milestones (0-40 miles)
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Ida B. Wells - Birth of a Voice', 'Holly Springs', 'Where Ida B. Wells was born into slavery', 'Holly Springs, Mississippi', 7, 1, 'Begin your journey where Ida B. Wells was born in 1862'),
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Ida B. Wells - Memphis Crusade', 'Memphis', 'Where her anti-lynching crusade began', 'Memphis, Tennessee', 20, 2, 'Ida refused to give up her train seat 71 years before Rosa Parks'),
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Ida B. Wells - Chicago Legacy', 'Chicago', 'Where she founded the Alpha Suffrage Club', 'Chicago, Illinois', 40, 3, 'Ida co-founded the NAACP and fought for women''s suffrage'),

-- Sojourner Truth milestones (40-75 miles)
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Sojourner Truth - Breaking Chains', 'Ulster County', 'Born into slavery, she would break free', 'Ulster County, New York', 52, 4, 'Born Isabella Baumfree around 1797 in Dutch-speaking New York'),
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Sojourner Truth - Ain''t I a Woman', 'Akron', 'Site of her famous speech', 'Akron, Ohio', 75, 5, 'In 1851, she delivered one of history''s most powerful speeches'),

-- Eleanor Roosevelt milestones (75-125 miles)
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Eleanor Roosevelt - First Lady of the World', 'New York City', 'Where Eleanor transformed the role of First Lady', 'New York City, New York', 90, 6, 'Eleanor redefined what it meant to be First Lady'),
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Eleanor Roosevelt - Human Rights Champion', 'United Nations', 'Where she championed the Universal Declaration', 'United Nations, New York', 125, 7, 'She chaired the committee that drafted the Universal Declaration of Human Rights'),

-- Fannie Lou Hamer milestones (125-157 miles)
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Fannie Lou Hamer - Sick and Tired', 'Ruleville', 'Where she began her voting rights fight', 'Ruleville, Mississippi', 142, 8, 'In 1962, she lost her job for trying to register to vote'),
('e967f72f-8f0f-4aa7-bb1d-b19a7a0deef0', 'Fannie Lou Hamer - Freedom Summer', 'Atlantic City', 'Her testimony shook the nation', 'Atlantic City, New Jersey', 157, 9, 'Her 1964 Democratic Convention testimony exposed brutal voter suppression');

-- Create milestones for Women's History Edition — Voice & Vision (113 miles total)
-- Combines: Maya Angelou (31mi), Toni Morrison (44mi), Katherine Johnson (38mi)

INSERT INTO public.milestones (challenge_id, title, stamp_title, stamp_copy, location_name, miles_required, order_index, description)
VALUES
-- Maya Angelou milestones (0-31 miles)
('842a999e-d2c3-4850-a531-d49eaef46e37', 'Maya Angelou - Caged Bird Sings', 'Stamps', 'Where Maya found her voice through silence', 'Stamps, Arkansas', 10, 1, 'After childhood trauma, she found healing through literature'),
('842a999e-d2c3-4850-a531-d49eaef46e37', 'Maya Angelou - Renaissance Woman', 'San Francisco', 'Where she became the first Black female streetcar conductor', 'San Francisco, California', 31, 2, 'Maya''s memoir "I Know Why the Caged Bird Sings" became a classic'),

-- Toni Morrison milestones (31-75 miles)
('842a999e-d2c3-4850-a531-d49eaef46e37', 'Toni Morrison - Ohio Roots', 'Lorain', 'Where Toni''s literary genius was born', 'Lorain, Ohio', 50, 3, 'Born Chloe Wofford in 1931, she would become a literary giant'),
('842a999e-d2c3-4850-a531-d49eaef46e37', 'Toni Morrison - Nobel Laureate', 'Stockholm', 'First Black woman to win the Nobel Prize in Literature', 'Stockholm, Sweden', 75, 4, 'In 1993, she won the Nobel Prize for her powerful novels'),

-- Katherine Johnson milestones (75-113 miles)
('842a999e-d2c3-4850-a531-d49eaef46e37', 'Katherine Johnson - Human Computer', 'White Sulphur Springs', 'Where a mathematical prodigy was born', 'White Sulphur Springs, West Virginia', 90, 5, 'Katherine''s calculations were trusted over computers'),
('842a999e-d2c3-4850-a531-d49eaef46e37', 'Katherine Johnson - To the Moon', 'NASA Langley', 'Where she calculated the path to the stars', 'Hampton, Virginia', 113, 6, 'Her calculations helped send astronauts to the moon and back');

-- Create milestones for Women's History Edition — Strength & Endurance (68 miles total)
-- Combines: Wilma Rudolph (42mi), Malala Yousafzai (26mi)

INSERT INTO public.milestones (challenge_id, title, stamp_title, stamp_copy, location_name, miles_required, order_index, description)
VALUES
-- Wilma Rudolph milestones (0-42 miles)
('b56f442a-ecd9-41a1-92f2-0b0f9da8dffd', 'Wilma Rudolph - Against All Odds', 'Clarksville', 'Born premature and stricken with polio', 'Clarksville, Tennessee', 10, 1, 'Doctors said she would never walk. She decided to run.'),
('b56f442a-ecd9-41a1-92f2-0b0f9da8dffd', 'Wilma Rudolph - First Steps', 'Nashville', 'Where she learned to walk without braces', 'Nashville, Tennessee', 21, 2, 'At age 12, she removed her leg braces for good'),
('b56f442a-ecd9-41a1-92f2-0b0f9da8dffd', 'Wilma Rudolph - Fastest Woman', 'Rome Olympics', 'Three gold medals in a single Olympics', 'Rome, Italy', 42, 3, 'In 1960, she became the fastest woman in the world'),

-- Malala Yousafzai milestones (42-68 miles)
('b56f442a-ecd9-41a1-92f2-0b0f9da8dffd', 'Malala Yousafzai - Voice for Education', 'Mingora', 'Where she began advocating for girls'' education', 'Mingora, Pakistan', 52, 4, 'At age 11, she wrote a BBC blog about life under Taliban rule'),
('b56f442a-ecd9-41a1-92f2-0b0f9da8dffd', 'Malala Yousafzai - Resilience', 'Birmingham', 'Where she recovered and continued her mission', 'Birmingham, United Kingdom', 60, 5, 'After surviving an assassination attempt, she continued fighting'),
('b56f442a-ecd9-41a1-92f2-0b0f9da8dffd', 'Malala Yousafzai - Nobel Peace Prize', 'Oslo', 'Youngest Nobel Peace Prize laureate in history', 'Oslo, Norway', 68, 6, 'At age 17, she became the youngest Nobel laureate');