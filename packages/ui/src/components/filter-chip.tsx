import { cn } from "@workspace/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

const filterChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5",
        selected:
          "border-primary bg-primary text-primary-foreground shadow-sm",
        disabled:
          "cursor-not-allowed border-muted bg-muted/50 text-muted-foreground/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type FilterChipProps = Omit<React.ComponentProps<"button">, "type"> &
  VariantProps<typeof filterChipVariants> & {
    /** Whether the chip is in a pressed/selected state */
    pressed?: boolean;
  };

function FilterChip({
  className,
  variant,
  pressed,
  disabled,
  children,
  ...props
}: FilterChipProps) {
  const resolvedVariant = variant ?? (pressed ? "selected" : disabled ? "disabled" : "default");

  return (
    <button
      aria-pressed={pressed}
      className={cn(filterChipVariants({ variant: resolvedVariant }), className)}
      data-slot="filter-chip"
      disabled={disabled}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export { FilterChip, filterChipVariants };
