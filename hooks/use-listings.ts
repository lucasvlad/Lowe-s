import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
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

/**
 * Loads active listings with cursor-free page pagination for infinite scroll.
 * `search`/`category` are applied server-side; changing either reloads from
 * page 0.
 */
export function useListings(
  search: string = "",
  category: string | null = null,
): UseListingsResult {
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      try {
        const rows = await fetchListingsPage(pageToLoad, { search, category });
        setHasMore(rows.length === LISTINGS_PAGE_SIZE);
        setListings((prev) => (replace ? rows : [...prev, ...rows]));
        setPage(pageToLoad);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load listings"));
      }
    },
    [search, category],
  );

  // Refetch every time the browse screen regains focus (e.g. after posting a
  // new listing) rather than only once on first mount — tabs stay mounted, so
  // a plain useEffect would never see listings created after the initial
  // load. The first focus still shows the full-screen spinner; later ones
  // refresh quietly behind the existing list.
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      setHasMore(true);
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        setIsLoading(true);
        loadPage(0, true).finally(() => setIsLoading(false));
      } else {
        loadPage(0, true);
      }
    }, [loadPage]),
  );

  // Reload from page 0 whenever the search/category filter changes while the
  // screen is already focused — useFocusEffect above only fires on
  // focus/blur transitions, not on every re-render.
  const isFirstFilter = useRef(true);
  useEffect(() => {
    if (isFirstFilter.current) {
      isFirstFilter.current = false;
      return;
    }
    setIsLoading(true);
    setHasMore(true);
    loadPage(0, true).finally(() => setIsLoading(false));
    // Reload is keyed on the filter values themselves; loadPage already
    // captures them and is recreated when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

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
