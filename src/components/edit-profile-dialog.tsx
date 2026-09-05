import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { ApiError, profileApi } from "@/lib/api";
import type {
  Certification,
  CertificationInput,
  Education,
  EducationInput,
  Experience,
  ExperienceInput,
  Profile,
  UpdateProfileInput,
} from "@/lib/api";
import { texts } from "@/texts";
import { buildProfileUpdate } from "@/utils/profile";

import {
  EditProfileInfoForm,
  type EditProfileInfoValues,
} from "@/components/profile/edit-profile-info-form";
import {
  EditProfileShell,
  type EditProfileTab,
} from "@/components/profile/edit-profile-shell";
import {
  ProfileEntryList,
  type ProfileEntryField,
} from "@/components/profile/profile-entry-list";

const experienceFields: ProfileEntryField[] = [
  { key: "title", label: texts.profile.edit.experienceFields.title, required: true },
  { key: "company", label: texts.profile.edit.experienceFields.company, required: true },
  { key: "location", label: texts.profile.edit.experienceFields.location },
  {
    key: "description",
    label: texts.profile.edit.experienceFields.description,
    multiline: true,
  },
  { key: "startDate", label: texts.profile.edit.experienceFields.startDate, type: "date" },
  { key: "endDate", label: texts.profile.edit.experienceFields.endDate, type: "date" },
];

const educationFields: ProfileEntryField[] = [
  { key: "school", label: texts.profile.edit.educationFields.school, required: true },
  { key: "degree", label: texts.profile.edit.educationFields.degree, required: true },
  { key: "field", label: texts.profile.edit.educationFields.field },
  {
    key: "description",
    label: texts.profile.edit.educationFields.description,
    multiline: true,
  },
  { key: "startDate", label: texts.profile.edit.educationFields.startDate, type: "date" },
  { key: "endDate", label: texts.profile.edit.educationFields.endDate, type: "date" },
];

const certificationFields: ProfileEntryField[] = [
  { key: "name", label: texts.profile.edit.certificationFields.name, required: true },
  { key: "issuer", label: texts.profile.edit.certificationFields.issuer, required: true },
  {
    key: "description",
    label: texts.profile.edit.certificationFields.description,
    multiline: true,
  },
  { key: "issueDate", label: texts.profile.edit.certificationFields.issueDate, type: "date" },
  {
    key: "expirationDate",
    label: texts.profile.edit.certificationFields.expirationDate,
    type: "date",
  },
  { key: "credentialUrl", label: texts.profile.edit.certificationFields.credentialUrl },
];

type EditProfileDialogProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function EditProfileDialog({ profile, children }: EditProfileDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EditProfileTab>("info");
  const [usernameError, setUsernameError] = useState("");
  const [formValues, setFormValues] = useState<EditProfileInfoValues>(() => ({
    username: profile.username,
    name: profile.name,
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    company: profile.company ?? "",
    location: profile.location ?? "",
    availability: profile.availability ?? "",
    portfolio: profile.portfolio ?? "",
    linksText: (profile.externalLinks ?? []).join("\n"),
    skillsText: (profile.skills ?? []).join(", "),
    goalsText: (profile.goals ?? []).join(", "),
    openToWork: profile.openToWork,
    isMentor: profile.isMentor,
  }));

  const updateProfileMutation = useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.updateCurrent(input),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile", profile.username] });
      if (updatedProfile.username && updatedProfile.username !== profile.username) {
        queryClient.invalidateQueries({ queryKey: ["profile", updatedProfile.username] });
        router.navigate({
          to: "/perfil/$username",
          params: { username: updatedProfile.username },
          replace: true,
        });
      }
      setIsOpen(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setUsernameError(texts.profile.edit.usernameTaken);
      }
    },
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["me", "experiences"],
    queryFn: () => profileApi.experiences.list(),
    enabled: isOpen && activeTab === "experiences",
  });

  const { data: education = [] } = useQuery({
    queryKey: ["me", "education"],
    queryFn: () => profileApi.education.list(),
    enabled: isOpen && activeTab === "education",
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["me", "certifications"],
    queryFn: () => profileApi.certifications.list(),
    enabled: isOpen && activeTab === "certifications",
  });

  const handleFieldChange = <K extends keyof EditProfileInfoValues>(
    field: K,
    fieldValue: EditProfileInfoValues[K],
  ) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: fieldValue }));
    if (field === "username") setUsernameError("");
  };

  const handleSave = async () => {
    setUsernameError("");
    await updateProfileMutation.mutateAsync(buildProfileUpdate(profile, formValues));
  };

  return (
    <EditProfileShell
      isOpen={isOpen}
      trigger={children}
      activeTab={activeTab}
      isSaving={updateProfileMutation.isPending}
      onOpenChange={setIsOpen}
      onTabChange={setActiveTab}
      onSave={handleSave}
    >
      {activeTab === "info" && (
        <EditProfileInfoForm
          formValues={formValues}
          usernameError={usernameError}
          onChange={handleFieldChange}
        />
      )}

      {activeTab === "experiences" && (
        <ProfileEntryList<Experience, ExperienceInput>
          items={experiences}
          fields={experienceFields}
          currentlyHereKey="currentlyHere"
          onCreate={profileApi.experiences.create}
          onUpdate={profileApi.experiences.update}
          onRemove={profileApi.experiences.remove}
          queryKey={["me", "experiences"]}
          emptyMessage={texts.profile.edit.emptyExperience}
          initialValues={{
            title: "",
            company: "",
            location: "",
            description: "",
            startDate: "",
            endDate: "",
          }}
        />
      )}

      {activeTab === "education" && (
        <ProfileEntryList<Education, EducationInput>
          items={education}
          fields={educationFields}
          currentlyHereKey="currentlyHere"
          onCreate={profileApi.education.create}
          onUpdate={profileApi.education.update}
          onRemove={profileApi.education.remove}
          queryKey={["me", "education"]}
          emptyMessage={texts.profile.edit.emptyEducation}
          initialValues={{
            school: "",
            degree: "",
            field: "",
            description: "",
            startDate: "",
            endDate: "",
          }}
        />
      )}

      {activeTab === "certifications" && (
        <ProfileEntryList<Certification, CertificationInput>
          items={certifications}
          fields={certificationFields}
          onCreate={profileApi.certifications.create}
          onUpdate={profileApi.certifications.update}
          onRemove={profileApi.certifications.remove}
          queryKey={["me", "certifications"]}
          emptyMessage={texts.profile.edit.emptyCertification}
          initialValues={{
            name: "",
            issuer: "",
            description: "",
            issueDate: "",
            expirationDate: "",
            credentialUrl: "",
          }}
        />
      )}
    </EditProfileShell>
  );
}
