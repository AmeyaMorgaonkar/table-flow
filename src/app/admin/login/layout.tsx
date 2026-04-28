import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — TableFlow Admin",
  description: "Sign in to manage your restaurant on TableFlow.",
};

/**
 * Login layout — minimal centered layout without admin nav.
 * This is separate from the main admin layout because the login page
 * should not show admin navigation or require authentication.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
