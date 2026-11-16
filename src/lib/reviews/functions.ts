// Server functions de avaliações. O corpo roda só no servidor.
import { createServerFn } from "@tanstack/react-start";
import type { ReviewableItem } from "./types";

type Result = { ok: true } | { ok: false; error: string };

export const getOrderReviewItems = createServerFn({ method: "GET" })
  .inputValidator((data: { orderId: string }) => data)
  .handler(async ({ data }): Promise<ReviewableItem[] | null> => {
    const { getReviewableItems } = await import("@/lib/server/reviews");
    return getReviewableItems(String(data.orderId));
  });

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((data: { orderId: string; slug: string; rating: number; comment: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const { createReview } = await import("@/lib/server/reviews");
    const { CheckoutError } = await import("@/lib/server/orders");
    try {
      await createReview(String(data.orderId), String(data.slug), data.rating, data.comment);
      return { ok: true };
    } catch (error) {
      if (error instanceof CheckoutError) return { ok: false, error: error.message };
      console.error("Erro ao avaliar:", error);
      return { ok: false, error: "Não foi possível enviar sua avaliação agora. Tente de novo." };
    }
  });
