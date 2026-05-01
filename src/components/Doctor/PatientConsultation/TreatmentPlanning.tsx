import React from "react";
import { Stethoscope } from "lucide-react";

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
  onTreatmentCostBlur
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
          <input
            type="checkbox"
            name="requiresTreatment"
            checked={requiresTreatment}
            onChange={onRequiresTreatmentChange}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
          />
          <span className="ml-2 text-sm font-medium text-purple-700">
            Patient requires treatment
          </span>
        </div>

        {requiresTreatment && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
            <div className="overflow-x-auto rounded-xl border border-purple-100">
              <table className="w-full text-left border-collapse bg-white">
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
                        <select
                          value={plan.procedure}
                          onChange={(e) => onUpdatePlan(index, "procedure", e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                        >
                          <option value="">Select Procedure</option>
                          <option value="Dental Filling">Dental Filling</option>
                          <option value="Root Canal Treatment">Root Canal Treatment</option>
                          <option value="Crown Placement">Crown Placement</option>
                          <option value="Tooth Extraction">Tooth Extraction</option>
                          <option value="Teeth Cleaning">Teeth Cleaning</option>
                          <option value="Orthodontic Treatment">Orthodontic Treatment</option>
                          <option value="Dental Implant">Dental Implant</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          value={plan.sessions}
                          onChange={(e) => onUpdatePlan(index, "sessions", parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={plan.cost}
                          onChange={(e) => onUpdatePlan(index, "cost", parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Cost"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Treatment Plan Description *
          </label>
          <textarea
            name="treatmentPlan"
            value={treatmentPlanText}
            onChange={onTreatmentPlanTextChange}
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Outline the recommended treatment plan and procedures..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Estimated Cost (₹)
          </label>
          <input
            type="number"
            name="treatmentCost"
            value={treatmentCost}
            onChange={onTreatmentCostChange}
            onFocus={onTreatmentCostFocus}
            onBlur={(e) => onTreatmentCostBlur(e.target.value)}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter overall treatment cost"
          />
          <p className="mt-2 text-xs text-gray-500 italic">
            This is the total cost for the entire consultation/treatment.
          </p>
        </div>
      </div>
    </div>
  );
}
