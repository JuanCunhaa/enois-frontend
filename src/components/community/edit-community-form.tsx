import { type ChangeEvent, useRef, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Camera } from "lucide-react";

import { communityApi, type Community } from "@/lib/api";
import { useMediaUpload } from "@/lib/use-media-upload";
import { texts } from "@/texts";
import {
  buildCommunityUpdate,
  type CommunityCropPurpose,
} from "@/utils/community";
import { createObjectUrl, getFirstFile, revokeObjectUrl } from "@/utils/files";

import { ImageCropDialog } from "@/components/image-crop-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditCommunityFormProps = {
  community: Community;
  onClose: () => void;
};

export function EditCommunityForm({ community, onClose }: EditCommunityFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [cover, setCover] = useState(community.cover ?? "");
  const [avatar, setAvatar] = useState(community.avatar ?? "");
  const coverUpload = useMediaUpload();
  const avatarUpload = useMediaUpload();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSource, setCropImageSource] = useState<string | null>(null);
  const [cropPurpose, setCropPurpose] = useState<CommunityCropPurpose | null>(null);

  const cropConfigByPurpose = {
    COVER: {
      upload: coverUpload,
      setValue: setCover,
      aspect: 3,
      title: texts.communities.detail.cropCover,
    },
    AVATAR: {
      upload: avatarUpload,
      setValue: setAvatar,
      aspect: 1,
      title: texts.communities.detail.cropAvatar,
    },
  } as const;

  const resetCropState = () => {
    revokeObjectUrl(cropImageSource);
    setCropImageSource(null);
    setCropPurpose(null);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropPurpose) return;
    const cropConfig = cropConfigByPurpose[cropPurpose];
    const uploadResult = await cropConfig.upload.upload(
      new File([croppedBlob], "crop.jpg", { type: "image/jpeg" }),
      cropPurpose,
    );
    cropConfig.setValue(uploadResult.cdnUrl);
    resetCropState();
  };

  const handleFileSelect =
    (purpose: CommunityCropPurpose) => (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = getFirstFile(event);
      if (!selectedFile) return;
      setCropPurpose(purpose);
      setCropImageSource(createObjectUrl(selectedFile));
    };

  const updateCommunityMutation = useMutation({
    mutationFn: () =>
      communityApi.update(
        community.id,
        buildCommunityUpdate(community, { name, description, cover, avatar }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", community.id] });
      onClose();
    },
  });

  const activeCropConfig = cropPurpose ? cropConfigByPurpose[cropPurpose] : null;

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.communities.create.name}</Label>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {texts.communities.create.description}
        </Label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.communities.detail.cover}</Label>
        {cover ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img src={cover} alt="" className="h-24 w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => coverInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" /> {texts.communities.detail.change}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={() => setCover("")}
              >
                {texts.communities.detail.remove}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full gap-1.5"
            onClick={() => coverInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" /> {texts.communities.detail.addCover}
          </Button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect("COVER")}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.communities.detail.avatar}</Label>
        {avatar ? (
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" /> {texts.communities.detail.change}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={() => setAvatar("")}
              >
                {texts.communities.detail.remove}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full gap-1.5"
            onClick={() => avatarInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" /> {texts.communities.detail.addAvatar}
          </Button>
        )}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect("AVATAR")}
        />
      </div>

      <Button
        className="w-full rounded-full"
        disabled={!name.trim() || updateCommunityMutation.isPending}
        onClick={() => updateCommunityMutation.mutate()}
      >
        {updateCommunityMutation.isPending ? texts.common.saving : texts.common.save}
      </Button>

      {cropImageSource && cropPurpose && activeCropConfig && (
        <ImageCropDialog
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) resetCropState();
          }}
          imageSrc={cropImageSource}
          aspect={activeCropConfig.aspect}
          title={activeCropConfig.title}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
