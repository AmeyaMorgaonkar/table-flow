"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Tables } from "@/types/supabase";
import { getSessionTokenFromCookie } from "@/lib/session-token-client";

type MenuItem = Tables<"menu_items">;

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; menuItem: MenuItem }
  | { type: "REMOVE_ITEM"; menuItemId: string }
  | { type: "UPDATE_QUANTITY"; menuItemId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "TOGGLE_DRAWER" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; items: CartItem[] };

/**
 * Get localStorage key scoped by sessionId.
 */
function getCartStorageKey(sessionId: string): string {
  return `tf_cart_${sessionId}`;
}

/**
 * Save cart state to localStorage, scoped by sessionId.
 */
function saveCartToStorage(sessionId: string, items: CartItem[]): void {
  try {
    const key = getCartStorageKey(sessionId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn("Failed to save cart to localStorage:", err);
  }
}

/**
 * Load cart state from localStorage, scoped by sessionId.
 */
function loadCartFromStorage(sessionId: string): CartItem[] {
  try {
    const key = getCartStorageKey(sessionId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn("Failed to load cart from localStorage:", err);
    return [];
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.menuItem.id === action.menuItem.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.menuItem.id === action.menuItem.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { menuItem: action.menuItem, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.menuItem.id !== action.menuItemId),
      };
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.menuItem.id !== action.menuItemId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItem.id === action.menuItemId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE_DRAWER":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_DRAWER":
      return { ...state, isOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart provider — client-side cart state using React context.
 * Cart persists to localStorage, scoped by sessionId.
 * Different sessions have separate carts and don't interfere with each other.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  // Read sessionId after hydration so the server and client start with the
  // same rendered output. This avoids loading localStorage during render and
  // prevents hydration mismatches.
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Start empty on both server and client, then hydrate from localStorage
  // once the browser session cookie is available.
  const [state, dispatch] = useReducer(
    cartReducer,
    undefined,
    (): CartState => ({
      items: [],
      isOpen: false,
    })
  );

  useEffect(() => {
    setSessionId(getSessionTokenFromCookie()?.sessionId ?? null);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    dispatch({ type: "HYDRATE", items: loadCartFromStorage(sessionId) });
  }, [sessionId]);

  // Save cart to localStorage whenever it changes.
  useEffect(() => {
    if (sessionId) saveCartToStorage(sessionId, state.items);
  }, [state.items, sessionId]);

  const addItem = useCallback(
    (item: MenuItem) => dispatch({ type: "ADD_ITEM", menuItem: item }),
    []
  );
  const removeItem = useCallback(
    (id: string) => dispatch({ type: "REMOVE_ITEM", menuItemId: id }),
    []
  );
  const updateQuantity = useCallback(
    (id: string, qty: number) =>
      dispatch({ type: "UPDATE_QUANTITY", menuItemId: id, quantity: qty }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const toggleDrawer = useCallback(
    () => dispatch({ type: "TOGGLE_DRAWER" }),
    []
  );
  const openDrawer = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(
    () => dispatch({ type: "CLOSE_DRAWER" }),
    []
  );

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleDrawer,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart state and actions.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
