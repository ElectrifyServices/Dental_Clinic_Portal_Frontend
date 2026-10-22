/* eslint-disable react-refresh/only-export-components */
import type { ApiAny } from "../../types/api";
import React, { useState, useMemo } from "react";
import {
  Download,
  FileText,
  Calendar,
  Stethoscope,
  Camera,
  Pill,
  CreditCard,
  FlaskConical,
  ScanLine,
  ClipboardList,
  ExternalLink,
  Phone,
  LayoutList,
  Clock,
  Layers,
} from "lucide-react";
import {
  Modal,
  Badge,
  Button,
  DataTable,
  SearchInput,
  Loading,
} from "@/components/ui";
import { useEMRListQuery } from "../../hooks/emr/useEMRListQuery";
import { usePatientDetailQuery } from "../../hooks/patients/usePatientDetailQuery";
import { useStaffData } from "../../hooks/useStaffData";
import { useDebounce } from "../../hooks/useDebounce";
import { downloadMedicalRecordPDF } from "../../utils/pdfGenerator";
import { extractDoctorName, formatDoctorDisplayName } from "../../utils/doctorUtils";

interface EMRViewerProps {
  record: ApiAny;
  onClose: () => void;
}

const CATEGORY_META: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    iconBg: string;
    icon: React.ReactNode;
    variant: ApiAny;
  }
> = {
  consultation: {
    label: "Consultation",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-l-blue-500",
    iconBg: "bg-blue-100",
    icon: <Stethoscope className="w-4 h-4 text-blue-600" />,
    variant: "blue",
  },
  prescription: {
    label: "Prescription",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-100",
    icon: <Pill className="w-4 h-4 text-emerald-600" />,
    variant: "green",
  },
  lab_report: {
    label: "Lab Report",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-l-violet-500",
    iconBg: "bg-violet-100",
    icon: <FlaskConical className="w-4 h-4 text-violet-600" />,
    variant: "violet",
  },
  x_ray: {
    label: "X-Ray",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-l-amber-500",
    iconBg: "bg-amber-100",
    icon: <ScanLine className="w-4 h-4 text-amber-600" />,
    variant: "amber",
  },
  treatment_note: {
    label: "Treatment Note",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-l-indigo-500",
    iconBg: "bg-indigo-100",
    icon: <ClipboardList className="w-4 h-4 text-indigo-600" />,
    variant: "indigo",
  },
  billing_record: {
    label: "Billing Record",
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-l-slate-400",
    iconBg: "bg-slate-100",
    icon: <CreditCard className="w-4 h-4 text-slate-600" />,
    variant: "gray",
  },
  appointment_visit: {
    label: "Appointment Visit",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-l-teal-500",
    iconBg: "bg-teal-100",
    icon: <Calendar className="w-4 h-4 text-teal-600" />,
    variant: "green",
  },
};

const getCategoryMeta = (category: string) => {
  const key = (category || "consultation")
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
  return (
    CATEGORY_META[key] || {
      label: category ? category.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Record",
      color: "text-primary",
      bg: "bg-primary/5",
      border: "border-l-primary",
      iconBg: "bg-primary/10",
      icon: <FileText className="w-4 h-4 text-primary" />,
      variant: "blue",
    }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF Generator — unified clinic letterhead, details grid & brand footer
// ─────────────────────────────────────────────────────────────────────────────
export async function generateEMRPDF(
  patientName: string,
  timeline: ApiAny[],
  recordType?: string,
  logoUrl?: string | null,
  patientData?: ApiAny
) {
  await downloadMedicalRecordPDF({
    patientName,
    timeline,
    recordType,
    logoUrl,
    patient: patientData,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Attachment Lightbox Preview
// ─────────────────────────────────────────────────────────────────────────────
function AttachmentPreview({
  url,
  fileName,
  onClose,
}: {
  url: string;
  fileName?: string;
  onClose: () => void;
}) {
  const ext = (url.split(".").pop() || "").toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground truncate max-w-md">
              {fileName || "Attachment Preview"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download={fileName || "attachment"}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Open full file"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm font-bold px-2.5"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="overflow-auto p-4 flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <img src={url} alt={fileName || "Attachment"} className="max-h-[75vh] w-auto object-contain rounded-lg" />
          ) : (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">{fileName}</p>
              <p className="text-xs text-muted-foreground mb-4">This file type cannot be previewed directly.</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main EMR Viewer Component
// ─────────────────────────────────────────────────────────────────────────────
export function EMRViewer({ record, onClose }: EMRViewerProps) {
  if (!record) return null;
  return <EMRViewerContent record={record} onClose={onClose} />;
}

function EMRViewerContent({ record, onClose }: EMRViewerProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");
  const [_isDownloading, _setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 300);

  const effectivePatientId = record.patientId || record.patient_id || record.patient?.id || "";
  const { data: patientDetail } = usePatientDetailQuery(effectivePatientId, !!effectivePatientId);
  const { staffMembers } = useStaffData();

  const queryParams: ApiAny = {
    all: true,
    page: 1,
    limit: 1000,
    filters: { patient_id: [effectivePatientId] },
  };

  const { data: apiListData, isLoading } = useEMRListQuery(queryParams, {
    refetchOnMount: "always",
  });

  const detailedRecord = useMemo(() => {
    let rawList: ApiAny[] = [];
    if (apiListData) {
      if (Array.isArray(apiListData)) rawList = apiListData;
      else if (Array.isArray((apiListData as ApiAny).data?.data)) rawList = (apiListData as ApiAny).data.data;
      else if (Array.isArray((apiListData as ApiAny).data)) rawList = (apiListData as ApiAny).data;
      else if (Array.isArray((apiListData as ApiAny).responseObject?.data?.data)) rawList = (apiListData as ApiAny).responseObject.data.data;
      else if (Array.isArray((apiListData as ApiAny).responseObject?.data)) rawList = (apiListData as ApiAny).responseObject.data;
      else if (Array.isArray((apiListData as ApiAny).responseObject)) rawList = (apiListData as ApiAny).responseObject;
    }

    const effectiveList = rawList.length > 0 ? rawList : (record.timeline || []);
    const latestItem = effectiveList[0] || record;

    const patientObj =
      effectiveList.find(
        (item: ApiAny) =>
          item.patient && (item.patient.phone || item.patient.patient_code || item.patient.patientCode)
      )?.patient ||
      latestItem.patient ||
      record.patient ||
      {};

    const patientName = patientDetail?.name || patientObj?.name || record.patientName || "—";
    const patientId = patientDetail?.id || patientObj?.id || record.patientId || "—";
    const patientCode =
      patientDetail?.patient_code ||
      patientDetail?.patientCode ||
      patientObj?.patient_code ||
      patientObj?.patientCode ||
      record.patient_code ||
      record.patientCode ||
      null;
    const phone =
      patientDetail?.phone ||
      patientObj?.phone ||
      record.phone ||
      "—";
    const gender = patientDetail?.gender || patientObj?.gender || record.gender;
    const dateOfBirth =
      patientDetail?.dateOfBirth ||
      patientDetail?.date_of_birth ||
      patientObj?.date_of_birth ||
      record.date_of_birth;
    const countryCode =
      patientDetail?.country_code ||
      patientDetail?.countryCode ||
      patientObj?.country_code ||
      "+91";

    const extractAttachments = (item: ApiAny) => {
      const atts = item.attachments;
      if (!Array.isArray(atts)) return [];
      return atts
        .map((a: ApiAny) => {
          if (typeof a === "string") return { url: a, name: a.split("/").pop() || "File" };
          return {
            url: a.file_url || a.url || a.file_path || "",
            name: a.file_name || a.name || (a.file_url || "").split("/").pop() || "File",
            type: a.file_type || a.type || "",
            size: a.file_size || a.size,
          };
        })
        .filter((a: ApiAny) => a.url);
    };

    // Find the primary attending doctor from the latest record with a doctor, or fallback to record
    const latestDoctorRecord = effectiveList.find((item: ApiAny) => extractDoctorName(item, staffMembers));
    const headerDoctorName =
      extractDoctorName(latestItem, staffMembers) ||
      (latestDoctorRecord ? extractDoctorName(latestDoctorRecord, staffMembers) : "") ||
      formatDoctorDisplayName(record.doctorName || record.lastDoctorName);

    return {
      ...record,
      patientName,
      patientId,
      patientCode,
      phone,
      gender,
      date_of_birth: dateOfBirth,
      country_code: countryCode,
      patient: {
        ...patientObj,
        ...patientDetail,
        id: patientId,
        name: patientName,
        phone,
        patient_code: patientCode,
      },
      date: latestItem.created_at || latestItem.date || record.date || new Date().toISOString(),
      type: (latestItem.record_type || latestItem.type || record.type || "consultation").toLowerCase(),
      title: latestItem.title || record.title || "—",
      content: latestItem.content || record.content || "—",
      doctorName: headerDoctorName || "—",
      timeline: effectiveList.map((item: ApiAny) => ({
        id: item.id,
        title: item.title || "Record Entry",
        content: item.content || "—",
        date: item.created_at || item.date || new Date().toISOString(),
        category: (item.record_type || item.type || "consultation").toLowerCase(),
        doctorName: extractDoctorName(item, staffMembers) || "—",
        attachments: extractAttachments(item),
      })),
    };
  }, [apiListData, record, patientDetail, staffMembers]);

  const allTimeline = useMemo(() => detailedRecord.timeline || [], [detailedRecord.timeline]);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allTimeline.length };
    allTimeline.forEach((t: ApiAny) => {
      const key = (t.category || "consultation").toLowerCase().replace(/[-_\s]+/g, "");
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [allTimeline]);

  const categoryTabs = useMemo(
    () =>
      [
        { key: "all", label: "All History", count: allTimeline.length, icon: <Layers className="w-3.5 h-3.5" /> },
        { key: "appointment_visit", label: "Visits", count: categoryCounts["appointmentvisit"] || 0, icon: <Calendar className="w-3.5 h-3.5" /> },
        { key: "consultation", label: "Consultations", count: categoryCounts["consultation"] || 0, icon: <Stethoscope className="w-3.5 h-3.5" /> },
        { key: "prescription", label: "Prescriptions", count: categoryCounts["prescription"] || 0, icon: <Pill className="w-3.5 h-3.5" /> },
        { key: "treatment_note", label: "Treatment Notes", count: categoryCounts["treatmentnote"] || 0, icon: <ClipboardList className="w-3.5 h-3.5" /> },
        { key: "billing_record", label: "Billing & Invoices", count: categoryCounts["billingrecord"] || 0, icon: <CreditCard className="w-3.5 h-3.5" /> },
        { key: "lab_report", label: "Lab Reports", count: categoryCounts["labreport"] || 0, icon: <FlaskConical className="w-3.5 h-3.5" /> },
        { key: "x_ray", label: "X-Rays", count: categoryCounts["xray"] || 0, icon: <ScanLine className="w-3.5 h-3.5" /> },
      ].filter((tab) => tab.key === "all" || tab.count > 0),
    [allTimeline.length, categoryCounts]
  );

  // Filtered entries by category and search
  const filteredTimeline = useMemo(() => {
    let list = allTimeline;
    if (activeCategory !== "all") {
      const normActive = activeCategory.toLowerCase().replace(/[-_\s]+/g, "");
      list = list.filter((item: ApiAny) => {
        const normCat = (item.category || "").toLowerCase().replace(/[-_\s]+/g, "");
        return normCat === normActive;
      });
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (item: ApiAny) =>
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.content && item.content.toLowerCase().includes(q)) ||
          (item.doctorName && item.doctorName.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allTimeline, activeCategory, debouncedSearch]);

  // Grouped by month/year for timeline view
  const groupedTimeline = useMemo(() => {
    const groups: { monthYear: string; items: ApiAny[] }[] = [];
    const map: Record<string, ApiAny[]> = {};

    filteredTimeline.forEach((item: ApiAny) => {
      let key = "Earlier Records";
      if (item.date) {
        try {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          }
        } catch {
          key = "Records";
        }
      }
      if (!map[key]) {
        map[key] = [];
        groups.push({ monthYear: key, items: map[key] });
      }
      map[key].push(item);
    });

    return groups;
  }, [filteredTimeline]);

  // Download PDF (currently commented out in UI)
  const _handleDownload = async () => {
    _setIsDownloading(true);
    try {
      const patientPhone =
        (patientDetail?.phone && patientDetail.phone !== "—" ? patientDetail.phone : null) ||
        (detailedRecord.phone && detailedRecord.phone !== "—" ? detailedRecord.phone : undefined);

      await generateEMRPDF(
        detailedRecord.patientName,
        allTimeline,
        detailedRecord.type,
        null,
        {
          id: detailedRecord.patientId || detailedRecord.patient?.id,
          patientName: detailedRecord.patientName,
          name: detailedRecord.patientName,
          phone: patientPhone,
          country_code: detailedRecord.country_code || patientDetail?.country_code || "+91",
          gender: detailedRecord.gender || patientDetail?.gender,
          date_of_birth: detailedRecord.date_of_birth || patientDetail?.dateOfBirth,
          patient_code: displayPatientCode,
          patientCode: displayPatientCode,
        }
      );
    } finally {
      _setIsDownloading(false);
    }
  };

  // Structured Columns for Table View
  const tableColumns = useMemo(
    () => [
      {
        key: "date",
        header: "Date & Time",
        className: "w-[130px]",
        render: (item: ApiAny) => {
          const d = item.date ? new Date(item.date) : null;
          const valid = d && !isNaN(d.getTime());
          return (
            <div className="whitespace-nowrap">
              <span className="font-bold text-xs text-foreground block">
                {valid ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium block">
                {valid ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>
          );
        },
      },
      {
        key: "category",
        header: "Type",
        className: "w-[160px]",
        render: (item: ApiAny) => {
          const meta = getCategoryMeta(item.category);
          return (
            <Badge
              variant={meta.variant}
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="[&_svg]:w-3 [&_svg]:h-3">{meta.icon}</span>
              {meta.label}
            </Badge>
          );
        },
      },
      {
        key: "title",
        header: "Title & Doctor",
        className: "w-[240px]",
        render: (item: ApiAny) => {
          const doc =
            item.doctorName &&
            item.doctorName !== "—" &&
            item.doctorName !== "-" &&
            item.doctorName !== "N/A"
              ? item.doctorName
              : null;
          return (
            <div className="min-w-0 pr-2">
              <span className="font-bold text-xs text-foreground block truncate">
                {item.title || "Record Entry"}
              </span>
              {doc ? (
                <span className="text-[11px] text-muted-foreground font-medium inline-flex items-center gap-1 mt-0.5">
                  <Stethoscope className="w-3 h-3 text-primary/70 shrink-0" /> {doc}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground/50 italic">—</span>
              )}
            </div>
          );
        },
      },
      {
        key: "content",
        header: "Clinical Notes & Observations",
        render: (item: ApiAny) => {
          const hasContent = item.content && item.content !== "—" && item.content !== "N/A";
          if (!hasContent) {
            return <span className="text-muted-foreground/40 italic text-xs">No clinical notes recorded</span>;
          }
          return (
            <div className="text-xs text-foreground/85 leading-relaxed font-normal bg-muted/20 border-l-2 border-primary/40 pl-2.5 py-1 pr-2 rounded-r">
              {item.content}
            </div>
          );
        },
      },
      {
        key: "attachments",
        header: "Files",
        align: "center" as const,
        className: "w-[110px]",
        render: (item: ApiAny) => {
          const count = Array.isArray(item.attachments) ? item.attachments.length : 0;
          if (count === 0) {
            return <span className="text-muted-foreground/30 text-xs">—</span>;
          }
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const first = item.attachments[0];
                setPreviewUrl(first.url || first);
                setPreviewFileName(first.name || "Attachment");
              }}
              className="h-6 text-[10px] font-bold gap-1 px-2 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary"
            >
              <Camera className="w-3 h-3" /> {count} File{count > 1 ? "s" : ""}
            </Button>
          );
        },
      },
    ],
    []
  );

  if (isLoading && !apiListData) {
    return (
      <Modal
        title={record.patientName}
        subtitle="Loading Complete Electronic Medical History..."
        onClose={onClose}
        size="5xl"
        icon={<FileText className="w-5 h-5 text-primary" />}
      >
        <Loading type="spinner" text="Fetching medical records..." className="py-20" />
      </Modal>
    );
  }

  const initials = detailedRecord.patientName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const categoryMeta = getCategoryMeta(detailedRecord.type);
  const formattedLastDate = detailedRecord.date
    ? new Date(detailedRecord.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const displayPhone =
    (patientDetail?.phone && patientDetail.phone !== "—" ? patientDetail.phone : null) ||
    (detailedRecord.phone && detailedRecord.phone !== "—" ? detailedRecord.phone : null);

  const rawPatientCode =
    patientDetail?.patient_code ||
    patientDetail?.patientCode ||
    detailedRecord.patientCode ||
    detailedRecord.patient_code;

  const displayPatientCode =
    rawPatientCode ||
    (detailedRecord.patientId && detailedRecord.patientId !== "—"
      ? detailedRecord.patientId.split("-")[0]
      : null);

  return (
    <>
      {/* Lightbox Preview */}
      {previewUrl && (
        <AttachmentPreview
          url={previewUrl}
          fileName={previewFileName}
          onClose={() => {
            setPreviewUrl(null);
            setPreviewFileName(undefined);
          }}
        />
      )}

      <Modal
        title={detailedRecord.patientName}
        subtitle="Complete Electronic Medical History & Records"
        onClose={onClose}
        size="5xl"
        icon={<FileText className="w-5 h-5 text-primary" />}
        footer={
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground font-semibold hidden sm:block">
              Showing {filteredTimeline.length} of {allTimeline.length} total records
            </p>
            <div className="flex gap-2.5 ml-auto">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close Record
              </Button>
              {/* <Button size="sm" onClick={handleDownload} className="gap-2" disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Download Record
                  </>
                )}
              </Button> */}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* ── 1. Executive Patient Card ── */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left: Avatar & Meta */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-base border border-primary/20 shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight">
                      {detailedRecord.patientName}
                    </h3>
                    {displayPatientCode && (
                      <Badge variant="blue" className="text-[10px] font-semibold px-2 py-0.5">
                        Code: {displayPatientCode}
                      </Badge>
                    )}
                    <Badge variant={categoryMeta.variant} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      {(detailedRecord.type || "consultation").replace(/[-_]/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground font-medium">
                    {displayPhone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground/70" /> {displayPhone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" /> Last Visit: {formattedLastDate}
                    </span>
                    {detailedRecord.doctorName &&
                      detailedRecord.doctorName !== "—" &&
                      detailedRecord.doctorName !== "-" && (
                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-muted-foreground/70" /> {detailedRecord.doctorName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Summary Counters */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <div className="bg-muted/40 border border-border/60 rounded-xl px-3 py-1.5 text-center min-w-[70px]">
                  <p className="text-base font-black text-foreground leading-none">{allTimeline.length}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Records</p>
                </div>
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl px-3 py-1.5 text-center min-w-[70px]">
                  <p className="text-base font-black text-teal-700 leading-none">{categoryCounts["appointmentvisit"] || 0}</p>
                  <p className="text-[9px] text-teal-600/90 font-bold uppercase tracking-wider mt-1">Visits</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5 text-center min-w-[70px]">
                  <p className="text-base font-black text-blue-700 leading-none">{categoryCounts["consultation"] || 0}</p>
                  <p className="text-[9px] text-blue-600/90 font-bold uppercase tracking-wider mt-1">Consults</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-1.5 text-center min-w-[70px]">
                  <p className="text-base font-black text-purple-700 leading-none">{categoryCounts["billingrecord"] || 0}</p>
                  <p className="text-[9px] text-purple-600/90 font-bold uppercase tracking-wider mt-1">Billing</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Toolbar: Search + View Switcher ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search clinical notes, diagnosis, procedures, doctor…"
              className="w-full sm:flex-1 max-w-lg"
            />

            {/* View Mode Switcher */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/70 shrink-0 self-end sm:self-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "timeline"
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
            </div>
          </div>

          {/* ── 3. Category Filter Pills with Live Counts ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <span className="[&_svg]:w-3 [&_svg]:h-3">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── 4. Content Area: Table View OR Timeline View ── */}
          {filteredTimeline.length > 0 ? (
            viewMode === "table" ? (
              /* ── TABLE VIEW (Default) ── */
              <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs">
                <DataTable
                  compact
                  columns={tableColumns}
                  data={filteredTimeline}
                  rowKey={(r) => r.id}
                  emptyIcon={<FileText className="w-10 h-10 text-muted-foreground/40" />}
                  emptyTitle="No records found"
                  emptySubtitle="Try adjusting your filter or search."
                />
              </div>
            ) : (
              /* ── TIMELINE VIEW (Chronological by Month) ── */
              <div className="space-y-6 pt-1 max-h-[550px] overflow-y-auto pr-1">
                {groupedTimeline.map((group) => (
                  <div key={group.monthYear} className="space-y-3">
                    {/* Month Section Anchor */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                        {group.monthYear}
                      </span>
                      <div className="h-px bg-border/60 flex-1" />
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {group.items.length} {group.items.length === 1 ? "record" : "records"}
                      </span>
                    </div>

                    {/* Events List */}
                    <div className="relative border-l-2 border-border/60 ml-3.5 pl-5 space-y-3">
                      {group.items.map((item: ApiAny, idx: number) => {
                        const meta = getCategoryMeta(item.category);
                        const d = item.date ? new Date(item.date) : null;
                        const formattedDate =
                          d && !isNaN(d.getTime())
                            ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "—";

                        return (
                          <div key={item.id || idx} className="relative group">
                            {/* Node Icon */}
                            <span className="absolute -left-[29px] top-3 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow-xs">
                              <div
                                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full ${meta.iconBg} [&_svg]:w-3 [&_svg]:h-3`}
                              >
                                {meta.icon}
                              </div>
                            </span>

                            {/* Event Card */}
                            <div className="bg-card border border-border/80 hover:border-primary/40 rounded-xl p-3.5 shadow-2xs transition-all">
                              {/* Card Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    variant={meta.variant}
                                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                                  >
                                    {meta.label}
                                  </Badge>
                                  <span className="font-bold text-sm text-foreground">
                                    {item.title || "Record Entry"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {item.doctorName &&
                                    item.doctorName !== "—" &&
                                    item.doctorName !== "-" && (
                                    <span className="flex items-center gap-1 font-medium">
                                      <Stethoscope className="w-3.5 h-3.5 text-primary/70" />
                                      {item.doctorName}
                                    </span>
                                  )}
                                  <span className="font-semibold text-foreground/80">{formattedDate}</span>
                                </div>
                              </div>

                              {/* Clinical Notes Block */}
                              {item.content && item.content !== "—" && item.content !== "N/A" && (
                                <div className="mt-2 text-xs text-foreground/85 leading-relaxed bg-muted/20 border border-border/40 rounded-lg p-2.5 whitespace-pre-wrap">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                    Clinical Notes:
                                  </span>
                                  {item.content}
                                </div>
                              )}

                              {/* Attachments */}
                              {item.attachments && item.attachments.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap gap-2 items-center">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Camera className="w-3 h-3 text-primary" /> Attachments:
                                  </span>
                                  {item.attachments.map((att: ApiAny, aIdx: number) => (
                                    <button
                                      key={aIdx}
                                      type="button"
                                      onClick={() => {
                                        setPreviewUrl(att.url);
                                        setPreviewFileName(att.name);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/60 hover:bg-primary/5 hover:border-primary/40 text-xs font-semibold text-foreground transition-all"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-primary" />
                                      <span className="max-w-[120px] truncate">{att.name || `File ${aIdx + 1}`}</span>
                                      <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-muted/10 rounded-2xl border-2 border-dashed border-border/40">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">No records found</h3>
              <p className="text-xs text-muted-foreground/60 font-medium">Try adjusting your category filter or search query.</p>
              {(search || activeCategory !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                  }}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
