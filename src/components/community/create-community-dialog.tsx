import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { communityApi } from "@/lib/api";
import { texts } from "@/texts";

import {
  COMMUNITY_TOPICS,
  CreateCommunityButton,
  type CommunityTopic,
} from "@/components/community/community-list-view";
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
import { Textarea } from "@/components/ui/textarea";

type CreateCommunityDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function CreateCommunityDialog({
  isOpen,
  onOpenChange,
}: CreateCommunityDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<CommunityTopic>("TECNOLOGIA");

  const createCommunityMutation = useMutation({
    mutationFn: () =>
      communityApi.create({ name, description, topic: selectedTopic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      onOpenChange(false);
      setName("");
      setDescription("");
      setSelectedTopic("TECNOLOGIA");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <CreateCommunityButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{texts.communities.create.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{texts.communities.create.name}</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 border-transparent bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {texts.communities.create.description}
            </Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="h-10 border-transparent bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{texts.communities.create.topic}</Label>
            <select
              value={selectedTopic}
              onChange={(event) => setSelectedTopic(event.target.value as CommunityTopic)}
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {COMMUNITY_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {texts.communities.topics[topic]}
                </option>
              ))}
            </select>
          </div>
          <Button
            className="w-full rounded-full"
            disabled={
              !name.trim() || !description.trim() || createCommunityMutation.isPending
            }
            onClick={() => createCommunityMutation.mutate()}
          >
            {createCommunityMutation.isPending
              ? texts.common.creating
              : texts.common.create}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
