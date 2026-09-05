import { type FormEvent, useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { commentApi, feedApi, reactionApi } from "@/lib/api";
import type { CommentView, PostView, ReactionType } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { createReplyTarget, getRootComments } from "@/utils/comments";

import { PostCardView } from "@/components/post/post-card-view";
import { ReactionsDialog, ReactionsSummary } from "@/components/post/post-reactions";
import { PostReportDialog } from "@/components/post/post-report-dialog";

type PostCardProps = {
  post: PostView;
};

export function PostCard({ post }: PostCardProps) {
  const { user: currentUser } = useAuth();
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentMentionUserIds, setCommentMentionUserIds] = useState<string[]>([]);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<CommentView[]>([]);
  const [postCounters, setPostCounters] = useState(post.counters);
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(
    post.currentUserReaction ?? null,
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isReactionsDialogOpen, setIsReactionsDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    setCurrentUserReaction(post.currentUserReaction ?? null);
  }, [post.currentUserReaction]);

  const { data: savedPostsResponse } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: () => feedApi.listSaved(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (savedPostsResponse) {
      setIsSaved(savedPostsResponse.items.some((savedPost) => savedPost.id === post.id));
    }
  }, [savedPostsResponse, post.id]);

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = commentDraft.trim();
    if (!content) return;

    try {
      const newComment = await commentApi.create(
        post.id,
        content,
        replyToCommentId,
        commentMentionUserIds,
      );
      setLocalComments((currentComments) => [...currentComments, newComment]);
      setPostCounters((currentCounters) => ({
        ...currentCounters,
        comments: currentCounters.comments + 1,
      }));
      setCommentDraft("");
      setCommentMentionUserIds([]);
      setReplyToCommentId(null);
    } catch {
      // Keep the existing silent-failure behavior.
    }
  };

  const handleReaction = async (type: ReactionType) => {
    try {
      const isRemovingReaction = currentUserReaction === type;
      const reactionResponse = isRemovingReaction
        ? await reactionApi.removePostReaction(post.id)
        : await reactionApi.reactToPost(post.id, type);
      setCurrentUserReaction(isRemovingReaction ? null : type);
      if ("counters" in reactionResponse && reactionResponse.counters) {
        setPostCounters(reactionResponse.counters);
      }
    } catch {
      // Keep the existing silent-failure behavior.
    }
  };

  const handleSave = async () => {
    try {
      const saveResponse = isSaved
        ? await reactionApi.unsavePost(post.id)
        : await reactionApi.savePost(post.id);
      setIsSaved((currentIsSaved) => !currentIsSaved);
      setPostCounters(saveResponse.counters);
    } catch {
      // Keep the existing silent-failure behavior.
    }
  };

  const handleShare = async () => {
    try {
      const shareResponse = await reactionApi.sharePost(post.id);
      setPostCounters(shareResponse.counters);
      const postUrl = `${window.location.origin}/feed/${post.id}`;
      const shareAction = navigator.share
        ? () => navigator.share({ url: postUrl })
        : () => navigator.clipboard.writeText(postUrl);
      await shareAction();
    } catch {
      // Keep the existing silent-failure behavior.
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.remove(post.id, commentId);
      setLocalComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId),
      );
      setPostCounters((currentCounters) => ({
        ...currentCounters,
        comments: currentCounters.comments - 1,
      }));
    } catch {
      // Keep the existing silent-failure behavior.
    }
  };

  const handleToggleComments = async () => {
    if (!isCommentsVisible) {
      try {
        const commentsResponse = await commentApi.list(post.id);
        setLocalComments(commentsResponse.items);
      } catch {
        // Keep the existing silent-failure behavior.
      }
    }
    setIsCommentsVisible((isVisible) => !isVisible);
  };

  const handleReplyStart = async (comment: CommentView) => {
    const replyTarget = await createReplyTarget(comment);
    setCommentDraft(replyTarget.draft);
    setCommentMentionUserIds(replyTarget.mentionedUserIds);
    setReplyToCommentId(replyTarget.replyToId);
  };

  return (
    <>
      <PostCardView
        post={post}
        currentUser={currentUser}
        postCounters={postCounters}
        currentUserReaction={currentUserReaction}
        isSaved={isSaved}
        isCommentsVisible={isCommentsVisible}
        comments={localComments}
        rootComments={getRootComments(localComments)}
        commentDraft={commentDraft}
        reactionSummary={
          <ReactionsSummary postId={post.id} currentUserReaction={currentUserReaction} />
        }
        onReaction={handleReaction}
        onOpenReactions={() => setIsReactionsDialogOpen(true)}
        onToggleComments={handleToggleComments}
        onShare={handleShare}
        onReport={() => setIsReportDialogOpen(true)}
        onSave={handleSave}
        onDeleteComment={handleDeleteComment}
        onReply={handleReplyStart}
        onCommentDraftChange={(draftValue, mentionedUserIds) => {
          setCommentDraft(draftValue);
          setCommentMentionUserIds(mentionedUserIds);
        }}
        onSubmitComment={handleCommentSubmit}
      />

      <ReactionsDialog
        postId={post.id}
        currentUserReaction={currentUserReaction}
        currentUserId={currentUser?.id}
        isOpen={isReactionsDialogOpen}
        onOpenChange={setIsReactionsDialogOpen}
      />
      <PostReportDialog
        postId={post.id}
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />
    </>
  );
}
