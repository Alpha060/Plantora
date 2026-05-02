"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Custom hook that polls a fetch function at a given interval.
 * Shows loading state only on initial fetch, not on subsequent polls.
 *
 * @param fetchFn - async function to call
 * @param intervalMs - polling interval in milliseconds (default: 15000)
 */
export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  intervalMs = 15000
) {
  const savedFn = useRef(fetchFn);

  useEffect(() => {
    savedFn.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const interval = setInterval(() => {
      savedFn.current();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}

/**
 * Hook that provides auto-refreshing data fetching.
 *
 * @param url - API URL to fetch from
 * @param intervalMs - polling interval in milliseconds (default: 15000)
 * @returns { data, isLoading, refresh }
 */
export function usePolledData<T>(url: string, intervalMs = 15000) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const fetchData = useCallback(async () => {
    if (!initialLoadDone.current) setIsLoading(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silent on poll errors
    } finally {
      initialLoadDone.current = true;
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [fetchData, intervalMs]);

  return { data, isLoading, refresh: fetchData };
}
