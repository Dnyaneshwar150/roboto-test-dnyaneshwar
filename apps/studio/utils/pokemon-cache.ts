import { POKEMON_CACHE_KEY, POKEMON_CACHE_TTL } from "@/utils/constant";

export type PokemonIndexEntry = {
  id: number;
  name: string;
  url: string;
};

type PokemonIndexCache = {
  data: PokemonIndexEntry[];
  timestamp: number;
};


export function isPokemonCacheValid(): boolean {
  try {
    const raw = localStorage.getItem(POKEMON_CACHE_KEY);
    if (!raw) return false;

    const cache: PokemonIndexCache = JSON.parse(raw);
    if (
      !cache ||
      !Array.isArray(cache.data) ||
      typeof cache.timestamp !== "number"
    ) {
      return false;
    }

    return Date.now() - cache.timestamp < POKEMON_CACHE_TTL;
  } catch {
    // Corrupt cache → treat as invalid
    localStorage.removeItem(POKEMON_CACHE_KEY);
    return false;
  }
}


export function getCachedPokemonIndex(): PokemonIndexEntry[] | null {
  if (!isPokemonCacheValid()) return null;

  try {
    const raw = localStorage.getItem(POKEMON_CACHE_KEY);
    if (!raw) return null;

    const cache: PokemonIndexCache = JSON.parse(raw);
    return cache.data;
  } catch {
    localStorage.removeItem(POKEMON_CACHE_KEY);
    return null;
  }
}


export function setCachedPokemonIndex(data: PokemonIndexEntry[]): void {
  try {
    const cache: PokemonIndexCache = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(POKEMON_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or unavailable — silently skip
  }
}
