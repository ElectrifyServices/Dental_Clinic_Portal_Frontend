import React from "react";
import ReactDOM from "react-dom";
import {
  Download,
  FileText,
  Calendar,
  Stethoscope,
  Camera,
  Pill,
  Activity,
  CreditCard,
  FlaskConical,
  ScanLine,
  ClipboardList,
  Image as ImageIcon,
  ExternalLink,
  X,
  User,
} from "lucide-react";
import {
  Modal,
  Badge,
  Button,
  FilterTabs,
  Input,
} from "@/components/ui";
import { useEMRListQuery } from "../../hooks/emr/useEMRListQuery";
import { useDebounce } from "../../hooks/useDebounce";
import { useTheme } from "../../contexts/ThemeContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImg from "../../logo.png";

interface EMRViewerProps {
  record: any;
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
    variant: any;
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
      label: category || "Record",
      color: "text-primary",
      bg: "bg-primary/5",
      border: "border-l-primary",
      iconBg: "bg-primary/10",
      icon: <FileText className="w-4 h-4 text-primary" />,
      variant: "blue",
    }
  );
};

const TIMELINE_FILTERS = [
  { key: "all", label: "All History" },
  { key: "CONSULTATION", label: "Consultation" },
  { key: "PRESCRIPTION", label: "Prescription" },
  { key: "LAB_REPORT", label: "Lab Report" },
  { key: "X_RAY", label: "X-Ray" },
  { key: "TREATMENT_NOTE", label: "Treatment Note" },
  { key: "BILLING_RECORD", label: "Billing Record" },
  { key: "APPOINTMENT_VISIT", label: "Appointment Visit" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PDF Generator — uses jsPDF + html2canvas, same as consultation
// ─────────────────────────────────────────────────────────────────────────────
export async function generateEMRPDF(
  patientName: string,
  timeline: any[],
  recordType?: string,
  logoUrl?: string | null
) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Build records rows HTML
  const rowsHtml = timeline
    .map(
      (item: any, idx: number) => `
    <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}; page-break-inside: avoid;">
      <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; width: 25%;">
        <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;">
          ${(item.category || "record").replace(/_/g, " ")}
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.4;">${item.title || "—"}</div>
      </td>
      <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; width: 18%; white-space: nowrap;">
        <div style="font-size: 12px; font-weight: 600; color: #334155;">
          ${item.date ? new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </div>
        ${item.doctorName && item.doctorName !== "-" && item.doctorName !== "—"
          ? `<div style="font-size: 10px; color: #64748b; margin-top: 3px;">${item.doctorName}</div>`
          : ""}
      </td>
      <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
        <div style="font-size: 12px; color: #334155; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
          ${item.content && item.content !== "—" ? item.content : '<span style="color:#94a3b8; font-style:italic;">No content recorded.</span>'}
        </div>
        ${item.attachments && item.attachments.length > 0
          ? `<div style="margin-top: 6px; font-size: 10px; color: #2563eb; font-weight: 700;">${item.attachments.length} attachment(s)</div>`
          : ""}
      </td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
  <div style="width:794px; background:#fff; margin:0; padding:0; color:#1f2937; display:flex; flex-direction:column; min-height:1123px; box-sizing:border-box; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

    <!-- HEADER: Logo + Patient Info -->
    <div style="padding: 25px 40px 15px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center;">
        <img src="${logoUrl || logoImg}" style="height: 80px; width: auto; object-fit: contain;" crossorigin="anonymous" />
      </div>
      <div style="text-align: right;">
        <div style="font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${patientName}</div>
        <div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 4px;">Total Records: ${timeline.length}</div>
        ${recordType ? `<div style="font-size: 11px; font-weight: 500; color: #475569; margin-top: 2px;">Primary Type: ${recordType.replace(/[-_]/g, " ").toUpperCase()}</div>` : ""}
      </div>
    </div>

    <!-- TITLE BAR -->
    <div style="padding: 10px 40px; background:#f8fafc; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; font-weight:900; color:#1e3a8a; text-transform:uppercase; letter-spacing:1px;">Complete Electronic Medical History</div>
      <div style="text-align:right; font-size:11px; color:#475569; font-weight:500;">
        <span><strong>Generated:</strong> ${dateStr}</span>
      </div>
    </div>

    <!-- CLINIC INFO BAR -->
    <div style="padding: 14px 40px;">
      <div style="display:flex; flex-direction:row; justify-content:space-between; align-items:center; padding:12px 18px; background:#ffffff; border:1px solid #cbd5e1; border-radius:8px;">
        <div style="flex:1; padding-right:10px; border-right: 1px solid #e2e8f0;">
          <div style="font-size:9px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:2px;">Record Summary</div>
          <div style="font-size:13px; font-weight:800; color:#0f172a;">${timeline.length} Medical Record${timeline.length !== 1 ? "s" : ""}</div>
          <div style="font-size:11px; font-weight:500; color:#475569; margin-top:2px;">${[...new Set(timeline.map((t: any) => (t.category || "").replace(/_/g, " ")))].filter(Boolean).join(", ") || "Various Categories"}</div>
        </div>
        <div style="flex:1; padding-left:18px;">
          <div style="font-size:9px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:2px;">Clinic</div>
          <div style="font-size:13px; font-weight:700; color:#0f172a;">Opal Smiles Dental Studio</div>
          <div style="font-size:11px; font-weight:500; color:#475569; margin-top:2px;">Dental &amp; Facial Aesthetics</div>
        </div>
      </div>
    </div>

    <!-- RECORDS TABLE -->
    <div style="padding: 5px 40px 20px;">
      <div style="font-size:11px; font-weight:850; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px;">
        Medical History Timeline — ${timeline.length} Record${timeline.length !== 1 ? "s" : ""}
      </div>
      <table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <thead>
          <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Record Type &amp; Title</th>
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Date &amp; Doctor</th>
            <th style="padding:10px 14px; text-align:left; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Clinical Notes / Content</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || `<tr><td colspan="3" style="padding:24px; text-align:center; color:#94a3b8; font-style:italic;">No records found.</td></tr>`}
        </tbody>
      </table>
    </div>

    <!-- FOOTER — identical to consultation -->
    <div style="margin-top: auto;">
      <div style="padding: 0 40px 20px;">
        <div style="display:flex; justify-content:flex-end; align-items:flex-end; padding-top:20px;">
          <div style="text-align:center;">
            <div style="width:200px; border-bottom:1px solid #cbd5e1; margin-bottom:8px;"></div>
            <div style="font-size:13px; font-weight:800; color:#0f172a;">Opal Smiles Dental Studio</div>
            <div style="font-size:11px; color:#475569; font-weight:500;">Authorized Signatory</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">(Seal)</div>
          </div>
        </div>
      </div>
      <div style="background:#ffffff; padding:15px 40px 30px 40px; color:#0f172a; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 -4px 10px rgba(0,0,0,0.03); border-top: 1px solid #f1f5f9;">
        <div style="flex: 1; display:flex; flex-direction:column; gap:4px;">
          <div style="font-size:11px; font-weight:700;">104, Unicus Shyamal, Shyamal Cross Road, Satellite, Ahmedabad, Gujarat – 380 015</div>
          <div style="font-size:11px; font-weight:600; color:#475569;">Phone: +91 99981 93256 | Email: hello@opalsmiles.in</div>
          <div style="font-size:11px; font-weight:600; color:#475569;">Mon–Sat: 10:00 AM – 8:00 PM | Emergency: 24 / 7</div>
          <div style="font-size:11px; font-weight:600; color:#475569;">Instagram: "opalsmiles_dental"</div>
        </div>
        <div style="width: 60px; height: 60px; background: white; padding: 2px; border-radius: 4px; border:1px solid #cbd5e1;">
          <img src="/opalsmiles-qr.png" style="width: 100%; height: 100%; object-fit: contain;" crossorigin="anonymous" onerror="this.style.display='none'" />
        </div>
      </div>
    </div>

  </div>`;

  // Create off-screen container
  const pdfContainer = document.createElement("div");
  pdfContainer.style.cssText = `
    position: absolute; left: -9999px; top: 0;
    width: 794px; background: white;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  pdfContainer.innerHTML = htmlContent;
  document.body.appendChild(pdfContainer);

  // Wait for images to load
  const images = Array.from(pdfContainer.getElementsByTagName("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  // Pad to A4 multiple
  const currentHeight = pdfContainer.offsetHeight;
  const remainder = currentHeight % 1123;
  if (remainder !== 0) {
    pdfContainer.style.height = currentHeight + (1123 - remainder) + "px";
  }

  try {
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 794,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);
    heightLeft -= pdfHeight;

    while (heightLeft > 10) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(1);
      pdf.rect(10, 10, pdfWidth - 20, pdfHeight - 20);
      heightLeft -= pdfHeight;
    }

    const safeName = patientName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    pdf.save(`emr_${safeName}_${now.toISOString().split("T")[0]}.pdf`);
  } finally {
    document.body.removeChild(pdfContainer);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Attachment Viewer Component
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
  const isPdf = ext === "pdf";

  return (
    <Modal
      title={fileName || "Attachment"}
      onClose={onClose}
      size="3xl"
      icon={<ImageIcon className="w-4 h-4 text-primary" />}
    >
      <div className="flex items-center justify-center p-4 min-h-[50vh]">
        {isImage ? (
          <img
            src={url}
            alt={fileName || "Attachment"}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
          />
        ) : isPdf ? (
          <iframe
            src={url}
            className="w-full h-[70vh] rounded-lg border-0"
            title={fileName || "PDF Attachment"}
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-semibold mb-4">
              Preview not available for this file type
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Download / Open File
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main EMR Viewer Component
// ─────────────────────────────────────────────────────────────────────────────
export function EMRViewer({ record, onClose }: EMRViewerProps) {
  const { themeData } = useTheme();
  if (!record) return null;

  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = React.useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 500);

  const queryParams: any = {
    page: 1,
    limit: 1000,
    filters: { patient_id: record.patientId },
  };
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (activeTab && activeTab !== "all") {
    queryParams.filters.record_type = [activeTab.toUpperCase()];
  }

  const { data: apiListData, isLoading } = useEMRListQuery(queryParams, {
    refetchOnMount: "always",
  });

  const detailedRecord = React.useMemo(() => {
    let rawList: any[] = [];
    if (apiListData) {
      if (Array.isArray(apiListData)) rawList = apiListData;
      else if (Array.isArray((apiListData as any).data?.data)) rawList = (apiListData as any).data.data;
      else if (Array.isArray((apiListData as any).data)) rawList = (apiListData as any).data;
      else if (Array.isArray((apiListData as any).responseObject?.data)) rawList = (apiListData as any).responseObject.data;
      else if (Array.isArray((apiListData as any).responseObject)) rawList = (apiListData as any).responseObject;
    }

    const latestItem = rawList[0] || record;

    // Extract attachments properly (objects with file_url)
    const extractAttachments = (item: any) => {
      const atts = item.attachments;
      if (!Array.isArray(atts)) return [];
      return atts.map((a: any) => {
        if (typeof a === "string") return { url: a, name: a.split("/").pop() || "File" };
        return {
          url: a.file_url || a.url || a.file_path || "",
          name: a.file_name || a.name || (a.file_url || "").split("/").pop() || "File",
          type: a.file_type || a.type || "",
          size: a.file_size || a.size,
        };
      }).filter((a: any) => a.url);
    };

    return {
      ...record,
      patientName: latestItem.patient?.name || record.patientName || "—",
      date: latestItem.created_at || latestItem.date || record.date || new Date().toISOString(),
      type: (latestItem.record_type || latestItem.type || record.type || "consultation").toLowerCase(),
      title: latestItem.title || record.title || "—",
      content: latestItem.content || record.content || "—",
      doctorName: latestItem.doctor?.name || record.doctorName || "—",
      attachments: extractAttachments(latestItem).length > 0
        ? extractAttachments(latestItem)
        : extractAttachments(record),
      timeline: rawList.map((item: any) => ({
        id: item.id,
        title: item.title || "N/A",
        content: item.content || "N/A",
        date: item.created_at || item.date || new Date().toISOString(),
        category: (item.record_type || item.type || "consultation").toLowerCase(),
        doctorName: item.doctor?.name || item.doctorName || record.doctorName || "N/A",
        attachments: extractAttachments(item),
      })),
    };
  }, [apiListData, record]);

  const filteredTimeline = React.useMemo(() => detailedRecord.timeline || [], [detailedRecord.timeline]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateEMRPDF(detailedRecord.patientName, filteredTimeline, detailedRecord.type, themeData?.theme?.logo_url);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading && !apiListData) {
    return (
      <Modal
        title={record.patientName}
        subtitle="Loading Complete Electronic Medical History..."
        onClose={onClose}
        size="5xl"
        icon={<FileText className="w-5 h-5" />}
      >
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-semibold">Fetching medical records...</p>
        </div>
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

  return (
    <>
      {/* Attachment Lightbox */}
      {previewUrl && (
        <AttachmentPreview
          url={previewUrl}
          fileName={previewFileName}
          onClose={() => { setPreviewUrl(null); setPreviewFileName(undefined); }}
        />
      )}

      <Modal
        title={detailedRecord.patientName}
        subtitle="Complete Electronic Medical History"
        onClose={onClose}
        size="5xl"
        icon={<FileText className="w-5 h-5 text-primary" />}
        footer={
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground font-semibold hidden sm:block">
              {filteredTimeline.length} record{filteredTimeline.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex gap-3 ml-auto">
              <Button variant="outline" onClick={onClose}>Close Record</Button>
              <Button onClick={handleDownload} className="gap-2" disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <><Download className="w-4 h-4" /> Download Record</>
                )}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* ── Patient Identity Card ── */}
          <div className="relative overflow-hidden rounded-2xl border border-[#4e6e65]/15 bg-gradient-to-br from-[#4e6e65]/[0.08] via-[#4e6e65]/[0.03] to-transparent shadow-sm">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#4e6e65]/[0.07] rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#c9a24b]/[0.08] rounded-full" />
            <div className="relative p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0 w-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4e6e65] to-[#33473f] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[#4e6e65]/25 flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-foreground tracking-tight mb-1">
                    {detailedRecord.patientName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      Last Record:{" "}
                      {new Date(detailedRecord.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <Badge variant={categoryMeta.variant} className="text-[9px] font-black uppercase tracking-widest px-2.5 h-5">
                      {(detailedRecord.type || "consultation").replace(/[-_]/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 sm:gap-8 flex-shrink-0 w-full sm:w-auto border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 border-[#4e6e65]/15">
                <div className="text-center flex-1 sm:flex-initial">
                  <p className="text-2xl font-black text-[#4e6e65]">{filteredTimeline.length}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Records</p>
                </div>
                <div className="text-center flex-1 sm:flex-initial">
                  <p className="text-2xl font-black text-[#c9a24b]">
                    {new Set(filteredTimeline.map((t: any) => t.category)).size}
                  </p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Categories</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Search + Filter ── */}
          <div className="space-y-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search in clinical notes, procedures..."
                className="pl-10 h-10"
              />
            </div>
            <div className="overflow-x-auto pb-1 -mx-2 px-2">
              <FilterTabs tabs={TIMELINE_FILTERS} active={activeTab} onChange={setActiveTab} />
            </div>
          </div>

          {/* ── Medical History Section Header ── */}
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <div className="w-7 h-7 rounded-lg bg-[#4e6e65]/10 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-[#4e6e65]" />
              </div>
              Medical History
            </h3>
            {filteredTimeline.length > 0 && (
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-3 h-6">
                {filteredTimeline.length} Records
              </Badge>
            )}
          </div>

          {/* ── Timeline ── */}
          {filteredTimeline.length > 0 ? (
            <div className="relative border-l-2 border-border/80 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
              {filteredTimeline.map((item: any, idx: number) => {
                const meta = getCategoryMeta(item.category);
                const formattedDate = item.date
                  ? new Date(item.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "N/A";

                return (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline Node (Floating Icon on the left line) */}
                    <span className="absolute -left-[41px] sm:-left-[49px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/85 shadow-sm ring-4 ring-card group-hover:scale-110 transition-transform duration-200">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${meta.iconBg}`}>
                        {meta.icon}
                      </div>
                    </span>

                    {/* Timeline Content Card */}
                    <div className="bg-card border border-border/60 hover:border-[#4e6e65]/30 rounded-2xl hover:shadow-md transition-all duration-300 p-4 sm:p-5">
                      {/* Top Row: Title, Category & Date */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3.5">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight leading-snug mb-1">
                            {item.title || "N/A"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={meta.variant} className="text-[8px] font-black uppercase tracking-widest px-2 h-5 inline-flex items-center">
                              {meta.label}
                            </Badge>
                            {item.doctorName && item.doctorName !== "—" && item.doctorName !== "N/A" && (
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-full">
                                <User className="w-3 h-3 text-muted-foreground/60" />
                                Dr. {item.doctorName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex-shrink-0 flex items-center gap-1.5 sm:flex-col sm:items-end">
                          <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest bg-muted/40 sm:bg-transparent px-2 py-0.5 sm:px-0 rounded-full">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* Clinical Content */}
                      {item.content && item.content !== "—" && item.content !== "N/A" && (
                        <div className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed font-medium bg-muted/20 border border-border/30 rounded-xl p-3 sm:p-4 whitespace-pre-wrap">
                          {item.content}
                        </div>
                      )}

                      {/* ── Attachments ── */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/40">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Camera className="w-3 h-3 text-[#4e6e65]" /> Attachments ({item.attachments.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.attachments.map((att: any, aIdx: number) => {
                              const ext = (att.url?.split(".").pop() || "").toLowerCase();
                              const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                              return (
                                <button
                                  key={aIdx}
                                  onClick={() => { setPreviewUrl(att.url); setPreviewFileName(att.name); }}
                                  className="group/att flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 hover:border-[#4e6e65]/40 hover:bg-[#4e6e65]/5 transition-all text-xs font-semibold text-foreground"
                                >
                                  {isImage ? (
                                    <div className="w-8 h-8 rounded-md overflow-hidden border border-border/30 flex-shrink-0">
                                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <span className="max-w-[120px] truncate">{att.name || `File ${aIdx + 1}`}</span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover/att:text-[#4e6e65] flex-shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-muted/10 rounded-2xl border-2 border-dashed border-border/40">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">No records found</h3>
              <p className="text-xs text-muted-foreground/60 font-medium">Try adjusting your filters or search query.</p>
              {(search || activeTab !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(""); setActiveTab("all"); }}
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
