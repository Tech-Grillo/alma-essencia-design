// Avaliações. SÓ no servidor. Só aceita avaliação de produto que está num pedido pago.
import type { ReviewableItem } from "@/lib/reviews/types";
import { CheckoutError } from "./orders";
import { supabaseAdmin } from "./supabase-admin";

const UUID_RE = /^[0-9a-f-]{36}$/i;

type OrderItem = { slug: string; name: string };

async function paidOrder(orderId: string) {
  if (!UUID_RE.test(orderId)) return null;
  const { data } = await supabaseAdmin()
    .from("orders")
    .select("id, status, customer_name, items")
    .eq("id", orderId)
    .maybeSingle();
  if (!data || data.status !== "paid") return null;
  return data as { id: string; status: string; customer_name: string; items: OrderItem[] };
}

/** "Maria da Silva" -> "Maria S." */
function publicName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? "Cliente";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

export async function getReviewableItems(orderId: string): Promise<ReviewableItem[] | null> {
  const order = await paidOrder(orderId);
  if (!order) return null;

  const { data: reviews } = await supabaseAdmin()
    .from("product_reviews")
    .select("product_slug, rating, comment")
    .eq("order_id", order.id);

  const seen = new Set<string>();
  return order.items
    .filter((item) => (seen.has(item.slug) ? false : (seen.add(item.slug), true)))
    .map((item) => {
      const review = reviews?.find((r) => r.product_slug === item.slug);
      return {
        slug: item.slug,
        name: item.name,
        review: review ? { rating: review.rating, comment: review.comment } : null,
      };
    });
}

export async function createReview(orderId: string, slug: string, rating: number, comment: string) {
  const stars = Number(rating);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new CheckoutError("Escolha de 1 a 5 estrelas.");
  const text = (comment ?? "").trim();
  if (text.length > 600) throw new CheckoutError("O comentário pode ter até 600 caracteres.");

  const order = await paidOrder(orderId);
  if (!order) throw new CheckoutError("Só é possível avaliar pedidos pagos.");
  if (!order.items.some((item) => item.slug === slug)) {
    throw new CheckoutError("Esse produto não está neste pedido.");
  }

  const { error } = await supabaseAdmin().from("product_reviews").insert({
    order_id: order.id,
    product_slug: slug,
    rating: stars,
    comment: text || null,
    author_name: publicName(order.customer_name),
  });
  if (error?.code === "23505") throw new CheckoutError("Você já avaliou este produto.");
  if (error) throw new Error(`Erro ao salvar avaliação: ${error.message}`);
}
