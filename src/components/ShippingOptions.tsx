import * as Icons from "lucide-react";
import { formatDays, type ShippingOption } from "@/lib/shipping";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Lista de fretes. Com onSelect vira escolha (checkout); sem, é só informativa (carrinho). */
export function ShippingOptions({
  options,
  selected,
  onSelect,
}: {
  options: ShippingOption[];
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <ul className="space-y-2" role={onSelect ? "radiogroup" : undefined} aria-label="Opções de frete">
      {options.map((o) => {
        const active = selected === o.id;
        const content = (
          <>
            {onSelect && (
              <span
                className={`h-5 w-5 flex-shrink-0 rounded-full border-2 ${
                  active ? "border-caramel bg-caramel shadow-[inset_0_0_0_3px_var(--color-card)]" : "border-border"
                }`}
              />
            )}
            <Icons.Truck className="h-5 w-5 flex-shrink-0 text-caramel-deep dark:text-caramel" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug">
                {o.carrier} <span className="font-normal text-foreground/75">{o.service}</span>
              </span>
              {o.days && <span className="block text-sm text-foreground/70">{formatDays(o.days)}</span>}
            </span>
            <span className="whitespace-nowrap font-bold tabular-nums">{brl(o.price)}</span>
          </>
        );
        return (
          <li key={o.id}>
            {onSelect ? (
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(o.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-base transition ${
                  active ? "border-caramel bg-caramel/5" : "border-border hover:bg-secondary/40"
                }`}
              >
                {content}
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-background/70 px-3 py-2.5 text-base">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
