import { useEffect, useState, useMemo } from "react";
import { FileText, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
  downloadConsultationPDF,
  PDFReportType,
} from "../../utils/pdfGenerator";
import { Modal, Button } from "@/components/ui";

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
  durationUnit?: string;
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

export default function ConsultationHistoryModal({
  onClose,
  patients = [],
}: Props) {
  const [data, setData] = useState<ConsultationRecord[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<ConsultationRecord | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterFollowUp, setFilterFollowUp] = useState<"all" | "yes" | "no">(
    "all",
  );
  const [filterSort, setFilterSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("completedConsultations");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(Array.isArray(parsed) ? parsed : []);
      } catch {
        setData([]);
      }
    } else {
      // Demo data if local storage is empty
      const demoData: ConsultationRecord[] = [
        {
          id: 1,
          patientName: "Ravi Kumar",
          patientId: "1776320417563",
          patientContact: "898988745",
          completedAt: new Date(2026, 3, 15, 10, 30).toISOString(),
          allergies: "Penicillin",
          conditions: "Diabetes Type 2",
          visits: "5",
          lastVisit: "08/01/2024",
          observations:
            "Patient complains of persistent cough and mild fever since 3 days.",
          diagnosis: "Acute bronchitis, rule out allergic reaction",
          treatmentPlan: "Antibiotics course for 5 days, rest, hydration.",
          prescriptions: [
            {
              id: "p1",
              medicine: "Amoxicillin",
              dosage: "500mg",
              timing: "After meals",
              frequency: "Twice daily",
              duration: "5",
              durationUnit: "Days",
              qty: "10",
            },
            {
              id: "p2",
              medicine: "Dextromethorphan",
              dosage: "10ml",
              timing: "After meals",
              frequency: "Thrice daily",
              duration: "3",
              durationUnit: "Days",
              qty: "1",
            },
          ],
          consultationNotes: "Patient advised to avoid cold drinks.",
          treatmentCost: 850,
          followUpRequired: true,
          followUpDate: "2026-04-20",
          images: [
            "https://picsum.photos/id/104/200/150",
            "https://picsum.photos/id/20/200/150",
          ],
        },
      ];
      localStorage.setItem("completedConsultations", JSON.stringify(demoData));
      setData(demoData);
    }
  }, []);

  const handleDownloadPDF = async (
    record: ConsultationRecord,
    type: PDFReportType = "FULL",
  ) => {
    await downloadConsultationPDF({
      type,
      patient: {
        id: record.patientId || "—",
        patientName: record.patientName,
        phone: record.patientContact,
        doctorName: (record as any).doctorName,
        treatmentType: record.treatmentType,
      },
      consultationData: record,
      toothChartState: record.toothChartState || {},
    });
  };

  const filtered = useMemo(() => {
    let result = [...data];
    const q = search.trim().toLowerCase();
    if (q)
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.patientId?.toLowerCase().includes(q) ||
          r.diagnosis?.toLowerCase().includes(q) ||
          r.patientContact?.includes(q),
      );
    if (filterFollowUp === "yes")
      result = result.filter((r) => r.followUpRequired);
    if (filterFollowUp === "no")
      result = result.filter((r) => !r.followUpRequired);
    result.sort((a, b) => {
      const da = new Date(a.completedAt).getTime();
      const db = new Date(b.completedAt).getTime();
      return filterSort === "newest" ? db - da : da - db;
    });
    return result;
  }, [data, search, filterFollowUp, filterSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, filterFollowUp, filterSort]);

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      const updated = data.filter((item) => item.id !== deleteConfirmId);
      setData(updated);
      localStorage.setItem("completedConsultations", JSON.stringify(updated));
      setDeleteConfirmId(null);
      if (selectedRecord?.id === deleteConfirmId) setSelectedRecord(null);
    }
  };

  const activeFiltersCount =
    (filterFollowUp !== "all" ? 1 : 0) + (filterSort !== "newest" ? 1 : 0);

  return (
    <Modal
      title={selectedRecord ? "Consultation Detail" : "Consultation History"}
      subtitle={
        selectedRecord
          ? selectedRecord.patientName
          : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} found`
      }
      onClose={onClose}
      size="5xl"
      icon={
        selectedRecord ? (
          <button
            onClick={() => setSelectedRecord(null)}
            className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm hover:bg-primary/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <FileText className="w-4 h-4" />
        )
      }
      footer={
        !selectedRecord && filtered.length > PAGE_SIZE ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={safePage === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="h-8 w-8 p-0 text-[10px] font-bold"
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="min-h-[500px]" onClick={() => setActiveMenuId(null)}>
        {selectedRecord ? (
          <HistoryDetail
            record={selectedRecord}
            onDownloadPDF={handleDownloadPDF}
            onDeleteClick={(id, e) => {
              e.stopPropagation();
              setDeleteConfirmId(id);
            }}
          />
        ) : (
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
        )}
      </div>

      {deleteConfirmId !== null && (
        <DeleteConfirmModal
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={confirmDelete}
        />
      )}
    </Modal>
  );
}
