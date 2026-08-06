import { Label } from "@/components/ui/Label";
import logo from "../../logo.png";
import {
  Printer,
  Shield,
  CheckCircle2,
  MapPin,
  Phone,
  Upload,
  BookOpen,
  User,
  Stethoscope,
  FileText,
  Calendar,
  ClipboardCheck,
  Quote,
  PenLine,
  HeartHandshake,
  ShieldCheck
} from "lucide-react";
import { Modal, Button } from "@/components/ui";

interface ConsentFormViewerProps {
  form: any;
  onClose: () => void;
  isLoading?: boolean;
}

export function ConsentFormViewer({ form, onClose, isLoading }: ConsentFormViewerProps) {
  const isOfflineUpload = Boolean(form?.consentFormUrl && form.consentFormUrl !== "null" && form.consentFormUrl !== "");

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
          {!isOfflineUpload && (
            <Button variant="outline" onClick={handlePrint} className="gap-2" disabled={isLoading}>
              <Printer className="w-4 h-4" /> Print / PDF
            </Button>
          )}
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
          <div className="bg-white mx-auto min-h-[1000px] relative print:border-none print:shadow-none print:p-0 flex flex-col font-sans">
            <div className="p-6 sm:p-8 flex-1">
              <div className="border-[3px] border-[#1e3a8a] rounded-3xl p-6 sm:p-8 h-full bg-white relative">

                {/* Professional Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] rotate-[-35deg]">
                  <ShieldCheck className="w-[400px] h-[400px]" />
                </div>

                {/* Clinic Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <img src={logo} alt="Clinic Logo" className="h-16 object-contain" />
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-bold text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-white" /> Verified Consent
                    </div>
                  </div>
                </div>

                {/* Disclaimer Quote */}
                <div className="border-2 border-[#94a3b8] rounded-xl p-4 bg-[#f8fafc] mb-8 flex gap-4 relative z-10">
                  <Quote className="w-6 h-6 text-[#1e3a8a] shrink-0 rotate-180" />
                  <p className="text-[#334155] text-sm font-semibold italic text-center leading-relaxed">
                    "I understand that dentistry is not an exact science and therefore reputable practitioners cannot properly guarantee results. I acknowledge that no guarantee or assurance has been made by anyone regarding the dental treatment I have requested and authorized."
                  </p>
                  <Quote className="w-6 h-6 text-[#1e3a8a] shrink-0" />
                </div>

                {/* Consent Information Grid */}
                <div className="border-2 border-[#1e3a8a] rounded-2xl mb-10 overflow-hidden relative z-10">
                  <div className="bg-[#1e3a8a] text-white text-center py-2 font-bold text-sm tracking-widest uppercase">
                    Consent Information
                  </div>
                  <div className="grid grid-cols-2 divide-x-2 divide-[#1e3a8a]">
                    <div className="divide-y-2 divide-[#1e3a8a]">
                      <div className="p-4 flex items-center gap-4 bg-white">
                        <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-[#1e3a8a]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Patient</div>
                          <div className="text-sm font-bold text-[#0f172a]">{form.patientName}</div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center gap-4 bg-[#f8fafc]">
                        <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5 text-[#1e3a8a]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Procedure</div>
                          <div className="text-sm font-bold text-[#0f172a] line-clamp-2">{form.treatmentType}</div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center gap-4 bg-white">
                        <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-[#1e3a8a]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Created Date</div>
                          <div className="text-sm font-bold text-[#0f172a]">
                            {form.createdDate ? new Date(form.createdDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y-2 divide-[#1e3a8a]">
                      <div className="p-4 flex items-center gap-4 bg-white">
                        <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-[#1e3a8a]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Doctor</div>
                          <div className="text-sm font-bold text-[#0f172a]">{form.doctorName}</div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center gap-4 bg-[#f8fafc] h-full">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
                              <ClipboardCheck className="w-5 h-5 text-[#1e3a8a]" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider">Signed Date</div>
                              <div className="text-sm font-bold text-[#0f172a]">
                                {(form.status?.toUpperCase() === "SIGNED" || form.status?.toUpperCase() === "COMPLETED") && form.signedDate ? new Date(form.signedDate).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric"
                                }) : "-"}
                              </div>
                            </div>
                          </div>
                          <div className="border-l-2 border-[#1e3a8a] pl-4 flex flex-col justify-center h-full">
                            <div className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-1 text-center">Status</div>
                            {form.status?.toUpperCase() === "SIGNED" || form.status?.toUpperCase() === "COMPLETED" ? (
                              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-bold text-[10px] uppercase tracking-wide border border-emerald-200 shadow-sm">Completed</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md font-bold text-[10px] uppercase tracking-wide border border-amber-200 shadow-sm">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offline Form Conditional Render */}
                {isOfflineUpload ? (
                  <div className="mb-10 flex flex-col items-center relative z-10 print:hidden">
                    {form.consentFormUrl.toLowerCase().includes(".pdf") || form.consentFormUrl.startsWith("data:application/pdf") ? (
                      <div className="h-48 w-full border-2 border-[#1e3a8a] border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
                        <BookOpen className="w-12 h-12 text-[#1e3a8a] mb-3" />
                        <span className="text-base font-bold text-[#1e3a8a]">Consent Document (PDF)</span>
                        <a
                          href={form.consentFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 text-sm text-blue-600 font-bold underline px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Open PDF in New Tab
                        </a>
                      </div>
                    ) : (
                      <img
                        src={form.consentFormUrl}
                        alt="Uploaded Consent Form"
                        className="w-full object-contain rounded-xl border-2 border-[#1e3a8a] print:border-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative z-10">
                    {/* Legal Sections */}
                    <div className="space-y-8 mb-10">
                      {/* Section 01 */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-[#1e3a8a] text-white px-2 py-1 rounded text-sm font-black w-8 text-center">01</div>
                          <h3 className="text-[#1e3a8a] font-bold text-lg whitespace-nowrap tracking-tight">Procedure Details & Authorization</h3>
                          <div className="h-px bg-[#1e3a8a] flex-1 opacity-40"></div>
                        </div>
                        <div className="pl-11 text-[#334155] text-sm whitespace-pre-wrap leading-relaxed font-medium">
                          {form.content}
                        </div>
                      </div>

                      {/* Section 02 */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-[#1e3a8a] text-white px-2 py-1 rounded text-sm font-black w-8 text-center">02</div>
                          <h3 className="text-[#1e3a8a] font-bold text-lg whitespace-nowrap tracking-tight">Disclosed Risks & Complications</h3>
                          <div className="h-px bg-[#1e3a8a] flex-1 opacity-40"></div>
                        </div>
                        <div className="pl-11 text-[#334155] text-sm whitespace-pre-wrap leading-relaxed font-medium">
                          {form.riskDisclosure}
                        </div>
                      </div>

                      {/* Section 03 */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-[#1e3a8a] text-white px-2 py-1 rounded text-sm font-black w-8 text-center">03</div>
                          <h3 className="text-[#1e3a8a] font-bold text-lg whitespace-nowrap tracking-tight">Alternative Treatment Options</h3>
                          <div className="h-px bg-[#1e3a8a] flex-1 opacity-40"></div>
                        </div>
                        <div className="pl-11 text-[#334155] text-sm whitespace-pre-wrap leading-relaxed font-medium">
                          {form.alternativeTreatments}
                        </div>
                      </div>

                      {/* Section 04 */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-[#1e3a8a] text-white px-2 py-1 rounded text-sm font-black w-8 text-center">04</div>
                          <h3 className="text-[#1e3a8a] font-bold text-lg whitespace-nowrap tracking-tight">Post-Treatment Care Compliance</h3>
                          <div className="h-px bg-[#1e3a8a] flex-1 opacity-40"></div>
                        </div>
                        <div className="pl-11">
                          <div className="border border-[#bfdbfe] bg-[#eff6ff] rounded-2xl p-5 flex gap-4">
                            <HeartHandshake className="w-8 h-8 text-[#1e3a8a] shrink-0" />
                            <div>
                              <p className="text-[#334155] text-sm font-bold mb-2">Follow doctor's post-treatment guidelines carefully.</p>
                              <p className="text-[#334155] text-sm leading-relaxed font-medium">
                                I have read this form or had it read to me. I have had an opportunity to ask questions and all questions have been answered to my satisfaction. I understand the procedure and its risks and alternatives. I hereby freely give my consent to the proposed treatment.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-16 pt-10 px-8">
                      <div className="text-center space-y-2">
                        <div className="h-20 flex items-center justify-center mb-2">
                          {form.signature ? (
                            <img src={form.signature} alt="Patient Signature" className="max-h-20 object-contain mix-blend-multiply contrast-125" />
                          ) : (
                            <span className="text-red-500 font-bold text-xs">Not signed yet</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 justify-center border-t border-dashed border-[#94a3b8] pt-3">
                          <PenLine className="w-4 h-4 text-[#64748b]" />
                          <span className="text-[#334155] font-bold text-sm">Patient Signature</span>
                        </div>
                        <div className="text-[#1e3a8a] font-black text-lg italic mt-1">{form.patientName}</div>
                      </div>

                      <div className="text-center space-y-2">
                        <div className="h-20 flex items-center justify-center mb-2">
                          {form.witnessSignature ? (
                            <img src={form.witnessSignature} alt="Witness Signature" className="max-h-20 object-contain mix-blend-multiply contrast-125" />
                          ) : (
                            <span className="text-[#cbd5e1] font-serif italic text-3xl">Clinic Seal</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 justify-center border-t border-dashed border-[#94a3b8] pt-3">
                          <PenLine className="w-4 h-4 text-[#64748b]" />
                          <span className="text-[#334155] font-bold text-sm">Witness Signature</span>
                        </div>
                        <div className="text-[#1e3a8a] font-black text-lg italic mt-1">{form.witnessName || form.doctorName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Solid Footer */}
            <div className="bg-[#1e3a8a] text-white py-4 text-center text-xs tracking-widest uppercase font-black mt-auto flex items-center justify-center gap-3">
              <ShieldCheck className="w-4 h-4" /> Electronically Verified Medical Document • {new Date().getFullYear()}
            </div>

          </div>
        )}
      </div>
    </Modal>
  );
}
