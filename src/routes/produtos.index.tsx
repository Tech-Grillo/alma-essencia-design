import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllCategories, getAllProducts } from "@/lib/products";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/produtos/")({
  component: ProductsList,
  head: () => ({ meta: [
    { title: "Produtos — Alma e Essência" },
    { name: "description", content: "Velas, sabonetes, home sprays e difusores artesanais." },
  ]}),
});

function ProductsList() {
  const [allProducts, setAllProducts] = useState(() => getAllProducts());
  const [allCategories, setAllCategories] = useState(() => getAllCategories());
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window === "undefined") return "Todos";
    return new URLSearchParams(window.location.search).get("categoria") || "Todos";
  });
  const list = filter === "Todos" ? allProducts : allProducts.filter((p) => p.category === filter);

  useEffect(() => {
    setAllProducts(getAllProducts());
    setAllCategories(getAllCategories());

    const category = new URLSearchParams(window.location.search).get("categoria");
    if (category) setFilter(category);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-12 pb-20 animate-fade-in-up">
        <div className="text-center mb-12">
          <p className="font-script text-3xl text-caramel-deep">— Coleção</p>
          <h1 className="font-serif text-5xl md:text-6xl">Nossos produtos</h1>
          <div className="botanical-divider mt-5"><span>❀</span></div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["Todos", ...allCategories].map((c) => (
            <button
              key={c}
              onClick={() => {
                setFilter(c);
                const url = c === "Todos" ? "/produtos" : `/produtos?categoria=${encodeURIComponent(c)}`;
                window.history.replaceState(null, "", url);
              }}
              className={`rounded-full px-5 py-2 text-sm transition-all ${
                filter === c ? "bg-rose text-foreground shadow-soft" : "bg-secondary/60 hover:bg-rose/40"
              }`}
            >{c}</button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
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
