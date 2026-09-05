import { type ChangeEvent, useCallback, useState } from "react";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";

import {
  ApiError,
  feedApi,
  networkApi,
  profileApi,
  rankingApi,
  recommendationApi,
  type Profile,
  type UpdateProfileInput,
} from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { useMediaUpload } from "@/lib/use-media-upload";
import { texts } from "@/texts";

import { AppContainer } from "@/components/app-container";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { ProfileMainContent, ProfileSidebar } from "@/components/profile/profile-content";
import { ProfileHeader } from "@/components/profile/profile-header";

export const Route = createFileRoute("/perfil/$username")({
  loader: async ({ params }) => {
    try {
      const profile = await profileApi.getByUsername(params.username);
      return { profile };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.profile.name ?? texts.profile.seoFallbackTitle} · ${texts.brand.name}`,
      },
      {
        name: "description",
        content: loaderData?.profile.headline ?? texts.profile.seoFallbackDescription,
      },
    ],
  }),
  notFoundComponent: () => (
    <AppContainer>
      <div className="rounded-2xl border border-border-soft bg-surface-card p-10 text-center">
        <p className="text-[16px] font-light text-text-strong">{texts.profile.notFound}</p>
        <Link
          to="/"
          className="mt-2 inline-block text-[13px] font-light text-primary hover:underline"
        >
          {texts.profile.backHome}
        </Link>
      </div>
    </AppContainer>
  ),
  errorComponent: () => (
    <AppContainer>
      <div className="rounded-2xl border border-border-soft bg-surface-card p-10 text-center">
        <p className="text-[13px] font-light text-text-subtle">{texts.profile.loadError}</p>
      </div>
    </AppContainer>
  ),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile: loaderProfile } = Route.useLoaderData();
  const { user: currentUser, requireAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarUpload = useMediaUpload();
  const bannerUpload = useMediaUpload();
  const [cropImageSource, setCropImageSource] = useState<string | null>(null);
  const [cropPurpose, setCropPurpose] = useState<"AVATAR" | "BANNER" | null>(null);
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false);
  const [recommendationComment, setRecommendationComment] = useState("");

  const { data: liveProfile } = useQuery({
    queryKey: ["profile", loaderProfile.username],
    queryFn: () => profileApi.getByUsername(loaderProfile.username),
    initialData: loaderProfile,
  });

  const profile = liveProfile ?? loaderProfile;
  const isOwnProfile = currentUser?.id === profile.id;

  const { data: connectionStatusDetails } = useQuery({
    queryKey: ["connection-status", profile.id],
    queryFn: () => networkApi.getConnectionStatus(profile.id),
    enabled: !isOwnProfile && Boolean(currentUser),
  });

  const { data: profileFeedResponse } = useQuery({
    queryKey: ["feed", "user", profile.id],
    queryFn: () => feedApi.listByUserId(profile.id),
  });

  const { data: ranking } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => rankingApi.list(10),
  });

  const { data: recommendationsResponse } = useQuery({
    queryKey: ["recommendations", profile.id],
    queryFn: () => recommendationApi.listReceived(profile.id),
  });

  const recommendations = recommendationsResponse ?? [];
  const recommenderProfileQueries = useQueries({
    queries: recommendations.map((recommendation) => ({
      queryKey: ["profile", "by-id", recommendation.recommenderId],
      queryFn: () => profileApi.getById(recommendation.recommenderId),
      staleTime: 60_000,
    })),
  });

  const recommenderProfileByUserId = recommendations.reduce<Record<string, Profile>>(
    (profileByUserId, recommendation, index) => {
      const recommenderProfile = recommenderProfileQueries[index]?.data;
      if (recommenderProfile) {
        profileByUserId[recommendation.recommenderId] = recommenderProfile;
      }
      return profileByUserId;
    },
    {},
  );

  const updateProfileMutation = useMutation({
    mutationFn: (input: Pick<UpdateProfileInput, "avatar" | "banner">) =>
      profileApi.updateCurrent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile", profile.username] });
    },
  });

  const sendConnectionRequestMutation = useMutation({
    mutationFn: () => networkApi.sendConnectionRequest(profile.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-status", profile.id] });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.code === "CONNECTION_ALREADY_REQUESTED") {
        queryClient.invalidateQueries({ queryKey: ["connection-status", profile.id] });
      }
    },
  });

  const createRecommendationMutation = useMutation({
    mutationFn: () => recommendationApi.create(profile.id, { comment: recommendationComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", profile.id] });
      setIsRecommendationDialogOpen(false);
      setRecommendationComment("");
    },
  });

  const handleFileSelect =
    (purpose: "AVATAR" | "BANNER") => (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;
      setCropImageSource(URL.createObjectURL(selectedFile));
      setCropPurpose(purpose);
    };

  const resetCropState = useCallback(() => {
    if (cropImageSource) URL.revokeObjectURL(cropImageSource);
    setCropImageSource(null);
    setCropPurpose(null);
  }, [cropImageSource]);

  const handleCropComplete = useCallback(
    async (croppedBlob: Blob) => {
      if (!cropPurpose) return;
      const mediaUpload = cropPurpose === "AVATAR" ? avatarUpload : bannerUpload;
      const profileField = cropPurpose === "AVATAR" ? "avatar" : "banner";
      const uploadResult = await mediaUpload.upload(
        new File([croppedBlob], "crop.jpg", { type: "image/jpeg" }),
        cropPurpose,
      );
      await updateProfileMutation.mutateAsync({ [profileField]: uploadResult.cdnUrl });
      resetCropState();
    },
    [avatarUpload, bannerUpload, cropPurpose, resetCropState, updateProfileMutation],
  );

  const handleMessage = () => {
    if (!requireAuth()) return;
    navigate({ to: "/mensagens" });
  };

  const handleConnect = () => {
    if (!requireAuth()) return;
    sendConnectionRequestMutation.mutate();
  };

  const connectionStatus = connectionStatusDetails?.status ?? null;
  const connectionLabel =
    connectionStatus === "PENDING"
      ? texts.profile.waitingResponse
      : connectionStatus === "ACCEPTED"
        ? texts.profile.connected
        : texts.profile.connect;
  const isConnectionDisabled =
    sendConnectionRequestMutation.isPending ||
    connectionStatus === "ACCEPTED" ||
    connectionStatus === "PENDING";

  return (
    <AppContainer>
      <div className="space-y-6">
        <ProfileHeader
          user={profile}
          isOwnProfile={isOwnProfile}
          isAvatarUploading={avatarUpload.status === "uploading"}
          isBannerUploading={bannerUpload.status === "uploading"}
          connectionLabel={connectionLabel}
          isConnectionDisabled={isConnectionDisabled}
          onAvatarSelect={handleFileSelect("AVATAR")}
          onBannerSelect={handleFileSelect("BANNER")}
          onMessage={handleMessage}
          onConnect={handleConnect}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ProfileMainContent user={profile} posts={profileFeedResponse?.items ?? []} />
          <ProfileSidebar
            user={profile}
            isOwnProfile={isOwnProfile}
            recommendations={recommendations}
            recommenderProfileByUserId={recommenderProfileByUserId}
            ranking={ranking ?? []}
            isRecommendationDialogOpen={isRecommendationDialogOpen}
            recommendationComment={recommendationComment}
            isRecommendationPending={createRecommendationMutation.isPending}
            onRecommendationDialogOpenChange={setIsRecommendationDialogOpen}
            onRecommendationCommentChange={setRecommendationComment}
            onRecommendationSubmit={() => createRecommendationMutation.mutate()}
          />
        </div>
      </div>
      <div className="h-4 lg:hidden" />

      {cropImageSource && cropPurpose && (
        <ImageCropDialog
          isOpen={Boolean(cropImageSource)}
          onOpenChange={(isOpen) => {
            if (!isOpen) resetCropState();
          }}
          imageSrc={cropImageSource}
          aspect={cropPurpose === "AVATAR" ? 1 : 3}
          title={cropPurpose === "AVATAR" ? texts.profile.cropAvatar : texts.profile.cropCover}
          onCropComplete={handleCropComplete}
        />
      )}
    </AppContainer>
  );
}
