import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/Dialog";
import { Badge } from "../../ui/Badge";
import {
  Loader2, Percent, Calendar, Sparkles, Smile,
  Award, Activity, AlertCircle, Shield, Info, HeartPulse
} from "lucide-react";
import { useBenefitUsageQuery } from "../../../hooks/corporate/useBenefitUsageQuery";

interface BenefitUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export const BenefitUsageModal: React.FC<BenefitUsageModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const searchStr = employee?.phone || employee?.parentPhone || "";

  const { data: response, isLoading: loading, error: queryError } = useBenefitUsageQuery(
    {
      page: 1,
      limit: 10,
      search: searchStr,
      filters: {},
    },
    {
      enabled: isOpen && !!searchStr,
      staleTime: 0,
      gcTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
    }
  );

  // Extract records array from various possible shapes
  let records: any[] = [];
  if (response) {
    if (Array.isArray(response)) {
      records = response;
    } else if (response.responseObject?.data?.data && Array.isArray(response.responseObject.data.data)) {
      records = response.responseObject.data.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      records = response.data.data;
    } else if (Array.isArray(response.data)) {
      records = response.data;
    } else if (response.responseObject && Array.isArray(response.responseObject.data)) {
      records = response.responseObject.data;
    }
  }

  // Find the exact record for this employee
  const activeRecord = records.find(
    (r: any) =>
      r.member?.id === employee?.id ||
      (employee?.member_id && r.member?.member_id === employee?.member_id) ||
      r.member?.name?.toLowerCase() === employee?.name?.toLowerCase()
  ) || records[0];

  const error = queryError ? "Failed to load benefit usage. Please try again." : null;

  const getBenefitIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "UNLIMITED_CONSULTATION":
        return <HeartPulse className="w-5 h-5 text-emerald-600" />;
      case "COMPLIMENTARY_SESSION":
        return <Smile className="w-5 h-5 text-blue-600" />;
      case "FLAT_DISCOUNT":
        return <Percent className="w-5 h-5 text-indigo-600" />;
      case "PRIORITY_SCHEDULING":
        return <Calendar className="w-5 h-5 text-violet-600" />;
      case "FLUORIDE_APPLICATION":
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBenefitBadge = (benefit: any) => {
    if (benefit.status === "UNLIMITED" || benefit.is_unlimited) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Unlimited</Badge>;
    }
    if (benefit.discount_percentage !== undefined && benefit.discount_percentage !== null) {
      return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">{benefit.discount_percentage}% Off</Badge>;
    }
    if (benefit.status === "APPLIED") {
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Active Progress</Badge>;
    }
    if (benefit.status === "NOT_APPLICABLE") {
      return <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">Included</Badge>;
    }
    return <Badge variant="outline" className="text-muted-foreground">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) + " " + date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getPatientName = (patientId: string) => {
    const found = records.find(
      (r: any) => r.member?.id === patientId || r.patient?.id === patientId
    );
    if (!found) return "Family Member";
    if (found.member?.id === patientId) {
      return found.member?.name || "Family Member";
    }
    if (found.patient?.id === patientId) {
      return found.patient?.name || "Family Member";
    }
    return found.member?.name || found.patient?.name || "Family Member";
  };

  const familyMembers = records.map((r: any) => r.member).filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[820px] p-0 overflow-hidden bg-background/95 backdrop-blur-sm border-white/20 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/5 p-6 border-b border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity className="w-32 h-32 text-blue-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
                <Activity className="w-5 h-5" />
              </div>
              Membership Benefits Usage
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5 ml-12 flex flex-wrap items-center gap-2">
              <span>Tracking benefits for</span>
              <strong className="text-foreground">{employee?.name || "Unknown"}</strong>
              <span className="text-xs text-muted-foreground/50">•</span>
              <span className="text-xs font-semibold text-slate-600">{employee?.phone || "No phone"}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">Fetching benefits usage...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 text-sm font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          ) : !activeRecord ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No Plan Benefits Data Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                This member does not appear to have any active benefits on their current plan.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Member & Enrollment Summary */}
              {activeRecord.enrollments?.map((enrollment: any, idx: number) => {
                const plan = enrollment.plan || {};
                const benefits = enrollment.benefits || [];

                return (
                  <div key={enrollment.enrollment_id || idx} className="space-y-4">
                    {/* Plan Information Card */}
                    <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Plan</p>
                        <h4 className="text-base font-black text-slate-800">{plan.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{plan.code}</span>
                          <span>•</span>
                          <span>Tier: <strong className="text-slate-700 capitalize">{plan.tier?.toLowerCase() || "standard"}</strong></span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Validity Period</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatDate(enrollment.enrollment_date)} — {formatDate(enrollment.expiry_date)}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${enrollment.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                          {enrollment.status}
                        </span>
                      </div>
                    </div>

                    {/* Family Coverage Group Card */}
                    {familyMembers.length > 0 && (
                      <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-4 space-y-2">
                        <p className="text-[10px] font-bold text-indigo-950/70 uppercase tracking-wider flex items-center gap-1.5">
                          <Smile className="w-3.5 h-3.5 text-indigo-500" />
                          Family Coverage Group ({familyMembers.length} Members Enrolled)
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {familyMembers.map((m: any, mIdx: number) => {
                            const isSelf = m.relationship_type === 'SELF' || m.id === employee?.id;
                            return (
                              <div
                                key={m.id || mIdx}
                                className={`text-xs px-2.5 py-1 rounded-xl border flex items-center gap-1 font-medium transition-all ${isSelf
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                                  }`}
                              >
                                <span>{m.name}</span>
                                <span className={`text-[8.5px] px-1.5 py-0.1 rounded font-bold uppercase ${isSelf ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                  {m.relationship_type || (isSelf ? 'SELF' : 'MEMBER')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Benefits Breakdown List */}
                    <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" /> Plan Benefits & Allocation
                      </h5>

                      {benefits.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic text-center py-6">No specific benefits listed for this plan.</p>
                      ) : (
                        benefits.map((benefit: any, bIdx: number) => {
                          const hasProgress = benefit.allocation !== null && benefit.used !== null && benefit.remaining !== null;
                          const used = benefit.used ?? 0;
                          const allocation = benefit.allocation ?? 0;
                          const remaining = benefit.remaining ?? 0;
                          const percentUsed = allocation > 0 ? Math.min(100, (used / allocation) * 100) : 0;

                          return (
                            <div
                              key={benefit.benefit_id || bIdx}
                              className="p-4 bg-white border border-border/80 rounded-2xl hover:shadow-sm transition-shadow space-y-3"
                            >
                              {/* Benefit Title & Badge */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                                    {getBenefitIcon(benefit.benefit_type)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 leading-tight">
                                      {benefit.label}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
                                      {benefit.benefit_type?.replace(/_/g, " ")}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  {getBenefitBadge(benefit)}
                                </div>
                              </div>

                              {/* Progress bar / usage counters */}
                              {hasProgress && (
                                <div className="space-y-1.5 pt-1">
                                  {/* Progress bar */}
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                      style={{ width: `${percentUsed}%` }}
                                    />
                                  </div>
                                  {/* Usage Statistics */}
                                  <div className="flex justify-between items-center text-xs font-semibold">
                                    <span className="text-slate-500">
                                      Used: <strong className="text-rose-600">{used}</strong> / {allocation} sessions
                                    </span>
                                    {/* <span className="text-slate-600">
                                      Remaining: <strong className="text-emerald-600">{remaining}</strong>
                                    </span> */}
                                  </div>
                                </div>
                              )}

                              {/* Flat Discount / Unlimited Benefit Total Usage count */}
                              {!hasProgress && used > 0 && (
                                <div className="flex justify-between items-center text-xs font-semibold pt-1">
                                  <span className="text-slate-500">
                                    Total Benefit Usage: <strong className="text-indigo-600">{used}</strong> {benefit.benefit_type === 'FLAT_DISCOUNT' ? 'discounted items' : 'sessions'}
                                  </span>
                                </div>
                              )}

                              {/* By Patient consumption breakdown */}
                              {benefit.by_patient && benefit.by_patient.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usage Breakdown by Family Member</p>
                                  <div className="flex flex-wrap gap-3">
                                    {benefit.by_patient.map((bp: any, bpIdx: number) => (
                                      <div
                                        key={bpIdx}
                                        className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-slate-700 w-full sm:w-[48%] flex-grow"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-extrabold text-slate-800 text-sm">{getPatientName(bp.patient_id)}</span>
                                          <span className="text-[10px] text-indigo-700 bg-indigo-50 font-extrabold px-2 py-0.5 rounded-lg border border-indigo-100">
                                            {bp.used} times used
                                          </span>
                                        </div>
                                        {bp.usage_history && bp.usage_history.length > 0 ? (
                                          <div className="text-[10.5px] text-muted-foreground space-y-1.5 mt-1 border-t border-slate-200/40 pt-2">
                                            <span className="font-bold text-[8.5px] text-slate-400 block uppercase tracking-wider">Usage Timeline:</span>
                                            {bp.usage_history.map((uh: any, uhIdx: number) => (
                                              <div key={uhIdx} className="flex justify-between items-center gap-2">
                                                <span className="font-mono text-slate-600">
                                                  #{uhIdx + 1}: {formatDateTime(uh.used_at || uh.usedAt)}
                                                </span>
                                                {uh.ref_type && (
                                                  <span className="text-[8px] bg-slate-200/60 text-slate-600 px-1 py-0.2 rounded font-bold uppercase shrink-0">
                                                    {uh.ref_type}
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : bp.last_used_at && (
                                          <div className="text-[10px] text-muted-foreground mt-1 border-t border-slate-200/40 pt-2 font-mono">
                                            Last Used: {formatDateTime(bp.last_used_at)}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Last Used Timestamp */}
                              {benefit.last_used_at && (
                                <div className="text-[10px] text-muted-foreground pt-1.5 border-t border-slate-100/50 flex items-center gap-1 font-medium">
                                  <Calendar className="w-3 h-3 opacity-60" />
                                  <span>Last Used on {formatDate(benefit.last_used_at)}</span>
                                  {benefit.scope && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">Scope: {benefit.scope}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
