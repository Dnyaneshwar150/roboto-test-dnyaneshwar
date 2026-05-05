import { TYPE_COLORS } from "@/utils/constant";

export function TypeBadge({ type }: { type: string }) {
  const bg = TYPE_COLORS[type] ?? "#888";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 8px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#fff",
        backgroundColor: bg,
        textTransform: "capitalize",
        lineHeight: "18px",
      }}
    >
      {type}
    </span>
  );
}