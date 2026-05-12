import { redirect } from "next/navigation";

/**
 * /[slug]/table/[tableId]/menu — redirects to the table page
 * which already renders the full menu.
 * This route exists as a safety net for old bookmarks/links.
 */
export default async function MenuRedirect({
  params,
}: {
  params: Promise<{ slug: string; tableId: string }>;
}) {
  const { slug, tableId } = await params;
  redirect(`/${slug}/table/${tableId}`);
}
