import {
  Download,
  Stethoscope,
  User,
  Calendar,
  FileText,
  Camera,
  Pill,
  IndianRupee,
  Clock,
} from "lucide-react";
import { Modal, Button, ContentCard, Badge } from "@/components/ui";

interface TreatmentViewerProps {
  treatment: any;
  onClose: () => void;
  onEditTreatment: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onStartTreatment: (id: string) => void;
}

export function TreatmentViewer({
  treatment,
  onClose,
  onEditTreatment,
  onMarkCompleted,
  onStartTreatment,
}: TreatmentViewerProps) {
  if (!treatment) return null;

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>Treatment Plan - ${treatment.patientName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 4px solid #3b82f6; padding-bottom: 20px; }
            .section { background: #f8fafc; padding: 25px; border-radius: 16px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            h1, h2, h3 { color: #0f172a; margin-top: 0; }
            .prescription-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .med-card { background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TREATMENT PLAN & PROGRESS</h1>
            <p style="font-weight: bold; color: #3b82f6;">DentalCare Pro - Advanced Dental Solutions</p>
          </div>
          
          <div class="section">
            <h3>Patient Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p><strong>Patient:</strong> ${treatment.patientName}</p>
              <p><strong>Procedure:</strong> ${treatment.procedure}</p>
              <p><strong>Tooth:</strong> ${treatment.tooth}</p>
              <p><strong>Doctor:</strong> ${treatment.doctorName}</p>
              <p><strong>Date:</strong> ${new Date(treatment.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${treatment.status.toUpperCase()}</p>
            </div>
          </div>

          <div class="section">
            <h3>Clinical Notes</h3>
            <p style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">${treatment.notes || "No notes available."}</p>
          </div>

          <div class="section">
            <h3>Prescribed Medications</h3>
            <div class="prescription-grid">
              ${(treatment.prescriptions || [])
                .map(
                  (p: any) => `
                <div class="med-card">
                  <p><strong>${p.medicine}</strong></p>
                  <p style="font-size: 13px; margin: 5px 0;">Dosage: ${p.dosage} | Timing: ${p.timing}</p>
                  <p style="font-size: 13px; margin: 5px 0;">Freq: ${p.frequency} | Dur: ${p.duration}</p>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <div class="footer">
            <p>Confidential medical document. Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treatment-plan-${treatment.patientName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusVariant = (treatment.status === 'completed' ? 'green' : treatment.status === 'in-progress' ? 'blue' : 'amber') as any;

  return (
    <Modal
      title={treatment.procedure}
      subtitle={`${treatment.patientName} • Tooth ${treatment.tooth}`}
      onClose={onClose}
      size="5xl"
      icon={<Stethoscope className="w-5 h-5" />}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            {treatment.status === "planned" && (
              <Button
                onClick={() => {
                  onStartTreatment(treatment.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg"
              >
                Start Treatment
              </Button>
            )}
            {treatment.status === "in-progress" && (
              <Button
                onClick={() => {
                  onMarkCompleted(treatment.id);
                  onClose();
                }}
                className="shadow-lg"
              >
                Complete Procedure
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                onEditTreatment(treatment.id);
                onClose();
              }}
            >
              Edit Plan
            </Button>
          </div>
          <Button variant="ghost" onClick={handleDownload} className="gap-2 text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContentCard 
            title="Patient Overview" 
            icon={<User className="w-5 h-5" />}
            className="bg-primary/5 border-primary/10"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Name</span>
                <span className="text-sm font-black text-foreground">{treatment.patientName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Tooth</span>
                <span className="text-sm font-black text-foreground">#{treatment.tooth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Doctor</span>
                <span className="text-sm font-black text-foreground">{treatment.doctorName}</span>
              </div>
            </div>
          </ContentCard>

          <ContentCard 
            title="Timeline & Status" 
            icon={<Calendar className="w-5 h-5" />}
            className="bg-emerald-50/50 border-emerald-100"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Started</span>
                <span className="text-sm font-black text-foreground">{new Date(treatment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Next Visit</span>
                <span className="text-sm font-black text-foreground">{treatment.nextAppointment ? new Date(treatment.nextAppointment).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Status</span>
                <Badge variant={statusVariant} className="font-black text-[9px] uppercase tracking-widest px-2.5 h-5">{treatment.status}</Badge>
              </div>
            </div>
          </ContentCard>

          <ContentCard 
            title="Financial Status" 
            icon={<IndianRupee className="w-5 h-5" />}
            className="bg-indigo-50/50 border-indigo-100"
          >
            <div className="mt-2">
              <p className="text-3xl font-black text-indigo-900 tracking-tighter">₹{treatment.cost.toLocaleString()}</p>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Total Procedure Fee</p>
            </div>
          </ContentCard>
        </div>

        <ContentCard 
          title="Clinical Notes & Progression" 
          icon={<FileText className="w-5 h-5 text-primary" />}
          className="border-border/50"
        >
          <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 text-foreground font-medium text-sm leading-relaxed whitespace-pre-wrap">
            {treatment.notes || "No detailed clinical notes provided for this treatment plan."}
          </div>
        </ContentCard>

        {treatment.prescriptions?.length > 0 && (
          <div className="space-y-4">
            <h3 className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-500" /> Prescribed Medications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatment.prescriptions.map((p: any) => (
                <ContentCard 
                  key={p.id}
                  title={p.medicine}
                  subtitle={p.dosage}
                  className="bg-emerald-50/20 border-emerald-100/50 hover:border-emerald-200 transition-colors"
                >
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-emerald-400" /> {p.timing}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-emerald-400" /> {p.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-emerald-400" /> {p.frequency}
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill className="w-3 h-3 text-emerald-400" /> {p.qty} Units
                    </div>
                  </div>
                </ContentCard>
              ))}
            </div>
          </div>
        )}

        {treatment.images?.length > 0 && (
          <div className="space-y-4">
            <h3 className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-500" /> Diagnostic Media
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {treatment.images.map((img: string, i: number) => (
                <div
                  key={i}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-border/50 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl"
                  onClick={() => window.open(img, "_blank")}
                >
                  <img src={img} alt="Diagnostic" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-primary transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <Download className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
