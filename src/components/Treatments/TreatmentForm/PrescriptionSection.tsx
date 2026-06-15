import React, { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ConfirmModal } from "@/components/ui";
import { Pill, Plus, Trash2 } from "lucide-react";
import {
  useMedicinesQuery,
  useCreateMedicineMutation,
  useDeleteMedicineMutation,
} from "@/hooks/patients/useMedicinesQuery";

interface Prescription {
  id: string;
  medicine: string;
  medicineName?: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  durationUnit?: string;
  qty: string;
}

interface PrescriptionSectionProps {
  prescriptions: Prescription[];
  onAddPrescription: () => void;
  onRemovePrescription: (id: string) => void;
  onUpdatePrescription: (id: string, field: string, value: string) => void;
}

export function PrescriptionSection({
  prescriptions,
  onAddPrescription,
  onRemovePrescription,
  onUpdatePrescription,
}: PrescriptionSectionProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: rawMedicines, isLoading } = useMedicinesQuery({ page: 1, limit: 30, search: debouncedSearch });

  const { mutateAsync: createMedicine, isPending: isCreating } = useCreateMedicineMutation();
  const { mutateAsync: deleteMedicine } = useDeleteMedicineMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const medicinesList = React.useMemo(() => {
    if (!rawMedicines) return [];
    // Debug: remove after confirming correct shape
    console.log("[PrescriptionSection] rawMedicines:", rawMedicines);
    let list: any[] = [];
    if (Array.isArray(rawMedicines)) {
      list = rawMedicines;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).responseObject?.data?.data)) {
      list = (rawMedicines as any).responseObject.data.data;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).responseObject?.data)) {
      list = (rawMedicines as any).responseObject.data;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).responseObject)) {
      list = (rawMedicines as any).responseObject;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).data?.data)) {
      list = (rawMedicines as any).data.data;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).data)) {
      list = (rawMedicines as any).data;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).list)) {
      list = (rawMedicines as any).list;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).medicines)) {
      list = (rawMedicines as any).medicines;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).items)) {
      list = (rawMedicines as any).items;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).records)) {
      list = (rawMedicines as any).records;
    } else if (rawMedicines && Array.isArray((rawMedicines as any).results)) {
      list = (rawMedicines as any).results;
    }
    console.log("[PrescriptionSection] resolved medicinesList:", list);
    return list;
  }, [rawMedicines]);

  const selectOptions = React.useMemo(() => {
    const opts = medicinesList.map((m: any) => ({
      label: m.name || m.label || m.medicine_name || (typeof m === "string" ? m : ""),
      // Always prefer the UUID field; never fall back to name string
      value: m.id || m._id || m.uuid || m.medicine_id || m.value || (typeof m === "string" ? m : ""),
    }));
    console.log("[PrescriptionSection] selectOptions sample:", opts.slice(0, 3));
    return opts;
  }, [medicinesList]);

  const handleCreateMedicine = async (name: string) => {
    try {
      const res = await createMedicine({
        name,
        description: "Advanced fever and pain relief medication for dental pain",
      });
      // Extract UUID from all possible response shapes
      const id =
        res?.id ||
        res?.uuid ||
        res?.medicine_id ||
        res?.data?.id ||
        res?.data?.uuid ||
        res?.responseObject?.id ||
        res?.responseObject?.data?.id ||
        res?.data?.data?.id ||
        null;
      if (id) return id;
      // If no UUID returned, warn and fall back so UI doesn't break
      console.warn("createMedicine: no UUID in response, falling back to name", res);
      return name;
    } catch (err) {
      console.error(err);
      return name;
    }
  };

  const [confirmDeleteName, setConfirmDeleteName] = useState<string | null>(null);

  const handleDeleteClick = (name: string) => {
    setConfirmDeleteName(name);
  };

  const handleDeleteMedicine = async () => {
    if (!confirmDeleteName) return;
    const name = confirmDeleteName;
    const found = medicinesList.find((m: any) => m.name === name);
    const id = found?.id || found?._id || name;
    setDeletingId(name);
    try {
      await deleteMedicine(id);
      setConfirmDeleteName(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center">
          <Pill className="w-5 h-5 mr-2 text-emerald-600" />
          Prescriptions
        </h3>
        <Button
          type="button"
          onClick={onAddPrescription}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 flex items-center text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm animate-in fade-in zoom-in duration-200"
          >
            <div className="col-span-1 sm:col-span-2">
              <Label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">
                Medicine Name
              </Label>
              <SearchableSelect
                value={prescription.medicine}
                displayValue={prescription.medicineName || prescription.medicine}
                onChange={(value) => {
                  onUpdatePrescription(prescription.id, "medicine", value);
                  const opt = selectOptions.find((o) => o.value === value);
                  if (opt) {
                    onUpdatePrescription(prescription.id, "medicineName", opt.label);
                  } else {
                    if (search) onUpdatePrescription(prescription.id, "medicineName", search);
                  }
                }}
                options={selectOptions}
                placeholder="Select or Search Medicine..."
                searchPlaceholder="Search medicine name..."
                onSearchChange={setSearch}
                isLoading={isLoading}
                onCreateOption={handleCreateMedicine}
                createLabel="Create Medicine"
                isCreating={isCreating}
                onDeleteOption={handleDeleteClick}
                isDeletingValue={deletingId}
                className="w-full h-10 border-emerald-200 focus:ring-emerald-500 rounded-lg"
              />
            </div>

            <div className="col-span-1">
              <Label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">
                Dosage
              </Label>
              <Select
                value={prescription.dosage || ""}
                onValueChange={(val) =>
                  onUpdatePrescription(
                    prescription.id,
                    "dosage",
                    val,
                  )
                }
              >
                <SelectTrigger className="w-full h-10 px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-card">
                  <SelectValue placeholder="Select Dosage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-0-0">1 - 0 - 0</SelectItem>
                  <SelectItem value="0-1-0">0 - 1 - 0</SelectItem>
                  <SelectItem value="0-0-1">0 - 0 - 1</SelectItem>
                  <SelectItem value="1-1-0">1 - 1 - 0</SelectItem>
                  <SelectItem value="1-0-1">1 - 0 - 1</SelectItem>
                  <SelectItem value="0-1-1">0 - 1 - 1</SelectItem>
                  <SelectItem value="1-1-1">1 - 1 - 1</SelectItem>
                  <SelectItem value="2-1-1">2 - 1 - 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1">
              <Label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">
                Timing
              </Label>
              <Input
                type="text"
                value={prescription.timing}
                onChange={(e) =>
                  onUpdatePrescription(
                    prescription.id,
                    "timing",
                    e.target.value,
                  )
                }
                className="w-full h-10 px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-card"
                placeholder="After meals"
              />
            </div>

            <div className="col-span-1">
              <Label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">
                Duration
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={prescription.duration}
                  onChange={(e) =>
                    onUpdatePrescription(
                      prescription.id,
                      "duration",
                      e.target.value,
                    )
                  }
                  min="1"
                  className="w-16 h-10 px-2 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-card text-center"
                  placeholder="5"
                />
                <Select
                  value={prescription.durationUnit || "Days"}
                  onValueChange={(val) =>
                    onUpdatePrescription(
                      prescription.id,
                      "durationUnit",
                      val,
                    )
                  }
                >
                  <SelectTrigger className="flex-1 h-10 px-2 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-card text-sm">
                    <SelectValue placeholder="Days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Days">Days</SelectItem>
                    <SelectItem value="Weeks">Weeks</SelectItem>
                    <SelectItem value="Months">Months</SelectItem>
                    <SelectItem value="Years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="col-span-1 flex items-end gap-2">
              <div className="flex-1">
                <Label className="block text-xs font-bold text-emerald-700 mb-1.5 uppercase tracking-wider">
                  Qty
                </Label>
                <Input
                  type="number"
                  value={prescription.qty}
                  onChange={(e) =>
                    onUpdatePrescription(
                      prescription.id,
                      "qty",
                      e.target.value,
                    )
                  }
                  min="1"
                  className="w-full h-10 px-2 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-card"
                  placeholder="10"
                />
              </div>
              {prescriptions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onRemovePrescription(prescription.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 shrink-0 h-10"
                  title="Remove Medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {confirmDeleteName && (
        <ConfirmModal
          title="Delete Medicine"
          message={`Are you sure you want to delete "${confirmDeleteName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          isLoading={!!deletingId}
          onConfirm={handleDeleteMedicine}
          onCancel={() => setConfirmDeleteName(null)}
        />
      )}
    </div>
  );
}
