type PortableTextSpan = {
  _type: "span";
  text?: string;
};

type PortableTextBlock = {
  _type: string;
  children?: PortableTextSpan[];
};

export function portableTextToPlain(
  blocks?: PortableTextBlock[] | null
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
