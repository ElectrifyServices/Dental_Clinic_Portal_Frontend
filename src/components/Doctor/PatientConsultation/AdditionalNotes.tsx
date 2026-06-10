import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
﻿import React from "react";
import { MessageSquare } from "lucide-react";

interface AdditionalNotesProps {
  consultationNotes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function AdditionalNotes({ consultationNotes, onChange }: AdditionalNotesProps) {
  return (
    <div className="px-6">
      <Label className="block text-sm font-semibold text-muted-foreground mb-2">
        <MessageSquare className="w-4 h-4 inline mr-2" />
        Additional Consultation Notes
      </Label>
      <Textarea
        name="consultationNotes"
        value={consultationNotes}
        onChange={onChange}
        rows={3}
        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
        placeholder="Any additional notes or observations..."
      />
    </div>
  );
}
