const TYPE_COLORS: Record<string, string> = {
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

type PokemonData = {
  id: number | null;
  name: string | null;
  sprite: string | null;
  artwork: string | null;
  types: string[] | null;
};

export function PokemonArtwork({ pokemon }: { pokemon: PokemonData }) {
  const imageSrc = pokemon.artwork || pokemon.sprite;

  if (!imageSrc) return null;

  const primaryType = pokemon.types?.[0] ?? "normal";
  const typeColor = TYPE_COLORS[primaryType] ?? "#888";

  return (
    <div
      className="flex items-center gap-6 rounded-2xl px-6 py-5 mb-6 border"
      style={{
        background: `linear-gradient(135deg, ${typeColor}18 0%, ${typeColor}08 100%)`,
        borderColor: `${typeColor}30`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="flex size-[100px] shrink-0 items-center justify-center">
        <img
          alt={`${pokemon.name} artwork`}
          className="size-[100px] object-contain"
          src={imageSrc}
        />
      </div>

      <div className="flex-1">
        <p className="text-foreground text-lg font-bold capitalize leading-tight">
          {pokemon.name}
        </p>
        <p className="text-muted-foreground mt-0.5 mb-2 text-xs">
          #{String(pokemon.id ?? 0).padStart(3, "0")}
        </p>
        {pokemon.types && pokemon.types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-[1.4] text-white capitalize"
                style={{ backgroundColor: TYPE_COLORS[type] ?? "#888" }}
              >
                {type}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
