import type { FormEventHandler, ReactNode } from "react";

import type { CommentView, PostView, Profile, ReactionType } from "@/lib/api";
import { texts } from "@/texts";

import { MediaGrid } from "@/components/media-grid";
import { PostLinkPreviews } from "@/components/post-link-previews";
import { PostActions } from "@/components/post/post-actions";
import { PostAuthorInfo } from "@/components/post/post-author-info";
import { PostComments } from "@/components/post/post-comments";
import { RichText } from "@/components/rich-text";
import { Badge } from "@/components/ui/badge";

const postTypeMeta: Record<
  PostView["type"],
  { label: string; className: string; avatarClassName: string }
> = {
  INSIGHT: {
    label: texts.posts.types.insight,
    className: "bg-highlight-insight text-highlight-insight-text",
    avatarClassName: "bg-user-insight text-highlight-insight-text",
  },
  QUESTION: {
    label: texts.posts.types.question,
    className: "bg-secondary/30 text-secondary-foreground",
    avatarClassName: "",
  },
  PROJECT: {
    label: texts.posts.types.project,
    className: "bg-highlight-project text-highlight-project-text",
    avatarClassName: "bg-user-project text-user-project-text",
  },
  OPPORTUNITY: {
    label: texts.posts.types.opportunity,
    className: "bg-opportunity/20 text-opportunity-foreground",
    avatarClassName: "",
  },
  ARTICLE: {
    label: texts.posts.types.article,
    className: "bg-highlight-article text-highlight-article-text",
    avatarClassName: "bg-user-article text-user-article-text",
  },
};

type PostCardViewProps = {
  post: PostView;
  currentUser: Profile | null | undefined;
  postCounters: PostView["counters"];
  currentUserReaction: string | null;
  isSaved: boolean;
  isCommentsVisible: boolean;
  comments: CommentView[];
  rootComments: CommentView[];
  commentDraft: string;
  reactionSummary: ReactNode;
  onReaction: (type: ReactionType) => void;
  onOpenReactions: () => void;
  onToggleComments: () => void;
  onShare: () => void;
  onReport: () => void;
  onSave: () => void;
  onDeleteComment: (commentId: string) => void;
  onReply: (comment: CommentView) => void;
  onCommentDraftChange: (draftValue: string, mentionedUserIds: string[]) => void;
  onSubmitComment: FormEventHandler<HTMLFormElement>;
};

export function PostCardView({
  post,
  currentUser,
  postCounters,
  currentUserReaction,
  isSaved,
  isCommentsVisible,
  comments,
  rootComments,
  commentDraft,
  reactionSummary,
  onReaction,
  onOpenReactions,
  onToggleComments,
  onShare,
  onReport,
  onSave,
  onDeleteComment,
  onReply,
  onCommentDraftChange,
  onSubmitComment,
}: PostCardViewProps) {
  const postTypeMetaConfig = postTypeMeta[post.type] ?? postTypeMeta.INSIGHT;

  return (
    <article className="min-w-0 rounded-2xl border border-border-soft bg-surface-card p-4 transition sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <PostAuthorInfo
          authorUsername={post.authorUsername}
          authorName={post.authorName}
          authorAvatar={post.authorAvatar}
          createdAt={post.createdAt}
          fallbackClassName={postTypeMetaConfig.avatarClassName}
        />
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${postTypeMetaConfig.className}`}
        >
          {postTypeMetaConfig.label}
        </span>
      </header>

      <p className="mt-4 whitespace-pre-line break-words text-[15px] font-light leading-relaxed text-text-strong">
        <RichText text={post.content} />
      </p>

      {post.mediaIds.length > 0 && (
        <div className="mt-4">
          <MediaGrid mediaIds={post.mediaIds} />
        </div>
      )}

      {reactionSummary}
      <PostLinkPreviews content={post.content} />

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full border border-border-soft bg-transparent font-light text-text-subtle"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <PostActions
        postCounters={postCounters}
        currentUserReaction={currentUserReaction}
        isSaved={isSaved}
        onReaction={onReaction}
        onOpenReactions={onOpenReactions}
        onToggleComments={onToggleComments}
        onShare={onShare}
        onReport={onReport}
        onSave={onSave}
      />

      {isCommentsVisible && (
        <PostComments
          currentUser={currentUser}
          comments={comments}
          rootComments={rootComments}
          commentDraft={commentDraft}
          onDeleteComment={onDeleteComment}
          onReply={onReply}
          onCommentDraftChange={onCommentDraftChange}
          onSubmitComment={onSubmitComment}
        />
      )}
    </article>
  );
}
