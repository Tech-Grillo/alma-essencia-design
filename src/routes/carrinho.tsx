import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/carrinho")({
  component: RouteComponent,
});

function RouteComponent() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCart();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Carrinho ({getCount()})</h1>

        {items.length === 0 ? (
          <div className="rounded-lg border border-input p-6 text-center">
            <p className="mb-4">Seu carrinho está vazio.</p>
            <Link to="/produtos" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.slug} className="flex items-center gap-4 rounded-lg border p-4">
                  {it.image && <img src={it.image} alt={it.name} className="w-20 h-20 object-cover rounded" />}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{it.name}</div>
                        {it.size && <div className="text-sm text-muted-foreground">Tamanho: {it.size}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">R$ { (it.price * it.quantity).toFixed(2) }</div>
                        <div className="text-sm text-muted-foreground">R$ {it.price.toFixed(2)} cada</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-sm">Quantidade:</label>
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => updateQuantity(it.slug, Number(e.target.value))}
                        className="w-20 rounded border px-2 py-1"
                      />
                      <button onClick={() => removeItem(it.slug)} className="ml-4 text-sm text-destructive">Remover</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-lg font-semibold">R$ {getTotal().toFixed(2)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => clearCart()} className="rounded border px-4 py-2">Limpar</button>
                <button className="rounded bg-primary px-4 py-2 text-primary-foreground">Finalizar compra</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
