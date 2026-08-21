import React, { useState, useMemo, useEffect } from "react";
import { 
  Modal, 
  Button, 
  DataTable, 
  StatusBadge, 
  Loading, 
  SearchInput, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Pagination,
  toast
} from "@/components/ui";
import { 
  MessageCircle, 
  AlertCircle, 
  FileText, 
  CheckCheck, 
  RefreshCw, 
  Phone,
  Send,
  CheckCircle2,
  XCircle,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useNotificationsQuery, 
  useTotalSuccessNotificationsQuery, 
  useTotalFailedNotificationsQuery 
} from "../../hooks/billing/useNotificationsQuery";
import { useRetryNotificationMutation } from "../../hooks/billing/useRetryNotificationMutation";

interface WhatsappHistoryModalProps {
  initialPhone?: string;
  initialPatientName?: string;
  onClose: () => void;
}

export function WhatsappHistoryModal({ 
  initialPhone = "", 
  initialPatientName = "", 
  onClose 
}: WhatsappHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialPhone || initialPatientName || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLogExpand = (logId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, templateFilter, itemsPerPage]);

  const queryParams: any = {
    page: currentPage,
    limit: itemsPerPage,
    filters: {}
  };

  if (debouncedSearch) {
    queryParams.search = debouncedSearch;
  }
  if (statusFilter !== "all") {
    queryParams.filters.status = statusFilter;
  }
  if (templateFilter !== "all") {
    queryParams.filters.template_name = templateFilter;
  }

  // Hook query and mutations
  const { data: rawData, isLoading, refetch: refetchList } = useNotificationsQuery(queryParams);
  const { data: successData, refetch: refetchSuccess } = useTotalSuccessNotificationsQuery(initialPhone);
  const { data: failedData, refetch: refetchFailed } = useTotalFailedNotificationsQuery(initialPhone);
  const retryMutation = useRetryNotificationMutation();

  const refetch = React.useCallback(() => {
    refetchList();
    refetchSuccess();
    refetchFailed();
  }, [refetchList, refetchSuccess, refetchFailed]);

  const getCountValue = (data: any) => {
    if (data === undefined || data === null) return 0;
    if (typeof data === "number") return data;
    if (typeof data === "string") return parseInt(data, 10) || 0;
    
    const val = data.count ?? data.total ?? data.total_items ?? data.data?.count ?? data.data?.total;
    if (typeof val === "number") return val;
    if (typeof val === "string") return parseInt(val, 10) || 0;
    
    return 0;
  };

  const notifications = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if (rawData.data && Array.isArray(rawData.data.data)) return rawData.data.data;
    if (Array.isArray(rawData.data)) return rawData.data;
    if (Array.isArray(rawData.items)) return rawData.items;
    if (rawData.data && Array.isArray(rawData.data.items)) return rawData.data.items;
    if (Array.isArray(rawData.rows)) return rawData.rows;
    if (rawData.data && Array.isArray(rawData.data.rows)) return rawData.data.rows;
    return [];
  }, [rawData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
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

  const getPatientNameFromNotification = (item: any) => {
    if (item.content?.patient_name) {
      return item.content.patient_name;
    }
    const bodyComp = item.content?.template?.components?.find(
      (c: any) => c.type === "body"
    );
    const firstParam = bodyComp?.parameters?.[0];
    if (firstParam && firstParam.type === "text" && firstParam.text) {
      return firstParam.text;
    }
    return "Patient";
  };

  const getFriendlyTemplateName = (name: string) => {
    if (!name) return "Generic Notification";
    switch (name) {
      case "treatment_plan_pdf_v4":
        return "Treatment Plan PDF";
      case "session_completed_v2":
        return "Session Completed Notification";
      case "treatment_plan_completed":
        return "Treatment Plan Completed";
      default:
        return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const getMessageSummary = (item: any) => {
    const bodyComp = item.content?.template?.components?.find(
      (c: any) => c.type === "body"
    );
    if (bodyComp && bodyComp.parameters) {
      const params = bodyComp.parameters.map((p: any) => p.text).filter(Boolean);
      if (params.length > 2) {
        return `${params[2]} (${params[1]})`;
      }
      return params.join(", ");
    }
    return "No body components found";
  };

  const getStatusBadge = (status: string, errorMsg?: string) => {
    const s = status?.toUpperCase();
    if (s === "SENT" || s === "DELIVERED" || s === "READ") {
      const isRead = s === "READ";
      const isDelivered = s === "DELIVERED" || isRead;
      return (
        <StatusBadge variant="green" className="text-[9px] uppercase font-bold flex items-center gap-1 !bg-emerald-50 !text-emerald-700 !border-emerald-200">
          {isRead ? "Read" : isDelivered ? "Delivered" : "Sent"}
          {isRead ? <CheckCheck className="w-3 h-3 text-sky-500" /> : <CheckCheck className="w-3 h-3 text-slate-400" />}
        </StatusBadge>
      );
    }
    return (
      <StatusBadge variant="red" className="text-[9px] uppercase font-bold !bg-red-50 !text-red-700 !border-red-200" title={errorMsg}>
        Failed
      </StatusBadge>
    );
  };

  // Handle message retry mutation trigger
  const handleRetry = async (id: string) => {
    try {
      setProcessingId(id);
      await retryMutation.mutateAsync({ id });
      toast.success("Notification resend triggered!");
    } catch (err: any) {
      console.error("Failed to retry message:", err);
      toast.error(err.message || "Failed to resend message");
    } finally {
      setProcessingId(null);
    }
  };

  // Get unique template names for filters
  const uniqueTemplates = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n: any) => {
      if (n.template_name) set.add(n.template_name);
    });
    return Array.from(set);
  }, [notifications]);

  // Apply filters on the list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item: any) => {
      const phoneStr = (item.to_phone || item.content?.to || "").toString();
      const patientName = getPatientNameFromNotification(item);
      const queryLower = searchQuery.toLowerCase();
      
      const phoneMatches = phoneStr.includes(searchQuery);
      const nameMatches = patientName.toLowerCase().includes(queryLower);
      const matchesSearch = !searchQuery || phoneMatches || nameMatches;

      let matchesStatus = true;
      if (statusFilter !== "all") {
        if (statusFilter === "failed") {
          matchesStatus = item.status?.toLowerCase() === "failed";
        } else {
          matchesStatus = item.status?.toLowerCase() !== "failed";
        }
      }

      const matchesTemplate = templateFilter === "all" || item.template_name === templateFilter;

      return matchesSearch && matchesStatus && matchesTemplate;
    });
  }, [notifications, searchQuery, statusFilter, templateFilter]);

  const totalItems = useMemo(() => {
    if (!rawData) return 0;
    
    // Attempt to extract total from various possible backend response formats
    const explicitTotal = 
      (rawData as any).totalItems ??
      (rawData as any).total ??
      (rawData as any).responseObject?.data?.pagination?.total_items ??
      (rawData as any).data?.pagination?.total_items ??
      (rawData as any).pagination?.total_items ??
      (rawData as any).pagination?.total ??
      (rawData as any).meta?.total;

    if (explicitTotal !== undefined && explicitTotal !== null) {
      return explicitTotal;
    }

    // Fallback: If we got a full page of results but no explicit total, assume there might be a next page
    if (filteredNotifications.length === itemsPerPage) {
      return currentPage * itemsPerPage + 1;
    }

    return (currentPage - 1) * itemsPerPage + filteredNotifications.length;
  }, [rawData, filteredNotifications.length, itemsPerPage, currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Apply filters on the list
  const stats = useMemo(() => {
    return {
      total: totalItems
    };
  }, [totalItems]);

  return (
    <Modal
      title="WhatsApp Notification Logs"
      onClose={onClose}
      size="5xl" // Large width (5xl matches 64rem/1024px width) for beautiful display
      icon={<MessageCircle className="w-5 h-5 text-emerald-600" />}
      bodyClassName="!p-0 !overflow-hidden flex flex-col flex-1 min-h-0"
      footer={
        <div className="flex justify-between items-center w-full bg-muted/10">
          <Button variant="ghost" onClick={() => refetch()} className="gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col flex-1 min-h-0 h-full p-3 xs:p-4 sm:p-6 space-y-3 sm:space-y-5">
        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-4 flex-shrink-0">
          <div className="bg-card border border-border/85 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-sm min-w-0">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[8px] xs:text-[9.5px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                <span className="hidden sm:inline">Total Filtered Logs</span>
                <span className="inline sm:hidden">Total Logs</span>
              </span>
              <span className="text-base xs:text-lg sm:text-2xl font-black text-foreground block truncate">{stats.total}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 hidden xs:flex">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-card border border-border/85 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-sm min-w-0">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[8px] xs:text-[9.5px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider block truncate">
                <span className="hidden sm:inline">Sent / Delivered Messages</span>
                <span className="inline sm:hidden">Sent</span>
              </span>
              <span className="text-base xs:text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block truncate">{getCountValue(successData)}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 hidden xs:flex">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-card border border-border/85 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center justify-between shadow-sm min-w-0">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[8px] xs:text-[9.5px] sm:text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider block truncate">
                <span className="hidden sm:inline">Failed Deliveries</span>
                <span className="inline sm:hidden">Failed</span>
              </span>
              <span className="text-base xs:text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 block truncate">{getCountValue(failedData)}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0 hidden xs:flex">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-muted/40 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/80 flex-shrink-0">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Patient Name or Phone Number..."
            className="flex-1 w-full"
          />
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <div className="flex-1 sm:flex-none">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs rounded-xl bg-card border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Successful</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 sm:flex-none">
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs rounded-xl bg-card border-border">
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {uniqueTemplates.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {getFriendlyTemplateName(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* List Data Table */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center space-y-4 flex-1 min-h-[300px]">
            <Loading type="spinner" text="Fetching WhatsApp logs..." />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="border border-border rounded-2xl overflow-hidden flex-1 min-h-0 flex flex-col">
            <DataTable
              className="flex-1 min-h-0 flex flex-col"
              scrollClassName="overflow-y-auto custom-scrollbar flex-1 min-h-0"
              columns={[
                {
                  key: "patient",
                  header: "Patient",
                  render: (item: any) => (
                    <div className="space-y-0.5 min-w-[120px]">
                      <div className="font-extrabold text-foreground text-sm">
                        {getPatientNameFromNotification(item)}
                      </div>
                      <div className="text-[10.5px] text-muted-foreground font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 opacity-60" />
                        {item.to_phone || item.content?.to || "—"}
                      </div>
                    </div>
                  )
                },
                {
                  key: "message",
                  header: "Message Details",
                  render: (item: any) => {
                    const headerComp = item.content?.template?.components?.find(
                      (c: any) => c.type === "header"
                    );
                    const docFilename = headerComp?.parameters?.[0]?.document?.filename;
                    const isFailed = item.status?.toLowerCase() === "failed";
                    const hasErrorDetails = item.failure_reason || item.user_friendly_error || item.suggested_action;
                    const isExpanded = !!expandedLogs[item.id];
                    return (
                      <div className="space-y-1.5 max-w-[280px] sm:max-w-[360px] whitespace-normal break-words">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider block w-max">
                          {getFriendlyTemplateName(item.template_name)}
                        </span>
                        <div className="text-xs text-foreground/80 font-medium" title={getMessageSummary(item)}>
                          {getMessageSummary(item)}
                        </div>
                        {docFilename && (
                          <div className="text-[9px] text-blue-600 font-semibold flex items-center gap-1.5 bg-blue-50/60 border border-blue-100/40 rounded px-1.5 py-0.5 mt-1 w-max max-w-xs truncate" title={docFilename}>
                            <FileText className="w-3.5 h-3.5" />
                            {docFilename}
                          </div>
                        )}
                        {isFailed && hasErrorDetails && (
                          <div className="flex flex-col items-start gap-1">
                            <Button
                              variant="destructive"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLogExpand(item.id);
                              }}
                              className="mt-1 text-[10px] font-bold h-auto py-0.5 px-2"
                            >
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{isExpanded ? "Hide Details" : "Show Error Details"}</span>
                              <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 transition-transform duration-250", isExpanded ? "rotate-180" : "")} />
                            </Button>

                            {isExpanded && (
                              <div className="mt-1.5 p-2.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl space-y-1.5 text-[10px] sm:text-[11px] leading-relaxed w-full">
                                {item.user_friendly_error && (
                                  <div className="text-rose-700 dark:text-rose-400 font-extrabold flex items-start gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{item.user_friendly_error}</span>
                                  </div>
                                )}
                                {item.failure_reason && (
                                  <div className="text-muted-foreground">
                                    <span className="font-bold text-foreground/80">Reason:</span> {item.failure_reason}
                                  </div>
                                )}
                                {item.suggested_action && (
                                  <div className="text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/10 px-2 py-0.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20 w-max max-w-full">
                                    <span className="font-extrabold">Suggested Action:</span> {item.suggested_action}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                },
                {
                  key: "timestamp",
                  header: "Sent / Failed At",
                  render: (item: any) => (
                    <div className="space-y-1 min-w-[140px]">
                      <span className="text-xs text-muted-foreground block font-mono">
                        {formatDate(item.sent_at || item.failed_at || item.created_at)}
                      </span>
                      {item.retry_count !== undefined && item.retry_count > 0 ? (
                        <span className="text-[9px] text-amber-700 font-extrabold bg-amber-50 border border-amber-100/50 rounded px-1.5 py-0.5 flex items-center gap-1 w-max">
                          🔄 Retried {item.retry_count} {item.retry_count === 1 ? 'time' : 'times'}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-medium bg-slate-100 border border-slate-200/60 rounded px-1.5 py-0.5 flex items-center gap-1 w-max">
                          First attempt
                        </span>
                      )}
                    </div>
                  )
                },
                {
                  key: "status",
                  header: "Status",
                  align: "center" as const,
                  render: (item: any) => (
                    <div className="space-y-1 min-w-[120px] flex flex-col items-center justify-center" title={item.error_message}>
                      {getStatusBadge(item.status, item.error_message)}
                    </div>
                  )
                },
                {
                  key: "actions",
                  header: "Actions",
                  align: "center" as const,
                  render: (item: any) => {
                    const isProcessing = processingId === item.id || retryMutation.isPending;
                    return (
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRetry(item.id)}
                          disabled={isProcessing}
                          title="Resend WhatsApp Message"
                          className="w-8 h-8 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30"
                        >
                          {isProcessing && processingId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    );
                  }
                }
              ]}
              data={filteredNotifications}
              rowKey={(item) => item.id}
              footer={
                <div className="py-4 px-6 border-t border-border bg-muted/30 flex-shrink-0">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages || 1}
                    totalItems={totalItems}
                    perPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onPerPageChange={setItemsPerPage}
                  />
                </div>
              }
            />
          </div>
        ) : (
          <div className="text-center p-12 border border-dashed border-border rounded-2xl bg-muted/10 flex-1 flex flex-col justify-center items-center">
            <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3 flex-shrink-0" />
            <p className="font-bold text-foreground text-sm">No notification logs found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery ? "No logs match your current search queries." : "No WhatsApp template logs have been recorded yet."}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
