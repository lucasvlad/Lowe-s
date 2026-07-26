import { supabase } from "@/utils/supabase";

export type ListingStatus = "active" | "sold" | "removed";

export interface ListingRecord {
  id: string;
  seller_id: string | null;
  title: string;
  description: string | null;
  price_cents: number;
  category: string | null;
  image_url: string | null;
  status: ListingStatus;
  created_at: string;
}

export interface ListingWithSeller extends ListingRecord {
  seller: { display_name: string | null } | null;
}

export const LISTINGS_PAGE_SIZE = 20;

/** One page of active listings, newest first. `page` is 0-indexed. */
export async function fetchListingsPage(page: number): Promise<ListingRecord[]> {
  const from = page * LISTINGS_PAGE_SIZE;
  const to = from + LISTINGS_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return (data ?? []) as ListingRecord[];
}

/** A single listing with its seller's display name, or null if not found. */
export async function fetchListingById(
  id: string,
): Promise<ListingWithSeller | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, seller:profiles(display_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as ListingWithSeller | null) ?? null;
}

/** Format an integer number of cents as USD, e.g. 6000 -> "$60.00". */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
