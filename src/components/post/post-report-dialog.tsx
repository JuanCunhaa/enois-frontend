import { useState } from "react";

import { REPORT_REASONS, reportApi } from "@/lib/api";
import type { ReportReason } from "@/lib/api";
import { texts } from "@/texts";
import { formatEnumValue } from "@/utils/string";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PostReportDialogProps = {
  postId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function PostReportDialog({ postId, isOpen, onOpenChange }: PostReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason>("SPAM");
  const [reportDescription, setReportDescription] = useState("");

  const handleSubmit = async () => {
    try {
      await reportApi.create({
        targetId: postId,
        targetType: "POST",
        reason: selectedReason,
        description: reportDescription || undefined,
      });
      onOpenChange(false);
      setReportDescription("");
    } catch {
      // Keep the existing silent-failure behavior.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-light">{texts.posts.report.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-light text-text-subtle">
              {texts.posts.report.reason}
            </Label>
            <select
              value={selectedReason}
              onChange={(event) => setSelectedReason(event.target.value as ReportReason)}
              className="flex h-10 w-full rounded-md border border-border-soft bg-muted px-3 py-2 text-[13px] font-light text-text-strong"
            >
              {REPORT_REASONS.map((reportReason) => (
                <option key={reportReason} value={reportReason}>
                  {formatEnumValue(reportReason)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-light text-text-subtle">
              {texts.posts.report.description}
            </Label>
            <Textarea
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              rows={3}
              className="h-10 border-transparent bg-muted text-[13px] font-light"
            />
          </div>

          <Button className="w-full rounded-full" onClick={handleSubmit}>
            {texts.posts.report.action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
