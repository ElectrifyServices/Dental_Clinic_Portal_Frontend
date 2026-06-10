import React from "react";
import {
  Download,
  FileText,
  User,
  Calendar,
  Stethoscope,
  Camera,
} from "lucide-react";
import {
  Modal,
  Badge,
  Button,
  ContentCard,
  SearchInput,
  FilterTabs,
} from "@/components/ui";
import { useEMRListQuery } from "../../hooks/emr/useEMRListQuery";
import { useDebounce } from "../../hooks/useDebounce";

interface EMRViewerProps {
  record: any;
  onClose: () => void;
}

export function EMRViewer({ record, onClose }: EMRViewerProps) {
  if (!record) return null;

  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  const debouncedSearch = useDebounce(search, 500);

  const queryParams: any = {
    page: 1,
    limit: 1000,
    filters: {
      patient_id: record.patientId,
    }
  };

  if (debouncedSearch) {
    queryParams.search = debouncedSearch;
  }
  if (activeTab && activeTab !== "all") {
    queryParams.filters.record_type = [activeTab.toUpperCase()];
  }

  const { data: apiListData, isLoading } = useEMRListQuery(queryParams, {
    refetchOnMount: "always",
  });

  const detailedRecord = React.useMemo(() => {
    let rawList: any[] = [];
    if (apiListData) {
      if (Array.isArray(apiListData)) {
        rawList = apiListData;
      } else if (Array.isArray((apiListData as any).data?.data)) {
        rawList = (apiListData as any).data.data;
      } else if (Array.isArray((apiListData as any).data)) {
        rawList = (apiListData as any).data;
      } else if (Array.isArray((apiListData as any).responseObject?.data)) {
        rawList = (apiListData as any).responseObject.data;
      } else if (Array.isArray((apiListData as any).responseObject)) {
        rawList = (apiListData as any).responseObject;
      }
    }

    const latestItem = rawList[0] || record;

    return {
      ...record,
      patientName: latestItem.patient?.name || record.patientName || "—",
      date: latestItem.created_at || latestItem.date || record.date || new Date().toISOString(),
      type: (latestItem.record_type || latestItem.type || record.type || "consultation").toLowerCase(),
      title: latestItem.title || record.title || "—",
      content: latestItem.content || record.content || "—",
      doctorName: record.doctorName || "—",
      attachments: Array.isArray(latestItem.attachments)
        ? latestItem.attachments.map((file: any) => typeof file === "string" ? file : file.file_url || file.url)
        : record.attachments || [],
      timeline: rawList.map((item: any) => ({
        id: item.id,
        title: item.title || "—",
        content: item.content || "—",
        date: item.created_at || item.date || new Date().toISOString(),
        category: (item.record_type || item.type || "consultation").toLowerCase(),
      }))
    };
  }, [apiListData, record]);

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

  const filteredTimeline = React.useMemo(() => {
    return detailedRecord.timeline || [];
  }, [detailedRecord.timeline]);

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>EMR Record - ${detailedRecord.patientName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 40px; line-height: 1.6; color: #1e293b; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 4px solid #2563eb; padding-bottom: 20px; }
            .record-info { background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .content { white-space: pre-wrap; margin-bottom: 30px; padding: 20px; background: #fff; border-radius: 8px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            h1, h2, h3 { color: #1e3a8a; margin: 0 0 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Electronic Medical Record</h1>
            <p style="font-weight: bold; color: #2563eb;">Opal Smiles Dental Studio - Advanced Dental Solutions</p>
          </div>
          
          <div class="record-info">
            <h3 style="margin-top:0">Record Information</h3>
            <p><strong>Patient:</strong> ${detailedRecord.patientName}</p>
            <p><strong>Date:</strong> ${new Date(detailedRecord.date).toLocaleDateString()}</p>
            <p><strong>Doctor:</strong> ${detailedRecord.doctorName || "N/A"}</p>
            <p><strong>Type:</strong> ${detailedRecord.type.toUpperCase()}</p>
          </div>

          <div class="content">
            <h3>Medical Record Content</h3>
            ${detailedRecord.content || "No primary content summary available."}
          </div>

          <div class="footer">
            <p>This is a confidential medical document generated from Opal Smiles Dental Studio EMR System</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emr-${detailedRecord.patientName}-${detailedRecord.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={detailedRecord.patientName}
      subtitle="Complete Electronic Medical History"
      onClose={onClose}
      size="5xl"
      icon={<FileText className="w-5 h-5" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Close Record
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <ContentCard
          title="Patient Summary"
          icon={<User className="w-5 h-5 text-primary" />}
          className="bg-primary/5 border-primary/10"
        >
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">
                Patient Name
              </p>
              <p className="font-black text-foreground text-sm tracking-tight">
                {detailedRecord.patientName}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">
                Recorded On
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary/40" />
                <p className="font-black text-foreground text-sm tracking-tight">
                  {new Date(detailedRecord.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">
                Record Type
              </p>
              <Badge
                variant="blue"
                className="font-black uppercase text-[9px] tracking-widest px-2.5 h-5"
              >
                {(detailedRecord.type || "previous-prescriptions").replace(/-/g, " ")}
              </Badge>
            </div>
          </div>
        </ContentCard>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary" />
              </div>
              Medical History
            </h3>
            {detailedRecord.timeline && (
              <Badge
                variant="secondary"
                className="font-black uppercase text-[9px] tracking-widest px-3 h-6"
              >
                {filteredTimeline?.length || 0} Records
              </Badge>
            )}
          </div>

          {detailedRecord.timeline ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search in clinical notes, procedures..."
                />
                <div className="overflow-x-auto pb-2 -mx-2 px-2">
                  <FilterTabs
                    tabs={TIMELINE_FILTERS}
                    active={activeTab}
                    onChange={setActiveTab}
                  />
                </div>
              </div>

              <div className="relative pl-10 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-1 before:bg-muted before:rounded-full">
                {filteredTimeline && filteredTimeline.length > 0 ? (
                  filteredTimeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[35px] top-6 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-125 z-10" />
                      <ContentCard className="border-border/50 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-foreground text-sm uppercase tracking-tight">
                            {item.title}
                          </span>
                          <time className="text-[10px] font-black text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            {new Date(item.date).toLocaleDateString()}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                          {item.content}
                        </p>
                      </ContentCard>
                    </div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50 -ml-10">
                    <FileText className="w-16 h-16 text-muted-foreground/10 mb-6" />
                    <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">
                      No records found
                    </h3>
                    <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
                      Try adjusting your filters or search query.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        setActiveTab("all");
                      }}
                      className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ContentCard title={detailedRecord.title} className="border-border/50">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium">
                {detailedRecord.content}
              </p>
            </ContentCard>
          )}
        </div>

        {detailedRecord.attachments && detailedRecord.attachments.length > 0 && (
          <div className="space-y-4">
            <h3 className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-500" /> Digital Attachments (
              {detailedRecord.attachments.length})
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {detailedRecord.attachments.map((attachment: string, index: number) => (
                <div
                  key={index}
                  className="group aspect-square bg-muted/30 rounded-2xl border border-border/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all hover:shadow-xl"
                >
                  <Camera className="w-10 h-10 text-muted-foreground/40 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-3 px-2 text-center opacity-60">
                    {attachment.split(".").pop()} FILE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
