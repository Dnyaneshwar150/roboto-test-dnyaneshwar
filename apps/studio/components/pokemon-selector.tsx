import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@sanity/ui";
import { useCallback, useEffect, useState } from "react";
import { set, type ObjectInputProps, unset } from "sanity";

import {
  type PokemonIndexEntry,
  getCachedPokemonIndex,
  setCachedPokemonIndex,
} from "@/utils/pokemon-cache";
import { POKEMON_MAX_RESULTS, POKEMON_SEARCH_DEBOUNCE } from "@/utils/constant";
import { fetchPokemonDetails, fetchPokemonIndex } from "@/utils/pokemon-fetch";
import { normalizePokemon } from "@/utils/helper";
import type { NormalizedPokemon } from "@/utils/types";

import { Autocomplete } from "./autocomplete";
import { TypeBadge } from "./badge";



export function PokemonSelector(props: ObjectInputProps) {
  const { onChange, value } = props;
  const currentValue = value as NormalizedPokemon | undefined;

  const [index, setIndex] = useState<PokemonIndexEntry[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadIndex() {
      const cached = getCachedPokemonIndex();
      if (cached) {
        setIndex(cached);
        return;
      }

      setIsLoadingIndex(true);
      setError(null);
      try {
        const data = await fetchPokemonIndex();
        if (!cancelled) {
          setCachedPokemonIndex(data);
          setIndex(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load Pokémon data"
          );
        }
      } finally {
        if (!cancelled) setIsLoadingIndex(false);
      }
    }

    loadIndex();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = useCallback(
    async (entry: PokemonIndexEntry) => {
      setIsLoadingDetail(true);
      setError(null);

      try {
        const raw = await fetchPokemonDetails(entry.name);
        const normalized = normalizePokemon(raw);

        onChange(
          set({
            _type: "pokemon",
            id: normalized.id,
            name: normalized.name,
            sprite: normalized.sprite,
            artwork: normalized.artwork,
            types: normalized.types,
          })
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to load details for ${entry.name}`
        );
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(unset());
  }, [onChange]);

  if (isLoadingIndex) {
    return (
      <Card padding={4} radius={2} shadow={1}>
        <Flex align="center" gap={3}>
          <Spinner muted />
          <Text muted size={1}>
            Loading Pokémon database…
          </Text>
        </Flex>
      </Card>
    );
  }

  if (error && !currentValue) {
    return (
      <Card padding={4} radius={2} shadow={1} tone="critical">
        <Stack space={3}>
          <Text size={1} weight="semibold">
            ⚠️ {error}
          </Text>
          <Button
            fontSize={1}
            mode="ghost"
            onClick={() => window.location.reload()}
            text="Retry"
            tone="primary"
          />
        </Stack>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      <Autocomplete<PokemonIndexEntry>
        items={index}
        onSelect={handleSelect}
        filterFn={filterPokemon}
        renderItem={(entry) => <PokemonDropdownItem entry={entry} />}
        getKey={(entry) => entry.id}
        placeholder="Search Pokémon by name…"
        debounceMs={POKEMON_SEARCH_DEBOUNCE}
        emptyMessage="No Pokémon found"
        disabled={isLoadingDetail}
      />

      {isLoadingDetail && (
        <Card padding={3} radius={2} shadow={1}>
          <Flex align="center" gap={3}>
            <Spinner muted />
            <Text muted size={1}>
              Fetching Pokémon details…
            </Text>
          </Flex>
        </Card>
      )}

      {currentValue?.name && !isLoadingDetail && (
        <PokemonPreview pokemon={currentValue} onClear={handleClear} />
      )}

      {error && currentValue && (
        <Card padding={3} radius={2} tone="caution">
          <Text muted size={1}>
            ⚠️ {error}
          </Text>
        </Card>
      )}
    </Stack>
  );
}


function filterPokemon(
  index: PokemonIndexEntry[],
  query: string
): PokemonIndexEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const exact: PokemonIndexEntry[] = [];
  const startsWith: PokemonIndexEntry[] = [];
  const includes: PokemonIndexEntry[] = [];

  for (const entry of index) {
    const name = entry.name.toLowerCase();
    if (name === q) {
      exact.push(entry);
    } else if (name.startsWith(q)) {
      startsWith.push(entry);
    } else if (name.includes(q)) {
      includes.push(entry);
    }
  }

  return [...exact, ...startsWith, ...includes].slice(0, POKEMON_MAX_RESULTS);
}

function PokemonDropdownItem({ entry }: { entry: PokemonIndexEntry }) {
  return (
    <>
      <img
        alt={entry.name}
        height={32}
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`}
        style={{ imageRendering: "pixelated", flexShrink: 0 }}
        width={32}
      />
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 500,
          textTransform: "capitalize",
        }}
      >
        {entry.name}
      </span>
      <span
        style={{
          fontSize: 11,
          color: "var(--card-muted-fg-color, #888)",
        }}
      >
        #{String(entry.id).padStart(3, "0")}
      </span>
    </>
  );
}

function PokemonPreview({
  pokemon,
  onClear,
}: {
  pokemon: NormalizedPokemon;
  onClear: () => void;
}) {
  return (
    <Card padding={4} radius={2} shadow={1}>
      <Flex gap={4}>
        <div
          style={{
            width: 120,
            height: 120,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <img
            alt={pokemon.name}
            height={100}
            src={pokemon.artwork || pokemon.sprite}
            style={{ objectFit: "contain" }}
            width={100}
          />
        </div>

        <Stack space={3} style={{ flex: 1 }}>
          <Text size={2} weight="bold" style={{ textTransform: "capitalize" }}>
            {pokemon.name}
          </Text>
          <Text muted size={1}>
            #{String(pokemon.id).padStart(3, "0")}
          </Text>

          {pokemon.types && pokemon.types.length > 0 && (
            <Flex gap={2} wrap="wrap">
              {pokemon.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </Flex>
          )}

          <Box>
            <Button
              fontSize={1}
              mode="ghost"
              onClick={onClear}
              text="Remove"
              tone="critical"
            />
          </Box>
        </Stack>
      </Flex>
    </Card>
  );
}