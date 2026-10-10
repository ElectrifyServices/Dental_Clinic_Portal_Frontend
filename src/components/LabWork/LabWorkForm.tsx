import type { ApiAny } from "../../types/api";
import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, Paperclip, Upload, X, FileText, Eye, ExternalLink } from "lucide-react";
import {
  Modal,
  Button,
  LabeledField,
  Form,
  FormInput,
  FormDateInput,
  FormTextarea,
  toast,
  Loading,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
import { usePatientTreatmentPlansQuery } from "../../hooks/treatment/usePatientTreatmentPlansQuery";
import { useLabNamesQuery } from "../../hooks/labWork/useLabNamesQuery";
import { useCreateLabNameMutation } from "../../hooks/labWork/useCreateLabNameMutation";
import { useUpdateLabNameMutation } from "../../hooks/labWork/useUpdateLabNameMutation";
import { useDeleteLabNameMutation } from "../../hooks/labWork/useDeleteLabNameMutation";
import { useModal } from "@/contexts/ModalContext";
import { getFileUrl } from "../../services/apiClient";
import { LabWork, LabWorkAttachment } from "../../types";
import { labWorkSchema, type LabWorkFormData } from "@/lib/schemas/labWork.schema";



function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeConfig(fileName: string) {
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") {
    return {
      label: "PDF",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
      iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
    };
  }
  if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) {
    return {
      label: ext.toUpperCase(),
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800",
      iconBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
    };
  }
  if (["doc", "docx"].includes(ext)) {
    return {
      label: "DOC",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
      iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    };
  }
  return {
    label: ext ? ext.toUpperCase() : "FILE",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
    iconBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
}

export interface LabWorkFormSaveData extends LabWorkFormData {
  labNameId?: string;
  existingAttachmentIds: string[];
}

interface LabWorkFormProps {
  onClose: () => void;
  onSave: (data: LabWorkFormSaveData) => void;
  labWork?: LabWork;
  existingLabNames: string[];
  isSaving?: boolean;
  isLoading?: boolean;
}

/**
 * Shows the loading shell before any hook runs. The form below builds its state
 * from `labWork`, which is not there yet while loading, so the hooks live in
 * their own component that mounts only once the data has arrived - returning
 * early above them would make React see a different number of hooks between
 * renders.
 */
export function LabWorkForm(props: LabWorkFormProps) {
  if (props.isLoading) {
    return (
      <Modal
        title={props.labWork ? "Edit Lab Work" : "Add Lab Work"}
        onClose={props.onClose}
        size="5xl"
        icon={<FlaskConical className="w-4 h-4" />}
      >
        <div className="flex h-60 items-center justify-center">
          <Loading type="spinner" text="Loading data..." />
        </div>
      </Modal>
    );
  }
  return <LabWorkFormContent {...props} />;
}

function LabWorkFormContent({
  onClose,
  onSave,
  labWork,
  existingLabNames: _existingLabNames,
  isSaving,
}: LabWorkFormProps) {
  const form = useForm<LabWorkFormData>({
    resolver: zodResolver(labWorkSchema) as ApiAny,
    defaultValues: {
      patientId: labWork?.patientId ?? "",
      patientName: labWork?.patientName ?? "",
      treatmentId: labWork?.treatmentId ?? "",
      treatmentName: labWork?.treatmentName ?? "",
      labName: labWork?.labName ?? "",
      workType: labWork?.workType ?? "",
      unitsCount: labWork?.unitsCount ?? 1,
      hasWarranty: labWork?.hasWarranty ?? false,
      warrantyYears: labWork?.warrantyYears ?? undefined,
      warrantyEndDate: labWork?.warrantyEndDate ?? "",
      createdDate: labWork?.createdDate ?? new Date().toISOString().split("T")[0],
      price: labWork?.price ?? 0,
      notes: labWork?.notes ?? "",
      rawFiles: [],
    },
  });

  const formData = form.watch();

  const [existingAttachments, setExistingAttachments] = useState<LabWorkAttachment[]>(
    labWork?.attachments ?? [],
  );

  const [patientSearchInput, setPatientSearchInput] = useState("");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setPatientSearchQuery(patientSearchInput), 400);
    return () => clearTimeout(handler);
  }, [patientSearchInput]);

  const { data: rawPatientsData } = usePatientQuery({
    search: patientSearchQuery || undefined,
  });

  const apiPatients = useMemo(() => {
    if (!rawPatientsData) return [];
    if (Array.isArray(rawPatientsData)) return rawPatientsData;
    const target = (rawPatientsData as ApiAny).responseObject !== undefined ? (rawPatientsData as ApiAny).responseObject : rawPatientsData;
    let list: ApiAny[] = [];
    if (Array.isArray(target)) {
      list = target;
    } else if (target && typeof target === "object") {
      if (Array.isArray(target.data?.data?.data)) list = target.data.data.data;
      else if (Array.isArray(target.data?.data)) list = target.data.data;
      else if (Array.isArray(target.data)) list = target.data;
      else if (Array.isArray(target.patients)) list = target.patients;
      else if (Array.isArray(target.data?.patients)) list = target.data.patients;
    }
    return list.map((p: ApiAny) => ({
      ...p,
      id: p.id,
      name: p.name || p.full_name || "",
      phone: p.phone || p.mobile || "",
      country_code: p.country_code || "",
      avatar: getFileUrl(p.profile_picture_url) || getFileUrl(p.profile_picture) || getFileUrl(p.avatar) || "",
    }));
  }, [rawPatientsData]);

  const [labSearchInput, setLabSearchInput] = useState("");
  const [labSearch, setLabSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setLabSearch(labSearchInput), 400);
    return () => clearTimeout(handler);
  }, [labSearchInput]);

  const { data: rawLabNamesData, isLoading: isLabNamesLoading } = useLabNamesQuery({
    search: labSearch || undefined,
  });
  const createLabNameMutation = useCreateLabNameMutation();
  const updateLabNameMutation = useUpdateLabNameMutation();
  const deleteLabNameMutation = useDeleteLabNameMutation();
  const { confirmDelete } = useModal();
  const [deletingLabName, setDeletingLabName] = useState<string | null>(null);

  const apiLabNames = useMemo(() => {
    if (!rawLabNamesData) return [];
    if (Array.isArray(rawLabNamesData)) return rawLabNamesData;
    const target = (rawLabNamesData as ApiAny).responseObject !== undefined ? (rawLabNamesData as ApiAny).responseObject : rawLabNamesData;
    if (Array.isArray(target)) return target;
    if (target && typeof target === "object") {
      if (Array.isArray(target.data?.data?.data)) return target.data.data.data;
      if (Array.isArray(target.data?.data)) return target.data.data;
      if (Array.isArray(target.data)) return target.data;
      if (Array.isArray(target.labNames)) return target.labNames;
      if (Array.isArray(target.data?.labNames)) return target.data.labNames;
      if (Array.isArray(target.list)) return target.list;
      if (Array.isArray(target.rows)) return target.rows;
      if (Array.isArray(target.results)) return target.results;
    }
    return [];
  }, [rawLabNamesData]);

  const labOptions = useMemo(() => {
    const apiNames = apiLabNames.map((lab: ApiAny) => typeof lab === "string" ? lab : (lab.name || "")).filter(Boolean);
    const currentName = labWork?.labName ? [labWork.labName] : [];
    const names = Array.from(new Set([...apiNames, ...currentName]));
    return names.map((name) => ({ label: name, value: name }));
  }, [apiLabNames, labWork]);

  const handleCreateLabName = async (name: string) => {
    try {
      await createLabNameMutation.mutateAsync({ name });
      toast.success("Lab added successfully");
      form.setValue("labName", name, { shouldValidate: true });
    } catch (err: ApiAny) {
      toast.error(err?.message || "Failed to create lab");
    }
  };

  const handleUpdateLabName = async (oldName: string, newName: string) => {
    try {
      const lab = apiLabNames.find((l: ApiAny) => (typeof l === "string" ? l : l.name) === oldName);
      if (!lab || typeof lab === "string" || !lab.id) {
        form.setValue("labName", newName, { shouldValidate: true });
        return;
      }
      await updateLabNameMutation.mutateAsync({ id: lab.id, name: newName });
      toast.success("Lab updated successfully");
      if (formData.labName === oldName) {
        form.setValue("labName", newName, { shouldValidate: true });
      }
    } catch (err: ApiAny) {
      toast.error(err?.message || "Failed to update lab");
    }
  };

  const handleDeleteLabName = async (nameToDelete: string) => {
    const lab = apiLabNames.find((l: ApiAny) => (typeof l === "string" ? l : l.name) === nameToDelete);
    if (!lab || typeof lab === "string" || !lab.id) {
      toast.error("Lab not found");
      return;
    }

    confirmDelete(
      "Delete Lab",
      `Are you sure you want to delete the lab "${nameToDelete}"?`,
      async () => {
        try {
          setDeletingLabName(nameToDelete);
          await deleteLabNameMutation.mutateAsync({ id: lab.id });
          if (formData.labName === nameToDelete) {
            form.setValue("labName", "");
          }
        } finally {
          setDeletingLabName(null);
        }
      }
    );
  };

  // Procedures CRUD list
  // Load treatments for the patient, filtered by status ["PLANNED", "IN_PROGRESS"]
  const { data: treatmentPagesData, isLoading: isTreatmentsLoading } = usePatientTreatmentPlansQuery(
    formData.patientId || undefined,
    {
      enabled: !!formData.patientId,
      limit: 100,
      filters: { status: ["PLANNED", "IN_PROGRESS"] },
    },
  );

  const inProgressTreatments = useMemo(() => {
    const pages = (treatmentPagesData as ApiAny)?.pages || [];
    const all = pages.flatMap((p: ApiAny) => p?.data?.data ?? p?.data ?? []);
    // Keep currently assigned treatment plan selectable
    if (
      labWork?.treatmentId &&
      formData.patientId === labWork.patientId &&
      !all.some((t: ApiAny) => t.id === labWork.treatmentId)
    ) {
      all.push({ id: labWork.treatmentId, procedure: labWork.treatmentName || labWork.treatmentId });
    }
    return all;
  }, [treatmentPagesData, labWork, formData.patientId]);

  // Auto-suggest the warranty end date from created date + warranty years,
  // without overriding a value the user has already picked manually.
  useEffect(() => {
    if (!formData.hasWarranty || !formData.warrantyYears || !formData.createdDate) return;
    if (formData.warrantyEndDate) return;
    const base = new Date(formData.createdDate);
    if (isNaN(base.getTime())) return;
    base.setFullYear(base.getFullYear() + Number(formData.warrantyYears));
    form.setValue("warrantyEndDate", base.toISOString().split("T")[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasWarranty, formData.warrantyYears, formData.createdDate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const current = (form.getValues("rawFiles") || []) as File[];
    form.setValue("rawFiles", [...current, ...files]);
    e.target.value = "";
  };

  const removeStagedFile = (index: number) => {
    const current = (form.getValues("rawFiles") || []) as File[];
    form.setValue(
      "rawFiles",
      current.filter((_, i) => i !== index),
    );
  };

  const removeExistingAttachment = (id: string) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const promptRemoveStagedFile = (index: number, fileName: string) => {
    confirmDelete(
      "Remove Document",
      `Are you sure you want to remove "${fileName}" from this lab work?`,
      () => {
        removeStagedFile(index);
        toast.success("Document removed");
      }
    );
  };

  const promptRemoveExistingAttachment = (id: string, fileName: string) => {
    confirmDelete(
      "Remove Document",
      `Are you sure you want to remove "${fileName}" from this lab work?`,
      () => {
        removeExistingAttachment(id);
        toast.success("Document removed");
      }
    );
  };

  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    size?: number;
    type?: string;
    isBlob?: boolean;
  } | null>(null);

  const handlePreviewExisting = (att: LabWorkAttachment) => {
    const url = getFileUrl(att.file_url);
    const ext = (att.file_name.split(".").pop() || "").toLowerCase();
    setPreviewFile({
      url,
      name: att.file_name,
      size: att.file_size,
      type: ext,
      isBlob: false,
    });
  };

  const handlePreviewRawFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    setPreviewFile({
      url,
      name: file.name,
      size: file.size,
      type: ext,
      isBlob: true,
    });
  };

  const handleClosePreview = () => {
    if (previewFile?.isBlob && previewFile.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    const current = (form.getValues("rawFiles") || []) as File[];
    form.setValue("rawFiles", [...current, ...files]);
  };

  const handleSubmit = (data: LabWorkFormData) => {
    const selectedLab = apiLabNames.find((l: ApiAny) => (typeof l === "string" ? l : l.name) === data.labName);
    const labNameId = selectedLab && typeof selectedLab === "object" ? selectedLab.id : "";
    onSave({
      ...data,
      labNameId,
      existingAttachmentIds: existingAttachments.map((a) => a.id),
    });
  };

  const rawFiles = (formData.rawFiles || []) as File[];

  return (
    <>
      <Modal
      title={labWork ? "Edit Lab Work" : "Add Lab Work"}
      onClose={onClose}
      size="5xl"
      icon={<FlaskConical className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSaving}>
            {isSaving ? "Saving…" : labWork ? "Save Changes" : "Add Entry"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledField label="Patient" required error={form.formState.errors.patientName?.message}>
            <SearchableSelect
              value={formData.patientId || "none"}
              onChange={(val) => {
                if (val === "none") return;
                const p = apiPatients.find((p: ApiAny) => p.id === val);
                form.setValue("patientId", val, { shouldValidate: true });
                form.setValue("patientName", p?.name || "", { shouldValidate: true });
              }}
              onSearchChange={setPatientSearchInput}
              options={[
                { label: "Select Patient", value: "none", avatar: "", phone: "" },
                ...apiPatients.map((p: ApiAny) => {
                  const formattedPhone = p.phone ? (p.country_code ? `${p.country_code} ${p.phone}` : p.phone) : "";
                  return {
                    label: p.name,
                    searchLabel: `${p.name} ${formattedPhone}`,
                    value: p.id,
                    avatar: p.avatar,
                    phone: formattedPhone,
                  };
                }),
              ]}
              renderOption={(opt: ApiAny) => {
                if (opt.value === "none") return <span className="text-muted-foreground">{opt.label}</span>;
                return (
                  <div className="flex items-center gap-2 py-0.5">
                    {opt.avatar ? (
                      <img
                        src={opt.avatar}
                        alt={opt.label}
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 border border-primary/20">
                        {opt.label.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-semibold text-foreground text-xs">{opt.label}</span>
                      {opt.phone && (
                        <span className="text-[10px] text-muted-foreground font-mono">{opt.phone}</span>
                      )}
                    </div>
                  </div>
                );
              }}
              renderValue={(opt: ApiAny) => {
                if (opt.value === "none") return <span>{opt.label}</span>;
                return (
                  <div className="flex items-center gap-2">
                    {opt.avatar ? (
                      <img
                        src={opt.avatar}
                        alt={opt.label}
                        className="w-5 h-5 rounded-full object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0 border border-primary/20">
                        {opt.label.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{opt.label}</span>
                  </div>
                );
              }}
              placeholder="Select Patient"
              searchPlaceholder="Search Patient..."
              className="w-full bg-white"
            />
          </LabeledField>

          <LabeledField label="Treatment" required error={form.formState.errors.treatmentId?.message}>
            <SearchableSelect
              value={formData.treatmentId || "none"}
              disabled={!formData.patientId}
              isLoading={isTreatmentsLoading}
              onChange={(val) => {
                const targetVal = val === "none" ? "" : val;
                const t = inProgressTreatments.find((t: ApiAny) => t.id === targetVal);
                form.setValue("treatmentId", targetVal, { shouldValidate: true });
                form.setValue("treatmentName", t?.procedure || "");
              }}
              options={[
                { label: "Select Treatment", value: "none" },
                ...inProgressTreatments.map((t: ApiAny) => ({
                  label: t.procedure,
                  value: t.id,
                })),
              ]}
              placeholder={!formData.patientId ? "Select a patient first" : "Select ongoing treatment"}
              searchPlaceholder="Search treatment..."
              className="w-full bg-white"
            />
          </LabeledField>

          <LabeledField label="Lab Name" required error={form.formState.errors.labName?.message}>
            <SearchableSelect
              value={formData.labName || "none"}
              onChange={(val) => {
                const targetVal = val === "none" ? "" : val;
                form.setValue("labName", targetVal, { shouldValidate: true });
              }}
              onCreateOption={handleCreateLabName}
              onEditOption={handleUpdateLabName}
              onDeleteOption={handleDeleteLabName}
              isCreating={createLabNameMutation.isPending}
              isDeletingValue={deletingLabName}
              isLoading={isLabNamesLoading}
              onSearchChange={setLabSearchInput}
              createLabel="Create lab"
              capitalizeWords
              options={[
                { label: "Select Lab", value: "none" },
                ...labOptions,
              ]}
              placeholder="Select or add lab"
              searchPlaceholder="Search or add lab name..."
              className="w-full bg-white"
            />
          </LabeledField>

          <FormInput
            control={form.control}
            name="workType"
            label="Work / Tooth No."
            placeholder="e.g. Crown - #14"
          />

          <FormInput
            control={form.control}
            name="unitsCount"
            label="No. of Units"
            type="number"
            min={1}
          />

          <LabeledField label="Warranty">
            <Select
              value={formData.hasWarranty ? "yes" : "no"}
              onValueChange={(val) => {
                const hasWarranty = val === "yes";
                form.setValue("hasWarranty", hasWarranty);
                if (!hasWarranty) {
                  form.setValue("warrantyYears", undefined);
                  form.setValue("warrantyEndDate", "");
                }
              }}
            >
              <SelectTrigger className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-input bg-card shadow-sm text-foreground">
                <SelectValue placeholder="Select Warranty Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes" className="text-xs font-semibold">Warranty</SelectItem>
                <SelectItem value="no" className="text-xs font-semibold">No Warranty</SelectItem>
              </SelectContent>
            </Select>
          </LabeledField>

          {formData.hasWarranty && (
            <>
              <FormInput
                control={form.control}
                name="warrantyYears"
                label="Warranty (Years)"
                type="number"
                min={1}
              />
              <FormDateInput
                control={form.control}
                name="warrantyEndDate"
                label="Warranty Valid Till"
              />
            </>
          )}

          <FormInput
            control={form.control}
            name="price"
            label="Price"
            type="text"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              const numVal = val === "" ? 0 : parseInt(val, 10);
              form.setValue("price", numVal, { shouldValidate: true });
            }}
          />

          <FormDateInput
            control={form.control}
            name="createdDate"
            label="Created Date"
            className="sm:col-start-2"
          />
        </div>

        <FormTextarea
          control={form.control}
          name="notes"
          label="Notes"
          placeholder="Any additional instructions or notes for this lab work..."
          rows={3}
        />

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="block text-xs font-semibold text-foreground">
              Documents & Prescriptions
            </Label>
            {(existingAttachments.length + rawFiles.length) > 0 && (
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {existingAttachments.length + rawFiles.length} {(existingAttachments.length + rawFiles.length) === 1 ? "file attached" : "files attached"}
              </span>
            )}
          </div>

          {/* List of attachments */}
          {(existingAttachments.length + rawFiles.length) > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {existingAttachments.map((att) => {
                const cfg = getFileTypeConfig(att.file_name);
                return (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg} font-black text-[10px]`}>
                        {cfg.label}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate" title={att.file_name}>
                          {att.file_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {att.file_size ? (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {formatFileSize(att.file_size)}
                            </span>
                          ) : null}
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                            Saved
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewExisting(att)}
                        className="h-7 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg gap-1.5"
                        title="Preview document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => promptRemoveExistingAttachment(att.id, att.file_name)}
                        className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Remove document"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {rawFiles.map((file, index) => {
                const cfg = getFileTypeConfig(file.name);
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg} font-black text-[10px]`}>
                        {cfg.label}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
                            New
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewRawFile(file)}
                        className="h-7 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg gap-1.5"
                        title="Preview document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => promptRemoveStagedFile(index, file.name)}
                        className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Remove document"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.005]"
                : "border-border hover:border-primary/50 hover:bg-muted/20"
            }`}
          >
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="labwork-document-upload"
            />
            <Label
              htmlFor="labwork-document-upload"
              className="flex flex-col items-center justify-center gap-1.5 p-4 cursor-pointer text-center select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform hover:scale-105">
                <Upload className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  Click to browse or drag & drop documents
                </p>
                <p className="text-[11px] text-muted-foreground font-normal">
                  Supports PDF, JPG, PNG, DOC, DOCX up to 10MB
                </p>
              </div>
            </Label>
          </div>
        </div>
      </form>
      </Form>
    </Modal>

    {previewFile && (
      <Modal
        title={previewFile.name}
        subtitle={previewFile.size ? `Size: ${formatFileSize(previewFile.size)}` : undefined}
        onClose={handleClosePreview}
        size="4xl"
        icon={<FileText className="w-4 h-4 text-primary" />}
        footer={
          <div className="flex items-center justify-between w-full">
            <a
              href={previewFile.url}
              target="_blank"
              rel="noreferrer"
              download={previewFile.name}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab / Download
            </a>
            <Button variant="outline" size="sm" onClick={handleClosePreview}>
              Close
            </Button>
          </div>
        }
      >
        <div className="flex items-center justify-center p-2 min-h-[50vh] max-h-[72vh] overflow-auto">
          {["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(previewFile.type || "") ? (
            <div className="flex flex-col items-center justify-center w-full">
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-md border border-border"
              />
            </div>
          ) : previewFile.type === "pdf" ? (
            <iframe
              src={previewFile.url}
              className="w-full h-[65vh] rounded-xl border border-border shadow-inner bg-white"
              title={previewFile.name}
            />
          ) : (
            <div className="text-center py-12 px-4 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1 truncate">
                {previewFile.name}
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Preview is not directly viewable in browser for .{previewFile.type} files.
              </p>
              <a
                href={previewFile.url}
                target="_blank"
                rel="noreferrer"
                download={previewFile.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Download / Open File
              </a>
            </div>
          )}
        </div>
      </Modal>
    )}
    </>
  );
}
