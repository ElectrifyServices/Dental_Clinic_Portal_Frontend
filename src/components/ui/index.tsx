/**
 * Generic UI primitives — reusable across the entire application.
 * Import from '@/components/ui' in any component.
 */
import React from "react";
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

// ─── PageHeader ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}
export function PageHeader({
  title,
  subtitle,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
      {children}
    </div>
  );
}

// ─── KpiCard ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  /** Optional Tailwind text-color class for the value; defaults to text-foreground */
  colorClass?: string;
  icon?: React.ReactNode;
  sub?: React.ReactNode;
  subPositive?: boolean;
}
export function KpiCard({
  label,
  value,
  colorClass = "text-foreground",
  icon,
  sub,
  subPositive,
}: KpiCardProps) {
  return (
    <div className="kpi-card flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className={cn("text-2xl font-bold", colorClass)}>{value}</p>
        {sub && (
          <p
            className={cn(
              "text-xs mt-1 font-medium",
              subPositive !== false ? "text-emerald-600" : "text-destructive",
            )}
          >
            {sub}
          </p>
        )}
      </div>
      {icon && (
        <div className="text-muted-foreground/40 flex-shrink-0 ml-3">
          {icon}
        </div>
      )}
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
type StatusBadgeVariant =
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "gray"
  | "violet"
  | "indigo";
interface StatusBadgeProps {
  variant?: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}
export function StatusBadge({
  variant = "gray",
  children,
  className = "",
}: StatusBadgeProps) {
  return (
    <span className={cn(`badge badge-${variant}`, className)}>{children}</span>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
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
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  "8xl": "max-w-8xl",
  "9xl": "max-w-9xl",
};

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = "lg",
  icon,
}: ModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "overflow-y-auto p-0 gap-0 max-h-[calc(100vh-5rem)]",
          MODAL_SIZES[size],
        )}
      >
        <DialogHeader className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border/50 p-6 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                {icon}
              </div>
            )}
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight leading-tight">
                {title}
              </DialogTitle>
              {subtitle ? (
                <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                  {subtitle}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  Modal dialog for {title}
                </DialogDescription>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        <div className="modal-body p-6">{children}</div>
        {footer && (
          <DialogFooter className="p-6 border-t border-border">
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
export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      onClose={isLoading ? () => {} : onCancel}
      size="sm"
      icon={<AlertTriangle className="w-4 h-4" />}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
}

// ─── ContentCard ─────────────────────────────────────────────────────────────
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

export function ContentCard({
  title,
  subtitle,
  children,
  footer,
  icon,
  action,
  className,
  bodyClassName,
}: ContentCardProps) {
  return (
    <Card className={cn("overflow-hidden flex flex-col h-full", className)}>
      {(title || icon) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50 mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold tracking-tight leading-tight">
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <CardDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("flex-1", bodyClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-4 border-t border-border mt-auto">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

// ─── MetricCard ──────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "primary" | "emerald" | "amber" | "rose" | "indigo" | "gray";
  trend?: string | { value: string; isUp: boolean };
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  variant = "gray",
  trend,
  className,
}: MetricCardProps) {
  const variants = {
    primary: "bg-primary/10 text-primary ring-primary/5",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-500/5",
    amber: "bg-amber-50 text-amber-600 ring-amber-500/5",
    rose: "bg-rose-50 text-rose-600 ring-rose-500/5",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-500/5",
    gray: "bg-muted text-muted-foreground ring-muted-foreground/5",
  };

  return (
    <Card
      className={cn(
        "p-6 hover:shadow-lg transition-all duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center ring-8",
            variants[variant],
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1.5">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-foreground tracking-tight leading-none">
              {value}
            </h4>
            {trend && (
              <span
                className={cn(
                  "text-[10px] font-bold",
                  typeof trend === "object"
                    ? trend.isUp
                      ? "text-emerald-600"
                      : "text-destructive"
                    : "text-emerald-600",
                )}
              >
                {typeof trend === "object" ? (
                  <span className="flex items-center gap-0.5">
                    {trend.isUp ? "↑" : "↓"} {trend.value}
                  </span>
                ) : (
                  trend
                )}
              </span>
            )}
          </div>
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
}
export function DataTable<T>({
  columns,
  data,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  rowKey,
  footer,
}: DataTableProps<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.className}
                  style={{ textAlign: col.align || "left" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                    {emptyIcon && (
                      <div className="text-muted-foreground/40">
                        {emptyIcon}
                      </div>
                    )}
                    {emptyTitle && (
                      <p className="text-sm font-semibold text-foreground">
                        {emptyTitle}
                      </p>
                    )}
                    {emptySubtitle && (
                      <p className="text-xs text-muted-foreground">
                        {emptySubtitle}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const key = rowKey(row) || `row-${idx}`;
                return (
                  <tr key={key}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align || "left" }}
                        className={col.className}
                      >
                        {col.render(row, idx)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="border-t border-border bg-muted/30">{footer}</div>
      )}
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
}
export function Pagination({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
  );
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
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
                  "w-7 h-7 text-xs rounded-lg font-medium transition-colors",
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
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
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
    </div>
  );
}

// ─── FilterTabs ───────────────────────────────────────────────────────────────
interface FilterTab {
  key: string;
  label: string;
}
interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  onChange: (key: string) => void;
}
export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="filter-tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={active === t.key ? "filter-tab-active" : "filter-tab"}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── LabeledField (legacy label-wrapper, kept for non-RHF contexts) ─────────
interface LabeledFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}
export function LabeledField({
  label,
  required,
  error,
  children,
}: LabeledFieldProps) {
  return (
    <div>
      <label className="form-label">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
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
export function FileUploadZone({
  onFile,
  accept = ".xlsx,.xls,.csv",
  label = "Click to upload or drag & drop",
  hint,
  inputRef,
}: FileUploadZoneProps) {
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
      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
export function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full",
        active ? "bg-emerald-500" : "bg-muted-foreground/30",
      )}
    />
  );
}

// ─── PlanBadge ────────────────────────────────────────────────────────────────
interface PlanBadgeProps {
  name: string;
  code: string;
  color?: string;
}
const PLAN_COLOR_CLASSES: Record<string, string> = {
  blue: "bg-primary/10 text-primary border-primary/30",
  violet: "bg-violet-100 text-violet-800 border-violet-200",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rose: "bg-rose-100 text-rose-800 border-rose-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  teal: "bg-teal-100 text-teal-800 border-teal-200",
};
export function PlanBadge({ name, code, color = "blue" }: PlanBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-foreground">{name}</span>
      <span
        className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded border",
          PLAN_COLOR_CLASSES[color] ?? PLAN_COLOR_CLASSES.blue,
        )}
      >
        {code}
      </span>
    </div>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────
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
