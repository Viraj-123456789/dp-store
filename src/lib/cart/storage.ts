import type { CartLine } from "@/types/cart";

const CART_KEY = "dp-cart";
const COUPON_KEY = "dp-coupon";

type Listener = () => void;

/**
 * Tiny localStorage-backed external store, safe to use with useSyncExternalStore.
 * Parsed snapshots are cached by raw string so identical data returns the same reference.
 */
export function createStore<T>(key: string, empty: T, parse: (raw: string) => T) {
  const listeners = new Set<Listener>();
  let cachedRaw: string | null = null;
  let cachedValue: T = empty;

  const readRaw = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const notify = () => listeners.forEach((listener) => listener());

  return {
    empty,
    getSnapshot(): T {
      const raw = readRaw();
      if (raw === cachedRaw) return cachedValue;
      cachedRaw = raw;
      try {
        cachedValue = raw ? parse(raw) : empty;
      } catch {
        cachedValue = empty;
      }
      return cachedValue;
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    write(value: T | null) {
      try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage may be unavailable (private mode); the in-memory snapshot still updates below.
      }
      notify();
    },
  };
}

const EMPTY_LINES: CartLine[] = [];

export const cartStore = createStore<CartLine[]>(CART_KEY, EMPTY_LINES, (raw) => {
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as CartLine[]) : EMPTY_LINES;
});

export const couponStore = createStore<string>(COUPON_KEY, "", (raw) => {
  const parsed: unknown = JSON.parse(raw);
  return typeof parsed === "string" ? parsed : "";
});
