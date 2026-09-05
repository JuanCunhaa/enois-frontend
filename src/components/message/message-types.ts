import type { Conversation, Profile } from "@/lib/api";

export type ConversationListItemViewModel = {
  conversation: Conversation;
  participantProfile?: Profile;
};
