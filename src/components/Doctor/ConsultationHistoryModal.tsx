import React, { useEffect, useState, useMemo } from "react";
import { X, FileText, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { downloadConsultationPDF, PDFReportType } from "../../utils/pdfGenerator";

// Sub-components
import { HistoryList } from "./ConsultationHistory/HistoryList";
import { HistoryDetail } from "./ConsultationHistory/HistoryDetail";
import { DeleteConfirmModal } from "./ConsultationHistory/DeleteConfirmModal";

interface Props {
  onClose: () => void;
  patients?: any[];
}

interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  qty: string;
  instructions?: string;
}

interface ConsultationRecord {
  id: number;
  patientName: string;
  patientId?: string;
  patientContact?: string;
  completedAt: string | number | Date;
  observations?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  prescriptions?: Prescription[];
  consultationNotes?: string;
  treatmentCost?: number;
  followUpRequired?: boolean;
  followUpDate?: string;
  images?: string[];
  allergies?: string;
  conditions?: string;
  visits?: string;
  lastVisit?: string;
  treatmentType?: string;
  patientConcern?: string;
  recommendations?: string;
  requiresTreatment?: boolean;
  treatmentProcedure?: string;
  treatmentTooth?: string;
  treatmentSessions?: number;
  startTreatmentToday?: boolean;
  toothChartState?: Record<number, string>;
  xrayFiles?: string[];
}

const PAGE_SIZE = 8;

export default function ConsultationHistoryModal({ onClose, patients = [] }: Props) {
  const [data, setData] = useState<ConsultationRecord[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterFollowUp, setFilterFollowUp] = useState<"all" | "yes" | "no">("all");
  const [filterSort, setFilterSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("completedConsultations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(Array.isArray(parsed) ? parsed : []);
      } catch { setData([]); }
    } else {
      // Demo data if local storage is empty
      const demoData: ConsultationRecord[] = [
        {
          id: 1, patientName: "Ravi Kumar", patientId: "1776320417563", patientContact: "898988745",
          completedAt: new Date(2026, 3, 15, 10, 30).toISOString(),
          allergies: "Penicillin", conditions: "Diabetes Type 2", visits: "5", lastVisit: "08/01/2024",
          observations: "Patient complains of persistent cough and mild fever since 3 days.",
          diagnosis: "Acute bronchitis, rule out allergic reaction",
          treatmentPlan: "Antibiotics course for 5 days, rest, hydration.",
          prescriptions: [
            { id: "p1", medicine: "Amoxicillin", dosage: "500mg", frequency: "Twice daily", duration: "5 days", qty: "10" },
            { id: "p2", medicine: "Dextromethorphan", dosage: "10ml", frequency: "Thrice daily", duration: "3 days", qty: "1" }
          ],
          consultationNotes: "Patient advised to avoid cold drinks.",
          treatmentCost: 850, followUpRequired: true, followUpDate: "2026-04-20",
          images: ["https://picsum.photos/id/104/200/150", "https://picsum.photos/id/20/200/150"]
        }
      ];
      localStorage.setItem("completedConsultations", JSON.stringify(demoData));
      setData(demoData);
    }
  }, []);

  const handleDownloadPDF = async (record: ConsultationRecord, type: PDFReportType = 'FULL') => {
    await downloadConsultationPDF({
      type,
      patient: {
        id: record.patientId || '—',
        patientName: record.patientName,
        phone: record.patientContact,
        doctorName: (record as any).doctorName,
        treatmentType: record.treatmentType
      },
      consultationData: record,
      toothChartState: record.toothChartState || {}
    });
  };

  const filtered = useMemo(() => {
    let result = [...data];
    const q = search.trim().toLowerCase();
    if (q) result = result.filter(r =>
      r.patientName.toLowerCase().includes(q) ||
      r.patientId?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.patientContact?.includes(q)
    );
    if (filterFollowUp === "yes") result = result.filter(r => r.followUpRequired);
    if (filterFollowUp === "no") result = result.filter(r => !r.followUpRequired);
    result.sort((a, b) => {
      const da = new Date(a.completedAt).getTime();
      const db = new Date(b.completedAt).getTime();
      return filterSort === "newest" ? db - da : da - db;
    });
    return result;
  }, [data, search, filterFollowUp, filterSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filterFollowUp, filterSort]);

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      const updated = data.filter(item => item.id !== deleteConfirmId);
      setData(updated);
      localStorage.setItem("completedConsultations", JSON.stringify(updated));
      setDeleteConfirmId(null);
      if (selectedRecord?.id === deleteConfirmId) setSelectedRecord(null);
    }
  };

  const activeFiltersCount = (filterFollowUp !== "all" ? 1 : 0) + (filterSort !== "newest" ? 1 : 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveMenuId(null)}>
      <div
        className="bg-card w-[900px] max-w-[95vw] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ height: "88vh", fontFamily: "'Inter', system-ui" }}
        onClick={(e) => {
          if (activeMenuId !== null) setActiveMenuId(null);
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-5 py-3 flex justify-between items-center bg-card">
          <div className="flex items-center gap-2">
            {selectedRecord && (
              <button onClick={() => setSelectedRecord(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <FileText className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {selectedRecord ? "Consultation Detail" : "Consultation History"}
              </h2>
              <p className="text-xs text-muted-foreground/60">
                {selectedRecord ? selectedRecord.patientName : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedRecord ? (
            <div className="flex-1 overflow-y-auto">
              <HistoryDetail 
                record={selectedRecord} 
                onDownloadPDF={handleDownloadPDF} 
                onDeleteClick={(id, e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(id);
                }} 
              />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <HistoryList 
                data={data}
                pageData={pageData}
                patients={patients}
                search={search}
                onSearchChange={setSearch}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                filterFollowUp={filterFollowUp}
                onFilterFollowUp={setFilterFollowUp}
                filterSort={filterSort}
                onFilterSort={setFilterSort}
                activeFilters={activeFiltersCount}
                activeMenuId={activeMenuId}
                onSetActiveMenuId={setActiveMenuId}
                onSelectRecord={setSelectedRecord}
                onDownloadPDF={handleDownloadPDF}
                onDeleteClick={(id, e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(id);
                }}
                safePage={safePage}
                PAGE_SIZE={PAGE_SIZE}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {!selectedRecord && filtered.length > PAGE_SIZE && (
          <div className="flex-shrink-0 border-t border-border px-5 py-2.5 flex items-center justify-between bg-card">
            <span className="text-xs text-muted-foreground">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${safePage === p ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted border border-border"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteConfirmId !== null && (
        <DeleteConfirmModal 
          onCancel={() => setDeleteConfirmId(null)} 
          onConfirm={confirmDelete} 
        />
      )}
    </div>
  );
}
