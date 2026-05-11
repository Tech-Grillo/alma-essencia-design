import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/lib/products";
import { useState } from "react";

export const Route = createFileRoute("/produtos/")({
  component: ProductsList,
  head: () => ({ meta: [
    { title: "Produtos — Alma e Essência" },
    { name: "description", content: "Velas, sabonetes, home sprays e difusores artesanais." },
  ]}),
});

function ProductsList() {
  const [filter, setFilter] = useState<string>("Todos");
  const list = filter === "Todos" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-12 pb-20">
        <div className="text-center mb-12">
          <p className="font-script text-3xl text-caramel-deep">— Coleção</p>
          <h1 className="font-serif text-5xl md:text-6xl">Nossos produtos</h1>
          <div className="botanical-divider mt-5"><span>❀</span></div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["Todos", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
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
