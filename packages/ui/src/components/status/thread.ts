import type { Account, Status } from '@repo/types';

/**
 * A status's position within a thread, as a discriminated union so that
 * invalid combinations (e.g. "connected above AND standalone") cannot be
 * expressed.
 *
 * Geometry contract:
 * - `standalone`              — no rail above, no rail below
 * - `chain-start`             — no rail above, rail below
 * - `chain-middle`            — rail above AND rail below
 * - `chain-end`               — rail above, no rail below
 * - `reply-with-parent-preview` — compact parent-context block rendered above
 *   this status, with a rail running from the parent's avatar down into this
 *   status's avatar. Used by the feed to show conversation context without
 *   navigating to the thread detail page.
 */
export type ThreadPosition
  = | { kind: 'standalone' }
    | { kind: 'chain-start' }
    | { kind: 'chain-middle' }
    | { kind: 'chain-end' }
    | { kind: 'reply-with-parent-preview'; parent: Status };

export function isConnectedAbove(position: ThreadPosition): boolean {
  return (
    position.kind === 'chain-middle'
    || position.kind === 'chain-end'
    || position.kind === 'reply-with-parent-preview'
  );
}

export function isConnectedBelow(position: ThreadPosition): boolean {
  return position.kind === 'chain-start' || position.kind === 'chain-middle';
}

/**
 * One render instruction emitted by `shapeThreadContext()`. Discriminated by
 * `kind` so that consumers exhaustively handle every render variant — adding
 * a new kind in the future surfaces as a TypeScript error at every call site.
 *
 * - `status`    — render with `<Status :thread-position>`
 * - `collapse`  — render with `<ThreadCollapseNode :accounts :hidden-count>`
 * - `tombstone` — render with `<DeletedStatusTombstone :reason>`
 */
export type ShapedThreadItem
  = | {
    kind: 'status';
    status: Status;
    position: ThreadPosition;
    role: 'ancestor' | 'descendant';
    /**
     * True when this status is by the same author as the focused `main` post.
     * Consumers render an "Author" badge so readers can quickly spot which
     * replies in a thread are by the original poster.
     */
    isAuthorReply: boolean;
  }
  | {
    kind: 'collapse';
    /** Stable key for v-for AND for tracking expansion state across re-shapes. */
    key: string;
    /** Up to 3 unique accounts from the hidden statuses, for the avatar stack. */
    accounts: Account[];
    /** Total number of hidden statuses. */
    hiddenCount: number;
    /**
     * IDs of the statuses this collapse node hides — used by consumers
     * to expand inline or navigate.
     */
    hiddenIds: string[];
    position: ThreadPosition;
    role: 'ancestor' | 'descendant';
  }
  | {
    kind: 'tombstone';
    /** Stable key for v-for. */
    key: string;
    /** Why the post is missing. */
    reason: 'deleted' | 'unavailable';
    position: ThreadPosition;
    role: 'ancestor' | 'descendant';
  };

export interface ThreadContext {
  ancestors: Status[];
  main: Status;
  descendants: Status[];
  /**
   * Set of collapse keys that should be expanded inline rather than collapsed.
   * The consumer manages this set as page state — a click on a `ThreadCollapseNode`
   * adds its key, the next shape pass renders the contained statuses individually.
   */
  expandedKeys?: ReadonlySet<string>;
}

/**
 * Tunable thresholds for auto-collapse. Picked from the design discussion:
 * - Ancestors: collapse the middle of chains longer than 6, keeping the root
 *   (so the reader sees where the conversation started) and the last 2
 *   (immediate context for the focused post). Stolen from Gmail's
 *   conversation view.
 * - Descendants: collapse any reply at depth > 3 from `main`. Beyond that,
 *   the reader should drill into the deeper post if they want to follow.
 */
const ANCESTOR_COLLAPSE_THRESHOLD = 6;
const ANCESTOR_TAIL_KEEP = 2;
const DESCENDANT_MAX_DEPTH = 3;

function uniqueAccounts(statuses: Status[]): Account[] {
  const seen = new Set<string>();
  const result: Account[] = [];
  for (const s of statuses) {
    if (!seen.has(s.account.id)) {
      seen.add(s.account.id);
      result.push(s.account);
    }
  }
  return result;
}

/**
 * Stable key for a collapse node. Derived from the FIRST hidden id only —
 * not the full list — so that adding more deeply-nested replies later doesn't
 * invalidate an existing expansion.
 */
function collapseKey(role: 'ancestor' | 'descendant', collapsed: Status[]): string {
  return `collapse-${role}-${collapsed[0]!.id}`;
}

function makeCollapseItem(
  collapsed: Status[],
  position: ThreadPosition,
  role: 'ancestor' | 'descendant',
): ShapedThreadItem {
  return {
    kind: 'collapse',
    key: collapseKey(role, collapsed),
    accounts: uniqueAccounts(collapsed).slice(0, 3),
    hiddenCount: collapsed.length,
    hiddenIds: collapsed.map(s => s.id),
    position,
    role,
  };
}

function shapeAncestors(
  ancestors: Status[],
  main: Status,
  expandedKeys: ReadonlySet<string>,
): ShapedThreadItem[] {
  if (ancestors.length === 0)
    return [];

  const isAuthorReply = (s: Status): boolean => s.account.id === main.account.id;

  const fullChain = (): ShapedThreadItem[] =>
    ancestors.map((status, i): ShapedThreadItem => {
      // First ancestor never has a rail above (nothing precedes it on the page).
      // Every other ancestor — including the last — is `chain-middle` because
      // it still connects down to `main` below.
      const position: ThreadPosition = i === 0
        ? { kind: 'chain-start' }
        : { kind: 'chain-middle' };
      return {
        kind: 'status',
        status,
        position,
        role: 'ancestor',
        isAuthorReply: isAuthorReply(status),
      };
    });

  if (ancestors.length <= ANCESTOR_COLLAPSE_THRESHOLD)
    return fullChain();

  // Collapse middle. Keep first (chain root) + last N (immediate context).
  const collapsed = ancestors.slice(1, -ANCESTOR_TAIL_KEEP);
  const key = collapseKey('ancestor', collapsed);

  // Honor expansion: render every ancestor individually as a continuous chain.
  if (expandedKeys.has(key))
    return fullChain();

  const first = ancestors[0]!;
  const tail = ancestors.slice(-ANCESTOR_TAIL_KEEP);
  const items: ShapedThreadItem[] = [
    {
      kind: 'status',
      status: first,
      position: { kind: 'chain-start' },
      role: 'ancestor',
      isAuthorReply: isAuthorReply(first),
    },
    makeCollapseItem(collapsed, { kind: 'chain-middle' }, 'ancestor'),
  ];
  for (const t of tail) {
    items.push({
      kind: 'status',
      status: t,
      position: { kind: 'chain-middle' },
      role: 'ancestor',
      isAuthorReply: isAuthorReply(t),
    });
  }
  return items;
}

function shapeDescendants(
  descendants: Status[],
  main: Status,
  ancestors: Status[],
  expandedKeys: ReadonlySet<string>,
): ShapedThreadItem[] {
  if (descendants.length === 0)
    return [];

  // 1. Build depth map: distance from `main` in the reply tree.
  //    Direct replies to main are depth 0. Orphans (parent unknown) are 0.
  const depthOf = new Map<string, number>();
  for (const d of descendants) {
    if (d.inReplyToId === main.id) {
      depthOf.set(d.id, 0);
    }
    else if (d.inReplyToId && depthOf.has(d.inReplyToId)) {
      depthOf.set(d.id, depthOf.get(d.inReplyToId)! + 1);
    }
    else {
      depthOf.set(d.id, 0);
    }
  }

  // 2. Walk the array, accumulating deep stretches into collapse buffers.
  //    Honor expandedKeys: if a buffer's key is in the expanded set, flush
  //    its statuses as individual entries instead of a collapse entry.
  type Entry
    = | { kind: 'status'; status: Status }
      | { kind: 'collapse'; collapsed: Status[]; parentId: string | null };

  const entries: Entry[] = [];
  let buffer: Status[] = [];

  function flushBuffer() {
    if (buffer.length === 0)
      return;
    const key = collapseKey('descendant', buffer);
    if (expandedKeys.has(key)) {
      for (const s of buffer)
        entries.push({ kind: 'status', status: s });
    }
    else {
      entries.push({
        kind: 'collapse',
        collapsed: buffer,
        parentId: buffer[0]!.inReplyToId ?? null,
      });
    }
    buffer = [];
  }

  for (const d of descendants) {
    const depth = depthOf.get(d.id) ?? 0;
    if (depth > DESCENDANT_MAX_DEPTH) {
      buffer.push(d);
    }
    else {
      flushBuffer();
      entries.push({ kind: 'status', status: d });
    }
  }
  flushBuffer();

  // 3. Second pass: compute each entry's position based on its shaped
  //    neighbors. This is the only place rail topology is decided.
  //    True orphans (parent missing from ancestors AND descendants) emit
  //    a tombstone immediately above so the gap is acknowledged honestly.
  function entryId(e: Entry): string | null {
    return e.kind === 'status' ? e.status.id : null;
  }
  function entryParentId(e: Entry): string | null {
    return e.kind === 'status' ? e.status.inReplyToId ?? null : e.parentId;
  }

  const tombstonedParents = new Set<string>();
  const isAuthorReply = (s: Status): boolean => s.account.id === main.account.id;

  return entries.flatMap((entry, i): ShapedThreadItem[] => {
    const prev = entries[i - 1];
    const next = entries[i + 1];

    if (entry.kind === 'collapse') {
      const prevIsParent = !!prev && entryId(prev) === entry.parentId;
      return [makeCollapseItem(
        entry.collapsed,
        prevIsParent ? { kind: 'chain-end' } : { kind: 'standalone' },
        'descendant',
      )];
    }

    const status = entry.status;
    const author = isAuthorReply(status);
    const myParentId = status.inReplyToId ?? null;
    const prevIsMyParent = !!prev && entryId(prev) === myParentId;
    const nextRepliesToMe = !!next && entryParentId(next) === status.id;
    const parentIsMain = myParentId === main.id;

    if (prevIsMyParent && nextRepliesToMe) {
      return [{ kind: 'status', status, position: { kind: 'chain-middle' }, role: 'descendant', isAuthorReply: author }];
    }
    if (prevIsMyParent) {
      return [{ kind: 'status', status, position: { kind: 'chain-end' }, role: 'descendant', isAuthorReply: author }];
    }
    if (nextRepliesToMe) {
      return [{ kind: 'status', status, position: { kind: 'chain-start' }, role: 'descendant', isAuthorReply: author }];
    }
    if (myParentId && !parentIsMain) {
      // Orphan: parent isn't the previous shaped item. Try to find it.
      const parent
        = ancestors.find(a => a.id === myParentId)
          ?? descendants.find(d => d.id === myParentId)
          ?? null;
      if (parent) {
        return [{
          kind: 'status',
          status,
          position: { kind: 'reply-with-parent-preview', parent },
          role: 'descendant',
          isAuthorReply: author,
        }];
      }

      // Truly orphan: parent doesn't exist anywhere. Emit a tombstone above.
      // Multiple orphans referencing the same missing parent share one tombstone.
      const items: ShapedThreadItem[] = [];
      const isFirstSiblingOfMissingParent = !tombstonedParents.has(myParentId);
      if (isFirstSiblingOfMissingParent) {
        items.push({
          kind: 'tombstone',
          key: `tombstone-${myParentId}`,
          reason: 'unavailable',
          position: { kind: 'chain-start' },
          role: 'descendant',
        });
        tombstonedParents.add(myParentId);
        const orphanPosition: ThreadPosition = nextRepliesToMe
          ? { kind: 'chain-middle' }
          : { kind: 'chain-end' };
        items.push({ kind: 'status', status, position: orphanPosition, role: 'descendant', isAuthorReply: author });
      }
      else {
        items.push({ kind: 'status', status, position: { kind: 'standalone' }, role: 'descendant', isAuthorReply: author });
      }
      return items;
    }
    return [{ kind: 'status', status, position: { kind: 'standalone' }, role: 'descendant', isAuthorReply: author }];
  });
}

/**
 * Transforms a Mastodon-style thread context into a flat list of render
 * instructions. The focused `main` post is intentionally omitted from both
 * lists — callers render it with `StatusDetailMain` which has its own
 * layout and is never part of the chain.
 *
 * The shaper auto-collapses:
 * - Ancestor chains longer than `ANCESTOR_COLLAPSE_THRESHOLD` (6) — keeps the
 *   root and the last 2, collapses the middle.
 * - Descendant subtrees deeper than `DESCENDANT_MAX_DEPTH` (3) from main —
 *   any reply at depth > 3 is folded into a collapse node.
 *
 * The shaper auto-emits tombstones for true orphans — descendants whose
 * `inReplyToId` doesn't resolve to anything in the context. The gap is
 * acknowledged with a `DeletedStatusTombstone` so the rail topology stays honest.
 *
 * Pass `expandedKeys` to opt specific collapse nodes out of folding —
 * a click on a `ThreadCollapseNode` adds its `key` to the set, the next
 * shape pass renders the contained statuses individually.
 */
export function shapeThreadContext({
  ancestors,
  main,
  descendants,
  expandedKeys = new Set<string>(),
}: ThreadContext): { ancestors: ShapedThreadItem[]; descendants: ShapedThreadItem[] } {
  return {
    ancestors: shapeAncestors(ancestors, main, expandedKeys),
    descendants: shapeDescendants(descendants, main, ancestors, expandedKeys),
  };
}

/**
 * Derives the ThreadPosition for a single feed status without considering
 * its neighbors — only the parent is considered. Use when you can't see the
 * surrounding feed (e.g. one-shot rendering). Prefer `shapeFeedThreads()`
 * for any list rendering, since it also detects self-thread chains across
 * adjacent feed items.
 */
export function shapeFeedStatus(parent: Status | null | undefined): ThreadPosition {
  return parent ? { kind: 'reply-with-parent-preview', parent } : { kind: 'standalone' };
}

/**
 * Derives one `ThreadPosition` per status for a feed array. Detects runs of
 * adjacent self-thread posts (same author, where each one replies to the
 * previous) and links them with chain-* positions so the rail renders as a
 * continuous line through the feed — the way Twitter shows author threads
 * inline.
 *
 * Detection rules:
 * - Both items must be non-reblogs (reblogs never participate in linking)
 * - Both items must be by the same author (`account.id` match)
 * - The lower item must reply directly to the upper one (`inReplyToId` match)
 *
 * Priority: chain linking wins over `reply-with-parent-preview`. If a status
 * is part of a self-thread run and ALSO has its parent in the store, the
 * parent preview is suppressed — the chain itself is the context. The reader
 * can tap to see further ancestors if they want.
 *
 * @param statuses    The feed array (in display order)
 * @param getStatus   Lookup function used by the parent-preview fallback for
 *                    statuses not part of a self-thread run.
 */
export function shapeFeedThreads(
  statuses: Status[],
  getStatus: (id: string) => Status | null | undefined,
): ThreadPosition[] {
  return statuses.map((status, i): ThreadPosition => {
    const display = status.reblog ?? status;
    const isReblog = !!status.reblog;

    const prev = statuses[i - 1];
    const next = statuses[i + 1];
    const prevDisplay = prev?.reblog ?? prev;
    const nextDisplay = next?.reblog ?? next;
    const prevIsReblog = !!prev?.reblog;
    const nextIsReblog = !!next?.reblog;

    const linkedAbove
      = !isReblog
        && !prevIsReblog
        && !!prevDisplay
        && !!display.inReplyToId
        && display.inReplyToId === prevDisplay.id
        && display.account.id === prevDisplay.account.id;

    const linkedBelow
      = !isReblog
        && !nextIsReblog
        && !!nextDisplay
        && !!nextDisplay.inReplyToId
        && nextDisplay.inReplyToId === display.id
        && nextDisplay.account.id === display.account.id;

    if (linkedAbove && linkedBelow)
      return { kind: 'chain-middle' };
    if (linkedAbove)
      return { kind: 'chain-end' };
    if (linkedBelow)
      return { kind: 'chain-start' };

    // Not linked — fall back to single-status shape with parent preview.
    const parent = display.inReplyToId ? getStatus(display.inReplyToId) ?? null : null;
    return shapeFeedStatus(parent);
  });
}
