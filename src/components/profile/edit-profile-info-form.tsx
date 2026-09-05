import type { ReactNode } from "react";

import { texts } from "@/texts";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type EditProfileInfoValues = {
  username: string;
  name: string;
  headline: string;
  bio: string;
  company: string;
  location: string;
  availability: string;
  portfolio: string;
  linksText: string;
  skillsText: string;
  goalsText: string;
  openToWork: boolean;
  isMentor: boolean;
};

type EditProfileInfoFormProps = {
  formValues: EditProfileInfoValues;
  usernameError: string;
  onChange: <K extends keyof EditProfileInfoValues>(
    field: K,
    fieldValue: EditProfileInfoValues[K],
  ) => void;
};

export function EditProfileInfoForm({
  formValues,
  usernameError,
  onChange,
}: EditProfileInfoFormProps) {
  return (
    <div className="space-y-5">
      <EditProfileField label={texts.profile.edit.fields.name}>
        <Input
          value={formValues.name}
          onChange={(event) => onChange("name", event.target.value)}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <EditProfileField label={texts.profile.edit.fields.username} error={usernameError}>
        <Input
          value={formValues.username}
          onChange={(event) => onChange("username", event.target.value)}
          placeholder={texts.profile.edit.placeholders.username}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <EditProfileField label={texts.profile.edit.fields.headline}>
        <Input
          value={formValues.headline}
          onChange={(event) => onChange("headline", event.target.value)}
          placeholder={texts.profile.edit.placeholders.headline}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <EditProfileField label={texts.profile.edit.fields.bio}>
        <Textarea
          value={formValues.bio}
          onChange={(event) => onChange("bio", event.target.value)}
          rows={3}
          className="h-10 border-border-soft bg-surface-1 pl-9"
        />
      </EditProfileField>

      <div className="grid gap-4 sm:grid-cols-2">
        <EditProfileField label={texts.profile.edit.fields.company}>
          <Input
            value={formValues.company}
            onChange={(event) => onChange("company", event.target.value)}
            className="h-10 border-border-soft bg-surface-1"
          />
        </EditProfileField>
        <EditProfileField label={texts.profile.edit.fields.location}>
          <Input
            value={formValues.location}
            onChange={(event) => onChange("location", event.target.value)}
            className="h-10 border-border-soft bg-surface-1"
          />
        </EditProfileField>
      </div>

      <EditProfileField label={texts.profile.edit.fields.availability}>
        <Input
          value={formValues.availability}
          onChange={(event) => onChange("availability", event.target.value)}
          placeholder={texts.profile.edit.placeholders.availability}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <EditProfileField label={texts.profile.edit.fields.portfolio}>
        <Input
          value={formValues.portfolio}
          onChange={(event) => onChange("portfolio", event.target.value)}
          placeholder={texts.profile.edit.placeholders.portfolio}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <EditProfileField label={texts.profile.edit.fields.externalLinks}>
        <Textarea
          value={formValues.linksText}
          onChange={(event) => onChange("linksText", event.target.value)}
          rows={3}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <EditProfileField label={texts.profile.edit.fields.skills}>
        <Input
          value={formValues.skillsText}
          onChange={(event) => onChange("skillsText", event.target.value)}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <EditProfileField label={texts.profile.edit.fields.goals}>
        <Input
          value={formValues.goalsText}
          onChange={(event) => onChange("goalsText", event.target.value)}
          className="h-10 border-border-soft bg-surface-1"
        />
      </EditProfileField>

      <div className="flex items-center gap-8">
        <label className="flex items-center gap-3 text-[13px] font-light text-text-strong">
          <Switch
            checked={formValues.openToWork}
            onCheckedChange={(isChecked) => onChange("openToWork", isChecked)}
          />
          {texts.profile.edit.openToWork}
        </label>
        <label className="flex items-center gap-3 text-[13px] font-light text-text-strong">
          <Switch
            checked={formValues.isMentor}
            onCheckedChange={(isChecked) => onChange("isMentor", isChecked)}
          />
          {texts.profile.edit.mentorAvailable}
        </label>
      </div>
    </div>
  );
}

type EditProfileFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function EditProfileField({ label, error, children }: EditProfileFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-light text-text-subtle">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
