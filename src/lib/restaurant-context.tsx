"use client";

import { createContext, useContext } from "react";
import type { Tables } from "@/types/supabase";

type Restaurant = Tables<"restaurants">;

export interface RestaurantContextValue {
  restaurant: Restaurant;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

/**
 * Provider to inject restaurant config (name, logo, brand color)
 * into the component tree for customer-facing pages.
 */
export function RestaurantProvider({
  restaurant,
  children,
}: {
  restaurant: Restaurant;
  children: React.ReactNode;
}) {
  return (
    <RestaurantContext.Provider value={{ restaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

/**
 * Hook to access the current restaurant config.
 * Must be used within a RestaurantProvider.
 */
export function useRestaurant(): RestaurantContextValue {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return ctx;
}
