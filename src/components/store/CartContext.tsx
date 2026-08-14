"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  cartCount,
  cartSubtotal,
  clampQty,
  getProduct,
  type CartItem,
} from "./cartMath";

export type { CartItem } from "./cartMath";

const EMPTY_CART: CartItem[] = [];

interface CartStore {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

function parseItems(raw: string | null): CartItem[] {
  if (!raw) {
    return EMPTY_CART;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return EMPTY_CART;
    }
    const items: CartItem[] = [];
    for (const entry of parsed as Array<{ productId?: unknown; qty?: unknown }>) {
      if (
        entry &&
        typeof entry.productId === "string" &&
        typeof entry.qty === "number" &&
        entry.qty > 0 &&
        getProduct(entry.productId) !== undefined
      ) {
        items.push({ productId: entry.productId, qty: clampQty(entry.qty) });
      }
    }
    return items;
  } catch {
    return EMPTY_CART;
  }
}

function createCartStore(storageKey: string): CartStore {
  const listeners = new Set<() => void>();
  let items: CartItem[] | null = null;

  const readStorage = (): string | null => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const getSnapshot = (): CartItem[] => {
    if (items === null) {
      items = parseItems(readStorage());
    }
    return items;
  };

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const commit = (next: CartItem[]) => {
    items = next;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage unavailable: the cart still works in memory for this tab.
    }
    notify();
  };

  const subscribe = (callback: () => void) => {
    listeners.add(callback);
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) {
        items = parseItems(event.key === null ? readStorage() : event.newValue);
        notify();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(callback);
      window.removeEventListener("storage", onStorage);
    };
  };

  const remove = (productId: string) => {
    commit(getSnapshot().filter((item) => item.productId !== productId));
  };

  return {
    subscribe,
    getSnapshot,
    add: (productId, qty = 1) => {
      const current = getSnapshot();
      const existing = current.find((item) => item.productId === productId);
      const next = existing
        ? current.map((item) =>
            item.productId === productId
              ? { ...item, qty: clampQty(item.qty + qty) }
              : item,
          )
        : [...current, { productId, qty: clampQty(qty) }];
      commit(next);
    },
    remove,
    setQty: (productId, qty) => {
      if (qty <= 0) {
        remove(productId);
        return;
      }
      commit(
        getSnapshot().map((item) =>
          item.productId === productId
            ? { ...item, qty: clampQty(qty) }
            : item,
        ),
      );
    },
    clear: () => {
      commit(EMPTY_CART);
    },
  };
}

const CartStoreContext = createContext<CartStore | null>(null);

export interface CartProviderProps {
  storageKey: string;
  children: ReactNode;
}

export function CartProvider({ storageKey, children }: CartProviderProps) {
  const [store] = useState(() => createCartStore(storageKey));
  return (
    <CartStoreContext.Provider value={store}>
      {children}
    </CartStoreContext.Provider>
  );
}

export interface Cart {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

function getEmptySnapshot(): CartItem[] {
  return EMPTY_CART;
}

function noopSubscribe(): () => void {
  return () => {};
}

export function useCart(): Cart {
  const store = useContext(CartStoreContext);
  const items = useSyncExternalStore(
    store ? store.subscribe : noopSubscribe,
    store ? store.getSnapshot : getEmptySnapshot,
    getEmptySnapshot,
  );
  if (!store) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return {
    items,
    add: store.add,
    remove: store.remove,
    setQty: store.setQty,
    clear: store.clear,
    count: cartCount(items),
    subtotal: cartSubtotal(items),
  };
}
