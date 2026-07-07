import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/Dialog";
import { Badge } from "../../ui/Badge";
import { Loader2, MessageCircle, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useWhatsAppHistoryQuery } from "../../../hooks/corporate/useWhatsAppHistoryQuery";

interface WhatsAppHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export const WhatsAppHistoryModal: React.FC<WhatsAppHistoryModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const { data: response, isLoading: loading, error: queryError } = useWhatsAppHistoryQuery(
    {
      page: 1,
      limit: 100,
      search: "",
      sortBy: "createdAt",
      sortOrder: "DESC",
      filters: {
        status: "",
        startDate: "",
        endDate: "",
        recipient: employee?.phone || "",
        messageType: "",
      },
    },
    { enabled: isOpen && !!employee?.phone }
  );

  const responseData = response?.data?.items || response?.items || response?.data || response || [];
  const messages = Array.isArray(responseData) ? responseData : [];
  
  const error = queryError ? "Failed to load message history. Please try again." : null;

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "read":
      case "sent":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "read":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Delivered</Badge>;
      case "sent":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">{status || "Pending"}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background/95 backdrop-blur-sm border-white/20 shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-6 border-b border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageCircle className="w-32 h-32" />
          </div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
                <MessageCircle className="w-5 h-5" />
              </div>
              WhatsApp Message History
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5 ml-12">
              Viewing messages sent to <strong className="text-foreground">{employee?.name}</strong> ({employee?.phone})
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading message history...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 text-sm font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No Messages Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                We couldn't find any WhatsApp messages sent to this member.
              </p>
            </div>
          ) : (
              <div className="h-[450px] overflow-y-auto pr-4 space-y-4">
                {messages.map((msg: any, index: number) => {
                  const status = msg.status || "PENDING";
                  const msgType = msg.message_type || msg.messageType || "TEXT";
                  const direction = msg.direction || "OUTBOUND";
                  const createdAt = msg.created_at || msg.createdAt || msg.sent_at;
                  const sentFrom = msg.sent_from_number;
                  const toPhone = msg.to_phone || msg.recipient;

                  // Parse content
                  let contentElement = null;
                  if (msg.content) {
                    if (typeof msg.content === "object") {
                      if (msg.content.type === "template" && msg.content.template) {
                        const template = msg.content.template;
                        contentElement = (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template:</span>
                              <Badge variant="outline" className="text-[11px] font-mono py-0.5 bg-slate-50 border-slate-200 text-slate-800 font-bold">
                                {template.name}
                              </Badge>
                            </div>
                            
                            {template.components && template.components.map((comp: any, cIdx: number) => {
                              if (comp.type === "header") {
                                const docParam = comp.parameters?.find((p: any) => p.type === "document");
                                if (docParam && docParam.document) {
                                  return (
                                    <div key={cIdx} className="flex items-center gap-2.5 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                                      <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                                      <div className="truncate flex-1">
                                        <span className="font-semibold text-emerald-900 block text-[10px] uppercase tracking-wide">Attached Document</span>
                                        <span className="font-bold text-slate-800">{docParam.document.filename || "OpalSmiles Document"}</span>
                                      </div>
                                    </div>
                                  );
                                }
                              }
                              
                              if (comp.type === "body" && comp.parameters && comp.parameters.length > 0) {
                                return (
                                  <div key={cIdx} className="space-y-2 p-3 bg-slate-50/60 border border-slate-100/80 rounded-xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Fields</span>
                                    <div className="space-y-1.5">
                                      {comp.parameters.map((param: any, pIdx: number) => (
                                        <div key={pIdx} className="flex items-start gap-2 text-xs">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                          <div className="text-slate-700 leading-relaxed">
                                            <span className="font-medium text-slate-400 text-[11px]">Field {pIdx + 1}: </span>
                                            <span className="font-bold text-slate-800 bg-white border border-border/40 px-2 py-0.5 rounded shadow-sm inline-block">{param.text || param.value || JSON.stringify(param)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        );
                      } else {
                        contentElement = (
                          <pre className="text-[11px] font-mono overflow-x-auto p-2.5 bg-slate-50 rounded-xl border border-slate-150 max-h-32 text-slate-600 leading-normal">
                            {JSON.stringify(msg.content, null, 2)}
                          </pre>
                        );
                      }
                    } else {
                      contentElement = <p className="text-sm text-slate-700 font-medium leading-relaxed">{msg.content}</p>;
                    }
                  }

                  return (
                    <div key={msg.id || index} className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                      {/* Header row */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                            {msgType} Message
                          </span>
                          <span className={`inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full border ${
                            direction === "OUTBOUND" 
                              ? "bg-slate-50 text-slate-700 border-slate-200" 
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {direction}
                          </span>
                        </div>
                        {getStatusBadge(status)}
                      </div>

                      {/* Content block */}
                      {contentElement}
                      
                      {/* Footer Info */}
                      <div className="flex flex-wrap items-center justify-between gap-y-2 text-[11px] text-muted-foreground pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 opacity-60" />
                          <span>
                            {createdAt ? new Date(createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).replace(',', ' •') : "Unknown time"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {sentFrom && (
                            <span className="opacity-75">
                              From: <strong className="text-slate-700">{sentFrom}</strong>
                            </span>
                          )}
                          {toPhone && (
                            <span className="opacity-75">
                              To: <strong className="text-slate-700">{toPhone}</strong>
                            </span>
                          )}
                          {msg.id && <span className="opacity-50 text-[10px]">ID: {msg.id.slice(-6)}</span>}
                        </div>
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
