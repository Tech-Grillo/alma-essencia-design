import { categoryGroups, topLevelCategories } from "@/lib/products";
import { getAllProducts, getAllCategories } from "@/lib/products-supabase";
import type { Product } from "@/lib/products-supabase";
import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";

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
    const cleaned = value.replace(/\s+/g, " ").trimStart();

    if (!cleaned) {
      setSearchQuery("");
      return;
    }

    const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    setSearchQuery(formatted);
  };

  useEffect(() => {
    getAllProducts().then((products: Product[]) => {
      const categoriesFromProducts = Array.from(
        new Set([...getAllCategories(), ...products.map((p) => p.category)]),
      ).sort();
      setAllCategories(categoriesFromProducts);
    }).catch(error => {
      console.error('Erro ao carregar categorias:', error);
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
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-caramel-deep" />
        <label className="text-sm font-bold uppercase tracking-[0.3em] bg-gradient-caramel bg-clip-text text-transparent">
          Buscar categorias
        </label>
        <Sparkles className="h-5 w-5 text-caramel-deep" />
      </div>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose/20 via-caramel/20 to-rose/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-caramel-deep/60 group-focus-within:text-caramel-deep transition-colors" />
          <input
            value={searchQuery}
            onChange={(event) => handleSearchInput(event.target.value)}
            placeholder="Ex: Hidratante"
            className="w-full rounded-full border-2 border-border bg-background/95 pl-14 pr-6 py-4 text-base shadow-lg outline-none transition-all duration-300 focus:border-rose focus:shadow-bloom focus:scale-[1.02]"
          />
          {searchQuery && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="h-2 w-2 rounded-full bg-rose animate-pulse" />
            </div>
          )}
        </div>
        {searchQuery && suggestionOptions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-3 rounded-2xl border-2 border-border bg-background/98 p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 px-3 py-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Sugestões encontradas
              </p>
            </div>
            {suggestionOptions.map((option) => (
              <a
                key={option}
                href={`/produtos?categoria=${encodeURIComponent(option)}`}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground transition-all duration-200 hover:bg-gradient-to-r hover:from-rose/10 hover:to-caramel/10 hover:translate-x-1"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/produtos?categoria=${encodeURIComponent(option)}`;
                }}
              >
                <span className="font-semibold">{option}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-caramel-deep font-bold">
                  Ir →
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}