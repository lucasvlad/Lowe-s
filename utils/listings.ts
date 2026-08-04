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
  contact: string | null;
  status: ListingStatus;
  created_at: string;
}

export interface ListingWithSeller extends ListingRecord {
  seller: { display_name: string | null } | null;
}

export const LISTINGS_PAGE_SIZE = 20;

export interface ListingsFilter {
  /** Keyword matched against title/description (server-side, case-insensitive). */
  search?: string;
  /** Restrict to one category, or omit/null for all categories. */
  category?: string | null;
}

// PostgREST's `.or()` filter syntax treats "," and "()" as structural
// (condition separators / grouping), so strip them out of user input rather
// than risk a malformed filter or a search that silently matches nothing.
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, " ").trim();
}

/** One page of active listings, newest first, optionally filtered. `page` is 0-indexed. */
export async function fetchListingsPage(
  page: number,
  filter: ListingsFilter = {},
): Promise<ListingRecord[]> {
  const from = page * LISTINGS_PAGE_SIZE;
  const to = from + LISTINGS_PAGE_SIZE - 1;

  let query = supabase.from("listings").select("*").eq("status", "active");

  if (filter.category) {
    query = query.eq("category", filter.category);
  }

  const term = filter.search ? sanitizeSearchTerm(filter.search) : "";
  if (term) {
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  const { data, error } = await query
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

/** Parse a user-entered price string (e.g. "19.99") into integer cents, or null if invalid. */
export function parsePriceToCents(value: string): number | null {
  const trimmed = value.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const cents = Math.round(parseFloat(trimmed) * 100);
  return Number.isFinite(cents) && cents >= 0 ? cents : null;
}

export interface ListingInput {
  title: string;
  description: string | null;
  price_cents: number;
  category: string;
  image_url: string | null;
  contact: string;
}

/** All listings (any status) belonging to `sellerId`, newest first — for "My listings". */
export async function fetchMyListings(sellerId: string): Promise<ListingRecord[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ListingRecord[];
}

/** Insert a new listing owned by `sellerId`. */
export async function createListing(
  sellerId: string,
  input: ListingInput,
): Promise<ListingRecord> {
  const { data, error } = await supabase
    .from("listings")
    .insert({ seller_id: sellerId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data as ListingRecord;
}

/** Update an existing listing. RLS restricts this to the owning seller. */
export async function updateListing(
  id: string,
  input: Partial<ListingInput> & { status?: ListingStatus },
): Promise<ListingRecord> {
  const { data, error } = await supabase
    .from("listings")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ListingRecord;
}

/** Delete a listing. RLS restricts this to the owning seller. */
export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}

export const MAX_LISTING_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

function extensionFromUri(uri: string): string {
  const clean = uri.split("?")[0].split("#")[0];
  const ext = clean.split(".").pop()?.toLowerCase();
  return ext && ext.length <= 4 ? ext : "jpg";
}

function contentTypeFromExtension(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/**
 * Upload a locally-picked image to the `listing-images` Storage bucket under
 * the seller's own folder (required by the bucket's RLS policy) and return
 * its public URL. Uses fetch->blob so it works the same on native and web.
 */
export async function uploadListingImage(
  sellerId: string,
  localUri: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  if (blob.size > MAX_LISTING_IMAGE_BYTES) {
    throw new Error("Image is too large — please choose one under 8MB.");
  }

  const ext = extensionFromUri(localUri);
  const path = `${sellerId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("listing-images")
    .upload(path, blob, { contentType: contentTypeFromExtension(ext) });

  if (error) throw error;

  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return data.publicUrl;
}
