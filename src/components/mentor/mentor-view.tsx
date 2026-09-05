import { useState } from "react";

import { Link } from "@tanstack/react-router";

import { Calendar, Sparkles, Star } from "lucide-react";

import type { CreateMentorInput, Mentor, Profile } from "@/lib/api";
import { texts } from "@/texts";

import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type MentorListItemViewModel = {
  mentor: Mentor;
  profile?: Profile;
  isOwner: boolean;
};

type MentoringHeroProps = {
  isRegistrationDialogOpen: boolean;
  isRegistrationPending: boolean;
  onRegistrationDialogOpenChange: (isOpen: boolean) => void;
  onRegister: (input: CreateMentorInput) => void;
};

export function MentoringHero({
  isRegistrationDialogOpen,
  isRegistrationPending,
  onRegistrationDialogOpenChange,
  onRegister,
}: MentoringHeroProps) {
  return (
    <div
      className="surface-card relative overflow-hidden p-5 sm:p-8"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="relative">
        <Badge className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
          <Sparkles className="mr-1 h-3 w-3" /> {texts.mentoring.badge}
        </Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{texts.mentoring.title}</h1>
        <p className="mt-2 text-muted-foreground">{texts.mentoring.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            className="rounded-full"
            onClick={() => document.getElementById("mentores-lista")?.scrollIntoView({ behavior: "smooth" })}
          >
            {texts.mentoring.findMentor}
          </Button>
          <Dialog open={isRegistrationDialogOpen} onOpenChange={onRegistrationDialogOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full">
                {texts.mentoring.becomeMentor}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{texts.mentoring.becomeMentorTitle}</DialogTitle>
              </DialogHeader>
              <RegisterMentorForm onRegister={onRegister} isPending={isRegistrationPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

type MentorListProps = {
  mentorItems: MentorListItemViewModel[];
};

export function MentorList({ mentorItems }: MentorListProps) {
  return (
    <div id="mentores-lista">
      <h2 className="text-lg font-semibold">{texts.mentoring.featured}</h2>
      <p className="text-sm text-muted-foreground">{texts.mentoring.featuredDescription}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {mentorItems.map((mentorItem) => (
          <MentorCard key={mentorItem.mentor.id} {...mentorItem} />
        ))}
      </div>
    </div>
  );
}

type RegisterMentorFormProps = {
  onRegister: (input: CreateMentorInput) => void;
  isPending: boolean;
};

function RegisterMentorForm({ onRegister, isPending }: RegisterMentorFormProps) {
  const [expertiseText, setExpertiseText] = useState("");
  const [price, setPrice] = useState(texts.mentoring.free);

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.mentoring.expertise}</Label>
        <Input
          value={expertiseText}
          onChange={(event) => setExpertiseText(event.target.value)}
          placeholder={texts.mentoring.expertisePlaceholder}
          className="h-10 border-transparent bg-muted"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.mentoring.investment}</Label>
        <Input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder={texts.mentoring.free}
          className="h-10 border-transparent bg-muted"
        />
      </div>
      <Button
        className="w-full rounded-full"
        disabled={!expertiseText.trim() || isPending}
        onClick={() => {
          const expertise = expertiseText
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
          onRegister({ expertise, price: price || texts.mentoring.free });
        }}
      >
        {isPending ? texts.common.saving : texts.common.save}
      </Button>
    </div>
  );
}

type MentorCardProps = MentorListItemViewModel;

function MentorCard({ mentor, profile, isOwner }: MentorCardProps) {
  return (
    <article className="surface-card mx-auto w-full max-w-5xl space-y-4 p-5">
      <header className="flex flex-wrap">
        <div className="md:col-span-3">
          <div className="flex h-full items-start justify-center overflow-hidden">
            <UserAvatar
              src={profile?.avatar}
              alt={profile?.name ?? texts.mentoring.mentorFallback}
              className="h-14 w-14 shrink-0"
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-hidden px-4 md:col-span-6">
          <Link
            to="/perfil/$username"
            params={{ username: profile?.username ?? mentor.userId }}
            className="m-0 block truncate font-semibold hover:underline"
          >
            {profile?.name ?? texts.mentoring.mentorFallback}
          </Link>
          <p className="line-clamp-2 text-xs text-muted-foreground">{profile?.headline ?? ""}</p>
        </div>

        <div className="flex flex-col gap-4 text-[13px] md:col-span-3">
          {!isOwner && (
            <Button className="shrink-0 self-center rounded-lg bg-mentorship-button px-[14px] py-2">
              {texts.mentoring.schedule}
            </Button>
          )}
        </div>
      </header>

      <section className="flex flex-wrap gap-1.5">
        {mentor.expertise.map((expertise) => (
          <Badge
            key={expertise}
            variant="secondary"
            className="rounded-full bg-accent font-normal text-accent-foreground"
          >
            {expertise}
          </Badge>
        ))}
      </section>

      <footer className="grid grid-cols-1 gap-8 rounded-2xl">
        <dl className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-3 text-xs">
          <div>
            <dt className="text-muted-foreground">{texts.mentoring.rating}</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1 font-semibold">
              <Star className="h-3.5 w-3.5 fill-opportunity text-opportunity" /> {mentor.rating}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{texts.mentoring.sessions}</dt>
            <dd className="mt-0.5 font-semibold">{mentor.sessions}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{texts.mentoring.investment}</dt>
            <dd className="mt-0.5 font-medium">{mentor.price}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{texts.mentoring.nextSlot}</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5" /> {mentor.nextSlot}
            </dd>
          </div>
        </dl>
      </footer>
    </article>
  );
}
