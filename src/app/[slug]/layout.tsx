import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/services/menu-service";
import { RestaurantProvider } from "@/lib/restaurant-context";
import type { Metadata } from "next";

/**
 * Layout for /[slug]/* routes.
 * Fetches restaurant config server-side and injects it via context.
 * Returns 404 if slug doesn't match any restaurant.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return { title: "Restaurant Not Found — TableFlow" };
  }

  return {
    title: `${restaurant.name} — TableFlow`,
    description: `Order from ${restaurant.name} on TableFlow. Browse the menu and place your order.`,
  };
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const brandColor = restaurant.brand_color || "#6366f1";

  return (
    <div
      style={
        {
          "--brand-color": brandColor,
          "--brand-color-light": `${brandColor}20`,
          "--brand-color-hover": `${brandColor}dd`,
        } as React.CSSProperties
      }
    >
      <RestaurantProvider restaurant={restaurant}>
        {children}
      </RestaurantProvider>
    </div>
  );
}
