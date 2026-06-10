import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import React from "react";
import { Stethoscope } from "lucide-react";
import { SearchableSelect } from "@/components/ui";

interface TreatmentPlan {
  id: string;
  tooth: string;
  procedure: string;
  sessions: number;
  cost: number;
  isActive: boolean;
  status: string;
}

interface TreatmentPlanningProps {
  requiresTreatment: boolean;
  treatmentPlans: TreatmentPlan[];
  treatmentPlanText: string;
  treatmentCost: number | string;
  onRequiresTreatmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdatePlan: (index: number, field: keyof TreatmentPlan, value: any) => void;
  onTreatmentPlanTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTreatmentCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTreatmentCostFocus: () => void;
  onTreatmentCostBlur: (value: string) => void;
  followUpRequired: boolean;
  onFollowUpRequiredChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
}

export function TreatmentPlanning({
  requiresTreatment,
  treatmentPlans,
  treatmentPlanText,
  treatmentCost,
  onRequiresTreatmentChange,
  onUpdatePlan,
  onTreatmentPlanTextChange,
  onTreatmentCostChange,
  onTreatmentCostFocus,
  onTreatmentCostBlur,
  followUpRequired,
  onFollowUpRequiredChange,
  errors = {},
}: TreatmentPlanningProps) {
  const totalPlannedCost = treatmentPlans.reduce((sum, p) => sum + (p.cost || 0), 0);

  return (
    <div className="px-6 space-y-6">
      <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Treatment Planning
        </h3>

        <div className="flex items-center mb-4">
          <Input
            type="checkbox"
            name="requiresTreatment"
            checked={requiresTreatment}
            onChange={onRequiresTreatmentChange}
            className="w-4 h-4 text-purple-600 border-border rounded focus:ring-purple-500 cursor-pointer"
          />
          <span className="ml-2 text-sm font-medium text-purple-700">
            Patient requires treatment
          </span>
        </div>

        {requiresTreatment && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
            <div className="overflow-x-auto rounded-xl border border-purple-100">
              <table className="w-full text-left border-collapse bg-card">
                <thead>
                  <tr className="bg-purple-100/50">
                    <th className="py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider">Tooth</th>
                    <th className="py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider">Procedure</th>
                    <th className="py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider">Sessions</th>
                    <th className="py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider">Est. Cost (₹)</th>
                    <th className="py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider text-center">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentPlans.map((plan, index) => (
                    <tr key={plan.id} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-purple-900 bg-purple-100 px-2 py-1 rounded-lg">#{plan.tooth}</span>
                      </td>
                      <td className="py-3 px-4">
                        <SearchableSelect
                          value={plan.procedure}
                          onChange={(val) => onUpdatePlan(index, "procedure", val)}
                          options={[
                            "Dental Filling",
                            "Root Canal Treatment",
                            "Crown Placement",
                            "Tooth Extraction",
                            "Teeth Cleaning",
                            "Orthodontic Treatment",
                            "Dental Implant"
                          ]}
                          placeholder="Select Procedure"
                          searchPlaceholder="Search procedure..."
                          className="h-9 font-semibold text-xs rounded-lg border-purple-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="1"
                          value={plan.sessions}
                          onChange={(e) => onUpdatePlan(index, "sessions", parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          value={plan.cost === 0 ? "" : plan.cost}
                          onChange={(e) => onUpdatePlan(index, "cost", parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Cost"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={(e) => onUpdatePlan(index, "isActive", e.target.checked)}
                          className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {treatmentPlans.length === 0 && (
              <div className="text-center py-6 text-purple-400 italic text-sm">
                No teeth selected in the chart above
              </div>
            )}

            <div className="mt-4 p-4 bg-purple-100/50 rounded-xl border border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-purple-900">Total Planned Cost:</span>
                <span className="text-lg font-bold text-purple-900">
                  ₹{totalPlannedCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-semibold text-muted-foreground mb-2">
            Treatment Plan Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            name="treatmentPlan"
            value={treatmentPlanText}
            onChange={onTreatmentPlanTextChange}
            required
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${errors.treatmentPlan
              ? "border-destructive focus:ring-destructive/30 bg-destructive/5"
              : "border-border focus:ring-primary"
              }`}
            placeholder="Outline the recommended treatment plan and procedures..."
          />
          {errors.treatmentPlan && (
            <p className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1">
              <span>⚠</span> {errors.treatmentPlan}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center p-3 bg-muted/40 border border-border/60 rounded-xl mt-4">
            <Input
              type="checkbox"
              name="followUpRequired"
              checked={followUpRequired}
              onChange={onFollowUpRequiredChange}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary cursor-pointer"
            />
            <span className="ml-2 text-sm font-bold text-muted-foreground">
              Follow-up appointment required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
