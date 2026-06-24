import { Label } from "@/components/ui/Label";
import {
  Printer,
  Shield,
  CheckCircle2,
  MapPin,
  Phone,
  Globe,
  Upload,
  BookOpen,
} from "lucide-react";
import { Modal, Button } from "@/components/ui";

interface ConsentFormViewerProps {
  form: any;
  onClose: () => void;
  isLoading?: boolean;
}

export function ConsentFormViewer({ form, onClose, isLoading }: ConsentFormViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title={isLoading ? "Loading Document..." : "Document Preview"}
      subtitle={isLoading ? "Retrieving informed consent record..." : "Informed Consent Record"}
      onClose={onClose}
      size="5xl"
      icon={<Shield className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full print:hidden">
          <Button variant="outline" onClick={handlePrint} className="gap-2" disabled={isLoading}>
            <Printer className="w-4 h-4" /> Print / PDF
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="p-0 sm:p-6 bg-muted/30 print:p-0 print:bg-transparent overflow-visible">
        {isLoading ? (
          <div className="bg-card mx-auto shadow-sm border border-border p-6 sm:p-12 min-h-[800px] relative animate-pulse space-y-10">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start border-b border-border pb-8">
              <div className="space-y-3">
                <div className="h-6 w-48 bg-muted rounded-lg" />
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted rounded mt-4" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-6 w-24 bg-muted rounded-lg ml-auto" />
                <div className="h-3 w-16 bg-muted rounded ml-auto" />
                <div className="h-4 w-36 bg-muted rounded ml-auto" />
              </div>
            </div>

            {/* Document Title Skeleton */}
            <div className="flex flex-col items-center space-y-3 py-6">
              <div className="h-7 w-3/4 bg-muted rounded-lg" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>

            {/* Patient Grid Skeleton */}
            <div className="grid grid-cols-2 gap-10 bg-muted/50 p-6 rounded-2xl border border-border">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-6 w-40 bg-muted rounded-lg" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-3 w-28 bg-muted rounded ml-auto" />
                <div className="h-6 w-32 bg-muted rounded-lg ml-auto" />
              </div>
            </div>

            {/* Sections Skeletons */}
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 bg-muted rounded-full shrink-0" />
                  <div className="space-y-2.5 w-full">
                    <div className="h-4 w-48 bg-muted rounded" />
                    <div className="h-3.5 w-full bg-muted/70 rounded" />
                    <div className="h-3.5 w-5/6 bg-muted/70 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Signatures Skeleton */}
            <div className="grid grid-cols-2 gap-20 pt-10 border-t border-border">
              <div className="flex flex-col items-center space-y-3">
                <div className="h-16 w-32 bg-muted rounded" />
                <div className="h-px bg-muted w-full" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="h-16 w-32 bg-muted rounded" />
                <div className="h-px bg-muted w-full" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card mx-auto shadow-sm border border-border p-6 sm:p-12 min-h-[1000px] relative print:border-none print:shadow-none print:p-0">
          {/* Professional Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-35deg] print:hidden">
            <Shield className="w-96 h-96" />
          </div>

          {/* Clinic Header */}
          <div className="flex justify-between items-start border-b-2 border-primary pb-8 mb-10">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                DENTAL CLINIC
              </h1>
              <p className="text-primary font-bold tracking-[0.2em] text-xs mt-1 uppercase">
                Advanced Oral Care Center
              </p>
              <div className="mt-6 space-y-1 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-500" /> 123 Healthcare Tower, Sector 44
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-blue-500" /> +91 98765 43210
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              {(() => {
                const statusUpper = form.status?.toUpperCase() || "";
                const isSigned = statusUpper === "SIGNED" || statusUpper === "COMPLETED";
                const isDraft = statusUpper === "DRAFT";

                if (isSigned) {
                  return (
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Verified Consent
                    </div>
                  );
                } else if (isDraft) {
                  return (
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-blue-500/20">
                      Draft
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-amber-500 text-white px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-amber-500/20">
                      Pending Signature
                    </div>
                  );
                }
              })()}
              <div>
                <div className="text-muted-foreground/60 text-xs uppercase font-bold tracking-widest mt-2">
                  Document ID
                </div>
                <div className="text-sm font-bold text-foreground">{form.id}</div>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight underline underline-offset-8 decoration-blue-600/30">
              INFORMED CONSENT FOR {form.treatmentType}
            </h2>
            <p className="text-muted-foreground mt-4 text-sm max-w-2xl mx-auto leading-relaxed italic">
              "I understand that dentistry is not an exact science and therefore
              reputable practitioners cannot properly guarantee results. I
              acknowledge that no guarantee or assurance has been made by anyone
              regarding the dental treatment I have requested and authorized."
            </p>
          </div>

          {/* Consent Information */}
          <div className="bg-muted p-6 rounded-2xl mb-10 border border-border">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 border-b border-border pb-4">
              Consent Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <Label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Patient
                </Label>
                <div className="text-sm font-bold text-foreground">
                  {form.patientName}
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Doctor
                </Label>
                <div className="text-sm font-bold text-foreground">
                  {form.doctorName}
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Procedure
                </Label>
                <div className="text-sm font-bold text-foreground uppercase tracking-tight">
                  {form.treatmentType}
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Created Date
                </Label>
                <div className="text-sm font-bold text-foreground">
                  {form.createdDate ? new Date(form.createdDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  }) : "-"}
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Signed Date
                </Label>
                <div className="text-sm font-bold text-foreground">
                  {(form.status?.toUpperCase() === "SIGNED" || form.status?.toUpperCase() === "COMPLETED") && form.signedDate ? new Date(form.signedDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  }) : "Pending"}
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">
                  Status
                </Label>
                <div className="text-sm font-bold text-foreground capitalize">
                  {form.status?.toLowerCase() || "pending"}
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Offline Consent Form (If exists) */}
          {form.consentFormUrl && form.consentFormUrl !== "null" && form.consentFormUrl !== "" && (
            <div className="bg-muted p-6 rounded-2xl mb-10 border border-border flex flex-col items-start gap-3 print:hidden">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Uploaded Offline Consent Document
              </h3>
              <div className="w-full max-w-xl border border-border rounded-xl p-2 bg-card shadow-sm overflow-hidden flex justify-center items-center">
                {form.consentFormUrl.toLowerCase().includes(".pdf") || form.consentFormUrl.startsWith("data:application/pdf") ? (
                  <div className="h-32 w-full flex flex-col items-center justify-center p-4 text-center">
                    <BookOpen className="w-10 h-10 text-primary mb-1" />
                    <span className="text-xs font-bold text-foreground truncate w-full">Consent Document (PDF)</span>
                    <a
                      href={form.consentFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-xs text-primary font-bold underline"
                    >
                      Open PDF in New Tab
                    </a>
                  </div>
                ) : (
                  <img
                    src={form.consentFormUrl}
                    alt="Uploaded Consent Form"
                    className="max-h-[250px] object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Legal Content Sections */}
          <div className="space-y-10 mb-12">
            <section>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">
                  01
                </span>
                Procedure Details & Authorization
              </h3>
              <div className="pl-8 text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-border ml-3">
                {form.content}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-[10px]">
                  02
                </span>
                Disclosed Risks & Complications
              </h3>
              <div className="pl-8 text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-border ml-3">
                {form.riskDisclosure}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px]">
                  03
                </span>
                Alternative Treatment Options
              </h3>
              <div className="pl-8 text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-border ml-3">
                {form.alternativeTreatments}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px]">
                  04
                </span>
                Post-Treatment Care Compliance
              </h3>
              <div className="pl-8 text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap border-l-2 border-border ml-3">
                {form.postTreatmentCare}
              </div>
            </section>
          </div>

          {/* Final Declarations */}
          <div className="p-6 border-2 border-border rounded-2xl mb-12 bg-muted/50">
            <div className="flex gap-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                I have read this form or had it read to me. I have had an
                opportunity to ask questions and all questions have been
                answered to my satisfaction. I understand the procedure and its
                risks and alternatives. I hereby freely give my consent to the
                proposed treatment.
              </p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="grid grid-cols-2 gap-20 pt-10 border-t border-border">
            <div className="space-y-6">
              <div className="text-center">
                <div className="min-h-[100px] flex items-center justify-center p-4">
                  {form.signature ? (
                    <img
                      src={form.signature}
                      alt="Patient Signature"
                      className="max-h-24 object-contain contrast-125 mix-blend-multiply"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold italic">Not signed yet</span>
                  )}
                </div>
                <div className="h-px bg-muted w-full mb-2"></div>
                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Patient Signature
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {form.patientName}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <div className="min-h-[100px] flex items-center justify-center p-4">
                  {form.witnessSignature ? (
                    <img
                      src={form.witnessSignature}
                      alt="Witness Signature"
                      className="max-h-24 object-contain contrast-125 mix-blend-multiply"
                    />
                  ) : (
                    <div className="text-blue-100 font-serif italic text-4xl select-none">
                      Clinic Seal
                    </div>
                  )}
                </div>
                <div className="h-px bg-muted w-full mb-2"></div>
                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Witness Signature
                </div>
                <div className="text-xs font-bold text-foreground mt-1">
                  {form.witnessName || form.doctorName}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-full">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                Electronically Verified Medical Document •{" "}
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
        )}
      </div>
    </Modal>
  );
}
