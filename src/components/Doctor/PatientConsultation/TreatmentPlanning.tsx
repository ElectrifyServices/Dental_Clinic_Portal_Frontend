import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import React from "react";
import { Stethoscope } from "lucide-react";
import { SearchableSelect, DataTable, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

interface TreatmentPlan {
  id: string;
  tooth: string;
  procedure: string;
  sessions: number;
  duration?: string;
  cost: number;
  discount?: number;
  isActive?: boolean;
  status: string;
  condition?: string;
  planDate?: string;
}

const conditionLabels: Record<string, string> = {
  caries: "Caries",
  missing: "Missing",
  restored: "Restored",
  endo: "Endo / RCT",
  crown: "Crown",
  extract: "For Extraction",
};

interface TreatmentPlanningProps {
  toothChartState: Record<string, string[]>;
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
  onAddPlan?: () => void;
  onRemovePlan?: (index: number) => void;
  errors?: Record<string, string>;
}

export function TreatmentPlanning({
  toothChartState,
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
  onAddPlan,
  onRemovePlan,
  errors = {},
}: TreatmentPlanningProps) {
  const totalPlannedCost = treatmentPlans.reduce((sum, p) => {
    const cost = Number(p.cost) || 0;
    const discountPct = Number(p.discount) || 0;
    const discountAmt = (cost * discountPct) / 100;
    return sum + Math.max(0, cost - discountAmt);
  }, 0);

  // Generate options for the tooth dropdown based on findings
  const findingOptions = React.useMemo(() => {
    if (!toothChartState) return [];
    const pairs = Object.entries(toothChartState).flatMap(([toothNum, conditions]) => {
      const condArray = Array.isArray(conditions) ? conditions : [conditions];
      return condArray
        .filter((c) => c !== "normal")
        .map((cond) => ({
          tooth: toothNum,
          condition: cond,
        }));
    });

    return pairs.map((pair) => {
      const displayTooth = pair.tooth === "FM" || String(pair.tooth) === "-1" ? "Full Mouth" : pair.tooth;
      const displayCond = conditionLabels[pair.condition] || pair.condition;
      return {
        label: `${displayTooth} (${displayCond})`,
        value: `${displayTooth} (${displayCond})`
      };
    });
  }, [toothChartState]);

  const columns = [
    {
      key: "tooth",
      header: "Tooth",
      className: "py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider min-w-[200px]",
      render: (plan: TreatmentPlan, index: number) => {
        const valueArray = plan.tooth ? plan.tooth.split(",").map(s => s.trim()).filter(Boolean) : [];
        return (
          <SearchableSelect
            isMulti
            value={valueArray}
            onChange={(val: string[]) => onUpdatePlan(index, "tooth", val.join(", "))}
            options={findingOptions.length > 0 ? findingOptions : [{ label: "No findings available", value: "" }]}
            placeholder="Select Teeth"
            searchPlaceholder="Search tooth..."
            className="h-9 font-semibold text-xs rounded-lg border-purple-200"
          />
        );
      },
    },
    {
      key: "procedure",
      header: "Procedure",
      className: "py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider",
      render: (plan: TreatmentPlan, index: number) => (
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
            "Dental Implant",
            "Dental Bridge",
            "Removable Partial Denture (RPD)",
            "Complete Denture",
            "No Treatment Required"
          ]}
          placeholder="Select Procedure"
          searchPlaceholder="Search procedure..."
          className="h-9 font-semibold text-xs rounded-lg border-purple-200"
        />
      ),
    },
    {
      key: "cost",
      header: "Cost (₹)",
      className: "py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider",
      render: (plan: TreatmentPlan, index: number) => (
        <Input
          type="number"
          min="0"
          value={plan.cost === 0 ? "" : plan.cost}
          onChange={(e) => onUpdatePlan(index, "cost", parseInt(e.target.value) || 0)}
          className="w-24 px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Cost"
        />
      ),
    },
    {
      key: "discount",
      header: "Discount (%)",
      className: "py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider",
      render: (plan: TreatmentPlan, index: number) => (
        <Input
          type="number"
          min="0"
          max="100"
          value={plan.discount === 0 ? "" : (plan.discount || "")}
          onChange={(e) => {
            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
            onUpdatePlan(index, "discount", val);
          }}
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            const target = e.currentTarget;
            let val = parseInt(target.value) || 0;
            if (val > 100) {
              target.value = "100";
            } else if (val < 0) {
              target.value = "0";
            }
          }}
          className="w-24 px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Discount %"
        />
      ),
    },
    {
      key: "sessions",
      header: "Sessions",
      className: "py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider",
      render: (plan: TreatmentPlan, index: number) => (
        <Input
          type="number"
          min="1"
          value={plan.sessions || 1}
          onChange={(e) => onUpdatePlan(index, "sessions", Math.max(1, parseInt(e.target.value) || 1))}
          className="w-20 px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Sessions"
        />
      ),
    },
    // {
    //   key: "planDate",
    //   header: "Plan Date",
    //   align: "center" as const,
    //   className: "py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider text-center",
    //   render: (plan: TreatmentPlan, index: number) => {
    //     const today = new Date();
    //     const year = today.getFullYear();
    //     const month = String(today.getMonth() + 1).padStart(2, "0");
    //     const day = String(today.getDate()).padStart(2, "0");
    //     const todayStr = `${year}-${month}-${day}`;
    //     return (
    //       <Input
    //         type="date"
    //         value={plan.planDate || ""}
    //         onChange={(e) => onUpdatePlan(index, "planDate", e.target.value)}
    //         min={todayStr}
    //         className="w-full min-w-[130px] px-2 py-1 text-xs border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-card"
    //       />
    //     );
    //   },
    // },
    {
      key: "actions",
      header: "",
      className: "py-3 px-4 text-xs font-bold text-purple-900 uppercase tracking-wider w-10",
      render: (_: any, index: number) => (
        <button
          type="button"
          onClick={() => onRemovePlan?.(index)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove Plan"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )
    }
  ];

  return (
    <div className="px-6 space-y-4">
      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 shadow-sm">
        <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Treatment Planning
        </h3>

        <div className="flex items-center mb-2">
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
            <DataTable
              columns={columns}
              data={treatmentPlans}
              rowKey={(plan) => plan.id}
            />

            {treatmentPlans.length === 0 && (
              <div className="text-center py-6 text-purple-400 italic text-sm">
                No treatment plans added yet.
              </div>
            )}

            {onAddPlan && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={onAddPlan}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Procedure
                </button>
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
            Treatment Plan Description
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
