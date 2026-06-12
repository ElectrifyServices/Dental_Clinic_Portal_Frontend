import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Pill, Plus, Trash2 } from "lucide-react";

interface Prescription {
  id: string;
  medicine: string;
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
}

export function PrescriptionForm({
  prescriptions,
  onAddPrescription,
  onRemovePrescription,
  onUpdatePrescription,
}: PrescriptionFormProps) {
  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center">
          <Pill className="w-5 h-5 mr-2 text-green-600" />
          Prescriptions
        </h3>
        <Button
          type="button"
          onClick={onAddPrescription}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="flex flex-wrap gap-4 items-end p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm animate-in fade-in zoom-in duration-200"
          >
            <div className="flex-[2] min-w-[200px]">
              <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Medicine Name
              </Label>
              <Input
                type="text"
                value={prescription.medicine}
                onChange={(e) =>
                  onUpdatePrescription(
                    prescription.id,
                    "medicine",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                placeholder="e.g. Paracetamol"
              />
            </div>
            <div className="w-[120px] shrink-0">
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
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[120px]">
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
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                placeholder="After meals"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Frequency
              </Label>
              <Input
                type="text"
                value={prescription.frequency}
                onChange={(e) =>
                  onUpdatePrescription(
                    prescription.id,
                    "frequency",
                    e.target.value,
                  )
                }
                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                placeholder="3 times daily"
              />
            </div>
            <div className="w-[180px] shrink-0">
              <Label className="block text-xs font-bold text-green-700 mb-1.5 uppercase tracking-wider">
                Duration
              </Label>
              <div className="flex gap-2">
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
                  className="w-16 px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card text-center"
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
            <div className="w-[120px] shrink-0 flex items-center gap-2">
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
                  className="w-full px-2 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-card"
                  placeholder="10"
                />
              </div>
              {prescriptions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onRemovePrescription(prescription.id)}
                  className="p-2 mt-6 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
