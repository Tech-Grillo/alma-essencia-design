import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Stars } from "@/components/ProductReviews";
import { Card, EmptyState, Notice } from "./ui";

type AdminReview = {
  id: string;
  created_at: string;
  product_slug: string;
  order_id: string;
  rating: number;
  comment: string | null;
  author_name: string;
  visible: boolean;
};

export function ReviewsTab() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data, error: err }, { data: products }] = await Promise.all([
      supabase.from("product_reviews").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("products").select("slug, name"),
    ]);
    setLoading(false);
    if (err) return setError("Não foi possível carregar as avaliações. Confira se a migration 003_reviews.sql foi aplicada.");
    setError("");
    setReviews((data ?? []) as AdminReview[]);
    setNames(Object.fromEntries((products ?? []).map((p: { slug: string; name: string }) => [p.slug, p.name])));
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (review: AdminReview) => {
    const { error: err } = await supabase.from("product_reviews").update({ visible: !review.visible }).eq("id", review.id);
    if (err) return setError("Não foi possível alterar a avaliação.");
    setReviews((list) => list.map((r) => (r.id === review.id ? { ...r, visible: !r.visible } : r)));
  };

  if (loading && reviews.length === 0) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      {error && <Notice>{error}</Notice>}
      {reviews.length === 0 && !error ? (
        <EmptyState
          icon={<Icons.Star className="h-6 w-6" />}
          title="Nenhuma avaliação ainda"
          text="Depois de entregar um pedido, use “Pedir avaliação” na aba Pedidos para mandar o link ao cliente pelo WhatsApp."
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card className={`p-4 sm:p-5 ${r.visible ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{names[r.product_slug] ?? r.product_slug}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <Stars value={r.rating} size="sm" />
                      <span>{r.author_name}</span>
                      <span>{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
                      <span>pedido #{r.order_id.slice(0, 8)}</span>
                      {!r.visible && <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">Oculta</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    {r.visible ? <Icons.EyeOff className="h-3.5 w-3.5" /> : <Icons.Eye className="h-3.5 w-3.5" />}
                    {r.visible ? "Ocultar do site" : "Mostrar no site"}
                  </button>
                </div>
                {r.comment && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{r.comment}”</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
