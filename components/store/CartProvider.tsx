"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { normalizeCart, type CartLine } from "@/lib/cart";
const KEY = "rahat-energy-cart-v1";
const CartContext = createContext<{
  lines: CartLine[];
  ready: boolean;
  notice: string;
  update: (id: string, quantity: number) => void;
  add: (id: string, quantity: number) => void;
}>({ lines: [], ready: false, notice: "", update: () => {}, add: () => {} });
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      setLines(normalizeCart(JSON.parse(localStorage.getItem(KEY) || "[]")));
    } catch {
      setNotice("Saved cart could not be restored.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(lines));
      } catch {
        setNotice(
          "Browser storage is unavailable. Your cart will last for this visit.",
        );
      }
    }
  }, [lines, ready]);
  function update(id: string, quantity: number) {
    setLines((current) =>
      normalizeCart([
        ...current.map((line) =>
          line.productId === id ? { productId: id, quantity } : line,
        ),
        ...(current.some((line) => line.productId === id)
          ? []
          : [{ productId: id, quantity }]),
      ]),
    );
  }
  function add(id: string, quantity: number) {
    setLines((current) =>
      normalizeCart([...current, { productId: id, quantity }]),
    );
    setNotice("Added to your cart.");
  }
  return (
    <CartContext.Provider value={{ lines, ready, update, add, notice }}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {notice}
      </div>
    </CartContext.Provider>
  );
}
export const useCart = () => useContext(CartContext);
