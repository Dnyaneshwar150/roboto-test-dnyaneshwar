import type { LiteClient } from "algoliasearch/lite";
import { liteClient as algoliasearch } from "algoliasearch/lite";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "";
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? "";

export const searchClient: LiteClient = algoliasearch(appId, searchKey);

export const ALGOLIA_BLOG_INDEX = "blogs";
