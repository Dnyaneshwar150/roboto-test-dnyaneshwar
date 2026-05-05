import { type JSX, lazy, Suspense } from "react";
import { defineField, defineType, type ObjectInputProps } from "sanity";

/**
 * Lazy-load the PokemonSelector so the heavy component (with Sanity UI
 * hooks and fetch logic) is NOT evaluated at schema-registration time.
 */
const LazyPokemonSelector = lazy(() =>
  import("@/components/pokemon-selector").then((mod) => ({
    default: mod.PokemonSelector,
  }))
);

function PokemonSelectorWrapper(props: ObjectInputProps): JSX.Element {
  return (
    <Suspense fallback={<div>Loading Pokémon selector…</div>}>
      <LazyPokemonSelector {...props} />
    </Suspense>
  );
}

/**
 * Pokémon object schema — stores normalised data from PokéAPI.
 * Rendered via the custom PokemonSelector input component.
 */
export const pokemon = defineType({
  name: "pokemon",
  title: "Pokémon",
  type: "object",
  components: {
    input: PokemonSelectorWrapper,
  },
  fields: [
    defineField({
      name: "id",
      title: "Pokédex ID",
      type: "number",
      description: "The national Pokédex number",
      readOnly: true,
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "The Pokémon's name",
      readOnly: true,
    }),
    defineField({
      name: "sprite",
      title: "Sprite URL",
      type: "url",
      description: "Small pixel-art sprite for previews",
      readOnly: true,
    }),
    defineField({
      name: "artwork",
      title: "Artwork URL",
      type: "url",
      description: "High-quality official artwork",
      readOnly: true,
    }),
    defineField({
      name: "types",
      title: "Types",
      type: "array",
      description: "Pokémon type(s) — e.g. Fire, Water",
      readOnly: true,
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "id",
    },
    prepare: ({ title, subtitle }) => ({
      title: title
        ? `${title.charAt(0).toUpperCase()}${title.slice(1)}`
        : "No Pokémon selected",
      subtitle: subtitle ? `#${subtitle}` : "",
    }),
  },
});
