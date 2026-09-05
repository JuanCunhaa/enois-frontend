import { type FormEventHandler, useEffect, useRef } from "react";

import { Link } from "@tanstack/react-router";

import { ArrowLeft, Send } from "lucide-react";

import type { Conversation, Message, Profile } from "@/lib/api";
import { texts } from "@/texts";
import { getOtherParticipantId } from "@/utils/messages";

import { MessageList } from "@/components/message/message-list";
import { UserAvatar } from "@/components/user-avatar";
import { Input } from "@/components/ui/input";

type MessageThreadProps = {
  conversation: Conversation | null;
  participantProfile?: Profile;
  currentUserId: string;
  messages: Message[];
  messageDraft: string;
  isSending: boolean;
  onBack: () => void;
  onMessageDraftChange: (messageDraft: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function MessageThread({
  conversation,
  participantProfile,
  currentUserId,
  messages,
  messageDraft,
  isSending,
  onBack,
  onMessageDraftChange,
  onSubmit,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!conversation) {
    return (
      <div className="hidden min-h-0 flex-col md:flex">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">{texts.messages.selectConversation}</p>
        </div>
      </div>
    );
  }

  const title = conversation.title ?? participantProfile?.name ?? texts.messages.conversationFallback;
  const participantUserId =
    getOtherParticipantId(conversation.participantIds, currentUserId) ?? currentUserId;

  return (
    <div className="flex min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-muted md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Link
            to="/perfil/$username"
            params={{ username: participantProfile?.username ?? participantUserId }}
          >
            <UserAvatar
              src={participantProfile?.avatar}
              alt={title}
              className="h-10 w-10 shrink-0"
            />
          </Link>
          <div className="min-w-0">
            <p className="truncate font-semibold">{title}</p>
            {participantProfile?.headline && (
              <p className="truncate text-xs text-muted-foreground">
                {participantProfile.headline}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-muted/30 p-5">
        {messages.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {texts.messages.noMessages}
          </p>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            participantUserId={participantUserId}
            participantProfile={participantProfile}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={messageDraft}
          onChange={(event) => onMessageDraftChange(event.target.value)}
          placeholder={texts.messages.inputPlaceholder}
          className="h-10 rounded-full bg-muted"
        />
        <button
          type="submit"
          disabled={!messageDraft.trim() || isSending}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
