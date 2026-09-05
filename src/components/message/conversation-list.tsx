import { Link } from "@tanstack/react-router";

import type { Conversation } from "@/lib/api";
import { texts } from "@/texts";
import { getOtherParticipantId } from "@/utils/messages";
import { formatRelativeTime } from "@/utils/time";

import type { ConversationListItemViewModel } from "@/components/message/message-types";
import { UserAvatar } from "@/components/user-avatar";

type ConversationListProps = {
  conversations: ConversationListItemViewModel[];
  activeConversationId: string | null;
  currentUserId: string;
  onSelectConversation: (conversation: Conversation) => void;
};

export function ConversationList({
  conversations,
  activeConversationId,
  currentUserId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-muted-foreground">
        {texts.messages.noConversations}
      </p>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {conversations.map(({ conversation, participantProfile }) => {
        const title =
          conversation.title ?? participantProfile?.name ?? texts.messages.conversationFallback;
        const participantUserId =
          getOtherParticipantId(conversation.participantIds, currentUserId) ?? currentUserId;

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelectConversation(conversation)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                conversation.id === activeConversationId ? "bg-primary-soft" : "hover:bg-muted"
              }`}
            >
              <Link
                to="/perfil/$username"
                params={{ username: participantProfile?.username ?? participantUserId }}
              >
                <UserAvatar
                  src={participantProfile?.avatar}
                  alt={title}
                  className="h-11 w-11 shrink-0"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">{title}</span>
                  <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                    {formatRelativeTime(conversation.time)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {conversation.lastMessage ?? ""}
                  </p>
                  {conversation.unread > 0 && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
