import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, Paperclip, Upload, X, FileText } from "lucide-react";
import {
  Modal,
  Button,
  LabeledField,
  Form,
  FormInput,
  FormDateInput,
  FormTextarea,
  toast,
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

export interface LabWorkFormSaveData extends LabWorkFormData {
  existingAttachmentIds: string[];
}

interface LabWorkFormProps {
  onClose: () => void;
  onSave: (data: LabWorkFormSaveData) => void;
  labWork?: LabWork;
  existingLabNames: string[];
  isSaving?: boolean;
}

export function LabWorkForm({
  onClose,
  onSave,
  labWork,
  existingLabNames,
  isSaving,
}: LabWorkFormProps) {
  const form = useForm<LabWorkFormData>({
    resolver: zodResolver(labWorkSchema) as any,
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
    const target = (rawPatientsData as any).responseObject !== undefined ? (rawPatientsData as any).responseObject : rawPatientsData;
    if (Array.isArray(target)) return target;
    if (target && typeof target === "object") {
      if (Array.isArray(target.data?.data?.data)) return target.data.data.data;
      if (Array.isArray(target.data?.data)) return target.data.data;
      if (Array.isArray(target.data)) return target.data;
      if (Array.isArray(target.patients)) return target.patients;
      if (Array.isArray(target.data?.patients)) return target.data.patients;
    }
    return [];
  }, [rawPatientsData]);

  const { data: rawLabNamesData, isLoading: isLabNamesLoading } = useLabNamesQuery();
  const createLabNameMutation = useCreateLabNameMutation();
  const updateLabNameMutation = useUpdateLabNameMutation();
  const deleteLabNameMutation = useDeleteLabNameMutation();
  const { confirmDelete } = useModal();
  const [deletingLabName, setDeletingLabName] = useState<string | null>(null);

  const apiLabNames = useMemo(() => {
    if (!rawLabNamesData) return [];
    if (Array.isArray(rawLabNamesData)) return rawLabNamesData;
    const target = (rawLabNamesData as any).responseObject !== undefined ? (rawLabNamesData as any).responseObject : rawLabNamesData;
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
    const apiNames = apiLabNames.map((lab: any) => typeof lab === "string" ? lab : (lab.name || "")).filter(Boolean);
    const currentName = labWork?.labName ? [labWork.labName] : [];
    const names = Array.from(new Set([...apiNames, ...currentName]));
    return names.map((name) => ({ label: name, value: name }));
  }, [apiLabNames, labWork]);

  const handleCreateLabName = async (name: string) => {
    try {
      await createLabNameMutation.mutateAsync({ name });
      toast.success("Lab added successfully");
      form.setValue("labName", name, { shouldValidate: true });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create lab");
    }
  };

  const handleUpdateLabName = async (oldName: string, newName: string) => {
    try {
      const lab = apiLabNames.find((l: any) => (typeof l === "string" ? l : l.name) === oldName);
      if (!lab || typeof lab === "string" || !lab.id) {
        form.setValue("labName", newName, { shouldValidate: true });
        return;
      }
      await updateLabNameMutation.mutateAsync({ id: lab.id, name: newName });
      toast.success("Lab updated successfully");
      if (formData.labName === oldName) {
        form.setValue("labName", newName, { shouldValidate: true });
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update lab");
    }
  };

  const handleDeleteLabName = async (nameToDelete: string) => {
    const lab = apiLabNames.find((l: any) => (typeof l === "string" ? l : l.name) === nameToDelete);
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
        } catch (err) {
          throw err;
        } finally {
          setDeletingLabName(null);
        }
      }
    );
  };

  // Ongoing treatments for the selected patient — a lab work entry must be raised
  // against one of these, matching how the clinic tracks in-progress work.
  const { data: treatmentPagesData, isLoading: isTreatmentsLoading } = usePatientTreatmentPlansQuery(
    formData.patientId || undefined,
    { enabled: !!formData.patientId, limit: 50 },
  );

  const inProgressTreatments = useMemo(() => {
    const pages = (treatmentPagesData as any)?.pages || [];
    const all = pages.flatMap((p: any) => p?.data?.data ?? p?.data ?? []);
    const filtered = all.filter((t: any) => t.status === "IN_PROGRESS");
    // Keep the currently-assigned treatment selectable even if it's no longer
    // in-progress (e.g. it was completed after this lab work was raised).
    if (
      labWork?.treatmentId &&
      formData.patientId === labWork.patientId &&
      !filtered.some((t: any) => t.id === labWork.treatmentId)
    ) {
      filtered.push({ id: labWork.treatmentId, procedure: labWork.treatmentName || labWork.treatmentId });
    }
    return filtered;
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

  const handleSubmit = (data: LabWorkFormData) => {
    onSave({ ...data, existingAttachmentIds: existingAttachments.map((a) => a.id) });
  };

  const rawFiles = (formData.rawFiles || []) as File[];

  return (
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
                const p = apiPatients.find((p: any) => p.id === val);
                form.setValue("patientId", val, { shouldValidate: true });
                form.setValue("patientName", p?.name || "", { shouldValidate: true });
                form.setValue("treatmentId", "", { shouldValidate: true });
                form.setValue("treatmentName", "");
              }}
              onSearchChange={setPatientSearchInput}
              options={[
                { label: "Select Patient", value: "none" },
                ...apiPatients.map((p: any) => ({
                  label: `${p.name}${p.phone ? ` (${p.phone})` : ""}`,
                  searchLabel: `${p.name} ${p.phone || ""}`,
                  value: p.id,
                })),
              ]}
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
                if (val === "none") return;
                const t = inProgressTreatments.find((t: any) => t.id === val);
                form.setValue("treatmentId", val, { shouldValidate: true });
                form.setValue("treatmentName", t?.procedure || "");
              }}
              options={[
                { label: "Select Treatment", value: "none" },
                ...inProgressTreatments.map((t: any) => ({
                  label: t.procedure,
                  value: t.id,
                })),
              ]}
              placeholder={!formData.patientId ? "Select a patient first" : "Select ongoing treatment"}
              searchPlaceholder="Search treatment..."
              className="w-full bg-white"
            />
            {formData.patientId && !isTreatmentsLoading && inProgressTreatments.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5">
                No ongoing treatment for this patient. Start a treatment first before raising lab work.
              </p>
            )}
          </LabeledField>

          <LabeledField label="Lab Name" required error={form.formState.errors.labName?.message}>
            <SearchableSelect
              value={formData.labName || "none"}
              onChange={(val) => {
                if (val === "none") return;
                form.setValue("labName", val, { shouldValidate: true });
              }}
              onCreateOption={handleCreateLabName}
              onEditOption={handleUpdateLabName}
              onDeleteOption={handleDeleteLabName}
              isCreating={createLabNameMutation.isPending}
              isDeletingValue={deletingLabName}
              isLoading={isLabNamesLoading}
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
            required
            placeholder="e.g. Crown - #14"
          />

          <FormInput
            control={form.control}
            name="unitsCount"
            label="No. of Units"
            type="number"
            min={1}
            required
          />

          <LabeledField label="Warranty">
            <select
              value={formData.hasWarranty ? "yes" : "no"}
              onChange={(e) => {
                const hasWarranty = e.target.value === "yes";
                form.setValue("hasWarranty", hasWarranty);
                if (!hasWarranty) {
                  form.setValue("warrantyYears", undefined);
                  form.setValue("warrantyEndDate", "");
                }
              }}
              className="form-input w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
            >
              <option value="yes">Warranty</option>
              <option value="no">No Warranty</option>
            </select>
          </LabeledField>

          {formData.hasWarranty && (
            <>
              <FormInput
                control={form.control}
                name="warrantyYears"
                label="Warranty (Years)"
                type="number"
                min={1}
                required
              />
              <FormDateInput
                control={form.control}
                name="warrantyEndDate"
                label="Warranty Valid Till"
                required
              />
            </>
          )}

          <FormInput
            control={form.control}
            name="price"
            label="Price"
            type="number"
            min={0}
            required
          />

          <FormDateInput
            control={form.control}
            name="createdDate"
            label="Created Date"
            required
          />
        </div>

        <FormTextarea
          control={form.control}
          name="notes"
          label="Notes"
          placeholder="Any additional instructions or notes for this lab work..."
          rows={3}
        />

        <div>
          <Label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Documents
          </Label>
          <div className="space-y-2">
            {existingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-border bg-muted/30"
              >
                <a
                  href={getFileUrl(att.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 min-w-0 text-primary hover:underline"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold truncate">{att.file_name}</span>
                  {att.file_size && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ({formatFileSize(att.file_size)})
                    </span>
                  )}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExistingAttachment(att.id)}
                  className="w-6 h-6 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

            {rawFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-border bg-muted/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-semibold truncate">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStagedFile(index)}
                  className="w-6 h-6 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

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
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer text-xs font-bold transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Document (PDF, image, doc)
            </Label>
          </div>
        </div>
      </form>
      </Form>
    </Modal>
  );
}
