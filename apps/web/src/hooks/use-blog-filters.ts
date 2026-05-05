"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const CATEGORIES_PARAM = "categories";
const PAGE_PARAM = "page";

export function useBlogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = useMemo(() => {
    const raw = searchParams.get(CATEGORIES_PARAM);
    if (!raw) {
      return [] as string[];
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [searchParams]);

  const hasActiveFilters = selectedCategories.length > 0;

  const buildUrl = useCallback(
    (categorySlugs: string[]) => {
      const params = new URLSearchParams(searchParams.toString());

      params.delete(PAGE_PARAM);

      if (categorySlugs.length === 0) {
        params.delete(CATEGORIES_PARAM);
      } else {
        params.set(CATEGORIES_PARAM, categorySlugs.join(","));
      }

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const toggleCategory = useCallback(
    (slug: string) => {
      const updated = selectedCategories.includes(slug)
        ? selectedCategories.filter((s) => s !== slug)
        : [...selectedCategories, slug];
      router.push(buildUrl(updated), { scroll: false });
    },
    [selectedCategories, buildUrl, router]
  );

  const removeCategory = useCallback(
    (slug: string) => {
      const updated = selectedCategories.filter((s) => s !== slug);
      router.push(buildUrl(updated), { scroll: false });
    },
    [selectedCategories, buildUrl, router]
  );

  const clearAll = useCallback(() => {
    router.push(buildUrl([]), { scroll: false });
  }, [buildUrl, router]);

  return {
    selectedCategories,
    hasActiveFilters,
    toggleCategory,
    removeCategory,
    clearAll,
  };
}
