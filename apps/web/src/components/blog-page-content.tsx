"use client";

import type { QueryBlogIndexPageDataResult } from "@workspace/sanity/types";
import { ListFilter } from "lucide-react";
import { Suspense } from "react";

import { BlogHeader } from "@/components/blog-card";
import { BlogPagination } from "@/components/blog-pagination";
import { BlogSearchResults } from "@/components/blog-search-results";
import { BlogSection } from "@/components/blog-section";
import {
  CategoryFilterBar,
  SelectedFiltersRow,
} from "@/components/category-filter";
import { PageBuilder } from "@/components/pagebuilder";
import { useAlgoliaSearch } from "@/hooks/use-algolia-search";
import { useBlogFilters } from "@/hooks/use-blog-filters";
import type { Blog, CategoryWithAvailability } from "@/types";
import type { PaginationMetadata } from "@/utils";
import { SearchInput } from "./blog-search";

type BlogPageContentProps = {
  indexPageData: NonNullable<QueryBlogIndexPageDataResult>;
  blogs: Blog[];
  paginationMetadata: PaginationMetadata;
  categories: CategoryWithAvailability[];
  selectedCategorySlugs: string[];
  hasActiveCategories: boolean;
  isPageOutOfRange: boolean;
};

function EmptyFilterState({ onClearAll }: { onClearAll: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
        <ListFilter className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">
        No articles match these filters.
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">
        Try removing a filter or clearing all.
      </p>
      <button
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2 text-sm font-medium transition-colors"
        onClick={onClearAll}
        type="button"
      >
        Clear all filters
      </button>
    </div>
  );
}

function BlogPageContentInner({
  indexPageData,
  blogs,
  paginationMetadata,
  categories,
  selectedCategorySlugs,
  hasActiveCategories,
  isPageOutOfRange,
}: BlogPageContentProps) {
  const {
    title,
    description,
    pageBuilder = [],
    _id,
    _type,
    featuredBlogsCount,
    displayFeaturedBlogs,
  } = indexPageData;

  const { searchQuery, setSearchQuery, results, isSearching, hasQuery, error } =
    useAlgoliaSearch(selectedCategorySlugs);

  const { toggleCategory, removeCategory, clearAll } = useBlogFilters();

  const validFeaturedBlogsCount = featuredBlogsCount
    ? Number.parseInt(featuredBlogsCount, 10)
    : 0;

  const shouldDisplayFeaturedBlogs =
    displayFeaturedBlogs &&
    validFeaturedBlogsCount > 0 &&
    paginationMetadata.currentPage === 1 &&
    !hasQuery &&
    !hasActiveCategories;

  const featuredBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(0, validFeaturedBlogsCount)
    : [];

  const remainingBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(validFeaturedBlogsCount)
    : blogs;

  const showEmptyState =
    (hasActiveCategories || isPageOutOfRange) &&
    featuredBlogs.length === 0 &&
    remainingBlogs.length === 0;

  return (
    <main className="bg-background">
      <div className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader description={description} title={title} />

        <SearchInput
          className="mt-8 mb-6"
          onChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search blogs..."
          value={searchQuery}
        />

        {categories.length > 0 && (
          <div className="mb-8 space-y-3">
            <CategoryFilterBar
              categories={categories}
              onClearAll={clearAll}
              onToggleCategory={toggleCategory}
              selectedCategories={selectedCategorySlugs}
            />
            <SelectedFiltersRow
              categories={categories}
              onClearAll={clearAll}
              onRemoveCategory={removeCategory}
              selectedCategories={selectedCategorySlugs}
            />
          </div>
        )}

        {hasQuery ? (
          <BlogSearchResults
            error={error}
            hasQuery={hasQuery}
            isSearching={isSearching}
            results={results}
            searchQuery={searchQuery}
          />
        ) : showEmptyState ? (
          <EmptyFilterState onClearAll={clearAll} />
        ) : (
          <>
            <BlogSection
              blogs={featuredBlogs}
              isFeatured
              title="Featured Posts"
            />
            <BlogSection blogs={remainingBlogs} title="All Posts" />
            {paginationMetadata?.totalPages > 1 && (
              <BlogPagination
                className="mt-12 flex justify-center"
                currentPage={paginationMetadata.currentPage}
                hasNextPage={paginationMetadata.hasNextPage}
                hasPreviousPage={paginationMetadata.hasPreviousPage}
                totalPages={paginationMetadata.totalPages}
              />
            )}
          </>
        )}
      </div>

      {pageBuilder && pageBuilder.length > 0 && (
        <PageBuilder id={_id} pageBuilder={pageBuilder} type={_type} />
      )}
    </main>
  );
}

export function BlogPageContent(props: BlogPageContentProps) {
  return (
    <Suspense>
      <BlogPageContentInner {...props} />
    </Suspense>
  );
}
