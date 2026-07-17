import { useEffect, useState, useMemo, useRef } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import {
  downloadConsultationPDF,
  PDFReportType,
} from "../../utils/pdfGenerator";
import { Modal, Button, ConfirmModal, toast, Pagination } from "@/components/ui";
import { useConsultationsQuery } from "../../hooks/consultation/useConsultationsQuery";
import { useDeleteConsultationMutation } from "../../hooks/consultation/useDeleteConsultationMutation";
import { useSendConsultationMutation } from "../../hooks/consultation/useSendConsultationMutation";
import { fetchConsultationDetail } from "../../hooks/consultation/useConsultationQuery";
import { useDebounce } from "../../hooks/useDebounce";

// Sub-components
import { HistoryList } from "./ConsultationHistory/HistoryList";
import { HistoryDetail } from "./ConsultationHistory/HistoryDetail";

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


export default function ConsultationHistoryModal({
  onClose,
  patients = [],
}: Props) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [showFilters, setShowFilters] = useState(false);
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [filterSort, setFilterSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const isDeletingRef = useRef(false);

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit: pageSize,
      filters: { status: ['COMPLETED'] }
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    params.sortBy = "created_at";
    params.sortOrder = filterSort === "newest" ? "DESC" : "ASC";

    if (startDateStr) {
      params.startDate = new Date(startDateStr);
    }
    if (endDateStr) {
      const d = new Date(endDateStr);
      d.setHours(23, 59, 59, 999);
      params.endDate = d;
    }

    return params;
  }, [page, debouncedSearch, filterSort, startDateStr, endDateStr]);

  const { data: apiData, isFetching } = useConsultationsQuery(queryParams);

  const data = useMemo(() => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;
    if (Array.isArray(apiData.data)) return apiData.data;
    if (apiData.data && Array.isArray((apiData.data as any).consultations)) return (apiData.data as any).consultations;
    if (Array.isArray((apiData as any).consultations)) return (apiData as any).consultations;
    return [];
  }, [apiData]);

  const handleDownloadPDF = async (
    record: any,
    type: PDFReportType = "FULL",
  ) => {
    const toastId = toast.loading("Generating PDF report...");
    try {
      let consultationData = { ...record };
      
      const detailData = await fetchConsultationDetail(record.id, type);
      if (detailData) {
        consultationData = { ...consultationData, ...detailData };
      }

      const matchedPatient = (patients || []).find(
        (p) =>
          p.id === record.patient_id ||
          p.id === record.patientId ||
          p.id === record.patient?.id ||
          p.patientId === record.patientId
      );

      await downloadConsultationPDF({
        type,
        patient: {
          id: record.patientId || record.patient_id || record.patient?.id || "—",
          patientName: record.patientName || record.patient?.name || "—",
          phone: record.patientContact || record.patient_phone || record.patient?.phone || "—",
          doctorName: (record as any).doctorName || record.doctor?.name,
          treatmentType: record.treatmentType,
          gender: matchedPatient?.gender || record.patient?.gender || "—",
          bloodGroup: matchedPatient?.blood_group || matchedPatient?.bloodGroup || record.patient?.blood_group || record.patient?.bloodGroup || "—",
        },
        consultationData,
        toothChartState: consultationData.toothChartState || {},
      });
      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const { mutateAsync: sendConsultation } = useSendConsultationMutation();

  const handleSendPDF = async (
    record: any,
    type: PDFReportType = "FULL"
  ) => {
    const toastId = toast.loading(`Sending ${type.toLowerCase().replace('_', ' ')} report...`);
    try {
      await sendConsultation({ id: String(record.id), type: type as any });
      toast.success("Report sent successfully!", { id: toastId });
    } catch (err: any) {
      toast.error("Failed to send report: " + (err.message || ""), { id: toastId });
    }
  };

  const totalRecords = useMemo(() => {
    if (!apiData) return 0;
    if (apiData.data?.pagination?.total_items !== undefined) return apiData.data.pagination.total_items;
    if (apiData.pagination?.total_items !== undefined) return apiData.pagination.total_items;
    if (typeof apiData.total === 'number') return apiData.total;
    if (apiData.data && typeof apiData.data.total === 'number') return apiData.data.total;
    if (apiData.data?.pagination && typeof apiData.data.pagination.total === 'number') return apiData.data.pagination.total;
    if (apiData.pagination && typeof apiData.pagination.total === 'number') return apiData.pagination.total;
    return data.length;
  }, [apiData, data]);

  const totalPages = useMemo(() => {
    if (!apiData) return 1;
    if (apiData.data?.pagination?.total_pages !== undefined) return apiData.data.pagination.total_pages;
    if (apiData.pagination?.total_pages !== undefined) return apiData.pagination.total_pages;
    if (typeof apiData.totalPages === 'number') return apiData.totalPages;
    if (apiData.data && typeof apiData.data.totalPages === 'number') return apiData.data.totalPages;
    if (apiData.data?.pagination && typeof apiData.data.pagination.totalPages === 'number') return apiData.data.pagination.totalPages;
    if (apiData.pagination && typeof apiData.pagination.totalPages === 'number') return apiData.pagination.totalPages;
    return Math.max(1, Math.ceil(totalRecords / pageSize));
  }, [apiData, totalRecords, pageSize]);

  const safePage = Math.min(page, totalPages);
  const pageData = data;

  useEffect(() => {
    setPage(1);
  }, [search, startDateStr, endDateStr, filterSort]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const { mutateAsync: deleteConsultation } = useDeleteConsultationMutation();

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        isDeletingRef.current = true;
        setIsDeleting(true);
        await deleteConsultation({ id: String(deleteConfirmId) });
        setDeleteConfirmId(null);
        toast.success("Consultation record deleted successfully");
        // If the deleted record is currently open in detail view, go back to list
        if (selectedRecord?.id === deleteConfirmId) setSelectedRecord(null);
        // History modal stays open — NO onClose() call here
      } catch (error) {
        toast.error("Failed to delete consultation record");
      } finally {
        setIsDeleting(false);
        setTimeout(() => {
          isDeletingRef.current = false;
        }, 100);
      }
    }
  };

  const activeFiltersCount =
    (startDateStr || endDateStr ? 1 : 0) + (filterSort !== "newest" ? 1 : 0);

  return (
    <Modal
      title={selectedRecord ? "Consultation Detail" : "Consultation History"}
      subtitle={
        selectedRecord
          ? selectedRecord.patient?.name
          : `${totalRecords} record${totalRecords !== 1 ? "s" : ""} found`
      }
      onClose={() => {
        if (isDeletingRef.current) return;
        onClose();
      }}
      size="5xl"
      icon={
        selectedRecord ? (
          <Button
            onClick={() => setSelectedRecord(null)}
            className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm hover:bg-primary/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        ) : (
          <FileText className="w-4 h-4" />
        )
      }
      footer={
        !selectedRecord && totalRecords > 0 ? (
          <div className="w-full">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={totalRecords}
              perPage={pageSize}
              onPageChange={setPage}
              onPerPageChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </div>
        ) : null
      }
    >
      <div className="min-h-[500px]" onClick={() => setActiveMenuId(null)}>
        {selectedRecord ? (
          <HistoryDetail
            record={selectedRecord}
            onDownloadPDF={handleDownloadPDF}
            onSendPDF={handleSendPDF}
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
            startDate={startDateStr}
            onStartDateChange={setStartDateStr}
            endDate={endDateStr}
            onEndDateChange={setEndDateStr}
            filterSort={filterSort}
            onFilterSort={setFilterSort}
            activeFilters={activeFiltersCount}
            activeMenuId={activeMenuId}
            onSetActiveMenuId={setActiveMenuId}
            onSelectRecord={setSelectedRecord}
            onDownloadPDF={handleDownloadPDF}
            onSendPDF={handleSendPDF}
            onDeleteClick={(id, e) => {
              e.stopPropagation();
              setDeleteConfirmId(id);
            }}
            safePage={safePage}
            PAGE_SIZE={pageSize}
            isLoading={isFetching}
          />
        )}
      </div>

      {deleteConfirmId !== null && (
        <ConfirmModal
          title="Delete Consultation"
          message="Are you sure you want to delete this consultation record? This action cannot be undone."
          confirmLabel="Yes, Delete"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </Modal>
  );
}
