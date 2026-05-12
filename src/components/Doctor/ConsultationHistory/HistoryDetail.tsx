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
      <div className="bg-gradient-to-r from-primary/10 to-white border border-primary/20 rounded-xl px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">{record.patientName}</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              {record.patientId && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">ID: {record.patientId}</span>
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
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Printer className="w-4 h-4" /> Download Report
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-30 py-2 hidden group-hover/print:block animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => onDownloadPDF(record, 'CLINICAL')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-primary/10 flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-primary" /> Clinical Observations
                </button>
                <button
                  onClick={() => onDownloadPDF(record, 'TREATMENT')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-purple-50 flex items-center gap-2"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-purple-600" /> Treatment Planning
                </button>
                <button
                  onClick={() => onDownloadPDF(record, 'PRESCRIPTION')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-emerald-50 flex items-center gap-2"
                >
                  <Pill className="w-3.5 h-3.5 text-emerald-600" /> Prescription Only
                </button>
                <div className="h-px bg-muted my-1" />
                <button
                  onClick={() => onDownloadPDF(record, 'FULL')}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" /> Full Consultation Summary
                </button>
              </div>
            </div>
            <button
              onClick={(e) => onDeleteClick(record.id, e)}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-destructive px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Medical History */}
      {(record.allergies || record.conditions || record.visits || record.lastVisit) && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-primary" />
            <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Medical History</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {record.allergies && (
              <div><span className="text-xs font-medium text-primary block mb-0.5">Allergies</span><span className="text-foreground">{record.allergies}</span></div>
            )}
            {record.conditions && (
              <div><span className="text-xs font-medium text-primary block mb-0.5">Conditions</span><span className="text-foreground">{record.conditions}</span></div>
            )}
            {(record.visits || record.lastVisit) && (
              <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-4 text-xs text-muted-foreground mt-1 pt-2 border-t border-primary/30">
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
            <div className="bg-muted border border-border rounded-xl p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1.5">
                <AlertCircle className="w-3 h-3" /> Observations
              </p>
              <p className="text-foreground text-sm">{record.observations}</p>
            </div>
          )}
          {record.diagnosis && (
            <div className="bg-muted border border-border rounded-xl p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1.5">
                <Stethoscope className="w-3 h-3" /> Diagnosis
              </p>
              <p className="text-foreground text-sm">{record.diagnosis}</p>
            </div>
          )}
        </div>
      )}

      {/* Tooth Chart Findings */}
      {record.toothChartState && Object.keys(record.toothChartState).length > 0 && (
        <div className="bg-primary/50 border border-primary/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center">
            <Activity className="w-3 h-3 mr-1.5" /> Tooth Chart Findings
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(record.toothChartState as Record<string, string>).map(
              ([num, condition]) => (
                <div
                  key={num}
                  className="bg-card border border-primary/30 rounded-full px-3 py-1 text-xs flex items-center gap-2 shadow-sm"
                >
                  <span className="font-bold text-primary">#{num}</span>
                  <span className="text-muted-foreground">{condition}</span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Treatment Plan */}
      {record.treatmentPlan && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <FileText className="w-3 h-3" /> Treatment Plan
          </p>
          <p className="text-foreground text-sm">{record.treatmentPlan}</p>
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
                <div key={p.id} className="bg-card border border-indigo-100 rounded-lg px-3 py-2 text-sm">
                  <span className="font-bold text-foreground">{p.medicine}</span>
                  {p.dosage && <span className="text-muted-foreground ml-2">· {p.dosage}</span>}
                  {p.timing && <span className="text-muted-foreground ml-2">· {p.timing}</span>}
                  {p.frequency && <span className="text-muted-foreground ml-2">· {p.frequency}</span>}
                  {p.duration && <span className="text-muted-foreground ml-2">· {p.duration}</span>}
                  {p.qty && <span className="text-muted-foreground ml-2">· Qty: {p.qty}</span>}
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
          <p className="text-foreground text-sm">{record.consultationNotes}</p>
        </div>
      )}

      {/* Cost & Follow-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {record.treatmentCost !== undefined && record.treatmentCost > 0 && (
          <div className="bg-muted border border-border rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <IndianRupee className="w-4 h-4" /> Treatment Cost
            </span>
            <span className="text-base font-bold text-foreground">₹ {record.treatmentCost}</span>
          </div>
        )}
        {record.followUpRequired && record.followUpDate && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="text-sm font-medium text-purple-800">Follow-up:</span>
            <span className="text-sm text-foreground">{fmtShort(record.followUpDate)}</span>
          </div>
        )}
      </div>

      {/* Clinical Images */}
      {record.images && record.images.length > 0 && (
        <div className="bg-muted border border-border rounded-xl p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-2">
            <ImageIcon className="w-3 h-3" /> Clinical Images
          </p>
          <div className="flex flex-wrap gap-2">
            {record.images.map((imgUrl: string, idx: number) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Clinical ${idx + 1}`}
                className="w-20 h-20 rounded-lg object-cover border border-border cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(imgUrl, "_blank")}
              />
            ))}
          </div>
        </div>
      )}

      {/* X-Ray Files */}
      {record.xrayFiles && record.xrayFiles.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1 mb-2">
            <Camera className="w-3 h-3" /> X-Ray Reports
          </p>
          <div className="flex flex-wrap gap-2">
            {record.xrayFiles.map((imgUrl: string, idx: number) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`X-Ray ${idx + 1}`}
                className="w-20 h-20 rounded-lg object-cover border border-primary/50 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(imgUrl, "_blank")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
