import { useQuery } from "@tanstack/react-query";

import { REACTION_EMOJIS, profileApi, reactionApi } from "@/lib/api";
import { texts } from "@/texts";
import { prependIfMissing, unique } from "@/utils/collections";

import { UserAvatar } from "@/components/user-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ReactionsSummaryProps = {
  postId: string;
  currentUserReaction: string | null;
};

export function ReactionsSummary({ postId, currentUserReaction }: ReactionsSummaryProps) {
  const { data: reactionsResponse } = useQuery({
    queryKey: ["reactions-summary", postId],
    queryFn: () => reactionApi.listPostReactions(postId),
    staleTime: 30_000,
  });

  const reactionSummary = reactionsResponse?.summary;
  if (!reactionSummary) return null;

  const reactionEntries = (Object.entries(reactionSummary) as [string, number][]).filter(
    ([, count]) => count > 0,
  );
  if (reactionEntries.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {reactionEntries.map(([type, count]) => (
        <span
          key={type}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-light tabular-nums ${
            currentUserReaction === type
              ? "bg-surface-2 text-primary"
              : "border border-border-soft text-text-subtle"
          }`}
        >
          {REACTION_EMOJIS[type] ?? type} {count}
        </span>
      ))}
    </div>
  );
}

type ReactionsDialogProps = {
  postId: string;
  currentUserReaction: string | null;
  currentUserId?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ReactionsDialog({
  postId,
  currentUserReaction,
  currentUserId,
  isOpen,
  onOpenChange,
}: ReactionsDialogProps) {
  const { data: reactionsResponse } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: () => reactionApi.listPostReactions(postId),
    enabled: isOpen,
  });

  const apiReactions = reactionsResponse?.reactions ?? [];
  const optimisticReaction =
    currentUserReaction && currentUserId
      ? {
          userId: currentUserId,
          type: currentUserReaction,
          createdAt: new Date().toISOString(),
        }
      : null;
  const reactions = prependIfMissing(
    apiReactions,
    optimisticReaction,
    (reaction) => reaction.userId === currentUserId,
  );
  const uniqueUserIds = unique(reactions.map((reaction) => reaction.userId));

  const { data: profileByUserId } = useQuery({
    queryKey: ["profiles", "by-ids", [...uniqueUserIds].sort().join(",")],
    queryFn: async () => {
      const profileResults = await Promise.all(
        uniqueUserIds.map((userId) => profileApi.getById(userId).catch(() => null)),
      );
      return Object.fromEntries(
        profileResults.filter(Boolean).map((profile) => [profile!.id, profile!]),
      );
    },
    enabled: isOpen && uniqueUserIds.length > 0,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-light">{texts.posts.reactions.title}</DialogTitle>
        </DialogHeader>
        {reactions.length === 0 ? (
          <p className="py-8 text-center text-[13px] font-light text-text-subtle">
            {texts.posts.reactions.empty}
          </p>
        ) : (
          <div className="space-y-2 pt-2">
            {reactions.map((reaction) => {
              const profile = profileByUserId?.[reaction.userId];
              return (
                <div
                  key={`${reaction.userId}-${reaction.type}`}
                  className="flex items-center gap-3 rounded-xl bg-surface-1 p-3"
                >
                  <UserAvatar
                    src={profile?.avatar}
                    alt={profile?.name}
                    className="h-9 w-9 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-light text-text-strong">
                      {profile?.name ?? texts.common.loading}
                    </p>
                  </div>
                  <span className="text-xl">
                    {REACTION_EMOJIS[reaction.type] ?? reaction.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
