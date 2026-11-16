// Formulário de avaliação na página do pedido. Só aparece para pedidos pagos.
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Stars } from "@/components/ProductReviews";
import { getOrderReviewItems, submitReview } from "@/lib/reviews/functions";
import type { ReviewableItem } from "@/lib/reviews/types";

export function OrderReviews({ orderId }: { orderId: string }) {
  const [items, setItems] = useState<ReviewableItem[] | null>(null);

  useEffect(() => {
    getOrderReviewItems({ data: { orderId } })
      .then(setItems)
      .catch(() => setItems([]));
  }, [orderId]);

  if (!items || items.length === 0) return null;

  const markReviewed = (slug: string, rating: number, comment: string) =>
    setItems((current) =>
      (current ?? []).map((i) => (i.slug === slug ? { ...i, review: { rating, comment: comment || null } } : i)),
    );

  return (
    <section className="mt-8 rounded-[2rem] border border-border bg-card p-6 text-left shadow-soft sm:p-10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-caramel-deep">Sua opinião</p>
      <h2 className="mb-2 font-serif text-3xl">Avalie sua compra</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Depois de receber, conte o que achou. Sua avaliação aparece na página do produto com seu primeiro nome.
      </p>
      <ul className="space-y-4">
        {items.map((item) => (
          <ReviewItem key={item.slug} orderId={orderId} item={item} onDone={markReviewed} />
        ))}
      </ul>
    </section>
  );
}

function ReviewItem({
  orderId,
  item,
  onDone,
}: {
  orderId: string;
  item: ReviewableItem;
  onDone: (slug: string, rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (item.review) {
    return (
      <li className="rounded-2xl border border-border p-5">
        <p className="mb-2 font-medium">{item.name}</p>
        <div className="flex items-center gap-3">
          <Stars value={item.review.rating} size="sm" />
          <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
            <Icons.Check className="h-4 w-4" /> Obrigado pela avaliação!
          </span>
        </div>
      </li>
    );
  }

  const send = async () => {
    if (!rating) return setError("Escolha de 1 a 5 estrelas.");
    setError("");
    setSending(true);
    const result = await submitReview({ data: { orderId, slug: item.slug, rating, comment } });
    setSending(false);
    if (!result.ok) return setError(result.error);
    onDone(item.slug, rating, comment);
  };

  return (
    <li className="rounded-2xl border border-border p-5">
      <p className="mb-2 font-medium">{item.name}</p>
      <Stars value={rating} onChange={setRating} size="lg" />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 600))}
        rows={3}
        placeholder="Conte como foi sua experiência (opcional)"
        className="mt-3 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
      />
      {error && <p className="mt-2 text-sm text-rose">{error}</p>}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{comment.length}/600</span>
        <button
          onClick={send}
          disabled={sending}
          className="rounded-full bg-caramel px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-caramel/90 disabled:opacity-60"
        >
          {sending ? "Enviando..." : "Enviar avaliação"}
        </button>
      </div>
    </li>
  );
}
