import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getAllProducts, type Product } from "@/lib/products-supabase";
import { categoryGroups } from "@/lib/products";
import { site, whatsappLink } from "@/config/site";

export const Route = createFileRoute("/produtos/")({
  component: ProductsList,
  head: () => ({
    meta: [
      { title: `Produtos — ${site.name}` },
      { name: "description", content: "Velas, sabonetes, home sprays e difusores artesanais feitos em Niterói." },
    ],
  }),
});

type Sort = "relevancia" | "menor-preco" | "maior-preco" | "novidades";
const SORTS: { id: Sort; label: string }[] = [
  { id: "relevancia", label: "Relevância" },
  { id: "menor-preco", label: "Menor preço" },
  { id: "maior-preco", label: "Maior preço" },
  { id: "novidades", label: "Novidades" },
];

const ALL = "Todos";

/** "Velas de massagem" pertence ao grupo "Velas aromáticas", etc. */
const parentOf = (category: string) => categoryGroups.find((g) => g.children.includes(category))?.parent ?? category;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const lowestPrice = (p: Product) => (p.sizes?.length ? Math.min(...p.sizes.map((s) => s.price)) : p.price);

function readCategoryFromUrl() {
  if (typeof window === "undefined") return ALL;
  return new URLSearchParams(window.location.search).get("categoria") || ALL;
}

function ProductsList() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("relevancia");

  useEffect(() => {
    setCategory(readCategoryFromUrl());
    const onPop = () => setCategory(readCategoryFromUrl());
    window.addEventListener("popstate", onPop);
    getAllProducts()
      .then(setProducts)
      .catch((error) => {
        console.error("Erro ao carregar produtos:", error);
        setProducts([]);
      });
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Só categorias que têm produto, com a quantidade, da maior para a menor.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products ?? []) counts.set(parentOf(p.category), (counts.get(parentOf(p.category)) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
  }, [products]);

  const selectCategory = (value: string) => {
    setCategory(value);
    const url = value === ALL ? "/produtos" : `/produtos?categoria=${encodeURIComponent(value)}`;
    window.history.replaceState(null, "", url);
  };

  const shown = useMemo(() => {
    const words = normalize(search).split(/\s+/).filter(Boolean);
    const list = (products ?? []).filter((p) => {
      if (category !== ALL && parentOf(p.category) !== category && p.category !== category) return false;
      if (!words.length) return true;
      const haystack = normalize([p.name, p.category, p.description, ...(p.scents ?? [])].join(" "));
      return words.every((w) => haystack.includes(w));
    });
    const sorted = [...list];
    if (sort === "menor-preco") sorted.sort((a, b) => lowestPrice(a) - lowestPrice(b));
    if (sort === "maior-preco") sorted.sort((a, b) => lowestPrice(b) - lowestPrice(a));
    if (sort === "novidades") sorted.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    return sorted;
  }, [products, category, search, sort]);

  const filtersActive = category !== ALL || search.trim() !== "";
  const clearFilters = () => {
    setSearch("");
    selectCategory(ALL);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-10">
        {/* Título e busca */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl">Produtos</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Velas, sabonetes, home sprays e difusores feitos à mão em Niterói.
            </p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Icons.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou aroma"
              aria-label="Buscar produtos"
              className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-10 text-sm outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary"
                aria-label="Limpar busca"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categorias: quebra linha no computador, rola para o lado no celular */}
        {categories.length > 1 && (
          <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="flex gap-2 sm:flex-wrap">
              {[ALL, ...categories.map(([name]) => name)].map((name) => {
                const active = category === name;
                return (
                  <button
                    key={name}
                    onClick={() => selectCategory(name)}
                    aria-pressed={active}
                    className={`flex-shrink-0 whitespace-nowrap rounded-full border px-5 py-2.5 text-base font-medium transition ${
                      active
                        ? "border-caramel bg-caramel text-primary-foreground"
                        : "border-caramel/40 bg-background text-foreground hover:border-caramel"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contagem e ordenação */}
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-3">
          <p className="text-sm text-muted-foreground">
            {products ? `${shown.length} ${shown.length === 1 ? "produto" : "produtos"}` : "Carregando..."}
            {filtersActive && products && (
              <button onClick={clearFilters} className="ml-3 text-caramel-deep underline-offset-2 hover:underline">
                Limpar filtros
              </button>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Ordenar produtos"
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-caramel"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Grade: 2 colunas no celular, 3 no tablet, 4 no computador */}
        {!products ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-secondary/70" />
                <div className="mt-3 h-3 w-1/2 rounded bg-secondary/70" />
                <div className="mt-2 h-4 w-3/4 rounded bg-secondary/70" />
                <div className="mt-3 h-9 rounded-full bg-secondary/70" />
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <Icons.SearchX className="mx-auto mb-4 h-10 w-10 text-caramel-deep/50" />
            <p className="font-serif text-2xl">Nenhum produto encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {search ? `Não achamos nada para “${search}”.` : "Ainda não temos produtos nesta categoria."} Procurando algo específico? Fale com a gente.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {filtersActive && (
                <button onClick={clearFilters} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                  Ver todos os produtos
                </button>
              )}
              <a
                href={whatsappLink(search ? `Olá! Vocês têm ${search}?` : "Olá! Gostaria de saber sobre os produtos.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                <WhatsAppIcon className="h-4 w-4" /> Falar no WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
