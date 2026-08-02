-- Sample listings for development so the browse grid has real data before the
-- "post a listing" flow (M3) exists. Run AFTER 0001_listings_and_profiles.sql.
-- Assigns every sample to the earliest existing user (so seller_id is valid).
-- Re-running adds duplicates; clear with:  delete from public.listings;

insert into public.listings (seller_id, title, description, price_cents, category, image_url, contact, status)
select seller.id, v.title, v.description, v.price_cents, v.category, v.image_url, v.contact, 'active'
from (select id from public.profiles order by created_at limit 1) as seller
cross join (values
  ('Mini fridge',              'Perfect for a dorm, barely used. Cold as ever.',        6000,  'appliances',  'https://picsum.photos/seed/lowes-fridge/600/800', 'text 555-0101'),
  ('Intro to Psychology, 9e',  'Some highlighting but all pages intact.',              2500,  'textbooks',   'https://picsum.photos/seed/lowes-psych/600/800', 'psychbooks@covenant.edu'),
  ('Desk lamp',                'Warm LED, adjustable arm. Great for late-night study.', 1200,  'furniture',   'https://picsum.photos/seed/lowes-lamp/600/800', 'GroupMe: Dorm Deals'),
  ('Trek mountain bike',       'Well-loved commuter, new tires last spring.',          15000, 'outdoors',    'https://picsum.photos/seed/lowes-bike/600/800', 'text 555-0102'),
  ('Nintendo Switch',          'Comes with dock + two controllers.',                   18000, 'electronics', 'https://picsum.photos/seed/lowes-switch/600/800', 'switchseller@covenant.edu'),
  ('Futon',                    'Folds flat for guests. Neutral grey.',                 8000,  'furniture',   'https://picsum.photos/seed/lowes-futon/600/800', 'text 555-0103'),
  ('Organic Chemistry model kit', 'All pieces accounted for, saved my orgo grade.',    3000,  'textbooks',   'https://picsum.photos/seed/lowes-orgo/600/800', 'orgohelp@covenant.edu'),
  ('Keurig coffee maker',      'Descaled and ready. Makes a mean cup at 8am.',         3500,  'appliances',  'https://picsum.photos/seed/lowes-keurig/600/800', 'text 555-0104'),
  ('Acoustic guitar',          'Yamaha, small ding on the back but sounds great.',     9000,  'music',       'https://picsum.photos/seed/lowes-guitar/600/800', 'GroupMe: Campus Music Trade'),
  ('Snow jacket (M)',          'Warm North Face, worn one season on the mountain.',    5500,  'clothing',    'https://picsum.photos/seed/lowes-jacket/600/800', 'text 555-0105')
) as v(title, description, price_cents, category, image_url, contact);
