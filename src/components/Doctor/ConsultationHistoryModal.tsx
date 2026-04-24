import {
  X, Trash2, Clock, Stethoscope, FileText, Calendar,
  Image as ImageIcon, IndianRupee, Pill, AlertCircle,
  Eye, ArrowLeft, Phone, Search, Filter, ChevronLeft, ChevronRight,
  Printer, MoreVertical, ExternalLink
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
      const demoData: ConsultationRecord[] = [
        {
          id: 1, patientName: "Ravi Kumar", patientId: "1776320417563", patientContact: "898988745",
          completedAt: new Date(2026, 3, 15, 10, 30).toISOString(),
          allergies: "Penicillin", conditions: "Diabetes Type 2", visits: "5", lastVisit: "08/01/2024",
          observations: "Patient complains of persistent cough and mild fever since 3 days.",
          diagnosis: "Acute bronchitis, rule out allergic reaction",
          treatmentPlan: "Antibiotics course for 5 days, rest, hydration.",
          prescriptions: [
            { id: "p1", medicine: "Amoxicillin", dosage: "500mg", frequency: "Twice daily", duration: "5 days" },
            { id: "p2", medicine: "Dextromethorphan", dosage: "10ml", frequency: "Thrice daily", duration: "3 days" }
          ],
          consultationNotes: "Patient advised to avoid cold drinks.",
          treatmentCost: 850, followUpRequired: true, followUpDate: "2026-04-20",
          images: ["https://picsum.photos/id/104/200/150", "https://picsum.photos/id/20/200/150"]
        },
        {
          id: 2, patientName: "Priya Sharma", patientId: "FD12345", patientContact: "9876543210",
          completedAt: new Date(2026, 3, 14, 15, 45).toISOString(),
          allergies: "Dust, Pollen", conditions: "Asthma", visits: "3", lastVisit: "15/03/2024",
          observations: "Patient experiencing wheezing and shortness of breath.",
          diagnosis: "Acute asthma exacerbation",
          treatmentPlan: "Inhaler prescribed. Avoid triggers. Review in 2 weeks.",
          prescriptions: [{ id: "p1", medicine: "Salbutamol Inhaler", dosage: "2 puffs", frequency: "As needed", duration: "1 month" }],
          consultationNotes: "Patient educated on proper inhaler technique.",
          treatmentCost: 1200, followUpRequired: true, followUpDate: "2026-04-28", images: []
        },
        {
          id: 3, patientName: "Amit Patel", patientId: "FD67890", patientContact: "9988776655",
          completedAt: new Date(2026, 3, 12, 9, 15).toISOString(),
          allergies: "", conditions: "",
          observations: "Routine checkup - all vitals normal",
          diagnosis: "Healthy", treatmentPlan: "Continue current lifestyle",
          prescriptions: [], consultationNotes: "No issues reported",
          treatmentCost: 500, followUpRequired: false, images: []
        },
        {
          id: 4, patientName: "Sunita Rao", patientId: "FD11111", patientContact: "9111111111",
          completedAt: new Date(2026, 3, 10, 11, 0).toISOString(),
          diagnosis: "Hypertension follow-up", treatmentCost: 600, followUpRequired: false,
          prescriptions: [{ id: "p1", medicine: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" }],
          images: []
        },
        {
          id: 5, patientName: "Deepak Verma", patientId: "FD22222", patientContact: "9222222222",
          completedAt: new Date(2026, 3, 8, 14, 30).toISOString(),
          diagnosis: "Migraine", treatmentCost: 750, followUpRequired: true, followUpDate: "2026-04-25",
          prescriptions: [], images: []
        }
      ];
      localStorage.setItem("completedConsultations", JSON.stringify(demoData));
      setData(demoData);
    }
  }, []);

  const downloadConsultationPDF = async (record: ConsultationRecord) => {
    const pdfContainer = document.createElement("div");
    pdfContainer.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; background: white; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

    const filledPrescriptions = record.prescriptions?.filter(
      (p) => p.medicine.trim() !== "",
    ) || [];

    pdfContainer.innerHTML = `
    <div style="width:794px; background:#fff; margin:0; padding:0; color: #1f2937;">
      <!-- Professional Medical Header -->
      <div style="padding: 30px 50px 20px; border-bottom: 2px solid #3b82f6;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:28px; font-weight:800; color:#1e40af; letter-spacing:-0.5px;">DentalCare Pro</div>
            <div style="font-size:12px; color:#6b7280; font-weight:500; margin-top:4px;">Advanced Dental Clinic & Implant Centre</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:14px; font-weight:700; color:#111827;">Dr. Rajesh Sharma</div>
            <div style="font-size:11px; color:#6b7280; margin-top:2px;">BDS, MDS (Oral & Maxillofacial Surgery)</div>
            <div style="font-size:11px; color:#6b7280;">Reg No: 123456/78</div>
          </div>
        </div>
      </div>

      <!-- Report Title & Date -->
      <div style="padding: 10px 50px; background:#f8fafc; border-bottom: 1px solid #e2e8f0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:16px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:1px;">Consultation Report</div>
          <div style="text-align:right; font-size:11px; color:#64748b; display:flex; gap:15px;">
          <span><strong>Date:</strong> ${new Date(record.completedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
          <span><strong>Record ID:</strong> ${record.id}</span>
        </div>
      </div>

      <div style="padding: 20px 50px 30px;">
        <!-- Patient Info Card -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div>
            <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Patient Name</div>
            <div style="font-size:15px; font-weight:700; color:#1e293b;">${record.patientName || "—"}</div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Patient ID</div>
            <div style="font-size:14px; font-weight:500; color:#334155;">${record.patientId || "—"}</div>
          </div>
          <div>
            <div style="font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; margin-bottom:4px;">Treatment Type</div>
            <div style="font-size:14px; font-weight:500; color:#334155;">${record.treatmentType || "General Consultation"}</div>
          </div>
        </div>

        <!-- Medical Alerts / History -->
        ${
          record.allergies || record.conditions
            ? `
        <div style="margin-bottom:20px; border:1px solid #fee2e2; border-radius:8px; overflow:hidden;">
          <div style="background:#fef2f2; padding:8px 15px; border-bottom:1px solid #fee2e2; display:flex; align-items:center; gap:8px;">
            <span style="color:#dc2626; font-size:14px;">⚠️</span>
            <span style="font-size:10px; font-weight:700; color:#991b1b; text-transform:uppercase; letter-spacing:0.5px;">Medical Alerts & History</span>
          </div>
          <div style="padding:12px 15px; background:#fff;">
            ${record.allergies ? `<div style="font-size:12px; color:#991b1b; margin-bottom:4px;"><strong>Allergies:</strong> ${record.allergies}</div>` : ""}
            ${record.conditions ? `<div style="font-size:12px; color:#991b1b;"><strong>Medical Conditions:</strong> ${record.conditions}</div>` : ""}
          </div>
        </div>
        `
            : ""
        }

        <!-- Clinical Assessment Section -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-bottom:20px;">
          <div style="border-left: 3px solid #3b82f6; padding-left:15px;">
            <div style="font-size:11px; font-weight:700; color:#1e40af; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Clinical Observations</div>
            <div style="font-size:13px; line-height:1.6; color:#374151;">
              ${record.observations || '<span style="color:#9ca3af;">No observations recorded.</span>'}
            </div>
          </div>
          <div style="border-left: 3px solid #10b981; padding-left:15px;">
            <div style="font-size:11px; font-weight:700; color:#065f46; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px;">Diagnosis</div>
            <div style="font-size:13px; line-height:1.6; color:#374151;">
              ${record.diagnosis || '<span style="color:#9ca3af;">No diagnosis provided.</span>'}
            </div>
          </div>
        </div>

        <!-- Treatment Plan -->
        <div style="margin-bottom:25px; background:#f1f5f9; padding:15px 20px; border-radius:8px;">
          <div style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:8px;">Treatment Plan & Procedures</div>
          <div style="font-size:13px; line-height:1.6; color:#334155;">
            ${record.treatmentPlan || '<span style="color:#9ca3af;">—</span>'}
          </div>
        </div>

        <!-- Prescriptions -->
        ${
          filledPrescriptions.length > 0
            ? `
        <div style="margin-bottom:25px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <div style="width:24px; height:24px; background:#ecfdf5; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#059669; font-weight:bold;">💊</div>
            <div style="font-size:14px; font-weight:700; color:#111827;">Prescribed Medications</div>
          </div>
          <table style="width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; border:1px solid #e2e8f0;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">#</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Medicine</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Dosage</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Timing</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Freq</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Days</th>
                <th style="padding:12px 15px; text-align:left; font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${filledPrescriptions
                .map(
                  (p, i) => `
                <tr style="border-bottom:1px solid #f1f5f9; ${i % 2 === 0 ? "" : "background:#fafafa;"}">
                  <td style="padding:12px 15px; font-size:12px; color:#94a3b8;">${i + 1}</td>
                  <td style="padding:12px 15px; font-size:13px; font-weight:600; color:#1e293b;">${p.medicine || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.dosage || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.timing || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.frequency || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; color:#475569;">${p.duration || "-"}</td>
                  <td style="padding:12px 15px; font-size:12px; font-weight:600; color:#1e293b;">${p.qty || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <!-- Recommendations & Summary -->
        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:30px; margin-bottom:25px;">
          <div>
            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Advice & Recommendations</div>
            <div style="font-size:12px; line-height:1.6; color:#334155; padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:8px;">
              ${record.recommendations || "Take care and follow instructions."}
            </div>
          </div>
          <div>
            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Consultation Summary</div>
            <div style="padding:15px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;">
              <div style="font-size:10px; color:#0369a1; text-transform:uppercase; margin-bottom:4px;">Total Cost</div>
              <div style="font-size:18px; font-weight:700; color:#0369a1;">₹${record.treatmentCost || 0}</div>
            </div>
          </div>
        </div>

        <!-- Footer / Signature Area -->
        <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
              <div style="font-size:10px; color:#94a3b8; font-style:italic;">This is a computer-generated report based on past clinical records.</div>
              <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Report Generated: ${new Date().toLocaleString("en-IN")}</div>
            </div>
            <div style="text-align:center;">
              <div style="width:180px; border-top:1px solid #1e293b; padding-top:10px;">
                <div style="font-size:13px; font-weight:700; color:#1e293b;">Dr. Rajesh Sharma</div>
                <div style="font-size:10px; color:#64748b; margin-top:2px;">Dental Surgeon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Clinic Address Footer -->
      <div style="background:#1e40af; padding:15px 50px; color:white; font-size:10px; display:flex; justify-content:space-between;">
        <div>📍 123 Dental Street, Medical Hub, New Delhi - 110001</div>
        <div>📞 +91 98765 43210 | 🌐 www.dentalcarepro.com</div>
      </div>
    </div>
  `;

    document.body.appendChild(pdfContainer);

    try {
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(
        `${record.patientName}_consultation_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } finally {
      document.body.removeChild(pdfContainer);
    }
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

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
    setActiveMenuId(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      const updated = data.filter(item => item.id !== deleteConfirmId);
      setData(updated);
      localStorage.setItem("completedConsultations", JSON.stringify(updated));
      setDeleteConfirmId(null);
      if (selectedRecord?.id === deleteConfirmId) setSelectedRecord(null);
    }
  };

  const hasValidPrescriptions = (p?: Prescription[]) =>
    p && p.some(x => x.medicine?.trim() !== "");

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

  const initials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };
  const avatarColors = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];
  const avatarColor = (id: number) => avatarColors[id % avatarColors.length];
  const activeFilters = (filterFollowUp !== "all" ? 1 : 0) + (filterSort !== "newest" ? 1 : 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveMenuId(null)}>
      <div
        className="bg-white w-[900px] max-w-[95vw] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ height: "88vh", fontFamily: "'Inter', system-ui" }}
        onClick={(e) => {
          // If a menu is open, clicking anywhere inside the modal should close it
          if (activeMenuId !== null) {
            setActiveMenuId(null);
          }
          e.stopPropagation();
        }}
      >

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-gray-200 px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {selectedRecord && (
              <button onClick={() => setSelectedRecord(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                {selectedRecord ? "Consultation Detail" : "Consultation History"}
              </h2>
              <p className="text-xs text-gray-400">
                {selectedRecord ? selectedRecord.patientName : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* ── Search & Filter Bar ── */}
        {!selectedRecord && (
          <div className="flex-shrink-0 px-5 py-2.5 border-b border-gray-100 bg-gray-50 space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, diagnosis, contact..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium whitespace-nowrap ${showFilters || activeFilters > 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                {activeFilters > 0 && (
                  <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-4 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">Follow-up:</span>
                  {(["all", "yes", "no"] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setFilterFollowUp(v)}
                      className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors font-medium ${filterFollowUp === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                    >
                      {v === "all" ? "All" : v === "yes" ? "Required" : "Not Required"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">Sort:</span>
                  {(["newest", "oldest"] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setFilterSort(v)}
                      className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors font-medium ${filterSort === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                    >
                      {v === "newest" ? "Newest First" : "Oldest First"}
                    </button>
                  ))}
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={() => { setFilterFollowUp("all"); setFilterSort("newest"); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ════ LIST VIEW ════ */}
          {!selectedRecord && (
            filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 rounded-full p-4 mb-3">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">No results found</h3>
                <p className="text-xs text-gray-400 mt-1">Try a different search term or clear filters</p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Diagnosis</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Cost</th>
                    <th className="text-right px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                      <td className="px-5 py-2.5 text-xs text-gray-400 tabular-nums align-middle">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(item.id)}`}>
                            {initials(item.patientName || patients.find(p => p.id === item.patientId)?.patientName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                              {item.patientName || patients.find(p => p.id === item.patientId)?.patientName || "Unknown Patient"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {item.patientId && <span className="text-xs text-gray-400 font-mono">{item.patientId}</span>}
                              {item.followUpRequired && (
                                <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium leading-tight">Follow-up</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 hidden md:table-cell align-middle">
                        <span className="text-xs text-gray-600 truncate block max-w-[180px]">{item.diagnosis || "—"}</span>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell align-middle">
                        <span className="text-xs text-gray-500 whitespace-nowrap">{fmtShort(item.completedAt || (item as any).consultationDate)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right hidden sm:table-cell align-middle">
                        {item.treatmentCost && item.treatmentCost > 0
                          ? <span className="text-xs font-semibold text-gray-700">₹{item.treatmentCost}</span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-2.5 align-middle">
                        <div className="flex items-center justify-end relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === item.id ? null : item.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${activeMenuId === item.id ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-500"}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === item.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in zoom-in duration-200">
                              <button
                                onClick={() => {
                                  setSelectedRecord(item);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button
                                onClick={() => {
                                  downloadConsultationPDF(item);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" /> Print
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button
                                onClick={(e) => handleDeleteClick(item.id, e)}
                                className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* ════ DETAIL VIEW ════ */}
          {selectedRecord && (
            <div className="p-5 space-y-3">
              {/* Patient Header */}
              <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedRecord.patientName}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-600">
                      {selectedRecord.patientId && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">ID: {selectedRecord.patientId}</span>
                      )}
                      {selectedRecord.patientContact && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedRecord.patientContact}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmt(selectedRecord.completedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadConsultationPDF(selectedRecord)}
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(selectedRecord.id, e)}
                      className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              {(selectedRecord.allergies || selectedRecord.conditions || selectedRecord.visits || selectedRecord.lastVisit) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
                    <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wide">Medical History</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {selectedRecord.allergies && (
                      <div><span className="text-xs font-medium text-blue-700 block mb-0.5">Allergies</span><span className="text-gray-800">{selectedRecord.allergies}</span></div>
                    )}
                    {selectedRecord.conditions && (
                      <div><span className="text-xs font-medium text-blue-700 block mb-0.5">Conditions</span><span className="text-gray-800">{selectedRecord.conditions}</span></div>
                    )}
                    {(selectedRecord.visits || selectedRecord.lastVisit) && (
                      <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-4 text-xs text-gray-600 mt-1 pt-2 border-t border-blue-200">
                        {selectedRecord.visits && <span>🩺 Total Visits: {selectedRecord.visits}</span>}
                        {selectedRecord.lastVisit && <span>📅 Last Visit: {selectedRecord.lastVisit}</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observations & Diagnosis */}
              {(selectedRecord.observations || selectedRecord.diagnosis) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRecord.observations && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                        <AlertCircle className="w-3 h-3" /> Observations
                      </p>
                      <p className="text-gray-800 text-sm">{selectedRecord.observations}</p>
                    </div>
                  )}
                  {selectedRecord.diagnosis && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                        <Stethoscope className="w-3 h-3" /> Diagnosis
                      </p>
                      <p className="text-gray-800 text-sm">{selectedRecord.diagnosis}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Treatment Plan */}
              {selectedRecord.treatmentPlan && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <FileText className="w-3 h-3" /> Treatment Plan
                  </p>
                  <p className="text-gray-800 text-sm">{selectedRecord.treatmentPlan}</p>
                </div>
              )}

              {/* Prescriptions */}
              {hasValidPrescriptions(selectedRecord.prescriptions) && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1 mb-2">
                    <Pill className="w-3 h-3" /> Prescriptions
                  </p>
                  <div className="space-y-1.5">
                    {selectedRecord.prescriptions?.map((p) =>
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
              {selectedRecord.consultationNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <FileText className="w-3 h-3" /> Additional Notes
                  </p>
                  <p className="text-gray-800 text-sm">{selectedRecord.consultationNotes}</p>
                </div>
              )}

              {/* Cost & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRecord.treatmentCost !== undefined && selectedRecord.treatmentCost > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> Treatment Cost
                    </span>
                    <span className="text-base font-bold text-gray-900">₹ {selectedRecord.treatmentCost}</span>
                  </div>
                )}
                {selectedRecord.followUpRequired && selectedRecord.followUpDate && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-purple-800">Follow-up:</span>
                    <span className="text-sm text-gray-800">{fmtShort(selectedRecord.followUpDate)}</span>
                  </div>
                )}
              </div>

              {/* Images */}
              {selectedRecord.images && selectedRecord.images.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                    <ImageIcon className="w-3 h-3" /> Attached Images
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.images.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Attachment ${idx + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-300 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(imgUrl, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {!selectedRecord && filtered.length > PAGE_SIZE && (
          <div className="flex-shrink-0 border-t border-gray-200 px-5 py-2.5 flex items-center justify-between bg-white">
            <span className="text-xs text-gray-500">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${safePage === p ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-semibold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this consultation record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}