import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts, getAllCategories, type Product } from "@/lib/products-supabase";
import { categoryGroups, topLevelCategories } from "@/lib/products";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/produtos/")({
  component: ProductsList,
  head: () => ({ meta: [
    { title: "Produtos — Alma e Essência" },
    { name: "description", content: "Velas, sabonetes, home sprays e difusores artesanais." },
  ]}),
});

function ProductsList() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("Todos");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeText = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  const levenshteinDistance = (left: string, right: string) => {
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
  };

  const matchesCategorySearch = (category: string, query: string) => {
    if (!query.trim()) return false;

    const normalizedCategory = normalizeText(category);
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return false;

    if (normalizedCategory.includes(normalizedQuery)) return true;
    if (normalizedQuery.length >= 3) {
      return levenshteinDistance(normalizedCategory, normalizedQuery) <= 2;
    }

    return false;
  };

  const suggestionOptions = Array.from(
    new Set([...topLevelCategories, ...allCategories, ...categoryGroups.flatMap((group) => group.children)]),
  )
    .filter((option) => matchesCategorySearch(option, searchQuery))
    .sort();

  const handleSearchInput = (value: string) => {
    if (!value) {
      setSearchQuery("");
      return;
    }

    const cleaned = value.trim();
    const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    setSearchQuery(formatted);
  };

  const matchesCategory = (productCategory: string, selectedFilter: string) => {
    if (selectedFilter === "Todos") return true;

    const group = categoryGroups.find((item) => item.parent === selectedFilter);
    if (group) {
      return productCategory === selectedFilter || group.children.includes(productCategory);
    }

    return productCategory === selectedFilter;
  };

  const list = filter === "Todos" ? allProducts : allProducts.filter((p) => matchesCategory(p.category, filter));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const category = new URLSearchParams(window.location.search).get("categoria") || "Todos";
    const matchingGroup = categoryGroups.find((group) => group.children.includes(category));
    setFilter(category);
    setExpandedGroup(matchingGroup?.parent ?? (topLevelCategories.includes(category) ? category : null));

    const onPopState = () => {
      const nextCategory = new URLSearchParams(window.location.search).get("categoria") || "Todos";
      const nextGroup = categoryGroups.find((group) => group.children.includes(nextCategory));
      setFilter(nextCategory);
      setExpandedGroup(nextGroup?.parent ?? (topLevelCategories.includes(nextCategory) ? nextCategory : null));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let mounted = true;

    getAllProducts()
      .then((products) => {
        if (!mounted) return;
        setAllProducts(products);
        const categoriesFromProducts = Array.from(
          new Set([...getAllCategories(), ...products.map((product) => product.category)]),
        ).sort();
        setAllCategories(categoriesFromProducts);
      })
      .catch(() => {
        if (!mounted) return;
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-10 sm:pt-12 pb-16 sm:pb-20 animate-fade-in-up">
        <div className="text-center mb-10 sm:mb-12">
          <p className="font-script text-2xl sm:text-3xl text-caramel-deep">— Coleção</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl">Nossos produtos</h1>
          <div className="botanical-divider mt-5"><span>❀</span></div>
        </div>
        <div className="flex flex-col items-center gap-4 mb-10 sm:mb-12">
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
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSearchQuery(option);
                        setFilter(option);
                        setExpandedGroup(categoryGroups.find((group) => group.parent === option || group.children.includes(option))?.parent ?? null);
                        window.history.replaceState(null, "", `/produtos?categoria=${encodeURIComponent(option)}`);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-rose/10"
                    >
                      <span>{option}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ir</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setFilter("Todos");
                setExpandedGroup(null);
                window.history.replaceState(null, "", "/produtos");
              }}
              className={`rounded-full px-5 py-2 text-base font-medium transition-all duration-300 ease-out transform ${
                filter === "Todos"
                  ? "bg-rose text-foreground shadow-soft scale-[1.03] ring-2 ring-rose/50"
                  : "bg-secondary/60 hover:bg-rose/40 hover:scale-[1.01]"
              }`}
            >
              Todos
            </button>

            {topLevelCategories.map((category) => {
              const children = categoryGroups.find((group) => group.parent === category)?.children ?? [];
              const isExpanded = expandedGroup === category || filter === category;

              return (
                <div key={category} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => {
                      if (filter === category && expandedGroup === category) {
                        setFilter("Todos");
                        setExpandedGroup(null);
                        window.history.replaceState(null, "", "/produtos");
                      } else {
                        setFilter(category);
                        setExpandedGroup(category);
                        window.history.replaceState(null, "", `/produtos?categoria=${encodeURIComponent(category)}`);
                      }
                    }}
                    className={`rounded-full px-5 py-2 text-base font-medium transition-all duration-300 ease-out transform ${
                      filter === category
                        ? "bg-rose text-foreground shadow-soft scale-[1.03] ring-2 ring-rose/50"
                        : "bg-secondary/60 hover:bg-rose/40 hover:scale-[1.01]"
                    }`}
                  >
                    {category}
                  </button>

                  {isExpanded && children.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {children.map((child) => (
                        <button
                          key={child}
                          onClick={() => {
                            setFilter(child);
                            setExpandedGroup(category);
                            window.history.replaceState(null, "", `/produtos?categoria=${encodeURIComponent(child)}`);
                          }}
                          className={`rounded-full px-3.5 py-1.75 text-sm font-medium transition-all duration-300 ease-out transform ${
                            filter === child
                              ? "bg-chocolate text-cream shadow-soft scale-[1.02] ring-2 ring-chocolate/40"
                              : "bg-white/80 hover:bg-rose/20 hover:scale-[1.01]"
                          }`}
                        >
                          {child}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {list.map((p) => <ProductCard key={p.slug} product={p} />)}
          {list.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-20">Em breve novidades nesta categoria ✿</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
