import { createClient } from "@sanity/client";
import { algoliasearch } from "algoliasearch";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(import.meta.dirname, "../.env.local") });

const ALGOLIA_CONTENT_MAX_LENGTH = 3000;
const ALGOLIA_INDEX_NAME = "blogs";

const imageFields = `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  "alt": coalesce(alt, asset->altText, caption, asset->originalFilename, "untitled"),
  hotspot { x, y },
  crop { bottom, left, right, top }
`;

const blogCardQuery = `
  *[_type == "blog" && defined(slug.current) && (seoHideFromLists != true)] | order(orderRank asc) {
    _type,
    _id,
    title,
    description,
    "slug": slug.current,
    orderRank,
    image { ${imageFields} },
    publishedAt,
    authors[0]->{
      _id,
      name,
      position,
      image { ${imageFields} }
    },
    "categories": categories[]->{ _id, title, "slug": slug.current },
    richText[]{
      _type,
      children[]{ _type, text }
    }
  }
`;

type FetchedBlog = {
  _type: string;
  _id: string;
  title: string | null;
  description: string | null;
  slug: string | null;
  orderRank: string | null;
  image: Record<string, unknown> | null;
  publishedAt: string | null;
  authors: Record<string, unknown> | null;
  categories: Array<{ _id: string; title: string; slug: string }> | null;
  richText: Array<{
    _type: string;
    children?: Array<{ _type: string; text?: string }>;
  }> | null;
};

function portableTextToPlain(
  blocks?: FetchedBlog["richText"] | null
): string {
  if (!blocks || !Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .filter((block) => block._type === "block")
    .map((block) =>
      (block.children ?? [])
        .filter((child) => child._type === "span")
        .map((span) => span.text ?? "")
        .join("")
    )
    .join("\n\n");
}

async function main() {
  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-08-29",
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
  });

  const algoliaClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_KEY!
  );

  const blogs = await sanityClient.fetch<FetchedBlog[]>(blogCardQuery);

  const records = blogs
    .filter((blog) => blog.slug)
    .map((blog) => {
      const plainContent = portableTextToPlain(blog.richText);
      const truncatedContent = plainContent.slice(0, ALGOLIA_CONTENT_MAX_LENGTH);
      const categorySlugs = (blog.categories ?? [])
        .map((c) => c.slug)
        .filter(Boolean);

      const { richText: _richText, ...blogFields } = blog;

      return {
        ...blogFields,
        objectID: blog._id,
        content: truncatedContent,
        categorySlugs,
      };
    });

  console.log(`Configuring Algolia index settings...`);

  await algoliaClient.setSettings({
    indexName: ALGOLIA_INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        "title",
        "description",
        "content",
        "categories.title",
      ],
      attributesForFaceting: ["filterOnly(categorySlugs)"],
    },
  });


  await algoliaClient.saveObjects({
    indexName: ALGOLIA_INDEX_NAME,
    objects: records,
  });

}

main().catch((error) => {
  console.error("Failed to index blogs:", error);
  process.exit(1);
});
