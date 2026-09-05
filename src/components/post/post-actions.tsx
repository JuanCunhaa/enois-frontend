import { Bookmark, Flag, Heart, MessageSquare, Share2 } from "lucide-react";

import { REACTION_EMOJIS } from "@/lib/api";
import type { PostView, ReactionType } from "@/lib/api";
import { texts } from "@/texts";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PostActionsProps = {
  postCounters: PostView["counters"];
  currentUserReaction: string | null;
  isSaved: boolean;
  onReaction: (type: ReactionType) => void;
  onOpenReactions: () => void;
  onToggleComments: () => void;
  onShare: () => void;
  onReport: () => void;
  onSave: () => void;
};

export function PostActions({
  postCounters,
  currentUserReaction,
  isSaved,
  onReaction,
  onOpenReactions,
  onToggleComments,
  onShare,
  onReport,
  onSave,
}: PostActionsProps) {
  return (
    <footer className="mt-4 flex flex-wrap items-center justify-between gap-1 border-t border-border pt-3 text-sm text-muted-foreground">
      <div className="flex">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground ${
                currentUserReaction ? "text-primary" : ""
              }`}
              title={
                currentUserReaction
                  ? texts.posts.reactions.reactedWith(REACTION_EMOJIS[currentUserReaction])
                  : texts.posts.reactions.react
              }
            >
              {currentUserReaction ? (
                <span className="text-base leading-none">{REACTION_EMOJIS[currentUserReaction]}</span>
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="top"
            className="w-fit rounded-2xl border-border p-1.5"
          >
            <div className="flex gap-1">
              {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(
                ([reactionType, emoji]) => (
                  <button
                    key={reactionType}
                    type="button"
                    onClick={() => onReaction(reactionType)}
                    className={`rounded-lg px-2 py-1 text-xl transition hover:bg-muted ${
                      currentUserReaction === reactionType ? "bg-muted ring-1 ring-primary" : ""
                    }`}
                    title={reactionType.toLowerCase()}
                  >
                    {emoji}
                  </button>
                ),
              )}
            </div>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={onOpenReactions}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs tabular-nums text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {postCounters.reactions}
        </button>
        <button
          type="button"
          onClick={onToggleComments}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4" /> {postCounters.comments}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
        >
          <Share2 className="h-4 w-4" /> {texts.posts.share}
        </button>
        <button
          type="button"
          onClick={onReport}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Flag className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onSave}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground ${
          isSaved ? "text-primary" : ""
        }`}
      >
        <Bookmark className="h-4 w-4" /> {postCounters.saves}
      </button>
    </footer>
  );
}
