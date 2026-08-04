-- Add a contact field to listings so buyers know how to reach the seller
-- (email, phone number, GroupMe link, etc). Safe to run more than once.

alter table public.listings
  add column if not exists contact text;
