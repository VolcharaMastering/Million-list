import { useEffect, useRef, useCallback } from "react";

const SCROLL_THRESHOLD = 100;

type UseInfiniteScrollArgs = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  loading: boolean;
  total: number;
  itemCount: number;
  loadMore: () => void;
  /** When true, do not load more (e.g. while dragging). */
  blockLoad?: boolean;
};

/**
 * Subscribes to scroll and requests next page when near bottom.
 * Also requests next page when list does not fill the container yet.
 */
export const useInfiniteScroll = ({
  scrollRef,
  loading,
  total,
  itemCount,
  loadMore,
  blockLoad = false,
}: UseInfiniteScrollArgs) => {
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const canLoad =
    !blockLoad &&
    !loading &&
    total > 0 &&
    itemCount < total;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !canLoad) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
      loadMoreRef.current();
    }
  }, [scrollRef, canLoad]);

  useEffect(() => {
    if (!canLoad) return;
    const id = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const { scrollHeight, clientHeight } = el;
      if (scrollHeight - clientHeight < SCROLL_THRESHOLD) {
        loadMoreRef.current();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [scrollRef, canLoad, itemCount, total, loading]);

  return handleScroll;
};
