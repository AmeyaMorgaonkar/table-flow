import { notFound } from "next/navigation";
import { getRestaurantBySlug, getMenuByRestaurantId } from "@/lib/services/menu-service";
import type { Metadata } from "next";

/**
 * /[slug]/menu — Public menu browsing (no table, no session).
 * Anyone can view the menu without scanning a QR code or entering OTP.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return { title: "Menu — TableFlow" };
  }

  return {
    title: `${restaurant.name} Menu — TableFlow`,
    description: `Browse ${restaurant.name}'s menu on TableFlow.`,
  };
}

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const menu = await getMenuByRestaurantId(restaurant.id);
  const brandColor = restaurant.brand_color || "#6366f1";
  const currency = restaurant.currency || "INR";

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  return (
    <div className="menu-page" style={{ "--brand-color": brandColor } as React.CSSProperties}>
      {/* Header */}
      <header className="menu-header">
        <div className="menu-header-inner">
          <div className="menu-header-left">
            {restaurant.logo_url && (
              <img
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                className="menu-logo"
              />
            )}
            <div>
              <h1 className="menu-restaurant-name">{restaurant.name}</h1>
              <p className="menu-table-label">Menu</p>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <main className="menu-content" style={{ paddingTop: "80px" }}>
        {menu.length === 0 ? (
          <div className="menu-empty">
            <h2>Menu coming soon</h2>
            <p>This restaurant hasn&apos;t added their menu yet.</p>
          </div>
        ) : (
          menu.map((category) => (
            <section key={category.id} className="menu-section">
              <h2 className="menu-section-title">{category.name}</h2>
              <div className="menu-grid">
                {category.items
                  .filter((item) => item.is_available)
                  .map((item) => (
                    <div key={item.id} className="menu-card">
                      {item.image_url && (
                        <div className="menu-card-image">
                          <img src={item.image_url} alt={item.name} loading="lazy" />
                        </div>
                      )}
                      <div className="menu-card-body">
                        <div className="menu-card-info">
                          <h3 className="menu-card-name">{item.name}</h3>
                          {item.description && (
                            <p className="menu-card-desc">{item.description}</p>
                          )}
                        </div>
                        <div className="menu-card-footer">
                          <span className="menu-card-price">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
