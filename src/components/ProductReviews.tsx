import * as Icons from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type Product } from "@/lib/products";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const initialReviews: Review[] = [
  {
    id: "sample-1",
    name: "Cliente Alma",
    rating: 5,
    comment: "Produto muito cheiroso, bem embalado e com acabamento lindo.",
    createdAt: "2026-06-01T12:00:00.000Z",
  },
];

function getStorageKey(productSlug: string) {
  return `alma-essencia-reviews:${productSlug}`;
}

function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const iconSize = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const active = rating <= value;
        const Icon = Icons.Star;

        if (!onChange) {
          return (
            <Icon
              key={rating}
              className={`${iconSize} ${active ? "fill-caramel text-caramel" : "text-muted-foreground/40"}`}
            />
          );
        }

        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="rounded-full p-1 text-caramel hover:bg-rose/40"
            aria-label={`Dar ${rating} estrela${rating > 1 ? "s" : ""}`}
          >
            <Icon className={`${iconSize} ${active ? "fill-caramel" : "text-muted-foreground/45"}`} />
          </button>
        );
      })}
    </div>
  );
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ProductReviews({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("reviews");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedReviews = window.localStorage.getItem(getStorageKey(product.slug));
    if (!savedReviews) return;

    try {
      setReviews(JSON.parse(savedReviews) as Review[]);
    } catch {
      setReviews(initialReviews);
    }
  }, [product.slug]);

  useEffect(() => {
    window.localStorage.setItem(getStorageKey(product.slug), JSON.stringify(reviews));
  }, [product.slug, reviews]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;

    return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  }, [reviews]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!name.trim() || !comment.trim()) {
      setMessage("Preencha seu nome e escreva sua avaliacao.");
      return;
    }

    const review: Review = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    setReviews((current) => [review, ...current]);
    setName("");
    setRating(5);
    setComment("");
    setMessage("Avaliacao enviada. Obrigado pelo carinho!");
  };

  return (
    <section className="mt-20 rounded-[2rem] border border-border bg-card shadow-soft overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border px-6 py-5 lg:px-8">
        <div className="inline-flex rounded-full bg-secondary p-1 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`rounded-full px-5 py-2 text-sm transition-all ${
              activeTab === "details" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            Detalhes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`rounded-full px-5 py-2 text-sm transition-all ${
              activeTab === "reviews" ? "bg-background text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            Avaliacoes
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Stars value={Math.round(average)} size="sm" />
          <span className="text-sm text-muted-foreground">
            {average.toFixed(1).replace(".", ",")} de 5 ({reviews.length} avaliacoes)
          </span>
        </div>
      </div>

      {activeTab === "details" ? (
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 p-6 lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-caramel-deep mb-3">{product.category}</p>
            <h2 className="font-serif text-3xl mb-4">Sobre o produto</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>
          </div>

          <div className="rounded-[1.5rem] bg-secondary/45 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-foreground/70 mb-3">Aromas disponiveis</p>
            <div className="flex flex-wrap gap-2">
              {product.scents.map((scent) => (
                <span key={scent} className="rounded-full bg-background px-4 py-2 text-sm">
                  {scent}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="rounded-[1.5rem] bg-secondary/45 p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-caramel-deep mb-2">Sua avaliacao</p>
              <h2 className="font-serif text-3xl">Conte como foi sua experiencia</h2>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">Estrelas</label>
              <Stars value={rating} onChange={setRating} size="lg" />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">Nome</label>
              <div className="relative">
                <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-full bg-background border border-border pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">Descricao</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="O que voce achou do produto?"
                rows={5}
                className="w-full resize-none rounded-[1.25rem] bg-background border border-border px-4 py-3.5 text-sm focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
              />
            </div>

            {message && <p className="text-sm text-caramel-deep">{message}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-caramel text-primary-foreground py-4 text-sm uppercase tracking-[0.2em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Enviar avaliacao
            </button>
          </form>

          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-[1.5rem] border border-border bg-background p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-serif text-2xl">{review.name}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                  <Stars value={review.rating} size="sm" />
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
