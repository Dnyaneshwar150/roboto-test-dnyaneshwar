import { sanityFetch } from "@workspace/sanity/live";
import {
  queryAllCategories,
  queryBlogCategoryAvailability,
  queryBlogIndexPageBlogs,
  queryBlogIndexPageBlogsByCategories,
  queryBlogIndexPageBlogsByCategoriesCount,
  queryBlogIndexPageBlogsCount,
  queryBlogIndexPageData,
} from "@workspace/sanity/query";
import { notFound } from "next/navigation";

import { BlogHeader } from "@/components/blog-card";
import { BlogPageContent } from "@/components/blog-page-content";
import { PageBuilder } from "@/components/pagebuilder";
import { getSEOMetadata } from "@/lib/seo";
import type { CategoryWithAvailability } from "@/types";
import {
  calculatePaginationMetadata,
  getBlogPaginationStartEnd,
  handleErrors,
} from "@/utils";

async function fetchBlogIndexPageData() {
  const res = await sanityFetch({ query: queryBlogIndexPageData });
  return res.data;
}

async function fetchBlogIndexPageBlogs(start: number, end: number) {
  const res = await sanityFetch({
    query: queryBlogIndexPageBlogs,
    params: { start, end },
  });
  return res.data;
}

async function fetchBlogIndexPageBlogsByCategories(
  categorySlugs: string[],
  start: number,
  end: number
) {
  const res = await sanityFetch({
    query: queryBlogIndexPageBlogsByCategories,
    params: {
      categorySlugs,
      categoryCount: categorySlugs.length,
      start,
      end,
    },
  });
  return res.data;
}

async function fetchBlogIndexPageBlogsCount() {
  const res = await sanityFetch({
    query: queryBlogIndexPageBlogsCount,
  });
  return res.data;
}

async function fetchBlogIndexPageBlogsByCategoriesCount(
  categorySlugs: string[]
) {
  const res = await sanityFetch({
    query: queryBlogIndexPageBlogsByCategoriesCount,
    params: {
      categorySlugs,
      categoryCount: categorySlugs.length,
    },
  });
  return res.data;
}

async function fetchAllCategories() {
  const res = await sanityFetch({ query: queryAllCategories });
  return res.data;
}

async function fetchCategoryAvailability(selectedSlugs: string[]) {
  const res = await sanityFetch({
    query: queryBlogCategoryAvailability,
    params: {
      selectedSlugs,
      selectedCount: selectedSlugs.length,
    },
  });
  return res.data;
}

export async function generateMetadata() {
  const { data: result } = await sanityFetch({
    query: queryBlogIndexPageData,
  });
  return getSEOMetadata({
    title: result?.title ?? result?.seoTitle,
    description: result?.description ?? result?.seoDescription,
    slug: "/blog",
    contentId: result?._id,
    contentType: result?._type,
  });
}

type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
    categories?: string;
  }>;
};

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const { page, categories: categoriesParam } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  const rawCategorySlugs = categoriesParam
    ? categoriesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const [
    [indexPageData, errIndexPageData],
    [allCategories, errCategories],
  ] = await Promise.all([
    handleErrors(fetchBlogIndexPageData()),
    handleErrors(fetchAllCategories()),
  ]);

  const validCategorySlugs: string[] = allCategories
    ? rawCategorySlugs.filter((slug) =>
        allCategories.some((c) => c.slug === slug)
      )
    : [];

  const selectedCategorySlugs = validCategorySlugs;
  const hasCategories = selectedCategorySlugs.length > 0;

  const [[totalCount, errTotalCount]] = await Promise.all([
    hasCategories
      ? handleErrors(
          fetchBlogIndexPageBlogsByCategoriesCount(selectedCategorySlugs)
        )
      : handleErrors(fetchBlogIndexPageBlogsCount()),
  ]);

  if (errIndexPageData || !indexPageData) {
    notFound();
  }


  if (errTotalCount || totalCount === null || totalCount === undefined) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Unable to load blog posts at the moment.
          </p>
        </div>
        {indexPageData.pageBuilder && indexPageData.pageBuilder.length > 0 && (
          <PageBuilder
            id={indexPageData._id}
            pageBuilder={indexPageData.pageBuilder}
            type={indexPageData._type}
          />
        )}
      </main>
    );
  }

  const featuredBlogsCount = indexPageData.displayFeaturedBlogs
    ? Number(indexPageData.featuredBlogsCount) || 0
    : 0;

  const paginationMetadata = calculatePaginationMetadata(
    totalCount,
    currentPage
  );


  const isPageOutOfRange =
    paginationMetadata.totalPages > 0 &&
    currentPage > paginationMetadata.totalPages;

  const { start, end } = getBlogPaginationStartEnd(currentPage);


  const offset = hasCategories ? 0 : featuredBlogsCount;
  const blogStart = currentPage === 1 ? 0 : start + offset;
  const blogEnd = end + offset;

  const [[blogs, errBlogs], [categoriesWithAvailability]] = await Promise.all([
    hasCategories
      ? handleErrors(
          fetchBlogIndexPageBlogsByCategories(
            selectedCategorySlugs,
            blogStart,
            blogEnd
          )
        )
      : handleErrors(fetchBlogIndexPageBlogs(blogStart, blogEnd)),
    hasCategories
      ? handleErrors(fetchCategoryAvailability(selectedCategorySlugs))
      : handleErrors(
          Promise.resolve(
            (allCategories ?? []).map((c) => ({ ...c, blogCount: 1 }))
          )
        ),
  ]);

  console.log("categoriesWithAvailability", categoriesWithAvailability);

  if (errBlogs || !blogs) {
    return (
      <main className="container mx-auto my-16 px-4 md:px-6">
        <BlogHeader
          description={indexPageData.description}
          title={indexPageData.title}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        </div>
        {indexPageData.pageBuilder && indexPageData.pageBuilder.length > 0 && (
          <PageBuilder
            id={indexPageData._id}
            pageBuilder={indexPageData.pageBuilder}
            type={indexPageData._type}
          />
        )}
      </main>
    );
  }

  const categoriesForFilter: CategoryWithAvailability[] =
    categoriesWithAvailability ?? [];

  return (
    <BlogPageContent
      blogs={isPageOutOfRange ? [] : blogs}
      categories={categoriesForFilter}
      hasActiveCategories={hasCategories}
      indexPageData={indexPageData}
      isPageOutOfRange={isPageOutOfRange}
      paginationMetadata={paginationMetadata}
      selectedCategorySlugs={selectedCategorySlugs}
    />
  );
}
