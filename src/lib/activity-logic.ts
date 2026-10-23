import { ActivityItem } from "../api/client";

/**
 * Deduplicates activity items by their ID.
 * This is useful for infinite scrolling where items might shift between pages.
 */
export function deduplicateActivityItems(items: ActivityItem[]): ActivityItem[] {
  const seenIds = new Set<string>();
  return items.filter((item) => {
    if (seenIds.has(item.id)) {
      return false;
    }
    seenIds.add(item.id);
    return true;
  });
}
