import { useEffect, useRef } from "react";

import { Loader2 } from "lucide-react";

import { texts } from "@/texts";

export function JobLoadingIndicator({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <div className="flex justify-center py-6">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ) : null;
}

export function JobEmptyState({ isVisible }: { isVisible: boolean }) {
  return isVisible ? (
    <p className="py-12 text-center text-sm text-muted-foreground">{texts.jobs.empty}</p>
  ) : null;
}

type JobInfiniteScrollProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function JobInfiniteScroll({ hasMore, isLoading, onLoadMore }: JobInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinelElement = sentinelRef.current;
    if (!sentinelElement || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) onLoadMore();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return hasMore ? <div ref={sentinelRef} className="h-4" /> : null;
}
