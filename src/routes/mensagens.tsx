import { type FormEvent, useState } from "react";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { messageApi, networkApi, profileApi } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { texts } from "@/texts";
import { getOtherParticipantId, sortMessagesByTime } from "@/utils/messages";

import { AppContainer } from "@/components/app-container";
import { MessageSidebar } from "@/components/message/message-sidebar";
import { MessageThread } from "@/components/message/message-thread";
import type { ConversationListItemViewModel } from "@/components/message/message-types";

export const Route = createFileRoute("/mensagens")({
  head: () => ({ meta: [{ title: texts.messages.seoTitle }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [isContactSearchVisible, setIsContactSearchVisible] = useState(false);

  const { data: conversationsResponse } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messageApi.listConversations(),
    refetchInterval: 15_000,
  });

  const conversations = conversationsResponse?.items ?? [];
  const otherParticipantIds = conversations.map((conversation) =>
    getOtherParticipantId(conversation.participantIds, currentUser?.id),
  );
  const participantProfileQueries = useQueries({
    queries: otherParticipantIds.map((participantId) => ({
      queryKey: ["profile", "by-id", participantId],
      queryFn: () => profileApi.getById(participantId ?? ""),
      enabled: Boolean(participantId),
      staleTime: 60_000,
    })),
  });

  const conversationItems: ConversationListItemViewModel[] = conversations.map(
    (conversation, index) => ({
      conversation,
      participantProfile: participantProfileQueries[index]?.data,
    }),
  );
  const activeConversationItem = activeConversationId
    ? conversationItems.find(({ conversation }) => conversation.id === activeConversationId)
    : undefined;
  const activeConversation = activeConversationItem?.conversation ?? null;

  const { data: messagesResponse } = useQuery({
    queryKey: ["messages", activeConversation?.id],
    queryFn: () => messageApi.listMessages(activeConversation!.id),
    enabled: Boolean(activeConversation),
    refetchInterval: 10_000,
  });

  const { data: contactSearchResponse } = useQuery({
    queryKey: ["network", "users", searchQuery],
    queryFn: () => networkApi.listUsers(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const contactSearchResults = (contactSearchResponse?.items ?? []).filter(
    (networkUser) => networkUser.id !== currentUser?.id,
  );

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, message }: { conversationId: string; message: string }) =>
      messageApi.sendMessage(conversationId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageDraft("");
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: (participantId: string) =>
      messageApi.createConversation({ kind: "DIRECT", participantIds: [participantId] }),
    onSuccess: (conversation) => {
      setActiveConversationId(conversation.id);
      setIsContactSearchVisible(false);
      setSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const markConversationAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => messageApi.markConversationRead(conversationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  const handleMessageSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = messageDraft.trim();
    if (!message || !activeConversation) return;
    sendMessageMutation.mutate({ conversationId: activeConversation.id, message });
  };

  const handleSelectConversation = (conversation: ConversationListItemViewModel["conversation"]) => {
    setActiveConversationId(conversation.id);
    if (conversation.unread > 0) markConversationAsReadMutation.mutate(conversation.id);
  };

  return (
    <AppContainer>
      <div className="surface-card grid h-[calc(100dvh-11rem)] grid-cols-1 overflow-hidden md:h-[calc(100vh-9rem)] md:grid-cols-[320px_1fr]">
        <MessageSidebar
          conversations={conversationItems}
          activeConversationId={activeConversationId}
          currentUserId={currentUser?.id ?? ""}
          isContactSearchVisible={isContactSearchVisible}
          searchQuery={searchQuery}
          contactSearchResults={contactSearchResults}
          onToggleContactSearch={() => setIsContactSearchVisible((isVisible) => !isVisible)}
          onSearchQueryChange={setSearchQuery}
          onCreateConversation={createConversationMutation.mutate}
          onSelectConversation={handleSelectConversation}
        />

        <MessageThread
          conversation={activeConversation}
          participantProfile={activeConversationItem?.participantProfile}
          currentUserId={currentUser?.id ?? ""}
          messages={sortMessagesByTime(messagesResponse?.items ?? [])}
          messageDraft={messageDraft}
          isSending={sendMessageMutation.isPending}
          onBack={() => setActiveConversationId(null)}
          onMessageDraftChange={setMessageDraft}
          onSubmit={handleMessageSubmit}
        />
      </div>
    </AppContainer>
  );
}
