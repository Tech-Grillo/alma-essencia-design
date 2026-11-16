// Avaliações de produtos. Só quem comprou e pagou pelo site pode avaliar
// (pela página do pedido); aqui elas são exibidas com o selo de compra verificada.
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PublicReview } from "@/lib/reviews/types";

export function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const dim = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const shown = hover || value;
  return (
    <div
      className="flex items-center gap-0.5"
      role={onChange ? "radiogroup" : "img"}
      aria-label={`${value} de 5 estrelas`}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Icons.Star className={`${dim} ${n <= shown ? "fill-caramel text-caramel" : "text-muted-foreground/40"}`} />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            className="rounded-full p-1 transition hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}

export function useProductReviews(slug: string | undefined) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    supabase
      .from("product_reviews")
      .select("id, rating, comment, author_name, created_at")
      .eq("product_slug", slug)
      .eq("visible", true)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!active) return;
        setReviews((data ?? []) as PublicReview[]);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  return { reviews, count, average, loaded };
}

export const formatAverage = (n: number) => n.toFixed(1).replace(".", ",");

export function ProductReviews({ reviews, average }: { reviews: PublicReview[]; average: number }) {
  const count = reviews.length;
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 5);

  return (
    <section id="avaliacoes" className="mt-20 scroll-mt-24 rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-caramel-deep">Avaliações</p>
      <h2 className="mb-8 font-serif text-4xl">O que diz quem comprou</h2>

      {count === 0 ? (
        <div className="rounded-2xl bg-secondary/40 p-6 text-center">
          <Stars value={0} size="lg" />
          <p className="mt-3 text-muted-foreground">
            Este produto ainda não tem avaliações. Quem compra pelo site pode avaliar pela página do pedido.
          </p>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <div>
            <p className="font-serif text-6xl leading-none">{formatAverage(average)}</p>
            <div className="my-3">
              <Stars value={Math.round(average)} />
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              {count} {count === 1 ? "avaliação" : "avaliações"}
            </p>
            <ul className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const total = reviews.filter((r) => r.rating === n).length;
                return (
                  <li key={n} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-muted-foreground">{n}</span>
                    <Icons.Star className="h-3.5 w-3.5 fill-caramel text-caramel" />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span className="block h-full rounded-full bg-caramel" style={{ width: `${(total / count) * 100}%` }} />
                    </span>
                    <span className="w-6 text-right text-muted-foreground">{total}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <ul className="divide-y divide-border">
              {visible.map((r) => (
                <li key={r.id} className="py-5 first:pt-0">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={r.rating} size="sm" />
                    <span className="font-medium">{r.author_name}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                      <Icons.BadgeCheck className="h-3.5 w-3.5" /> Compra verificada
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {r.comment && <p className="leading-relaxed text-muted-foreground">{r.comment}</p>}
                </li>
              ))}
            </ul>
            {count > 5 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-2 rounded-full border border-border px-5 py-2 text-sm font-medium hover:bg-secondary"
              >
                Ver todas as {count} avaliações
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
