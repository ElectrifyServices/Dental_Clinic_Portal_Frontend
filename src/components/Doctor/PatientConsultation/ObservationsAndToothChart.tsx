import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import React from "react";
import { Activity, Stethoscope } from "lucide-react";
import { ToothChart } from "../ToothChart";

interface ObservationsAndToothChartProps {
  toothChartState: Record<string, string[]>;
  onChartChange: (state: Record<string, string[]>) => void;
  observations: string;
  diagnosis: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  errors?: Record<string, string>;
  defaultChartType?: "adult" | "pediatric";
}

export function ObservationsAndToothChart({
  toothChartState,
  onChartChange,
  observations,
  diagnosis,
  onChange,
  errors = {},
  defaultChartType,
}: ObservationsAndToothChartProps) {
  return (
    <div className="px-6">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Clinical Observations & Tooth Chart</h3>
            <p className="text-sm text-muted-foreground">Select affected teeth and record your findings</p>
          </div>
        </div>

        <div className="space-y-3">
          <ToothChart
            initialState={toothChartState as any}
            onChartChange={onChartChange}
            defaultChartType={defaultChartType}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-semibold text-muted-foreground mb-2">
                Detailed Observations
              </Label>
              <Textarea
                name="observations"
                value={observations}
                onChange={onChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.observations
                    ? "border-destructive focus:ring-destructive/30 bg-destructive/5"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="Record your clinical observations and examination findings..."
              />
              {errors.observations && (
                <p className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1">
                  <span>⚠</span> {errors.observations}
                </p>
              )}
            </div>

            <div>
              <Label className="block text-sm font-semibold text-muted-foreground mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Diagnosis
              </Label>
              <Textarea
                name="diagnosis"
                value={diagnosis}
                onChange={onChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  errors.diagnosis
                    ? "border-destructive focus:ring-destructive/30 bg-destructive/5"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="Enter your diagnosis based on examination..."
              />
              {errors.diagnosis && (
                <p className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1">
                  <span>⚠</span> {errors.diagnosis}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
