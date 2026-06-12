import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface Prescription {
  id: string;
  medicine: string;
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
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Prescriptions</h3>
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
            className="flex flex-wrap gap-4 items-end p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative group transition-all hover:shadow-md animate-in fade-in zoom-in duration-200"
          >
            <div className="flex-[2] min-w-[200px]">
              <Label className="block text-[10px] font-bold text-emerald-800 mb-1.5 uppercase tracking-widest">
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
                className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-card outline-none text-sm font-semibold"
                placeholder="e.g. Amoxicillin"
              />
            </div>

            <div className="w-[140px] shrink-0">
              <Label className="block text-[10px] font-bold text-emerald-800 mb-1.5 uppercase tracking-widest">
                Dosage
              </Label>
              <Select
                value={prescription.dosage}
                onValueChange={(val) =>
                  onUpdatePrescription(
                    prescription.id,
                    "dosage",
                    val,
                  )
                }
              >
                <SelectTrigger className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-card text-sm font-semibold h-11 bg-background">
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
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <Label className="block text-[10px] font-bold text-emerald-800 mb-1.5 uppercase tracking-widest">
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
                className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-card outline-none text-sm font-semibold"
                placeholder="After food"
              />
            </div>

            <div className="flex-1 min-w-[120px]">
              <Label className="block text-[10px] font-bold text-emerald-800 mb-1.5 uppercase tracking-widest">
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
                className="w-full px-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-card outline-none text-sm font-semibold"
                placeholder="Once daily"
              />
            </div>

            <div className="w-[180px] shrink-0">
              <Label className="block text-[10px] font-bold text-emerald-800 mb-1.5 uppercase tracking-widest">
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
                  className="w-16 px-2 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-card text-center outline-none text-sm font-semibold"
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
                  <SelectTrigger className="flex-1 px-3 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-card text-sm font-semibold h-11 bg-background">
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

            <div className="w-[120px] shrink-0 flex items-center gap-2">
              <div className="flex-1">
                <Label className="block text-[10px] font-bold text-emerald-800 mb-1.5 uppercase tracking-widest">
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
                  className="w-full px-3 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-card outline-none text-sm font-semibold"
                  placeholder="10"
                />
              </div>
              {prescriptions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onRemovePrescription(prescription.id)}
                  className="p-2.5 text-red-500 hover:bg-destructive/10 rounded-xl transition-all duration-200 shrink-0"
                  title="Remove Medicine"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
