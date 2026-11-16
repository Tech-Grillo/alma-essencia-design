import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Stars } from "@/components/ProductReviews";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("product_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (err) return setError("Não foi possível carregar as avaliações. Confira se a migration 003_reviews.sql foi aplicada.");
    setError("");
    setReviews((data ?? []) as AdminReview[]);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (review: AdminReview) => {
    const { error: err } = await supabase
      .from("product_reviews")
      .update({ visible: !review.visible })
      .eq("id", review.id);
    if (err) return setError("Não foi possível alterar a avaliação.");
    setReviews((list) => list.map((r) => (r.id === review.id ? { ...r, visible: !r.visible } : r)));
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl">Avaliações</h2>
          <p className="text-sm text-muted-foreground">Ocultar tira a avaliação do site sem apagá-la.</p>
        </div>
        <button onClick={load} className="rounded-full border border-border p-2 hover:bg-secondary" aria-label="Atualizar">
          <Icons.RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="mb-4 rounded-2xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : reviews.length === 0 && !error ? (
        <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className={`rounded-2xl border border-border p-4 ${r.visible ? "" : "opacity-60"}`}>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Stars value={r.rating} size="sm" />
                  <span className="font-medium">{r.author_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.product_slug} · pedido #{r.order_id.slice(0, 8)} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <button
                  onClick={() => toggle(r)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                >
                  {r.visible ? <Icons.EyeOff className="h-3.5 w-3.5" /> : <Icons.Eye className="h-3.5 w-3.5" />}
                  {r.visible ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
