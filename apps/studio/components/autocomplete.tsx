import { SearchIcon } from "@sanity/icons";
import { Box, Card, Stack, Text, TextInput } from "@sanity/ui";
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type AutocompleteProps<T> = {
  items: T[];
  onSelect: (item: T) => void;
  filterFn: (items: T[], query: string) => T[];
  renderItem: (item: T, isHighlighted: boolean) => ReactNode;
  getKey: (item: T) => string | number;
  placeholder?: string;
  debounceMs?: number;
  maxHeight?: number;
  emptyMessage?: string;
  disabled?: boolean;
};

export function Autocomplete<T>({
  items,
  onSelect,
  filterFn,
  renderItem,
  getKey,
  placeholder = "Search…",
  debounceMs = 300,
  maxHeight = 320,
  emptyMessage = "No results found",
  disabled = false,
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const results = debouncedQuery.trim()
    ? filterFn(items, debouncedQuery)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setQuery(e.currentTarget.value);
      setShowDropdown(true);
      setHighlightedIdx(-1);
    },
    []
  );

  const handleItemSelect = useCallback(
    (item: T) => {
      setShowDropdown(false);
      setQuery("");
      setDebouncedQuery("");
      onSelect(item);
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIdx((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIdx((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
      } else if (e.key === "Enter" && highlightedIdx >= 0) {
        e.preventDefault();
        handleItemSelect(results[highlightedIdx]);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    },
    [showDropdown, results, highlightedIdx, handleItemSelect]
  );

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <TextInput
        disabled={disabled}
        fontSize={1}
        icon={SearchIcon}
        onChange={handleInputChange}
        onFocus={() => {
          if (query.trim()) setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        value={query}
      />

      {showDropdown && debouncedQuery.trim() && (
        <Card
          radius={2}
          shadow={2}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 200,
            maxHeight,
            overflowY: "auto",
            marginTop: 4,
          }}
        >
          {results.length === 0 ? (
            <Box padding={3}>
              <Text muted size={1}>
                {emptyMessage}
              </Text>
            </Box>
          ) : (
            <Stack>
              {results.map((item, idx) => (
                <button
                  key={getKey(item)}
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 12px",
                    border: "none",
                    background:
                      idx === highlightedIdx
                        ? "var(--card-bg2-color, #f3f3f3)"
                        : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    borderBottom:
                      "1px solid var(--card-border-color, #e5e5e5)",
                  }}
                  type="button"
                >
                  {renderItem(item, idx === highlightedIdx)}
                </button>
              ))}
            </Stack>
          )}
        </Card>
      )}
    </div>
  );
}
