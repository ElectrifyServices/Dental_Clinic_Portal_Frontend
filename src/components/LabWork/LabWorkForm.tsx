import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical } from "lucide-react";
import {
  Modal,
  Button,
  LabeledField,
  Form,
  FormInput,
  FormDateInput,
} from "@/components/ui";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { usePatientQuery } from "../../hooks/patients/usePatientQuery";
import { LabWork } from "../../types";
import { labWorkSchema, type LabWorkFormData } from "@/lib/schemas/labWork.schema";

// Seed suggestions shown until real lab entries exist / a labs API is wired up.
const DEFAULT_LAB_SUGGESTIONS = [
  "Smile Dental Lab",
  "PrecisionCraft Dental Lab",
  "Crown & Bridge Works",
  "OrthoTech Lab",
];

interface LabWorkFormProps {
  onClose: () => void;
  onSave: (data: LabWorkFormData) => void;
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
      labName: labWork?.labName ?? "",
      workType: labWork?.workType ?? "",
      unitsCount: labWork?.unitsCount ?? 1,
      hasWarranty: labWork?.hasWarranty ?? false,
      warrantyYears: labWork?.warrantyYears ?? undefined,
      warrantyEndDate: labWork?.warrantyEndDate ?? "",
      createdDate: labWork?.createdDate ?? new Date().toISOString().split("T")[0],
      price: labWork?.price ?? 0,
    },
  });

  const formData = form.watch();

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

  const labOptions = useMemo(() => {
    const names = Array.from(new Set([...DEFAULT_LAB_SUGGESTIONS, ...existingLabNames.filter(Boolean)]));
    return names.map((name) => ({ label: name, value: name }));
  }, [existingLabNames]);

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

  const handleSubmit = (data: LabWorkFormData) => {
    onSave(data);
  };

  return (
    <Modal
      title={labWork ? "Edit Lab Work" : "Add Lab Work"}
      onClose={onClose}
      size="lg"
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

          <LabeledField label="Lab Name" required error={form.formState.errors.labName?.message}>
            <SearchableSelect
              value={formData.labName || "none"}
              onChange={(val) => {
                if (val === "none") return;
                form.setValue("labName", val, { shouldValidate: true });
              }}
              onCreateOption={async (value) => {
                form.setValue("labName", value, { shouldValidate: true });
                return value;
              }}
              createLabel="Use lab"
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
      </form>
      </Form>
    </Modal>
  );
}
