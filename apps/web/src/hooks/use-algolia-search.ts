import { useCallback, useEffect, useMemo, useState } from "react";

import { ALGOLIA_BLOG_INDEX, searchClient } from "@/lib/algolia";
import type { Blog } from "@/types";
import { useDebounce } from "./use-debounce";

const SEARCH_DEBOUNCE_MS = 400;

type SearchState = {
  results: Blog[];
  isSearching: boolean;
  error: Error | null;
};

export function useAlgoliaSearch(categorySlugs: string[] = []) {
  const [searchQuery, setSearchQuery] = useState("");
  const [state, setState] = useState<SearchState>({
    results: [],
    isSearching: false,
    error: null,
  });

  const debouncedQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const hasQuery = debouncedQuery.trim().length > 0;

  const facetFilters = useMemo(() => {
    if (categorySlugs.length === 0) return undefined;
    return [categorySlugs.map((slug) => `categorySlugs:${slug}`)];
  }, [categorySlugs]);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setState({ results: [], isSearching: false, error: null });
        return;
      }

      setState((prev) => ({ ...prev, isSearching: true, error: null }));

      try {
        const { results } = await searchClient.search({
          requests: [
            {
              indexName: ALGOLIA_BLOG_INDEX,
              query,
              hitsPerPage: 12,
              facetFilters,
            },
          ],
        });

        const firstResult = results[0];
        if (firstResult && "hits" in firstResult) {
          setState({
            results: firstResult.hits as unknown as Blog[],
            isSearching: false,
            error: null,
          });
        }
      } catch (err) {
        setState({
          results: [],
          isSearching: false,
          error: err instanceof Error ? err : new Error("Search failed"),
        });
      }
    },
    [facetFilters]
  );

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  return {
    searchQuery,
    setSearchQuery,
    results: state.results,
    isSearching: state.isSearching,
    error: state.error,
    hasQuery,
  };
}
