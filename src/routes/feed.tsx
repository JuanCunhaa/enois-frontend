import { type FormEvent, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  useEventsQuery,
  useFeedQuery,
  useNetworkSuggestionsQuery,
} from "@/hooks/use-feed-queries";
import { feedApi, networkApi } from "@/lib/api";
import type { PostView } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { useAuth } from "@/lib/use-auth";
import { useMediaUpload } from "@/lib/use-media-upload";
import { texts } from "@/texts";
import {
  appendLocalMedia,
  removeLocalMedia,
  type LocalMediaItem,
} from "@/utils/media";

import { AppContainer } from "@/components/app-container";
import {
  FeedComposer,
  FeedSidebar,
  FeedTabs,
  FeedTimeline,
} from "@/components/feed/feed-view";

export const Route = createFileRoute("/feed")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: texts.feed.seo.title },
      { name: "description", content: texts.feed.seo.description },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string | undefined>("FOR_YOU");
  const [postContent, setPostContent] = useState("");
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [selectedPostType, setSelectedPostType] = useState<PostView["type"]>("INSIGHT");
  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);
  const mediaUpload = useMediaUpload();

  const { data: feedData, isFetching: isFeedLoading } = useFeedQuery(activeTab);
  const { data: suggestions } = useNetworkSuggestionsQuery(4);
  const { data: eventsData } = useEventsQuery();

  const createPostMutation = useMutation({
    mutationFn: (input: {
      content: string;
      type: PostView["type"];
      mediaIds?: string[];
      mentionedUserIds?: string[];
    }) => feedApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  const handlePublishPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = postContent.trim();
    if (!content) return;

    setPublishError(null);
    try {
      const uploadResults =
        mediaItems.length > 0
          ? await mediaUpload.uploadAll(mediaItems.map((mediaItem) => ({ file: mediaItem.file })))
          : [];
      const mediaIds = uploadResults.map((result) => result.mediaId);

      await createPostMutation.mutateAsync({
        content,
        type: selectedPostType,
        mediaIds,
        mentionedUserIds,
      });
      setPostContent("");
      setMentionedUserIds([]);
      setSelectedPostType("INSIGHT");
      setMediaItems([]);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : texts.feed.composer.publishError);
    }
  };

  const handleConnectSuggestion = async (userId: string) => {
    await networkApi.sendConnectionRequest(userId);
    queryClient.invalidateQueries({ queryKey: ["network", "suggestions"] });
  };

  const isUploading = mediaUpload.status === "uploading";
  const isPublishing = createPostMutation.isPending || isUploading;

  return (
    <AppContainer>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <FeedComposer
            currentUser={currentUser}
            content={postContent}
            selectedPostType={selectedPostType}
            mediaItems={mediaItems}
            publishError={publishError}
            isUploading={isUploading}
            uploadProgress={mediaUpload.progress}
            isPublishing={isPublishing}
            onSubmit={handlePublishPost}
            onContentChange={(value, userIds) => {
              setPostContent(value);
              setMentionedUserIds(userIds);
            }}
            onPostTypeChange={setSelectedPostType}
            onMediaFilesSelect={(files) =>
              setMediaItems((currentItems) => appendLocalMedia(currentItems, files))
            }
            onMediaRemove={(index) =>
              setMediaItems((currentItems) => removeLocalMedia(currentItems, index))
            }
          />

          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <FeedTimeline posts={feedData?.items ?? []} isLoading={isFeedLoading} />
        </div>

        <FeedSidebar
          currentUser={currentUser}
          suggestions={suggestions ?? []}
          events={eventsData?.items ?? []}
          onConnectSuggestion={handleConnectSuggestion}
        />
      </div>
    </AppContainer>
  );
}
