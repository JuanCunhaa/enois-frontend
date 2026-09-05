import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { Loader2, Plus, Users } from "lucide-react";

import type { Community } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { texts } from "@/texts";

import { Button } from "@/components/ui/button";

export const COMMUNITY_TOPICS = [
  "TECNOLOGIA",
  "ENGENHARIA",
  "DESIGN",
  "PRODUTO",
  "LIDERANCA",
  "CARREIRA",
  "FREELANCE",
] as const;

export type CommunityTopic = (typeof COMMUNITY_TOPICS)[number];

export function CommunityPageHeader({ createDialog }: { createDialog: ReactNode }) {
  return (
    <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 sm:gap-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{texts.communities.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{texts.communities.description}</p>
      </div>
      {createDialog}
    </div>
  );
}

type CommunityTopicFiltersProps = {
  selectedTopic: CommunityTopic | undefined;
  onChange: (topic?: CommunityTopic) => void;
};

export function CommunityTopicFilters({
  selectedTopic,
  onChange,
}: CommunityTopicFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <CommunityTopicButton isActive={!selectedTopic} onClick={() => onChange(undefined)}>
        {texts.communities.topics.all}
      </CommunityTopicButton>
      {COMMUNITY_TOPICS.map((topic) => (
        <CommunityTopicButton
          key={topic}
          isActive={topic === selectedTopic}
          onClick={() => onChange(topic)}
        >
          {texts.communities.topics[topic]}
        </CommunityTopicButton>
      ))}
    </div>
  );
}

type CommunityGridProps = {
  communities: Community[];
  isMembershipPending: boolean;
  onJoin: (communityId: string) => void;
  onLeave: (communityId: string) => void;
};

export function CommunityGrid({
  communities,
  isMembershipPending,
  onJoin,
  onLeave,
}: CommunityGridProps) {
  const membershipMeta = {
    joined: {
      label: texts.communities.participating,
      variant: "secondary" as const,
      onSelect: onLeave,
    },
    available: {
      label: texts.communities.enter,
      variant: "default" as const,
      onSelect: onJoin,
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {communities.map((community) => {
        const membershipAction = membershipMeta[community.joined ? "joined" : "available"];
        return (
          <Link
            key={community.id}
            to="/comunidades/$communityId"
            params={{ communityId: community.id }}
          >
            <article className="surface-card cursor-pointer overflow-hidden transition hover:shadow-[var(--shadow-card)]">
              {community.cover ? (
                <img
                  src={resolveCdnUrl(community.cover)}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
              <div className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  {community.avatar && (
                    <img
                      src={resolveCdnUrl(community.avatar)}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">
                      {community.topic}
                    </p>
                    <h3 className="truncate font-semibold">{community.name}</h3>
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {community.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {texts.communities.members(community.members ?? 0)}
                  </span>
                  <Button
                    size="sm"
                    variant={membershipAction.variant}
                    className="rounded-full"
                    disabled={isMembershipPending}
                    onClick={(event) => {
                      event.preventDefault();
                      membershipAction.onSelect(community.id);
                    }}
                  >
                    {membershipAction.label}
                  </Button>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}

type CommunityLoadMoreButtonProps = {
  isVisible: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

export function CommunityLoadMoreButton({
  isVisible,
  isLoading,
  onLoadMore,
}: CommunityLoadMoreButtonProps) {
  return isVisible ? (
    <div className="flex justify-center pb-8">
      <Button
        variant="outline"
        className="rounded-full"
        onClick={onLoadMore}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : texts.communities.loadMore}
      </Button>
    </div>
  ) : null;
}

export function CreateCommunityButton() {
  return (
    <Button className="rounded-full gap-1.5">
      <Plus className="h-4 w-4" /> {texts.communities.createCommunity}
    </Button>
  );
}

type CommunityTopicButtonProps = {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
};

function CommunityTopicButton({ isActive, onClick, children }: CommunityTopicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
