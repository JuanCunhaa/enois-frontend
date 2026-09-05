import { type FormEventHandler, useRef } from "react";

import { Link } from "@tanstack/react-router";

import {
  BarChart3,
  Calendar,
  FileText,
  Film,
  Image,
  Loader2,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";

import type { Event, NetworkUser, PostView, Profile } from "@/lib/api";
import { texts } from "@/texts";
import {
  getLocalMediaTypeFromItems,
  type LocalMediaItem,
  type LocalMediaType,
} from "@/utils/media";

import { MentionTextarea } from "@/components/mention-textarea";
import { PostCard } from "@/components/post-card";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";

const composerPostActions: Array<{
  type: PostView["type"];
  icon: React.ElementType;
  label: string;
}> = [
  { type: "INSIGHT", icon: Image, label: texts.feed.composer.types.insight },
  { type: "ARTICLE", icon: FileText, label: texts.feed.composer.types.article },
  { type: "QUESTION", icon: BarChart3, label: texts.feed.composer.types.question },
  { type: "PROJECT", icon: Calendar, label: texts.feed.composer.types.project },
];

const feedTabs = [
  { value: "FOR_YOU", label: texts.feed.tabs.forYou },
  { value: "ALL", label: texts.feed.tabs.all },
  { value: "FOLLOWING", label: texts.feed.tabs.following },
  { value: "RECENT", label: texts.feed.tabs.discussions },
  { value: "PROJECTS", label: texts.feed.tabs.projects },
] as const;

type FeedComposerProps = {
  currentUser: Profile | null | undefined;
  content: string;
  selectedPostType: PostView["type"];
  mediaItems: LocalMediaItem[];
  publishError: string | null;
  isUploading: boolean;
  uploadProgress: number;
  isPublishing: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onContentChange: (value: string, mentionedUserIds: string[]) => void;
  onPostTypeChange: (type: PostView["type"]) => void;
  onMediaFilesSelect: (files: FileList) => void;
  onMediaRemove: (index: number) => void;
};

export function FeedComposer({
  currentUser,
  content,
  selectedPostType,
  mediaItems,
  publishError,
  isUploading,
  uploadProgress,
  isPublishing,
  onSubmit,
  onContentChange,
  onPostTypeChange,
  onMediaFilesSelect,
  onMediaRemove,
}: FeedComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaType = getLocalMediaTypeFromItems(mediaItems);
  const mediaLabels: Record<LocalMediaType, string> = {
    image: texts.feed.composer.mediaCount(mediaItems.length),
    video: texts.feed.composer.video,
  };
  const mediaLabel = mediaType ? mediaLabels[mediaType] : texts.feed.composer.media;
  const MediaIcon = mediaType === "video" ? Film : Image;
  const publishingLabel = isUploading ? texts.common.sending : texts.common.publishing;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <UserAvatar
          src={currentUser?.avatar}
          alt={currentUser?.name ?? texts.feed.you}
          className="h-11 w-11"
        />
        <MentionTextarea
          value={content}
          onChange={onContentChange}
          placeholder={texts.feed.composer.placeholder}
          className="min-h-11 flex-1 resize-none rounded-2xl border-border-soft bg-surface-1 px-3 py-2 text-[14px] font-light"
          maxLength={600}
        />
      </div>

      {mediaItems.length > 0 && (
        <div className="relative mt-3">
          {mediaType === "image" ? (
            <div className={`grid gap-2 ${mediaItems.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {mediaItems.map((mediaItem, index) => (
                <div
                  key={mediaItem.preview}
                  className="relative overflow-hidden rounded-xl border border-border-soft"
                >
                  <img
                    src={mediaItem.preview}
                    alt=""
                    className="h-48 w-full object-cover bg-surface-1"
                  />
                  <button
                    type="button"
                    onClick={() => onMediaRemove(index)}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-surface-card/80 text-text-strong shadow hover:bg-surface-card"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-border-soft">
              <video src={mediaItems[0].preview} controls className="max-h-64 w-full bg-surface-1" />
              <button
                type="button"
                onClick={() => onMediaRemove(0)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-surface-card/80 text-text-strong shadow hover:bg-surface-card"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) onMediaFilesSelect(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-3 text-[13px] font-light text-text-subtle">
        <div className="flex flex-wrap gap-1.5">
          {composerPostActions.map((action) => (
            <ComposerAction
              key={action.type}
              icon={action.icon}
              label={action.label}
              isActive={selectedPostType === action.type}
              onClick={() => onPostTypeChange(action.type)}
            />
          ))}
          <ComposerAction
            icon={MediaIcon}
            label={mediaLabel}
            isActive={mediaItems.length > 0}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>

        <div className="flex items-center gap-2">
          {publishError && (
            <p className="max-w-[200px] truncate text-[12px] font-light text-destructive">
              {publishError}
            </p>
          )}
          {!publishError && isUploading && (
            <span className="text-[12px] font-light text-text-subtle">
              {texts.feed.composer.uploadProgress(uploadProgress)}
            </span>
          )}
          <Button size="sm" className="rounded-full" disabled={!content.trim() || isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {publishingLabel}
              </>
            ) : (
              texts.common.publish
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

type FeedTabsProps = {
  activeTab: string | undefined;
  onTabChange: (tab: string) => void;
};

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {feedTabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-light transition ${
            activeTab === tab.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border-soft bg-surface-card text-text-subtle hover:text-text-strong"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

type FeedTimelineProps = {
  posts: PostView[];
  isLoading: boolean;
};

export function FeedTimeline({ posts, isLoading }: FeedTimelineProps) {
  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-text-subtle">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {!isLoading && posts.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}

type FeedSidebarProps = {
  currentUser: Profile | null | undefined;
  suggestions: NetworkUser[];
  events: Event[];
  onConnectSuggestion: (userId: string) => void;
};

export function FeedSidebar({
  currentUser,
  suggestions,
  events,
  onConnectSuggestion,
}: FeedSidebarProps) {
  return (
    <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] space-y-4 overflow-y-auto lg:block">
      {currentUser && (
        <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
          <div className="h-14" style={{ background: "var(--gradient-primary)" }} />
          <div className="-mt-7 px-4 pb-4 text-center">
            <UserAvatar
              src={currentUser.avatar}
              alt={currentUser.name}
              className="mx-auto h-16 w-16 ring-4 ring-surface-card"
            />
            <Link
              to="/perfil/$username"
              params={{ username: currentUser.username }}
              className="mt-2 block text-[14px] font-light text-text-strong hover:underline"
            >
              {currentUser.name}
            </Link>
            <p className="line-clamp-2 text-[12px] font-light text-text-subtle">
              {currentUser.headline}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1 border-t border-border-soft pt-3 text-[12px]">
              <div>
                <p className="font-light text-text-strong">{currentUser.connectionsCount ?? 0}</p>
                <p className="text-text-subtle">{texts.feed.sidebar.connections}</p>
              </div>
              <div>
                <p className="font-light text-text-strong">{currentUser.followersCount ?? 0}</p>
                <p className="text-text-subtle">{texts.feed.sidebar.followers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-[14px] font-light text-text-strong">{texts.feed.sidebar.suggestions}</h3>
          </div>
          <p className="mt-0.5 text-[12px] font-light text-text-subtle">
            {texts.feed.sidebar.suggestionsDescription}
          </p>
          <ul className="mt-4 space-y-3">
            {suggestions.map((user) => (
              <li key={user.id} className="flex items-center gap-3">
                <UserAvatar src={user.avatar} alt={user.name} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/perfil/$username"
                    params={{ username: user.username }}
                    className="block truncate text-[13px] font-light text-text-strong hover:underline"
                  >
                    {user.name}
                  </Link>
                  <p className="truncate text-[11px] font-light text-text-subtle">{user.headline}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-border-soft px-3 py-1 text-[12px] font-light text-text-subtle transition hover:border-primary hover:text-primary"
                  onClick={() => onConnectSuggestion(user.id)}
                >
                  {texts.feed.sidebar.connect}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {events.length > 0 && (
        <div className="rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-[14px] font-light text-text-strong">
              {texts.feed.sidebar.happeningNow}
            </h3>
          </div>
          <ul className="mt-3 space-y-3">
            {events.slice(0, 3).map((event) => (
              <li key={event.id}>
                <p className="text-[13px] font-light text-text-strong">{event.title}</p>
                <p className="text-[11px] font-light text-text-subtle">
                  {event.date} · {event.format} · {texts.feed.sidebar.confirmed(event.attendees)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

type ComposerActionProps = {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
};

function ComposerAction({ icon: Icon, label, isActive, onClick }: ComposerActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-light transition ${
        isActive ? "bg-surface-2 text-primary" : "hover:bg-surface-3 hover:text-text-strong"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
