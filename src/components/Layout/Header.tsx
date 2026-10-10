import type { ApiAny } from "../../types/api";
import { Button } from "@/components/ui/Button";
import logo from "../../logo.png";
import { Bell, LogOut, Calendar, ChevronDown, Package, UserCheck, Coins, CalendarDays, Zap, MoreVertical, FileText, ClipboardList, Pill, FileCheck, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTenant } from "../../contexts/TenantContext";
import { useModal } from "../../contexts/ModalContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Popover, PopoverTrigger, PopoverContent, toast } from "@/components/ui";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { downloadBlankPDF, BlankPDFType } from "../../utils/pdfGenerator";
import { useState } from "react";

const _getNotificationIcon = (type: string) => {
  switch (type) {
    case "inventory": return Package;
    case "queue": return UserCheck;
    case "billing": return Coins;
    case "appointment":
    case "followup": return CalendarDays;
    default: return Bell;
  }
};

const _getNotificationColorCls = (type: string) => {
  switch (type) {
    case "inventory": return "bg-red-50 text-red-600";
    case "queue": return "bg-emerald-50 text-emerald-600";
    case "billing": return "bg-amber-50 text-amber-600";
    case "appointment": return "bg-blue-50 text-blue-600";
    case "followup": return "bg-indigo-50 text-indigo-600";
    default: return "bg-primary/10 text-primary";
  }
};

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  superadmin: { label: "Super Admin", cls: "bg-violet-50 text-violet-700 border-violet-200" },
  admin: { label: "Admin", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  doctor: { label: "Doctor", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  receptionist: { label: "Receptionist", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function Header() {
  const { state, logout } = useAuth();
  const { tenant } = useTenant();
  const { themeData } = useTheme();
  const navigate = useNavigate();
  const { setActiveModal, showConfirm, setWhatsappPhone, setWhatsappPatientName } = useModal();
  const { notifications: _notifications, unreadCount: _unreadCount, markAsRead: _markAsRead, markAllAsRead: _markAllAsRead, clearAll: _clearAll } = useNotifications();

  const [downloadingBlank, setDownloadingBlank] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDownloadBlank = async (type: BlankPDFType) => {
    try {
      setDownloadingBlank(type);
      await downloadBlankPDF(type);
    } catch (caught) {
      const err = caught as ApiAny;
      toast.error(err?.message || "Failed to download blank PDF. Please try again.");
    } finally {
      setDownloadingBlank(null);
    }
  };

  const rm = ROLE_BADGE[state.user?.role ?? ""] ?? {
    label: state.user?.role ?? "",
    cls: "bg-muted text-muted-foreground border-border",
  };

  return (
    <header className="bg-card border-b border-border/60 px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-40 shrink-0 shadow-[0_2px_12px_rgba(15,23,42,0.015)]">
      {/* ── Left ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 group/logo cursor-pointer">
          <div className="w-8 h-8 rounded-md bg-white border border-border/60 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-3 overflow-hidden p-0.5 shrink-0">
            <img src={themeData?.theme?.logo_url || logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-foreground text-sm group-hover/logo:text-primary transition-colors hidden min-[400px]:block truncate max-w-[200px] sm:max-w-[260px]">
            {themeData?.branding?.clinic_name || tenant.branding.clinicName}
          </span>
        </div>

        {/* Today's Schedule & Download Blank PDF shortcuts (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal("todaySchedule")}
            className="gap-2 text-foreground"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Today's Schedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveModal("addCorporateMember")}
            className="gap-2 text-foreground"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Register Member
          </Button>

          {/* Download Blank PDF Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-foreground bg-white hover:bg-slate-50 border-slate-200"
              >
                {downloadingBlank ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Download Blank PDF</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-60 p-1.5 flex flex-col gap-1 rounded-xl shadow-modal z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                Select Blank PDF Template
              </div>
              <Button
                variant="ghost"
                disabled={!!downloadingBlank}
                onClick={() => handleDownloadBlank("CLINICAL")}
                className="w-full justify-start gap-2.5 text-xs font-semibold h-auto py-2 rounded-lg text-foreground hover:bg-muted"
              >
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                1. Clinical Observations
              </Button>
              <Button
                variant="ghost"
                disabled={!!downloadingBlank}
                onClick={() => handleDownloadBlank("TREATMENT")}
                className="w-full justify-start gap-2.5 text-xs font-semibold h-auto py-2 rounded-lg text-foreground hover:bg-muted"
              >
                <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
                2. Treatment Planning
              </Button>
              <Button
                variant="ghost"
                disabled={!!downloadingBlank}
                onClick={() => handleDownloadBlank("PRESCRIPTION")}
                className="w-full justify-start gap-2.5 text-xs font-semibold h-auto py-2 rounded-lg text-foreground hover:bg-muted"
              >
                <Pill className="w-4 h-4 text-purple-600 shrink-0" />
                3. Prescription Only
              </Button>
              <Button
                variant="ghost"
                disabled={!!downloadingBlank}
                onClick={() => handleDownloadBlank("FULL")}
                className="w-full justify-start gap-2.5 text-xs font-semibold h-auto py-2 rounded-lg text-foreground hover:bg-muted"
              >
                <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                4. Full Summary
              </Button>
              <Button
                variant="ghost"
                disabled={!!downloadingBlank}
                onClick={() => handleDownloadBlank("COMPLETION")}
                className="w-full justify-start gap-2.5 text-xs font-semibold h-auto py-2 rounded-lg text-foreground hover:bg-muted"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                5. Treatment Completion PDF
              </Button>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setWhatsappPhone("");
              setWhatsappPatientName("");
              setActiveModal("whatsappHistory");
            }}
            className="gap-2 text-foreground bg-white hover:bg-slate-50 border-slate-200"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Log</span>
          </Button>
        </div>
      </div>

      {/* ── Center: Global Search ────────────────────────────────── */}
      <div className="flex-1 flex justify-center min-w-0 mx-2 sm:mx-0">
        {/* <GlobalSearch /> */}
      </div>
      {/* ── Right ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Notifications */}
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white ring-2 ring-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-96 p-0 bg-card rounded-lg border border-border shadow-modal flex flex-col max-h-[480px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={markAllAsRead} title="Mark all as read"
                    className="text-primary hover:bg-primary/10 hover:text-primary">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={clearAll} title="Clear all"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/60 max-h-[380px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = getNotificationIcon(n.type);
                  const colorCls = getNotificationColorCls(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => { markAsRead(n.id); if (n.link) window.location.pathname = n.link; }}
                      className={[
                        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                        !n.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${colorCls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed wrap-break-word">{n.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover> */}

        {/* User menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-muted h-auto rounded-md"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0">
                {state.user?.name?.[0] ?? "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-foreground leading-tight truncate max-w-[120px]">
                  {state.user?.name}
                </p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${rm.cls}`}>
                  {rm.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-60 p-0 rounded-lg border border-border shadow-modal">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground truncate">{state.user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{state.user?.email}</p>
            </div>
            {state.user?.role === "doctor" && (
              <Button
                variant="ghost"
                onClick={() => navigate("/calendar-integration")}
                className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-none h-auto"
              >
                <Calendar className="w-4 h-4 text-muted-foreground" /> Calendar Sync
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => showConfirm("Sign Out", "Are you sure you want to sign out?", async () => { await logout(); }, "Sign Out", "danger")}
              className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors rounded-none rounded-b-lg h-auto"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </PopoverContent>
        </Popover>

        {/* Mobile Actions Menu (Placed on the extreme right) */}
        <div className="lg:hidden flex items-center">
          <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/60 bg-muted/20 shadow-xs flex items-center justify-center active:scale-95 shrink-0"
                aria-label="Quick Actions Menu"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-72 sm:w-80 p-0 rounded-2xl border border-border/80 bg-card/98 backdrop-blur-xl shadow-2xl overflow-hidden z-50 divide-y divide-border/50"
            >
              {/* Header */}
              <div className="px-3.5 py-2.5 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Quick Actions</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-background px-2 py-0.5 rounded-md border border-border/60">
                  Menu
                </span>
              </div>

              {/* Primary Shortcuts */}
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal("todaySchedule");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Today's Schedule</p>
                    <p className="text-[10px] text-muted-foreground truncate">View appointments & queue</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal("addCorporateMember");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground group-hover:text-amber-600 transition-colors">Register Member</p>
                    <p className="text-[10px] text-muted-foreground truncate">Onboard corporate or plan member</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWhatsappPhone("");
                    setWhatsappPatientName("");
                    setActiveModal("whatsappHistory");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">WhatsApp Log</p>
                    <p className="text-[10px] text-muted-foreground truncate">Recent messages & delivery status</p>
                  </div>
                </button>
              </div>

              {/* Blank PDF Templates Section */}
              <div className="p-2 space-y-1 bg-muted/15">
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-muted-foreground" /> Blank PDF Templates
                  </span>
                  {downloadingBlank && (
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Downloading...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-0.5">
                  {[
                    { type: "CLINICAL" as BlankPDFType, label: "1. Clinical Observations", icon: FileText, color: "text-emerald-600" },
                    { type: "TREATMENT" as BlankPDFType, label: "2. Treatment Planning", icon: ClipboardList, color: "text-blue-600" },
                    { type: "PRESCRIPTION" as BlankPDFType, label: "3. Prescription Only", icon: Pill, color: "text-purple-600" },
                    { type: "FULL" as BlankPDFType, label: "4. Full Summary", icon: FileCheck, color: "text-amber-600" },
                    { type: "COMPLETION" as BlankPDFType, label: "5. Treatment Completion PDF", icon: CheckCircle2, color: "text-indigo-600" },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        disabled={!!downloadingBlank}
                        onClick={async () => {
                          await handleDownloadBlank(item.type);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-xs font-medium text-foreground transition-all disabled:opacity-50 text-left"
                      >
                        <ItemIcon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer with User & Sign Out */}
              <div className="p-2.5 bg-muted/40 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {state.user?.name?.[0] ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">{state.user?.name}</p>
                    <span className="text-[10px] text-muted-foreground capitalize">{rm.label || state.user?.role}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    showConfirm("Sign Out", "Are you sure you want to sign out?", async () => { await logout(); }, "Sign Out", "danger");
                  }}
                  className="h-7 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg gap-1.5 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
