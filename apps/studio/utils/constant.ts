import {
  BlockElementIcon,
  ComposeIcon,
  InlineElementIcon,
  InsertAboveIcon,
  SearchIcon,
} from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";

export const GROUP = {
  SEO: "seo",
  MAIN_CONTENT: "main-content",
  CARD: "card",
  RELATED: "related",
  OG: "og",
};

export const GROUPS: FieldGroupDefinition[] = [
  // { name: CONST.MAIN_CONTENT, default: true },
  {
    name: GROUP.MAIN_CONTENT,
    icon: ComposeIcon,
    title: "Content",
    default: true,
  },
  { name: GROUP.SEO, icon: SearchIcon, title: "SEO" },
  {
    name: GROUP.OG,
    icon: InsertAboveIcon,
    title: "Open Graph",
  },
  {
    name: GROUP.CARD,
    icon: BlockElementIcon,
    title: "Card",
  },
  {
    name: GROUP.RELATED,
    icon: InlineElementIcon,
    title: "Related",
  },
];

export const API_VERSION =
  process.env.SANITY_STUDIO_API_VERSION ?? "2025-05-08";

// Pokemon Constants
export const POKEMON_LIST_API = "https://pokeapi.co/api/v2/pokemon?limit=500";
export const POKEMON_DETAIL_API = "https://pokeapi.co/api/v2/pokemon";
export const POKEMON_CACHE_KEY = "pokemon-index-cache";
export const POKEMON_CACHE_TTL = 24 * 60 * 60 * 1000;
export const POKEMON_SEARCH_DEBOUNCE = 300;
export const POKEMON_MAX_RESULTS = 20;


export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};
