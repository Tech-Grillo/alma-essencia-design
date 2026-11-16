// Recebe os avisos do Mercado Pago quando um pagamento muda de status.
// O aviso só traz o ID: o status real é sempre consultado na API do Mercado Pago,
// então um aviso falso não consegue marcar um pedido como pago.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/mercadopago/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const body = (await request.json().catch(() => ({}))) as {
          type?: string;
          topic?: string;
          data?: { id?: string | number };
        };
        const type = body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
        const id = body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

        if (type === "payment" && id) {
          try {
            const { mpGetPayment } = await import("@/lib/server/mercadopago");
            const { applyPayment } = await import("@/lib/server/orders");
            await applyPayment(await mpGetPayment(id));
          } catch (error) {
            console.error("Erro no webhook do Mercado Pago:", error);
            return new Response("erro", { status: 500 }); // o Mercado Pago tenta de novo
          }
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
