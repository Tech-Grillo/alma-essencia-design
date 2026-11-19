import React from "react";
import { Product } from "./products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  size?: string | null;
  /** Aroma escolhido na página do produto. */
  scent?: string | null;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, size?: string | null, scent?: string | null) => void;
  updateQuantity: (slug: string, size: string | null, quantity: number, scent?: string | null) => void;
  clearCart: () => void;
  /** Troca o carrinho inteiro (usado ao atualizar preços pelo catálogo). */
  replaceItems: (items: CartItem[]) => void;
  getTotal: () => number;
  getCount: () => number;
  isInCart: (slug: string, size?: string | null) => boolean;
  /** true depois que o carrinho salvo no navegador foi carregado */
  ready: boolean;
};

const CART_KEY = "cart_v1";

/** Mesmo produto, tamanho e aroma = mesma linha do carrinho. */
function sameLine(item: { slug: string; size?: string | null; scent?: string | null }, slug: string, size?: string | null, scent?: string | null) {
  return item.slug === slug && (item.size ?? null) === (size ?? null) && (item.scent ?? null) === (scent ?? null);
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

function save(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch (e) {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Começa vazio no servidor e no primeiro render do navegador (evita erro de hydration);
  // o carrinho salvo é carregado logo depois de montar.
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setItems(load());
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (ready) save(items);
  }, [items, ready]);

  const addItem = React.useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => sameLine(p, item.slug, item.size, item.scent));
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
          return copy;
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = React.useCallback((slug: string, size?: string | null, scent?: string | null) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, slug, size, scent)));
  }, []);

  const updateQuantity = React.useCallback((slug: string, size: string | null, quantity: number, scent?: string | null) => {
    setItems((prev) =>
      prev
        .map((i) => (sameLine(i, slug, size, scent) ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);
  const replaceItems = React.useCallback((next: CartItem[]) => setItems(next), []);

  const getTotal = React.useCallback(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const getCount = React.useCallback(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const isInCart = React.useCallback(
    (slug: string, size?: string | null) => items.some((i) => i.slug === slug && i.size === (size ?? null)),
    [items]
  );

  const value: CartContextType = React.useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, replaceItems, getTotal, getCount, isInCart, ready }),
    [items, addItem, removeItem, updateQuantity, clearCart, replaceItems, getTotal, getCount, isInCart, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function productToCartItem(p: Product, size?: string, _quantity = 1, scent?: string | null): Omit<CartItem, "quantity"> {
  // find size price if available
  const sizeObj = p.sizes?.find((s: any) => s.label === size);
  const price = sizeObj ? sizeObj.price : p.price;
  return { slug: p.slug, name: p.name, price, image: p.images?.[0] ?? "", size: size ?? null, scent: scent || null };
}

/** "Único" é o tamanho padrão de produto com preço único: não precisa aparecer para o cliente. */
export const isDefaultSize = (size?: string | null) => !size || /^[uú]nico$/i.test(size.trim());

export default CartProvider;
