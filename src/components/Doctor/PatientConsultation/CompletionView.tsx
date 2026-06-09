import { Button } from "@/components/ui/Button";
﻿import {
  CheckCircle,
  Activity,
  Stethoscope,
  Pill,
  FileText,
  File,
} from "lucide-react";
import { PDFReportType } from "../../../utils/pdfGenerator";

interface CompletionViewProps {
  onDownloadPDF: (type: PDFReportType) => void;
  onClose: () => void;
}

export function CompletionView({
  onDownloadPDF,
  onClose,
}: CompletionViewProps) {
  return (
    <div className="p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100 ring-8 ring-green-50">
        <CheckCircle className="w-12 h-12" />
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-foreground">
          Consultation Completed!
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          All clinical data has been saved to patient history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Button
          onClick={() => onDownloadPDF("CLINICAL")}
          className="flex items-center justify-between p-5 bg-primary/10 border border-primary/30 rounded-2xl hover:bg-primary/10 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-card rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-bold text-blue-900">Clinical Report</div>
              <div className="text-xs text-primary font-medium">
                Observations & Tooth Chart
              </div>
            </div>
          </div>
          <File className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          onClick={() => onDownloadPDF("TREATMENT")}
          className="flex items-center justify-between p-5 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-100 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-card rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-purple-900">Treatment Plan</div>
              <div className="text-xs text-purple-600 font-medium">
                Procedures & Planning
              </div>
            </div>
          </div>
          <File className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          onClick={() => onDownloadPDF("PRESCRIPTION")}
          className="flex items-center justify-between p-5 bg-emerald-50 border border-emerald-200 rounded-2xl hover:bg-emerald-100 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-card rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-emerald-900">Prescription</div>
              <div className="text-xs text-emerald-600 font-medium">
                Medicines & Instructions
              </div>
            </div>
          </div>
          <File className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          onClick={() => onDownloadPDF("FULL")}
          className="flex items-center justify-between p-5 bg-muted border border-border rounded-2xl hover:bg-muted hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-card rounded-xl shadow-sm group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-left">
              <div className="font-bold text-foreground">Full Report</div>
              <div className="text-xs text-muted-foreground font-medium">
                Complete Consultation File
              </div>
            </div>
          </div>
          <File className="w-5 h-5 text-muted-foreground/60 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="pt-10 border-t border-border">
        <Button
          onClick={onClose}
          className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black hover:shadow-2xl active:scale-95 transition-all shadow-xl"
        >
          Done & Close Window
        </Button>
      </div>
    </div>
  );
}
