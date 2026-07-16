import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import React, { useState } from "react";
import { MessageSquare, List, ListOrdered } from "lucide-react";

interface AdditionalNotesProps {
  consultationNotes: string;
  recommendations?: string; // Kept as optional just in case it's passed
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement> | { target: { name: string; value: string } }) => void;
}

export function AdditionalNotes({ consultationNotes, onChange }: AdditionalNotesProps) {
  const [listType, setListType] = useState<"numbered" | "bulleted">("numbered");

  const toggleListType = (type: "numbered" | "bulleted") => {
    setListType(type);
    if (!consultationNotes) {
      // If empty, just set the initial prefix when toggled
      const prefix = type === "numbered" ? "1. " : "• ";
      onChange({ target: { name: "consultationNotes", value: prefix } });
      return;
    }
    
    let newText = consultationNotes;
    if (type === "numbered") {
      let counter = 1;
      newText = newText.split('\n').map(line => {
        if (/^[•\-]\s/.test(line)) {
          return line.replace(/^[•\-]\s/, `${counter++}. `);
        }
        return line;
      }).join('\n');
    } else {
      newText = newText.split('\n').map(line => {
        if (/^\d+\.\s/.test(line)) {
          return line.replace(/^\d+\.\s/, '• ');
        }
        return line;
      }).join('\n');
    }
    onChange({ target: { name: "consultationNotes", value: newText } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;

      const before = val.substring(0, start);
      const after = val.substring(end);
      
      const lines = before.split('\n');
      const lastLine = lines[lines.length - 1];

      let prefix = '';

      if (listType === 'numbered') {
        const match = lastLine.match(/^(\d+)\.\s/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (lastLine === `${num}. `) {
             const newBefore = before.substring(0, before.length - lastLine.length);
             const newValue = newBefore + '\n' + after;
             onChange({ target: { name: target.name, value: newValue } });
             setTimeout(() => {
               target.selectionStart = target.selectionEnd = newBefore.length + 1;
             }, 0);
             return;
          }
          prefix = `\n${num + 1}. `;
        } else {
          prefix = '\n';
        }
      } else {
        const match = lastLine.match(/^([•\-])\s/);
        if (match) {
          const bullet = match[1];
          if (lastLine === `${bullet} `) {
             const newBefore = before.substring(0, before.length - lastLine.length);
             const newValue = newBefore + '\n' + after;
             onChange({ target: { name: target.name, value: newValue } });
             setTimeout(() => {
               target.selectionStart = target.selectionEnd = newBefore.length + 1;
             }, 0);
             return;
          }
          prefix = `\n${bullet} `;
        } else {
          prefix = '\n';
        }
      }

      const newValue = before + prefix + after;
      onChange({ target: { name: target.name, value: newValue } });
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + prefix.length;
      }, 0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!e.target.value.trim()) {
       const prefix = listType === 'numbered' ? '1. ' : '• ';
       onChange({ target: { name: e.target.name, value: prefix } });
       setTimeout(() => {
         e.target.selectionStart = e.target.selectionEnd = prefix.length;
       }, 0);
    }
  };

  return (
    <div className="px-6 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-muted-foreground flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Additional Consultation Notes
        </Label>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleListType("numbered")}
            className={listType === "numbered" ? "bg-background text-primary shadow-sm hover:bg-background hover:text-primary" : "text-muted-foreground"}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleListType("bulleted")}
            className={listType === "bulleted" ? "bg-background text-primary shadow-sm hover:bg-background hover:text-primary" : "text-muted-foreground"}
            title="Bulleted List"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Textarea
        name="consultationNotes"
        value={consultationNotes}
        onChange={onChange as any}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        rows={4}
        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
        placeholder="Type here... Use the list toggle to format."
      />
    </div>
  );
}
