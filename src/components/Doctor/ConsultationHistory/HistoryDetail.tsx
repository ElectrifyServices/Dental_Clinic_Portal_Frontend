import React from "react";
import { 
  Phone, Clock, Printer, Activity, Stethoscope, Pill, FileText, Trash2, 
  AlertCircle, IndianRupee, Calendar, Image as ImageIcon, Camera 
} from "lucide-react";

interface HistoryDetailProps {
  record: any;
  onDownloadPDF: (record: any, type: any) => void;
  onDeleteClick: (id: number, e: React.MouseEvent) => void;
}

export function HistoryDetail({ record, onDownloadPDF, onDeleteClick }: HistoryDetailProps) {
  const fmt = (d: any) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const fmtShort = (d: any) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const hasValidPrescriptions = (p?: any[]) =>
    p && p.some(x => x.medicine?.trim() !== "");

  return (
    <div className="p-5 space-y-3">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{record.patientName}</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-600">
              {record.patientId && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">ID: {record.patientId}</span>
              )}
              {record.patientContact && (
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {record.patientContact}</span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmt(record.completedAt)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative group/print">
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Printer className="w-4 h-4" /> Download Report
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-2 hidden group-hover/print:block animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => onDownloadPDF(record, 'CLINICAL')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Clinical Observations
                </button>
                <button
                  onClick={() => onDownloadPDF(record, 'TREATMENT')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-purple-600" /> Treatment Planning
                </button>
                <button
                  onClick={() => onDownloadPDF(record, 'PRESCRIPTION')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
                >
                  <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescription Only
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => onDownloadPDF(record, 'FULL')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-gray-600" /> Full Consultation Summary
                </button>
              </div>
            </div>
            <button
              onClick={(e) => onDeleteClick(record.id, e)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Medical History */}
      {(record.allergies || record.conditions || record.visits || record.lastVisit) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
            <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Medical History</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {record.allergies && (
              <div><span className="text-xs font-medium text-blue-700 block mb-0.5">Allergies</span><span className="text-gray-800">{record.allergies}</span></div>
            )}
            {record.conditions && (
              <div><span className="text-xs font-medium text-blue-700 block mb-0.5">Conditions</span><span className="text-gray-800">{record.conditions}</span></div>
            )}
            {(record.visits || record.lastVisit) && (
              <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-4 text-xs text-gray-600 mt-1 pt-2 border-t border-blue-200">
                {record.visits && <span>🩺 Total Visits: {record.visits}</span>}
                {record.lastVisit && <span>📅 Last Visit: {record.lastVisit}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observations & Diagnosis */}
      {(record.observations || record.diagnosis) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {record.observations && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                <AlertCircle className="w-3 h-3" /> Observations
              </p>
              <p className="text-gray-800 text-sm">{record.observations}</p>
            </div>
          )}
          {record.diagnosis && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                <Stethoscope className="w-3 h-3" /> Diagnosis
              </p>
              <p className="text-gray-800 text-sm">{record.diagnosis}</p>
            </div>
          )}
        </div>
      )}

      {/* Tooth Chart Findings */}
      {record.toothChartState && Object.keys(record.toothChartState).length > 0 && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center">
            <Activity className="w-3 h-3 mr-1.5" /> Tooth Chart Findings
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(record.toothChartState).map(([num, condition]) => (
              <div key={num} className="bg-white border border-blue-200 rounded-full px-3 py-1 text-xs flex items-center gap-2 shadow-sm">
                <span className="font-bold text-blue-600">#{num}</span>
                <span className="text-gray-600">{condition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment Plan */}
      {record.treatmentPlan && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <FileText className="w-3 h-3" /> Treatment Plan
          </p>
          <p className="text-gray-800 text-sm">{record.treatmentPlan}</p>
        </div>
      )}

      {/* Prescriptions */}
      {hasValidPrescriptions(record.prescriptions) && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1 mb-2">
            <Pill className="w-3 h-3" /> Prescriptions
          </p>
          <div className="space-y-1.5">
            {record.prescriptions?.map((p: any) =>
              p.medicine?.trim() ? (
                <div key={p.id} className="bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm">
                  <span className="font-bold text-gray-800">{p.medicine}</span>
                  {p.dosage && <span className="text-gray-500 ml-2">· {p.dosage}</span>}
                  {p.timing && <span className="text-gray-500 ml-2">· {p.timing}</span>}
                  {p.frequency && <span className="text-gray-500 ml-2">· {p.frequency}</span>}
                  {p.duration && <span className="text-gray-500 ml-2">· {p.duration}</span>}
                  {p.qty && <span className="text-gray-500 ml-2">· Qty: {p.qty}</span>}
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {record.consultationNotes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <FileText className="w-3 h-3" /> Additional Notes
          </p>
          <p className="text-gray-800 text-sm">{record.consultationNotes}</p>
        </div>
      )}

      {/* Cost & Follow-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {record.treatmentCost !== undefined && record.treatmentCost > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <IndianRupee className="w-4 h-4" /> Treatment Cost
            </span>
            <span className="text-base font-bold text-gray-900">₹ {record.treatmentCost}</span>
          </div>
        )}
        {record.followUpRequired && record.followUpDate && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="text-sm font-medium text-purple-800">Follow-up:</span>
            <span className="text-sm text-gray-800">{fmtShort(record.followUpDate)}</span>
          </div>
        )}
      </div>

      {/* Clinical Images */}
      {record.images && record.images.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
            <ImageIcon className="w-3 h-3" /> Clinical Images
          </p>
          <div className="flex flex-wrap gap-2">
            {record.images.map((imgUrl: string, idx: number) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Clinical ${idx + 1}`}
                className="w-20 h-20 rounded-lg object-cover border border-gray-300 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(imgUrl, "_blank")}
              />
            ))}
          </div>
        </div>
      )}

      {/* X-Ray Files */}
      {record.xrayFiles && record.xrayFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1 mb-2">
            <Camera className="w-3 h-3" /> X-Ray Reports
          </p>
          <div className="flex flex-wrap gap-2">
            {record.xrayFiles.map((imgUrl: string, idx: number) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`X-Ray ${idx + 1}`}
                className="w-20 h-20 rounded-lg object-cover border border-blue-300 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(imgUrl, "_blank")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
