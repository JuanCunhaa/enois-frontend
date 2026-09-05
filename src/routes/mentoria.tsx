import { useState } from "react";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { mentorApi, profileApi } from "@/lib/api";
import type { CreateMentorInput } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { useAuth } from "@/lib/use-auth";
import { texts } from "@/texts";

import { AppContainer } from "@/components/app-container";
import {
  MentoringHero,
  MentorList,
  type MentorListItemViewModel,
} from "@/components/mentor/mentor-view";

export const Route = createFileRoute("/mentoria")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.mentoring.seoTitle }] }),
  component: MentoringPage,
});

function MentoringPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);

  const { data: mentorsResponse } = useQuery({
    queryKey: ["mentors"],
    queryFn: () => mentorApi.list(),
  });

  const mentors = mentorsResponse?.items ?? [];
  const mentorProfileQueries = useQueries({
    queries: mentors.map((mentor) => ({
      queryKey: ["profile", "by-id", mentor.userId],
      queryFn: () => profileApi.getById(mentor.userId),
      staleTime: 60_000,
    })),
  });
  const mentorItems: MentorListItemViewModel[] = mentors.map((mentor, index) => ({
    mentor,
    profile: mentorProfileQueries[index]?.data,
    isOwner: currentUser?.id === mentor.userId,
  }));

  const createMentorMutation = useMutation({
    mutationFn: (input: CreateMentorInput) => mentorApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      setIsRegistrationDialogOpen(false);
    },
  });

  return (
    <AppContainer>
      <div className="space-y-6">
        <MentoringHero
          isRegistrationDialogOpen={isRegistrationDialogOpen}
          isRegistrationPending={createMentorMutation.isPending}
          onRegistrationDialogOpenChange={setIsRegistrationDialogOpen}
          onRegister={createMentorMutation.mutate}
        />
        <MentorList mentorItems={mentorItems} />
      </div>
    </AppContainer>
  );
}
