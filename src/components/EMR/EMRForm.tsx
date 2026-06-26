import React, { useMemo, useState } from "react";
import { Save, FileText, Camera, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Label,
  Input,
  Textarea,
  SearchableSelect,
} from "@/components/ui";
import { useFormTitle, useSubmitLabel } from "../../hooks/useFormConfig";
import { emrSchema, type EmrFormData } from "@/lib/schemas/emr.schema";
import { usePatientQuery } from "@/hooks/patients/usePatientQuery";

interface EMRFormProps {
  onClose: () => void;
  onSave: (record: any) => void;
  record?: any;
  patients: any[];
}

const RECORD_TYPE_OPTIONS = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "X_RAY", label: "X-Ray" },
  { value: "TREATMENT_NOTE", label: "Treatment Note" },
  { value: "BILLING_RECORD", label: "Billing Record" },
  { value: "APPOINTMENT_VISIT", label: "Appointment Visit" },
] as const;

export function EMRForm({
  onClose,
  onSave,
  record,
  patients: allPatients,
}: EMRFormProps) {
  const formTitle = useFormTitle("emr", record ? "edit" : "create");
  const submitLabel = useSubmitLabel("emr", record ? "edit" : "create");
  const [attachments, setAttachments] = useState<string[]>(
    record?.attachments ?? [],
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: rawPatientsData } = usePatientQuery({ filters: { isDropdown: [true] as any } });
  const apiPatients = useMemo(() => {
    return Array.isArray(rawPatientsData) 
      ? rawPatientsData 
      : (rawPatientsData as any)?.data?.data || (rawPatientsData as any)?.data || [];
  }, [rawPatientsData]);

  const form = useForm<EmrFormData>({
    resolver: zodResolver(emrSchema) as any,
    defaultValues: {
      patientName: record?.patientName ?? "",
      type: record?.type ?? "CONSULTATION",
      title: record?.title ?? "",
      content: record?.content ?? "",
      date: record?.date ?? new Date().toISOString().split("T")[0],
      attachments: record?.attachments ?? [],
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...filesList]);
    const urls = filesList.map((f) =>
      URL.createObjectURL(f),
    );
    setAttachments((prev) => [...prev, ...urls]);
  };

  const onSubmit = (data: EmrFormData) => {
    onSave({
      ...data,
      attachments,
      files: selectedFiles,
      id: record?.id || Date.now().toString(),
      patientId: record?.patientId || "",
      doctorId: "1",
      doctorName: "Dr. Sharma",
    });
  };

  return (
    <Modal
      title={formTitle}
      onClose={onClose}
      size="2xl"
      icon={<FileText className="w-4 h-4" />}
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
            <Save className="w-4 h-4" />
            {submitLabel}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Patient */}
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Patient <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        // Optional: if patientId needs to be set, we can look it up, 
                        // but it seems EMRForm relies on patientName and looks up ID on submit.
                      }}
                      options={[
                        { label: "Select Patient", value: "none" },
                        ...apiPatients.map((p: any) => ({
                          label: `${p.name} ${p.phone ? `(${p.phone})` : ""}`,
                          searchLabel: `${p.name} ${p.phone || ""}`,
                          value: p.name,
                          patient: p,
                        }))
                      ]}
                      renderOption={(option: any) => {
                        if (option.value === "none") return <span className="truncate pr-2">{option.label}</span>;
                        const p = option.patient;
                        if (!p) return <span className="truncate pr-2">{option.label}</span>;

                        const profilePic = p.profilePicture || p.avatar || p.profile_picture || p.image;
                        const initial = p.name ? p.name.trim().charAt(0).toUpperCase() : "?";

                        return (
                          <div className="flex items-center gap-3 py-1">
                            {profilePic ? (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                                <img
                                  src={profilePic}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 flex-shrink-0">
                                {initial}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground text-sm truncate">{p.name}</span>
                              {p.phone && (
                                <span className="text-[10px] font-semibold text-muted-foreground truncate tracking-wide">
                                  {p.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }}
                      renderValue={(option: any) => {
                        if (option.value === "none") return option.label;
                        const p = option.patient;
                        if (!p) return option.label;

                        const profilePic = p.profilePicture || p.avatar || p.profile_picture || p.image;
                        const initial = p.name ? p.name.trim().charAt(0).toUpperCase() : "?";

                        return (
                          <div className="flex items-center gap-2">
                            {profilePic ? (
                              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border flex-shrink-0 bg-muted">
                                <img
                                  src={profilePic}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center border border-primary/20 flex-shrink-0">
                                {initial}
                              </div>
                            )}
                            <span className="font-bold text-foreground text-sm truncate">{p.name}</span>
                          </div>
                        );
                      }}
                      placeholder="Select patient..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Record type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Record Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={RECORD_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                      placeholder="Select Record Type..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Record title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    Content <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Enter record details, notes, or observations..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── Attachment uploader ── */}
          <div>
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-input rounded-2xl p-8 text-center bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer relative">
              <Input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Click or drag to upload files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Images, reports, or documents (Max 10MB)
                </p>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2 mt-3">
                {attachments.map((url: string, idx: number) => {
                  const initialAttachmentCount = record?.attachments?.length || 0;
                  const isNewFile = idx >= initialAttachmentCount;
                  const fileObj = isNewFile ? selectedFiles[idx - initialAttachmentCount] : null;
                  
                  const isImage = fileObj 
                    ? fileObj.type.startsWith("image/") 
                    : url.match(/\\.(jpeg|jpg|gif|png|webp|svg)$/i) || url.startsWith("blob:") || url.startsWith("data:image");

                  const fileName = fileObj ? fileObj.name : url.split('/').pop() || `File ${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      className="relative aspect-square bg-muted rounded-xl overflow-hidden border border-border flex flex-col items-center justify-center group"
                    >
                      {isImage ? (
                        <img src={url} alt="attachment" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center w-full h-full bg-primary/5">
                           <FileText className="w-6 h-6 text-primary mb-1" />
                           <span className="text-[9px] font-medium text-foreground line-clamp-2 break-all">{fileName}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </Form>
    </Modal>
  );
}
