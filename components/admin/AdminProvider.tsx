"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { AdminIdentity } from "@/lib/admin-auth";
export type InventorySnapshot = {
  productId: string;
  priceKobo: number | null;
  stock: number;
  reserved: number;
  enabled: boolean;
  lowStockThreshold: number;
  version: number;
};
const Context = createContext<{
  actor: AdminIdentity | null;
  inventory: Record<string, InventorySnapshot>;
  publish: (row: InventorySnapshot) => void;
}>({ actor: null, inventory: {}, publish: () => {} });
export function AdminProvider({
  actor,
  children,
}: {
  actor: AdminIdentity | null;
  children: ReactNode;
}) {
  const [inventory, setInventory] = useState<Record<string, InventorySnapshot>>(
    {},
  );
  const channel = useRef<BroadcastChannel>();
  const receive = (row: InventorySnapshot) =>
    setInventory((old) =>
      !old[row.productId] || old[row.productId].version < row.version
        ? { ...old, [row.productId]: row }
        : old,
    );
  const actorId = actor?.id;
  useEffect(() => {
    setInventory({});
    if (!actorId) return;
    const c = new BroadcastChannel(`energy-inventory-${actorId}`);
    channel.current = c;
    c.onmessage = (e) => {
      if (e.data?.productId && Number.isInteger(e.data.version))
        receive(e.data);
    };
    return () => c.close();
  }, [actorId]);
  return (
    <Context.Provider
      value={{
        actor,
        inventory,
        publish: (row) => {
          receive(row);
          channel.current?.postMessage(row);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAdmin = () => useContext(Context);
