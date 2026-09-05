import { type FormEvent, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { communityApi, feedApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { useAuth } from "@/lib/use-auth";
import { texts } from "@/texts";

import { AppContainer } from "@/components/app-container";
import {
  CommunityBackLink,
  CommunityComposer,
  CommunityFeed,
  CommunityHeader,
  CommunityMembers,
} from "@/components/community/community-detail-view";
import { EditCommunityForm } from "@/components/community/edit-community-form";

export const Route = createFileRoute("/comunidades/$communityId")({
  beforeLoad: requireAuth,
  loader: async ({ params }) => {
    try {
      return await communityApi.getById(params.communityId);
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.name ?? texts.communities.detail.seoFallback} · ${texts.brand.name}`,
      },
    ],
  }),
  component: CommunityDetailPage,
});

function CommunityDetailPage() {
  const queryClient = useQueryClient();
  const community = Route.useLoaderData();
  const { user: currentUser } = useAuth();
  const [postDraft, setPostDraft] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: liveCommunity } = useQuery({
    queryKey: ["community", community.id],
    queryFn: () => communityApi.getById(community.id),
    initialData: community,
  });

  const { data: membersResponse } = useQuery({
    queryKey: ["community", community.id, "members"],
    queryFn: () => communityApi.listMembers(community.id),
  });

  const { data: communityFeedResponse } = useQuery({
    queryKey: ["community", community.id, "feed"],
    queryFn: () => communityApi.listFeed(community.id),
  });

  const members = membersResponse?.items ?? [];
  const posts = communityFeedResponse?.items ?? [];
  const admins = members.filter((member) => member.role === "ADMIN");
  const isAdmin = Boolean(currentUser && admins.some((admin) => admin.userId === currentUser.id));
  const isMember = liveCommunity.joined;

  const invalidateCommunityQuery = () =>
    queryClient.invalidateQueries({ queryKey: ["community", community.id] });

  const joinCommunityMutation = useMutation({
    mutationFn: () => communityApi.join(community.id),
    onSuccess: invalidateCommunityQuery,
  });

  const leaveCommunityMutation = useMutation({
    mutationFn: () => communityApi.leave(community.id),
    onSuccess: invalidateCommunityQuery,
  });

  const createCommunityPostMutation = useMutation({
    mutationFn: (content: string) =>
      feedApi.create({ type: "INSIGHT", content, communityId: community.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", community.id, "feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setPostDraft("");
    },
  });

  const handlePostSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = postDraft.trim();
    if (content) createCommunityPostMutation.mutate(content);
  };

  const membershipAction = isMember
    ? {
        label: texts.communities.participating,
        variant: "secondary" as const,
        onSelect: () => leaveCommunityMutation.mutate(),
      }
    : {
        label: texts.communities.enter,
        variant: "default" as const,
        onSelect: () => joinCommunityMutation.mutate(),
      };
  const emptyFeedText = isMember
    ? texts.communities.detail.emptyMember
    : texts.communities.detail.emptyGuest;

  return (
    <AppContainer>
      <div className="space-y-6">
        <CommunityBackLink />

        <CommunityHeader
          community={liveCommunity}
          admins={admins}
          isAdmin={isAdmin}
          isEditDialogOpen={isEditDialogOpen}
          editForm={
            <EditCommunityForm
              community={liveCommunity}
              onClose={() => setIsEditDialogOpen(false)}
            />
          }
          membershipLabel={membershipAction.label}
          membershipVariant={membershipAction.variant}
          isMembershipPending={
            joinCommunityMutation.isPending || leaveCommunityMutation.isPending
          }
          onEditDialogOpenChange={setIsEditDialogOpen}
          onMembership={membershipAction.onSelect}
        />

        {isMember && (
          <CommunityComposer
            postDraft={postDraft}
            isPublishing={createCommunityPostMutation.isPending}
            onPostDraftChange={setPostDraft}
            onSubmit={handlePostSubmit}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <CommunityFeed posts={posts} emptyText={emptyFeedText} />
          <CommunityMembers members={members} />
        </div>
      </div>
    </AppContainer>
  );
}
