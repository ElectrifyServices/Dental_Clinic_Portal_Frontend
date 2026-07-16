/**
 * Generic UI primitives — reusable across the entire application.
 * Import from '@/components/ui' in any component.
 */
import React from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { Label } from "./Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
export * from "./DropdownMenu";

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}
export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-4 mb-6">
      <div className="flex-1 min-w-[120px]">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight line-clamp-1">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">{subtitle}</p>}
      </div>
      {children}
      {action && (
        <div className="flex flex-row items-center justify-end gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  colorClass?: string;
  icon?: React.ReactNode;
  sub?: React.ReactNode;
  subPositive?: boolean;
}
export function KpiCard({ label, value, colorClass = "text-foreground", icon, sub, subPositive }: KpiCardProps) {
  return (
    <div className="kpi-card flex items-start justify-between group cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 transition-colors duration-200 group-hover:text-primary/80">
          {label}
        </p>
        <p className={cn("text-[32px] font-bold leading-none transition-transform duration-300 group-hover:translate-x-0.5", colorClass)}>{value}</p>
        {sub && (
          <p className={cn("text-xs mt-2 font-medium", subPositive !== false ? "text-emerald-600" : "text-destructive")}>
            {sub}
          </p>
        )}
      </div>
      {icon && <div className="text-muted-foreground/30 flex-shrink-0 ml-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary/50">{icon}</div>}
    </div>
  );
}

type StatusBadgeVariant = "green" | "blue" | "amber" | "red" | "gray" | "violet" | "indigo";
interface StatusBadgeProps {
  variant?: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}
export function StatusBadge({ variant = "gray", children, className = "" }: StatusBadgeProps) {
  const variantClasses: Record<StatusBadgeVariant, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400",
    red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400",
    gray: "bg-muted text-muted-foreground border-transparent dark:bg-slate-900/40 dark:text-slate-400",
    violet: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", variantClasses[variant], className)}>{children}</span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl";
  icon?: React.ReactNode;
}
const MODAL_SIZES: Record<string, string> = {
  sm:  "max-w-sm",
  md:  "max-w-md",
  lg:  "max-w-lg",
  xl:  "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export function Modal({ title, subtitle, onClose, children, footer, size = "lg", icon }: ModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 max-h-[calc(100vh-4rem)] overflow-hidden rounded-modal border border-border/80 bg-card/95 backdrop-blur-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)]",
          MODAL_SIZES[size],
        )}
      >
        <DialogHeader className="sticky top-0 z-20 bg-card border-b border-border px-6 py-4 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 bg-primary/10 rounded-md flex items-center justify-center text-primary flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground leading-snug">
                {title}
              </DialogTitle>
              {subtitle ? (
                <DialogDescription className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[1px] mt-0.5">
                  {subtitle}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">Modal dialog for {title}</DialogDescription>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
        {footer && (
          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/40 sticky bottom-0 z-20">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
export function ConfirmModal({ title, message, confirmLabel = "Confirm", variant = "danger", isLoading = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      onClose={isLoading ? () => {} : onCancel}
      size="sm"
      icon={<AlertTriangle className={cn("w-4 h-4 animate-pulse", variant === "danger" ? "text-destructive" : "text-primary")} />}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button variant={variant === "danger" ? "destructive" : "default"} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
    </Modal>
  );
}

// ─── ContentCard ──────────────────────────────────────────────────────────────
interface ContentCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}
export function ContentCard({ title, subtitle, children, footer, icon, action, className, bodyClassName }: ContentCardProps) {
  return (
    <Card className={cn("overflow-hidden flex flex-col", className)}>
      {(title || icon) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border mb-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 bg-primary/10 rounded-md flex items-center justify-center text-primary flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold leading-snug">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <CardDescription className="text-[11px] font-semibold uppercase tracking-[1px] mt-0.5">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 pt-5", bodyClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-4 border-t border-border mt-auto bg-muted/30">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "emerald" | "amber" | "rose" | "indigo" | "gray";
  trend?: string | { value: string; isUp: boolean };
  className?: string;
  interactive?: boolean;
}
export function MetricCard({ label, value, icon, variant = "gray", trend, className, interactive = true }: MetricCardProps) {
  const variants = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-50 text-emerald-600",
    amber:   "bg-amber-50  text-amber-600",
    rose:    "bg-rose-50   text-rose-600",
    indigo:  "bg-indigo-50 text-indigo-600",
    gray:    "bg-muted     text-muted-foreground",
  };
  const hoverVariants = {
    primary: "group-hover:bg-primary/20",
    emerald: "group-hover:bg-emerald-100",
    amber:   "group-hover:bg-amber-100",
    rose:    "group-hover:bg-rose-100",
    indigo:  "group-hover:bg-indigo-100",
    gray:    "group-hover:bg-muted/80",
  };

  return (
    <Card className={cn(
      "p-4 sm:p-5 md:p-6 transition-all duration-300 ease-out group",
      interactive ? "hover:shadow-card-hover hover:-translate-y-1 hover:border-border/80 cursor-pointer" : "cursor-default",
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 transition-colors duration-200",
            interactive ? "group-hover:text-primary/80" : "",
          )}>
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] sm:text-[32px] font-bold text-foreground leading-none">{value}</span>
            {trend && (
              <span className={cn("text-xs font-semibold",
                typeof trend === "object"
                  ? trend.isUp ? "text-emerald-600" : "text-destructive"
                  : "text-emerald-600",
              )}>
                {typeof trend === "object" ? (
                  <span className="flex items-center gap-0.5">
                    {trend.isUp ? "↑" : "↓"} {trend.value}
                  </span>
                ) : trend}
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "w-10 h-10 sm:w-11 sm:h-11 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-300",
          variants[variant],
          interactive ? hoverVariants[variant] : "",
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────
interface Column<T> {
  key: string;
  header: string;
  render: (row: T, idx: number) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
  rowKey: (row: T) => string;
  footer?: React.ReactNode;
  renderExpandedRow?: (row: T) => React.ReactNode;
  expandedRowIds?: Set<string>;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T, idx: number) => string;
  className?: string;
  scrollClassName?: string;
  disableRowAnimation?: boolean;
}
export function DataTable<T>({ columns, data, emptyIcon, emptyTitle, emptySubtitle, rowKey, footer, renderExpandedRow, expandedRowIds, onRowClick, rowClassName, className, scrollClassName, disableRowAnimation = false }: DataTableProps<T>) {
  return (
    <div className={cn("card overflow-hidden flex flex-col min-h-0", className)}>
      <div className={cn("overflow-x-auto flex-1 min-h-0", scrollClassName)}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.className} style={{ textAlign: col.align || "left" }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    {emptyIcon && (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground/50">
                        {emptyIcon}
                      </div>
                    )}
                    {emptyTitle && <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>}
                    {emptySubtitle && <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">{emptySubtitle}</p>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const key = rowKey(row) || `row-${idx}`;
                const rowClasses = cn(
                  onRowClick ? "cursor-pointer hover:bg-muted/30 transition-colors" : "",
                  rowClassName?.(row, idx)
                );

                return (
                  <React.Fragment key={key}>
                    {disableRowAnimation ? (
                      <tr key={key} onClick={() => onRowClick?.(row)} className={rowClasses}>
                        {columns.map((col) => (
                          <td key={col.key} style={{ textAlign: col.align || "left" }} className={col.className}>
                            {col.render(row, idx)}
                          </td>
                        ))}
                      </tr>
                    ) : (
                      <motion.tr
                        key={key}
                        onClick={() => onRowClick?.(row)}
                        className={rowClasses}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.25) }}
                      >
                        {columns.map((col) => (
                          <td key={col.key} style={{ textAlign: col.align || "left" }} className={col.className}>
                            {col.render(row, idx)}
                          </td>
                        ))}
                      </motion.tr>
                    )}
                    {(() => {
                      if (!renderExpandedRow || !expandedRowIds?.has(key)) return null;
                      const content = renderExpandedRow(row);
                      if (!content) return null;
                      return (
                        <tr>
                          <td colSpan={columns.length} className="p-0  border-border bg-transparent">
                            {content}
                          </td>
                        </tr>
                      );
                    })()}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer && <div className="border-t border-border bg-muted/30">{footer}</div>}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (p: number) => void;
  onPerPageChange?: (size: number) => void;
}
export function Pagination({ page, totalPages, totalItems, perPage, onPageChange, onPerPageChange }: PaginationProps) {
  if (totalPages <= 1 && !onPerPageChange) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
  );
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{start > totalItems ? totalItems : start}–{end}</span> of <span className="font-semibold text-foreground">{totalItems}</span>
        </p>
        {onPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Rows:</span>
            <Select value={String(perPage)} onValueChange={(val) => onPerPageChange(Number(val))}>
              <SelectTrigger className="h-7 text-xs px-2 w-[65px]">
                <SelectValue placeholder={String(perPage)} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((p, i) => {
          const prev = pages[i - 1];
          return (
            <React.Fragment key={p}>
              {prev && p - prev > 1 && (
                <span className="text-xs text-muted-foreground px-1">…</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-8 h-8 text-xs rounded-md font-medium transition-colors",
                  p === page
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {p}
              </button>
            </React.Fragment>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}
export function SearchInput({ value, onChange, placeholder = "Search…", className = "", ...props }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        name="search-query-input"
        autoComplete="new-password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        spellCheck="false"
        {...props}
      />
    </div>
  );
}

// ─── FilterTabs ───────────────────────────────────────────────────────────────
interface FilterTab { key?: string; value?: string; label: string; }
interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  onChange: (key: string) => void;
}
export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="filter-tabs">
      {tabs.map((t, idx) => {
        const k = t.key ?? t.value ?? String(idx);
        return (
          <button key={k} onClick={() => onChange(k)}
            className={active === k ? "filter-tab-active" : "filter-tab"}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── LabeledField ─────────────────────────────────────────────────────────────
interface LabeledFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}
export function LabeledField({ label, required, error, children }: LabeledFieldProps) {
  return (
    <div>
      <Label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── FileUploadZone ───────────────────────────────────────────────────────────
interface FileUploadZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  hint?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}
export function FileUploadZone({ onFile, accept = ".xlsx,.xls,.csv", label = "Click to upload or drag & drop", hint, inputRef }: FileUploadZoneProps) {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef || defaultRef;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => ref.current?.click()}
      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 hover:scale-[1.005] hover:shadow-sm transition-all duration-250 ease-out group"
    >
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3 transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-primary/80" />
      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
export function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={cn("inline-block w-2 h-2 rounded-full", active ? "bg-success" : "bg-muted-foreground/30")} />
  );
}

// ─── PlanBadge ────────────────────────────────────────────────────────────────
interface PlanBadgeProps { name: string; code: string; color?: string; }
const PLAN_COLOR_CLASSES: Record<string, string> = {
  blue:   "bg-primary/10 text-primary border-primary/30",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  emerald:"bg-emerald-100 text-emerald-700 border-emerald-200",
  rose:   "bg-rose-100    text-rose-700    border-rose-200",
  amber:  "bg-amber-100   text-amber-700   border-amber-200",
  cyan:   "bg-cyan-100    text-cyan-700    border-cyan-200",
  indigo: "bg-indigo-100  text-indigo-700  border-indigo-200",
  teal:   "bg-teal-100    text-teal-700    border-teal-200",
};
export function PlanBadge({ name, code, color = "blue" }: PlanBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-foreground">{name}</span>
      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", PLAN_COLOR_CLASSES[color] ?? PLAN_COLOR_CLASSES.blue)}>
        {code}
      </span>
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export * from "./Button";
export * from "./Input";
export * from "./Card";
export * from "./Badge";
export * from "./Label";
export * from "./Textarea";
export * from "./Select";
export * from "./Checkbox";
export * from "./Separator";
export * from "./Tooltip";
export * from "./Dialog";
export * from "./Tabs";
export * from "./DropdownMenu";
export * from "./Popover";
export * from "./SearchableSelect";
export { FormRenderer, SectionRenderer } from "./FormRenderer";
export type { FormRendererProps, SectionRendererProps } from "./FormRenderer";
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from "./Form";
export {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormDateInput,
  FormPhoneInput,
} from "./form/index";
export * from "./Toast";
export * from "./Loading";
export * from "./ErrorState";
