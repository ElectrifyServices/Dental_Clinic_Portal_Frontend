import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Users, Calendar, FileText, BarChart3, Package, CreditCard, UserCheck, Activity, Building2, DollarSign, Home } from "lucide-react";
import { Input, Card } from "../ui";

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
  color: string;
}

const PAGES: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
  { id: "dashboard",       label: "Dashboard",          icon: Home,       color: "text-blue-500" },
  { id: "appointments",    label: "Appointments",       icon: Calendar,   color: "text-violet-500" },
  { id: "patients",        label: "Patients",           icon: Users,      color: "text-emerald-500" },
  { id: "patient-queue",   label: "Consultation Queue", icon: Activity,   color: "text-amber-500" },
  { id: "treatments",      label: "Treatments",         icon: UserCheck,  color: "text-rose-500" },
  { id: "emr",             label: "Medical Records",    icon: FileText,   color: "text-cyan-500" },
  { id: "billing",         label: "Billing",            icon: CreditCard, color: "text-green-500" },
  { id: "inventory",       label: "Inventory",          icon: Package,    color: "text-orange-500" },
  { id: "reports",         label: "Analytics",          icon: BarChart3,  color: "text-purple-500" },
  { id: "staff",           label: "Staff",              icon: UserCheck,  color: "text-indigo-500" },
  { id: "membership",      label: "Memberships",        icon: Building2,  color: "text-teal-500" },
  { id: "profit-sharing",  label: "Profit Sharing",     icon: DollarSign, color: "text-yellow-500" },
];

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const results: SearchResult[] = React.useMemo(() => {
    if (!query.trim()) {
      // Show all pages as quick nav when no query
      return PAGES.slice(0, 6).map((p) => ({
        id: p.id,
        label: p.label,
        icon: p.icon,
        action: () => { navigate(`/${p.id}`); close(); },
        category: "Pages",
        color: p.color,
      }));
    }

    const q = query.toLowerCase();
    const matched: SearchResult[] = [];

    PAGES.forEach((p) => {
      if (p.label.toLowerCase().includes(q)) {
        matched.push({
          id: `page-${p.id}`,
          label: p.label,
          sublabel: "Go to page",
          icon: p.icon,
          action: () => { navigate(`/${p.id}`); close(); },
          category: "Pages",
          color: p.color,
        });
      }
    });

    return matched.slice(0, 8);
  }, [query, navigate]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[activeIdx]?.action();
    } else if (e.key === "Escape") {
      close();
    }
  };

  useEffect(() => {
    setActiveIdx(0);
  }, [results.length]);

  // Group by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative flex-1 w-full max-w-md">
      {/* Search trigger / input */}
      <div className="relative w-full">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search pages, patients, records…"
          className={[
            "w-full pl-10 pr-12 h-9 text-sm rounded-xl border transition-all duration-200 bg-muted/60 border-border/60 hover:border-border hover:bg-muted focus-visible:bg-card focus-visible:border-primary/40 focus-visible:ring-primary/20 text-ellipsis",
            open && "bg-card border-primary/40 shadow-[0_0_0_3px_rgba(var(--primary)/0.08)] ring-1 ring-primary/20"
          ].join(" ")}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
          {query ? (
            <button
              onClick={(e) => { e.stopPropagation(); setQuery(""); inputRef.current?.focus(); }}
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground/50 bg-muted border border-border/50 rounded px-1.5 py-0.5 select-none flex-shrink-0">
              <span className="text-[9px]">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1.5 border border-border rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {!query.trim() && (
            <div className="px-3 pt-2.5 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground/60">Quick Navigation</span>
            </div>
          )}

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              {query.trim() && (
                <div className="px-3 pt-2.5 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground/60">{category}</span>
                </div>
              )}
              <div className="pb-1.5">
                {items.map((result, idx) => {
                  const globalIdx = results.findIndex((r) => r.id === result.id);
                  const Icon = result.icon;
                  return (
                    <button
                      key={result.id}
                      onClick={result.action}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      className={[
                        "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                        activeIdx === globalIdx
                          ? "bg-primary/5 text-foreground"
                          : "hover:bg-muted/60 text-foreground",
                      ].join(" ")}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${activeIdx === globalIdx ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`w-3.5 h-3.5 ${activeIdx === globalIdx ? "text-primary" : result.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.label}</p>
                        {result.sublabel && (
                          <p className="text-[11px] text-muted-foreground truncate">{result.sublabel}</p>
                        )}
                      </div>
                      {activeIdx === globalIdx && (
                        <kbd className="text-[10px] font-medium text-muted-foreground/50 bg-muted border border-border/50 rounded px-1.5 py-0.5 flex-shrink-0">↵</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="border-t border-border/60 px-3 py-2 flex items-center gap-3 bg-muted/30">
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
              <kbd className="bg-muted border border-border/50 rounded px-1 text-[9px]">↑↓</kbd> navigate
            </span>
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
              <kbd className="bg-muted border border-border/50 rounded px-1 text-[9px]">↵</kbd> select
            </span>
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
              <kbd className="bg-muted border border-border/50 rounded px-1 text-[9px]">Esc</kbd> close
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
