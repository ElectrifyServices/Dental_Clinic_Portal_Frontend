import React from "react";
import { Activity, Stethoscope } from "lucide-react";
import { ToothChart } from "../ToothChart";

interface ObservationsAndToothChartProps {
  toothChartState: Record<number, string>;
  onChartChange: (state: Record<number, string>) => void;
  observations: string;
  diagnosis: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ObservationsAndToothChart({
  toothChartState,
  onChartChange,
  observations,
  diagnosis,
  onChange
}: ObservationsAndToothChartProps) {
  return (
    <div className="px-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">Clinical Observations & Tooth Chart</h3>
            <p className="text-sm text-gray-500">Select affected teeth and record your findings</p>
          </div>
        </div>

        <div className="space-y-6">
          <ToothChart
            initialState={toothChartState as any}
            onChartChange={onChartChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detailed Observations *
              </label>
              <textarea
                name="observations"
                value={observations}
                onChange={onChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Record your clinical observations and examination findings..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Diagnosis *
              </label>
              <textarea
                name="diagnosis"
                value={diagnosis}
                onChange={onChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your diagnosis based on examination..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
