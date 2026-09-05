import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { texts } from "@/texts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type ProfileEntryField = {
  key: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
};

type ProfileEntryListProps<T extends { id: string }, TInput extends object> = {
  items: T[];
  fields: ProfileEntryField[];
  currentlyHereKey?: string;
  onCreate: (input: TInput) => Promise<T>;
  onUpdate: (itemId: string, input: TInput) => Promise<T>;
  onRemove: (itemId: string) => Promise<void>;
  queryKey: readonly unknown[];
  emptyMessage: string;
  initialValues: Record<string, string>;
};

export function ProfileEntryList<T extends { id: string }, TInput extends object>({
  items,
  fields,
  currentlyHereKey,
  onCreate,
  onUpdate,
  onRemove,
  queryKey,
  emptyMessage,
  initialValues,
}: ProfileEntryListProps<T, TInput>) {
  const queryClient = useQueryClient();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({ ...initialValues });
  const [isCurrentlyHere, setIsCurrentlyHere] = useState(false);

  const resetFormState = () => {
    setEditingItemId(null);
    setFormValues({ ...initialValues });
    setIsCurrentlyHere(false);
  };

  const createItemMutation = useMutation({
    mutationFn: (input: TInput) => onCreate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      resetFormState();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: TInput }) =>
      onUpdate(itemId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      resetFormState();
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => onRemove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const handleEditStart = (item: T) => {
    setEditingItemId(item.id);
    setFormValues(
      Object.fromEntries(
        fields.map((field) => [
          field.key,
          String((item as Record<string, unknown>)[field.key] ?? ""),
        ]),
      ),
    );
    if (currentlyHereKey) {
      setIsCurrentlyHere(Boolean((item as Record<string, unknown>)[currentlyHereKey]));
    }
  };

  const handleSubmit = async () => {
    const inputValues: Record<string, unknown> = { ...formValues };
    if (currentlyHereKey) {
      inputValues[currentlyHereKey] = isCurrentlyHere;
      if (isCurrentlyHere) inputValues.endDate = null;
    }

    const input = inputValues as unknown as TInput;
    if (editingItemId && editingItemId !== "__new__") {
      await updateItemMutation.mutateAsync({ itemId: editingItemId, input });
      return;
    }
    await createItemMutation.mutateAsync(input);
  };

  const isSubmitting = createItemMutation.isPending || updateItemMutation.isPending;
  const isFormVisible = editingItemId !== null;

  return (
    <div className="space-y-4">
      {isFormVisible ? (
        <div className="space-y-3 rounded-xl border border-border-soft p-4">
          {fields.map((field) => (
            <ProfileEntryFieldControl key={field.key} label={field.label}>
              {field.multiline ? (
                <Textarea
                  value={formValues[field.key] ?? ""}
                  onChange={(event) =>
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      [field.key]: event.target.value,
                    }))
                  }
                  rows={2}
                  className="h-10 border-border-soft bg-surface-1"
                />
              ) : (
                <Input
                  type={field.type ?? "text"}
                  value={formValues[field.key] ?? ""}
                  onChange={(event) =>
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="h-10 border-border-soft bg-surface-1"
                />
              )}
            </ProfileEntryFieldControl>
          ))}

          {currentlyHereKey && (
            <label className="flex items-center gap-2 text-[13px] font-light text-text-strong">
              <Switch checked={isCurrentlyHere} onCheckedChange={setIsCurrentlyHere} />
              {texts.profile.edit.currentlyHere}
            </label>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? texts.common.saving : texts.common.save}
            </Button>
            <Button size="sm" variant="outline" onClick={resetFormState}>
              {texts.common.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <p className="py-8 text-center text-[13px] font-light text-text-subtle">
              {emptyMessage}
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 text-[13px] font-light">
                    <p className="break-words text-text-strong">
                      {String((item as Record<string, unknown>)[fields[0].key] ?? "")}
                    </p>
                    <p className="break-words text-text-subtle">
                      {String((item as Record<string, unknown>)[fields[1]?.key] ?? "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditStart(item)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2"
                    >
                      <Pencil className="h-4 w-4 text-text-subtle" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItemMutation.mutate(item.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5"
            onClick={() => {
              setEditingItemId("__new__");
              setFormValues({ ...initialValues });
              setIsCurrentlyHere(false);
            }}
          >
            <Plus className="h-4 w-4" /> {texts.common.add}
          </Button>
        </>
      )}
    </div>
  );
}

type ProfileEntryFieldControlProps = {
  label: string;
  children: React.ReactNode;
};

function ProfileEntryFieldControl({ label, children }: ProfileEntryFieldControlProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-light text-text-subtle">{label}</Label>
      {children}
    </div>
  );
}
