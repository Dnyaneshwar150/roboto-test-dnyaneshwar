"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { FilterChip } from "@workspace/ui/components/filter-chip";
import { X } from "lucide-react";

import type { CategoryWithAvailability } from "@/types";

type CategoryFilterBarProps = {
  categories: CategoryWithAvailability[];
  selectedCategories: string[];
  onToggleCategory: (slug: string) => void;
  onClearAll: () => void;
};

export function CategoryFilterBar({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearAll,
}: CategoryFilterBarProps) {
  if (categories.length === 0) {
    return null;
  }

  const isAllSelected = selectedCategories.length === 0;

  return (
    <div
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
      role="group"
    >
      <FilterChip pressed={isAllSelected} onClick={onClearAll}>
        All
      </FilterChip>
      {categories.map((category) => {
        const slug = category.slug;
        if (!slug) {
          return null;
        }
        const isSelected = selectedCategories.includes(slug);
        const isDisabled = !isSelected && category.blogCount === 0;

        return (
          <FilterChip
            disabled={isDisabled}
            key={category._id}
            onClick={() => onToggleCategory(slug)}
            pressed={isSelected}
            title={
              isDisabled
                ? `No blogs match when adding "${category.title}"`
                : undefined
            }
          >
            {category.title}
          </FilterChip>
        );
      })}
    </div>
  );
}

type SelectedFiltersRowProps = {
  categories: CategoryWithAvailability[];
  selectedCategories: string[];
  onRemoveCategory: (slug: string) => void;
  onClearAll: () => void;
};

export function SelectedFiltersRow({
  categories,
  selectedCategories,
  onRemoveCategory,
  onClearAll,
}: SelectedFiltersRowProps) {
  if (selectedCategories.length === 0) {
    return null;
  }

  const selectedCategoryObjects = selectedCategories
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(
      (c): c is CategoryWithAvailability => c !== undefined && c !== null
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">Active filters:</span>
      {selectedCategoryObjects.map((category) => (
        <Badge
          className="gap-1 rounded-full px-3 py-1"
          key={category._id}
          variant="secondary"
        >
          {category.title}
          <button
            aria-label={`Remove ${category.title} filter`}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
            onClick={() => category.slug && onRemoveCategory(category.slug)}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <ClearFiltersButton onClear={onClearAll} />
    </div>
  );
}

type ClearFiltersButtonProps = {
  onClear: () => void;
};

export function ClearFiltersButton({ onClear }: ClearFiltersButtonProps) {
  return (
    <Button
      className="h-auto rounded-full px-3 py-1 text-xs"
      onClick={onClear}
      size="sm"
      variant="ghost"
    >
      Clear all
    </Button>
  );
}
