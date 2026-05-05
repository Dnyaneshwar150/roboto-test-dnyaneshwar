import type { PokemonIndexEntry } from "@/utils/pokemon-cache";
import {
  POKEMON_DETAIL_API,
  POKEMON_LIST_API,
} from "@/utils/constant";

type PokemonListResponse = {
  results: Array<{ name: string; url: string }>;
};
export async function fetchPokemonIndex(): Promise<PokemonIndexEntry[]> {
  const response = await fetch(POKEMON_LIST_API);

  if (!response.ok) {
    throw new Error(`Failed to fetch Pokémon list: ${response.statusText}`);
  }

  const json: PokemonListResponse = await response.json();

  return json.results.map((entry) => {
    const segments = entry.url.replace(/\/$/, "").split("/");
    const id = Number(segments[segments.length - 1]);

    return {
      id,
      name: entry.name,
      url: entry.url,
    };
  });
}

export type PokemonDetailResponse = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
};

export async function fetchPokemonDetails(
  name: string
): Promise<PokemonDetailResponse> {
  const response = await fetch(`${POKEMON_DETAIL_API}/${name}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Pokémon details for "${name}": ${response.statusText}`
    );
  }

  return response.json();
}
