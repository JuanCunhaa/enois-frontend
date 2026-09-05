import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet, createFileRoute, useMatchRoute } from "@tanstack/react-router";

import { communityApi } from "@/lib/api";
import type { Community } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { texts } from "@/texts";
import { mergeUniquePage } from "@/utils/collections";

import { AppContainer } from "@/components/app-container";
import {
  CommunityGrid,
  CommunityLoadMoreButton,
  CommunityPageHeader,
  CommunityTopicFilters,
  type CommunityTopic,
} from "@/components/community/community-list-view";
import { CreateCommunityDialog } from "@/components/community/create-community-dialog";

export const Route = createFileRoute("/comunidades")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.communities.seoTitle }] }),
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const queryClient = useQueryClient();
  const matchRoute = useMatchRoute();
  const [selectedTopic, setSelectedTopic] = useState<CommunityTopic | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [communitiesCursor, setCommunitiesCursor] = useState<string | undefined>();
  const [loadedCommunities, setLoadedCommunities] = useState<Community[]>([]);
  const communitiesCursorRef = useRef(communitiesCursor);
  communitiesCursorRef.current = communitiesCursor;
  const isDetailRoute = Boolean(matchRoute({ to: "/comunidades/$communityId" }));

  const { data: communitiesResponse, isFetching: isCommunitiesFetching } = useQuery({
    queryKey: ["communities", selectedTopic, communitiesCursor],
    queryFn: () => communityApi.list(selectedTopic, communitiesCursor),
    enabled: !isDetailRoute,
  });

  const nextCommunityCursor = communitiesResponse?.nextCursor ?? null;

  useEffect(() => {
    const currentPageCommunities = communitiesResponse?.items;
    if (!currentPageCommunities) return;
    setLoadedCommunities((currentCommunities) =>
      mergeUniquePage(
        currentCommunities,
        currentPageCommunities,
        !communitiesCursorRef.current,
        (community) => community.id,
      ),
    );
  }, [communitiesResponse]);

  const handleTopicChange = (nextTopic?: CommunityTopic) => {
    setSelectedTopic(nextTopic);
    setCommunitiesCursor(undefined);
    setLoadedCommunities([]);
  };

  const joinCommunityMutation = useMutation({
    mutationFn: (communityId: string) => communityApi.join(communityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const leaveCommunityMutation = useMutation({
    mutationFn: (communityId: string) => communityApi.leave(communityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const handleLoadMore = () => {
    if (!isCommunitiesFetching && nextCommunityCursor) {
      setCommunitiesCursor(nextCommunityCursor);
    }
  };

  if (isDetailRoute) return <Outlet />;

  return (
    <AppContainer>
      <div className="space-y-6">
        <CommunityPageHeader
          createDialog={
            <CreateCommunityDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            />
          }
        />
        <CommunityTopicFilters selectedTopic={selectedTopic} onChange={handleTopicChange} />
        <CommunityGrid
          communities={loadedCommunities}
          isMembershipPending={joinCommunityMutation.isPending || leaveCommunityMutation.isPending}
          onJoin={joinCommunityMutation.mutate}
          onLeave={leaveCommunityMutation.mutate}
        />
        <CommunityLoadMoreButton
          isVisible={Boolean(nextCommunityCursor)}
          isLoading={isCommunitiesFetching}
          onLoadMore={handleLoadMore}
        />
      </div>
    </AppContainer>
  );
}
