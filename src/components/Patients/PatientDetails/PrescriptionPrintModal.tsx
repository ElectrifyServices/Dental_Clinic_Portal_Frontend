import React from "react";
import { Printer } from "lucide-react";
import { Modal, Button } from "@/components/ui";

interface PrescriptionPrintModalProps {
  show: boolean;
  onClose: () => void;
  printLanguage: "en" | "gu";
  setPrintLanguage: (lang: "en" | "gu") => void;
  previewData: any;
  setPreviewData: (data: any) => void;
  customSections: any[];
  setCustomSections: (sections: any[]) => void;
  onPrint: () => void;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  show,
  onClose,
  printLanguage,
  setPrintLanguage,
  previewData,
  setPreviewData,
  onPrint,
}) => {
  if (!show) return null;

  return (
    <Modal
      title="Prescription Preview & Edit"
      subtitle="Review and finalize clinical details before printing"
      onClose={onClose}
      size="5xl"
      icon={<Printer className="w-5 h-5" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onPrint}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Printer className="w-4 h-4" /> Generate & Print
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex bg-muted p-1 rounded-xl w-fit">
          <button
            onClick={() => setPrintLanguage("en")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${printLanguage === "en" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            ENGLISH
          </button>
          <button
            onClick={() => setPrintLanguage("gu")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${printLanguage === "gu" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            ગુજરાતી (GUJ)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
              Clinical Vitals
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  BP (mmHg)
                </label>
                <input
                  type="text"
                  value={previewData.bp}
                  onChange={(e) =>
                    setPreviewData({ ...previewData, bp: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Weight (Kg)
                </label>
                <input
                  type="text"
                  value={previewData.weight}
                  onChange={(e) =>
                    setPreviewData({ ...previewData, weight: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Clinical Complaints / Observation
              </label>
              <textarea
                rows={3}
                value={previewData.complaints}
                onChange={(e) =>
                  setPreviewData({ ...previewData, complaints: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
              Diagnosis & Advice
            </h4>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Diagnosis
              </label>
              <input
                type="text"
                value={previewData.diagnosis}
                onChange={(e) =>
                  setPreviewData({ ...previewData, diagnosis: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Advice / Instructions
              </label>
              <textarea
                rows={3}
                value={previewData.advice}
                onChange={(e) =>
                  setPreviewData({ ...previewData, advice: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
