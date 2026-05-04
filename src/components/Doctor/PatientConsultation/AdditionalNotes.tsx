import React from "react";
import { MessageSquare } from "lucide-react";

interface AdditionalNotesProps {
  consultationNotes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function AdditionalNotes({ consultationNotes, onChange }: AdditionalNotesProps) {
  return (
    <div className="px-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <MessageSquare className="w-4 h-4 inline mr-2" />
        Additional Consultation Notes
      </label>
      <textarea
        name="consultationNotes"
        value={consultationNotes}
        onChange={onChange}
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        placeholder="Any additional notes or observations..."
      />
    </div>
  );
}
