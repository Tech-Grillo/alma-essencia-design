import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts, getAllCategories, type Product } from "@/lib/products-supabase";
import { categoryGroups, topLevelCategories } from "@/lib/products";
import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";

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
  const [reloadTrigger, setReloadTrigger] = useState(0);

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

    const loadProducts = async () => {
      try {
        // Forçar busca no servidor (ignorar cache)
        const products = await fetch('https://vjznmeoftbgyebhclibb.supabase.co/rest/v1/products?select=*', {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }).then(res => res.json()).then(data => {
          return data.map((p: any) => ({
            ...p,
            purchaseLink: `/produtos/${p.slug}#comprar`
          }));
        });
        
        if (!mounted) return;
        setAllProducts(products);
        const categoriesFromProducts = Array.from(
          new Set([...getAllCategories(), ...products.map((product: any) => product.category)]),
        ).sort();
        setAllCategories(categoriesFromProducts);
      } catch (error) {
        if (!mounted) return;
        console.error('Erro ao carregar produtos:', error);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadProducts();

    // Recarregar quando a página se tornar visível
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };

    // Recarregar periodicamente (a cada 15 segundos)
    const interval = setInterval(() => {
      loadProducts();
    }, 15000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [reloadTrigger]);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 pt-10 sm:pt-12 pb-16 sm:pb-20 animate-fade-in-up">
        <div className="text-center mb-10 sm:mb-12">
          <p className="font-script text-2xl sm:text-3xl text-caramel-deep">— Coleção</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl">Nossos produtos</h1>
          <div className="botanical-divider mt-5"><span>❀</span></div>
        </div>
        <div className="flex flex-col items-center gap-4 mb-10 sm:mb-12">
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
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSearchQuery(option);
                        setFilter(option);
                        setExpandedGroup(categoryGroups.find((group) => group.parent === option || group.children.includes(option))?.parent ?? null);
                        window.history.replaceState(null, "", `/produtos?categoria=${encodeURIComponent(option)}`);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground transition-all duration-200 hover:bg-gradient-to-r hover:from-rose/10 hover:to-caramel/10 hover:translate-x-1"
                    >
                      <span className="font-semibold">{option}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-caramel-deep font-bold">
                        Ir →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

            <div className="flex flex-wrap justify-center gap-3 hide-scrollbar">
             <div className="w-full flex justify-center mb-3">
               <button
                 onClick={() => {
                   setFilter("Todos");
                   setExpandedGroup(null);
                   window.history.replaceState(null, "", "/produtos");
                 }}
                 className={`rounded-full px-8 py-3 text-xl font-bold transition-all duration-300 hover:scale-105 ${
                   filter === "Todos"
                     ? "bg-rose text-foreground shadow-soft ring-2 ring-rose/50 scale-105"
                     : "bg-secondary/60 hover:bg-rose/40"
                 }`}
               >
                 Todos
               </button>
             </div>

             {topLevelCategories.map((category) => {
               const children = categoryGroups.find((group) => group.parent === category)?.children ?? [];
               const isExpanded = expandedGroup === category || filter === category;

               return (
                 <div key={category} className="flex flex-col items-center">
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
                     className={`rounded-full px-8 py-3 text-xl font-bold transition-all duration-300 hover:scale-105 ${
                       filter === category
                         ? "bg-rose text-foreground shadow-soft ring-2 ring-rose/50 scale-105"
                         : "bg-secondary/60 hover:bg-rose/40"
                     }`}
                   >
                     {category}
                   </button>

                   {isExpanded && children.length > 0 && (
                     <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-md animate-slide-down">
                       {children.map((child, index) => (
                         <button
                           key={child}
                           onClick={() => {
                             setFilter(child);
                             setExpandedGroup(category);
                             window.history.replaceState(null, "", `/produtos?categoria=${encodeURIComponent(child)}`);
                           }}
                           className={`w-full rounded-full px-6 py-3 text-lg font-semibold transition-all duration-300 animate-fade-in-up-item ${
                             filter === child
                               ? "bg-chocolate text-cream shadow-soft ring-2 ring-chocolate/40"
                               : "bg-white/80 hover:bg-rose/20"
                           }`}
                           style={{ animationDelay: `${index * 0.05}s` }}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-7">
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
