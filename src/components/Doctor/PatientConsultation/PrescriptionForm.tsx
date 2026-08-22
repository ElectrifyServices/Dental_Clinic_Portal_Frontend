import React, { useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { ConfirmModal } from "@/components/ui";
import { Pill, Plus, Trash2, Download, Loader2 } from "lucide-react";
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
  durationUnit: string;
  qty: string;
}

interface PrescriptionFormProps {
  prescriptions: Prescription[];
  onAddPrescription: () => void;
  onRemovePrescription: (id: string) => void;
  onUpdatePrescription: (id: string, field: string, value: string) => void;
  onDownload?: () => void;
}

export function PrescriptionForm({
  prescriptions,
  onAddPrescription,
  onRemovePrescription,
  onUpdatePrescription,
  onDownload,
}: PrescriptionFormProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

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
    }
    return list;
  }, [rawMedicines]);

  const selectOptions = React.useMemo(() => {
    return medicinesList.map((m: any) => ({
      label: m.name || m.label || m,
      value: m.id || m._id || m.value || m.name || m,
    }));
  }, [medicinesList]);

  const handleCreateMedicine = async (name: string) => {
    try {
      const res = await createMedicine({
        name,
      });
      return res?.id || res?.data?.id || res?.responseObject?.id || res?.data?.data?.id || name;
    } catch (err) {
      console.error(err);
      return name;
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
    const found = selectOptions.find((o) => o.value === id);
    setConfirmDeleteName(found?.label || id);
  };

  const handleDeleteMedicine = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeletingId(id);
    try {
      await deleteMedicine(id);
      setConfirmDeleteId(null);
      setConfirmDeleteName(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center">
          <Pill className="w-5 h-5 mr-2 text-green-600" />
          Prescriptions
        </h3>
        <div className="flex items-center gap-2">
          {onDownload && (
            <Button
              type="button"
              disabled={downloading}
              onClick={() => setShowDownloadConfirm(true)}
              className="border border-green-200 bg-green-50 text-green-700 hover:bg-green-100/80 px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all duration-200 shadow-sm gap-1.5"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 text-green-700 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-green-700" />
              )}
              {downloading ? "Downloading..." : "Download"}
            </Button>
          )}
          <Button
            type="button"
            onClick={onAddPrescription}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm animate-in fade-in zoom-in duration-200"
          >
            <div className="col-span-1 sm:col-span-2 md:col-span-4">
              <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
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
                    // if it's a newly created one, value might be the ID. But we know the name was what the user typed in search!
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
                capitalizeWords={true}
                className="w-full h-10 border-green-200 focus:ring-green-500"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Dosage
              </Label>
              <Select
                value={prescription.dosage || ""}
                onValueChange={(value) => onUpdatePrescription(prescription.id, "dosage", value)}
              >
                <SelectTrigger className="w-full h-10 px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card">
                  <SelectValue placeholder="Select" />
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
            <div className="col-span-1 md:col-span-2">
              <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
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
                className="w-full h-10 px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                placeholder="After meals"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
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
                  className="w-16 h-10 px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card text-center"
                  placeholder="5"
                />
                <Select
                  value={prescription.durationUnit || "Days"}
                  onValueChange={(value) => onUpdatePrescription(prescription.id, "durationUnit", value)}
                >
                  <SelectTrigger className="flex-1 h-10 px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card text-sm">
                    <SelectValue />
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
            <div className="col-span-1 md:col-span-2 flex items-end gap-2">
              <div className="flex-1">
                <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                  Qty
                </Label>
                <Input
                  type="number"
                  value={prescription.qty}
                  onChange={(e) =>
                    onUpdatePrescription(prescription.id, "qty", e.target.value)
                  }
                  min="1"
                  className="w-full h-10 px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                  placeholder="10"
                />
              </div>
              {prescriptions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onRemovePrescription(prescription.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 shrink-0"
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
          onCancel={() => {
            setConfirmDeleteId(null);
            setConfirmDeleteName(null);
          }}
        />
      )}

      {showDownloadConfirm && (
        <ConfirmModal
          title="Download Prescription"
          message="Are you sure you want to download this prescription PDF?"
          confirmLabel="Download"
          variant="default"
          isLoading={downloading}
          onConfirm={async () => {
            setDownloading(true);
            try {
              if (onDownload) await onDownload();
            } catch (err) {
              console.error(err);
            } finally {
              setDownloading(false);
              setShowDownloadConfirm(false);
            }
          }}
          onCancel={() => setShowDownloadConfirm(false)}
        />
      )}
    </div>
  );
}
