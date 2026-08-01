import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/Dialog";
import { Badge } from "../../ui/Badge";
import { Loader2, MessageCircle, Clock, CheckCircle2, AlertCircle, FileText, User, Phone, Calendar, Hash, Tag, Send, ArrowDown, ArrowUp, File, Info } from "lucide-react";
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

  // Extract messages array by checking all possible shapes in response
  let messages: any[] = [];
  if (response) {
    if (Array.isArray(response)) {
      messages = response;
    } else if (response.data && Array.isArray(response.data.data)) {
      messages = response.data.data;
    } else if (Array.isArray(response.data)) {
      messages = response.data;
    } else if (Array.isArray(response.items)) {
      messages = response.items;
    } else if (response.data && Array.isArray(response.data.items)) {
      messages = response.data.items;
    } else if (Array.isArray(response.rows)) {
      messages = response.rows;
    } else if (response.data && Array.isArray(response.data.rows)) {
      messages = response.data.rows;
    }
  }

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).replace(',', ' •');
  };

  const renderTemplateContent = (template: any) => {
    if (!template) return null;

    const templateName = template.name || "Unknown Template";
    const components = template.components || [];

    // Extract header document
    const headerComponent = components.find((comp: any) => comp.type === "header");
    const documentParam = headerComponent?.parameters?.find((p: any) => p.type === "document");
    const hasDocument = documentParam?.document;

    // Extract body fields
    const bodyComponent = components.find((comp: any) => comp.type === "body");
    const bodyParameters = bodyComponent?.parameters || [];

    return (
      <div className="space-y-4">
        {/* Template Name */}
        <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 rounded-lg p-2.5">
          <Tag className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs text-muted-foreground">Template:</span>
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
            {templateName}
          </span>
        </div>

        {/* Attached Document */}
        {hasDocument && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Attached Document</p>
              <p className="text-sm font-medium text-slate-800 truncate">
                {documentParam.document.filename || "OpalSmiles Document"}
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 text-[10px] bg-white/50">
              PDF
            </Badge>
          </div>
        )}

        {/* Message Fields */}
        {bodyParameters.length > 0 && (
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Message Details</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {bodyParameters.map((param: any, idx: number) => {
                const fieldLabel = idx === 0 ? "Patient Name" : "Invoice Number";
                const fieldValue = param.text || param.value || JSON.stringify(param);

                return (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {idx === 0 ? <User className="w-3 h-3 text-slate-500" /> : <Hash className="w-3 h-3 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{fieldLabel}</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{fieldValue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = (msg: any) => {
    const content = msg.content;

    if (!content) {
      return <p className="text-sm text-slate-500 italic">No content available</p>;
    }

    // Template message
    if (typeof content === "object" && content.type === "template" && content.template) {
      return renderTemplateContent(content.template);
    }

    // Plain text message
    if (typeof content === "string") {
      return (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      );
    }

    // Fallback for other content types
    return (
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
        <pre className="text-xs font-mono text-slate-600 whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background/95 backdrop-blur-sm border-white/20 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-6 border-b border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageCircle className="w-32 h-32" />
          </div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
                <MessageCircle className="w-5 h-5" />
              </div>
              WhatsApp Message History
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1.5 ml-12 flex flex-wrap items-center gap-2">
              <span>Viewing messages sent to</span>
              <strong className="text-foreground">{employee?.name || "Unknown"}</strong>
              <span className="text-xs text-muted-foreground/50">•</span>
              <Phone className="w-3 h-3 text-muted-foreground/50 inline" />
              <span className="text-sm font-medium text-slate-600">{employee?.phone || "No phone"}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
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
            <div className="h-[480px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {messages.map((msg: any, index: number) => {
                const status = msg.status || "PENDING";
                const msgType = msg.message_type || msg.messageType || "TEXT";
                const direction = msg.direction || "OUTBOUND";
                const createdAt = msg.created_at || msg.createdAt || msg.sent_at;
                const sentFrom = msg.sent_from_number || msg.from;
                const toPhone = msg.to_phone || msg.recipient || msg.to;

                // Determine if it's a template message
                const isTemplate = msgType?.toUpperCase() === "TEMPLATE" ||
                  (typeof msg.content === "object" && msg.content?.type === "template");

                return (
                  <div
                    key={msg.id || index}
                    className="bg-card border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Message Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-slate-50/50 border-b border-border/50">
                      <div className="flex items-center gap-2.5">
                        {getStatusIcon(status)}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 text-[10px] font-semibold uppercase tracking-wider">
                            {msgType}
                          </Badge>
                          {isTemplate && (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                              Template
                            </Badge>
                          )}
                        </div>
                        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${direction === "OUTBOUND"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                          {direction === "OUTBOUND" ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {direction}
                        </div>
                      </div>
                      {getStatusBadge(status)}
                    </div>

                    {/* Message Content */}
                    <div className="p-4">
                      {renderContent(msg)}
                    </div>

                    {/* Message Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-50/50 border-t border-border/50">
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-60" />
                          <span>{formatDate(createdAt)}</span>
                        </div>
                        {sentFrom && (
                          <div className="flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 opacity-60" />
                            <span>From: <strong className="text-slate-700">{sentFrom}</strong></span>
                          </div>
                        )}
                      </div>
                      {toPhone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 opacity-60" />
                          <span>To: <strong className="text-slate-700">{toPhone}</strong></span>
                        </div>
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