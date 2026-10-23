import { deduplicateActivityItems } from '../activity-logic';
import { ActivityItem } from '../../api/client';

describe('activity-logic', () => {
  describe('deduplicateActivityItems', () => {
    it('should remove items with duplicate IDs', () => {
      const items: Partial<ActivityItem>[] = [
        { id: '1', amount: '10' },
        { id: '2', amount: '20' },
        { id: '1', amount: '10' }, // Duplicate
        { id: '3', amount: '30' },
      ];
      const result = deduplicateActivityItems(items as ActivityItem[]);
      expect(result).toHaveLength(3);
      expect(result.map(i => i.id)).toEqual(['1', '2', '3']);
    });

    it('should return empty array for empty input', () => {
      expect(deduplicateActivityItems([])).toEqual([]);
    });

    it('should preserve order of first occurrence', () => {
      const items: Partial<ActivityItem>[] = [
        { id: '2', amount: '20' },
        { id: '1', amount: '10' },
        { id: '2', amount: '20' },
      ];
      const result = deduplicateActivityItems(items as ActivityItem[]);
      expect(result.map(i => i.id)).toEqual(['2', '1']);
    });
  });
});
