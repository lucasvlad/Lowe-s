import { useCallback, useEffect, useState } from "react";
import {
  fetchListingsPage,
  LISTINGS_PAGE_SIZE,
  type ListingRecord,
} from "@/utils/listings";

interface UseListingsResult {
  listings: ListingRecord[];
  isLoading: boolean; // initial load
  isLoadingMore: boolean; // fetching the next page
  isRefreshing: boolean; // pull-to-refresh
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

/** Loads active listings with cursor-free page pagination for infinite scroll. */
export function useListings(): UseListingsResult {
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(async (pageToLoad: number, replace: boolean) => {
    try {
      const rows = await fetchListingsPage(pageToLoad);
      setHasMore(rows.length === LISTINGS_PAGE_SIZE);
      setListings((prev) => (replace ? rows : [...prev, ...rows]));
      setPage(pageToLoad);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load listings"));
    }
  }, []);

  // Initial load.
  useEffect(() => {
    setIsLoading(true);
    loadPage(0, true).finally(() => setIsLoading(false));
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || isRefreshing || !hasMore) return;
    setIsLoadingMore(true);
    loadPage(page + 1, false).finally(() => setIsLoadingMore(false));
  }, [isLoading, isLoadingMore, isRefreshing, hasMore, page, loadPage]);

  const refresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setHasMore(true);
    loadPage(0, true).finally(() => setIsRefreshing(false));
  }, [isRefreshing, loadPage]);

  return {
    listings,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
