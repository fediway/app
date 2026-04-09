import type { MockState } from '../state';
import { taggedStatuses } from '../fixtures';
import { delay, paginateArray } from '../utils';

const HASH_PREFIX_RE = /^#/;

export function createTimelinesHandler(state: MockState) {
  return {
    home: {
      async list(params?: { limit?: number; maxId?: string; sinceId?: string }) {
        await delay();
        return paginateArray(state.timelineStatuses, params);
      },
    },
    tag: {
      $select(tagName: string) {
        return {
          async list() {
            await delay();
            const normalized = tagName.toLowerCase().replace(HASH_PREFIX_RE, '');
            const dedicated = taggedStatuses[normalized] || [];
            const fromTimeline = state.timelineStatuses.filter(status =>
              status.tags.some(tag => tag.name.toLowerCase() === normalized),
            );
            const allResults = [...dedicated, ...fromTimeline];
            const seen = new Set<string>();
            return allResults
              .filter((s) => {
                if (seen.has(s.id))
                  return false;
                seen.add(s.id);
                return true;
              })
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          },
        };
      },
    },
  };
}
