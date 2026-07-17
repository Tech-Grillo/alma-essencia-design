import { categoryGroups, topLevelCategories } from "@/lib/products";
import { getAllProducts, getAllCategories } from "@/lib/products-supabase";
import type { Product } from "@/lib/products-supabase";
import { useEffect, useState } from "react";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function levenshteinDistance(left: string, right: string) {
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[left.length][right.length];
}

function matchesCategorySearch(category: string, query: string) {
  if (!query.trim()) return false;
  const normalizedCategory = normalizeText(category);
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return false;
  if (normalizedCategory.includes(normalizedQuery)) return true;
  if (normalizedQuery.length >= 3) {
    return levenshteinDistance(normalizedCategory, normalizedQuery) <= 2;
  }
  return false;
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [suggestionOptions, setSuggestionOptions] = useState<string[]>([]);

  const handleSearchInput = (value: string) => {
    if (!value) {
      setSearchQuery("");
      return;
    }
    const cleaned = value.trim();
    const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    setSearchQuery(formatted);
  };

  useEffect(() => {
    getAllProducts().then((products: Product[]) => {
      const categoriesFromProducts = Array.from(
        new Set([...getAllCategories(), ...products.map((p) => p.category)]),
      ).sort();
      setAllCategories(categoriesFromProducts);
    });
  }, []);

  useEffect(() => {
    const options = Array.from(
      new Set([...topLevelCategories, ...allCategories, ...categoryGroups.flatMap((group) => group.children)]),
    )
      .filter((option) => matchesCategorySearch(option, searchQuery))
      .sort();
    setSuggestionOptions(options);
  }, [searchQuery, allCategories]);

  return (
    <div className="w-full max-w-2xl">
      <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Buscar categoria
      </label>
      <div className="relative">
        <input
          value={searchQuery}
          onChange={(event) => handleSearchInput(event.target.value)}
          placeholder="Ex: Hidratante"
          className="w-full rounded-full border border-border bg-background/90 px-5 py-3 text-base shadow-sm outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
        />
        {searchQuery && suggestionOptions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur">
            {suggestionOptions.map((option) => (
              <a
                key={option}
                href={`/produtos?categoria=${encodeURIComponent(option)}`}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-rose/10"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/produtos?categoria=${encodeURIComponent(option)}`;
                }}
              >
                <span>{option}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ir</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}