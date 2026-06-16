import React from "react";
import { Product } from "./products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  size?: string | null;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
  isInCart: (slug: string) => boolean;
};

const CART_KEY = "cart_v1";

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
  const [items, setItems] = React.useState<CartItem[]>(() => load());

  React.useEffect(() => {
    save(items);
  }, [items]);

  const addItem = React.useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.slug === item.slug && p.size === item.size);
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

  const removeItem = React.useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const updateQuantity = React.useCallback((slug: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);

  const getTotal = React.useCallback(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  const getCount = React.useCallback(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const isInCart = React.useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);

  const value: CartContextType = React.useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, getTotal, getCount, isInCart }),
    [items, addItem, removeItem, updateQuantity, clearCart, getTotal, getCount, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function productToCartItem(p: Product, size?: string, quantity = 1): Omit<CartItem, "quantity"> {
  return { slug: p.slug, name: p.name, price: p.price, image: p.image, size: size ?? null };
}

export default CartProvider;
