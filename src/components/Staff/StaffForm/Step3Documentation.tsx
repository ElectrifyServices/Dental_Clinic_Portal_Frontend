import React from 'react';
import { FileText, Upload, Shield, CheckCircle2, Trash2, Eye } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useModal } from '@/contexts/ModalContext';

interface Step3Props {
  role: string;
  documents: any[];
  onUpload: (docType: string, file: File) => void;
  onRemove: (docType: string) => void;
}

const DOC_REQUIREMENTS: Record<string, string[]> = {
  doctor: [
    'Aadhaar / Identity Proof', 'Educational Degree Documents', 'Medical Council Registration',
    'Experience Certificates', 'Medical Indemnity Insurance', 'NOC (if applicable)',
    'Police Verification', 'PAN Card', 'Bank Details / Passbook', 'Signed Employment Contract'
  ],
  receptionist: [
    'Aadhaar / Identity Proof', 'Educational Degree Documents', 'Experience Certificates',
    'PAN Card', 'Bank Details / Passbook'
  ],
  assistant: [
    'Aadhaar / Identity Proof', 'Educational Degree Documents', 'Experience Certificates',
    'Medical Fitness Certificate', 'Vaccination Proof (Hep-B/COVID)'
  ],
  admin: [
    'Aadhaar / Identity Proof', 'PAN Card', 'Resume / CV', 'Bank Details / Passbook',
    'Police Verification', 'Signed Employment Contract', 'Experience Certificates'
  ],
  super_admin: [
    'Aadhaar / Identity Proof', 'PAN Card', 'Resume / CV', 'Bank Details / Passbook',
    'Police Verification', 'Signed Employment Contract', 'Experience Certificates'
  ]
};

export const REQUIRED_DOCS: Record<string, string[]> = {
  doctor: [
    'Aadhaar / Identity Proof', 'Educational Degree Documents', 'Medical Council Registration', 'PAN Card', 'Bank Details / Passbook'
  ],
  receptionist: [
    'Aadhaar / Identity Proof', 'PAN Card', 'Bank Details / Passbook'
  ],
  assistant: [
    'Aadhaar / Identity Proof', 'Vaccination Proof (Hep-B/COVID)'
  ],
  admin: [
    'Aadhaar / Identity Proof', 'PAN Card', 'Bank Details / Passbook', 'Signed Employment Contract'
  ],
  super_admin: [
    'Aadhaar / Identity Proof', 'PAN Card', 'Bank Details / Passbook', 'Signed Employment Contract'
  ]
};

export function Step3Documentation({ role, documents, onUpload, onRemove }: Step3Props) {
  const { showConfirm } = useModal();
  const requirements = DOC_REQUIREMENTS[role] || DOC_REQUIREMENTS.assistant;
  const requiredList = REQUIRED_DOCS[role] || REQUIRED_DOCS.assistant;

  const handleFileChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(docType, file);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="text-center">
        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Compliance & Documents</h3>
        <p className="text-xs text-muted-foreground font-medium">Upload mandatory verification records for {role} role</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirements.map((doc, idx) => {
          const uploadedFiles = documents.filter(d => d.type === doc);
          const hasFiles = uploadedFiles.length > 0;
          const isRequired = requiredList.includes(doc);

          return (
            <div key={idx} className={`p-4 border rounded-2xl transition-all bg-card/50 group relative overflow-hidden ${hasFiles ? 'border-emerald-200 bg-emerald-50/30' : 'border-border hover:border-primary/30'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:rotate-6 ${hasFiles ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                    {hasFiles ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <span className={`font-bold text-xs ${hasFiles ? 'text-emerald-700' : 'text-foreground'}`}>{doc}</span>
                </div>
                {hasFiles ? (
                  <Badge variant="green" className="text-[8px] font-black tracking-widest">{uploadedFiles.length} UPLOADED</Badge>
                ) : isRequired ? (
                  <Badge variant="amber" className="text-[8px] font-black tracking-widest">REQUIRED</Badge>
                ) : (
                  <Badge variant="gray" className="text-[8px] font-black tracking-widest bg-muted text-muted-foreground/60 border border-border">OPTIONAL</Badge>
                )}
              </div>

              {hasFiles && (
                <div className="space-y-2 mb-3 relative z-20">
                  {uploadedFiles.map((file: any, fIdx: number) => (
                    <div key={fIdx} className="flex items-center justify-between bg-card/60 p-2 rounded-xl border border-emerald-100 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-emerald-800 truncate max-w-[120px]" title={file.name}>{file.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-emerald-600 hover:bg-emerald-100" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const win = window.open('', '_blank');
                            if (win) {
                              win.document.body.style.margin = '0';
                              win.document.body.innerHTML = `<iframe src="${file.url}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`;
                            }
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:bg-destructive/10" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            showConfirm(
                              'Remove Document',
                              `Are you sure you want to remove ${file.name}?`,
                              () => onRemove(file),
                              'Remove'
                            );
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <div className={`w-full ${hasFiles ? 'h-10' : 'h-14'} border-2 border-dashed border-border rounded-xl flex items-center justify-center group-hover:border-primary/50 transition-all cursor-pointer bg-muted/20 hover:bg-primary/5`}>
                  <Upload className="w-3.5 h-3.5 text-muted-foreground mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{hasFiles ? "Upload Another" : "Tap to upload PDF/JPG"}</span>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(doc, e)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {hasFiles && (
                <div className="absolute -right-2 -bottom-2 opacity-5 pointer-events-none">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-primary/50 border border-primary/20 rounded-2xl flex gap-4 shadow-sm">
        <div className="w-12 h-12 bg-primary/100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Verification Compliance</h4>
          <p className="text-[11px] text-primary/80 font-medium leading-relaxed">
            Ensure all documents are high-resolution scans. We accept <span className="font-bold">PDF, JPG, and PNG</span> formats under <span className="font-black text-blue-900">5MB</span>.
            Missing or illegible documents will delay the onboarding process.
          </p>
        </div>
      </div>
    </div>
  );
}
