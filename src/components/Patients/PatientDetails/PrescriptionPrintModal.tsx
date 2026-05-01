import React from "react";
import { X, Printer, Plus, Download, FileText } from "lucide-react";

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
  customSections,
  setCustomSections,
  onPrint
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Printer className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Prescription Preview & Edit</h3>
              <p className="text-xs text-blue-100">Review and finalize clinical details before printing</p>
            </div>
            <div className="flex bg-blue-700/50 p-1 rounded-xl border border-blue-400/30 ml-4">
              <button
                onClick={() => setPrintLanguage("en")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${printLanguage === "en" ? "bg-white text-blue-600 shadow-lg" : "text-blue-100 hover:text-white"}`}
              >
                ENGLISH
              </button>
              <button
                onClick={() => setPrintLanguage("gu")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${printLanguage === "gu" ? "bg-white text-blue-600 shadow-lg" : "text-blue-100 hover:text-white"}`}
              >
                ગુજરાતી (GUJ)
              </button>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form inputs would go here - simplified for this extraction */}
            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">Clinical Vitals</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">BP (mmHg)</label>
                  <input type="text" value={previewData.bp} onChange={(e) => setPreviewData({ ...previewData, bp: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (Kg)</label>
                  <input type="text" value={previewData.weight} onChange={(e) => setPreviewData({ ...previewData, weight: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinical Complaints / Observation</label>
                <textarea rows={3} value={previewData.complaints} onChange={(e) => setPreviewData({ ...previewData, complaints: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">Diagnosis & Advice</h4>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Diagnosis</label>
                <input type="text" value={previewData.diagnosis} onChange={(e) => setPreviewData({ ...previewData, diagnosis: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Advice / Instructions</label>
                <textarea rows={3} value={previewData.advice} onChange={(e) => setPreviewData({ ...previewData, advice: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <button onClick={onPrint} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                <Printer className="w-6 h-6" /> Generate & Print Prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
