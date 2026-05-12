/**
 * Generic UI primitives — reusable across the entire application.
 * Import from '@/components/ui' in any component.
 */
import React from 'react';
import { ChevronLeft, ChevronRight, X, AlertTriangle, Search, Upload } from 'lucide-react';

export * from './Button';
export * from './Input';
export * from './Card';
export { FormRenderer, SectionRenderer } from './FormRenderer';
export type { FormRendererProps, SectionRendererProps } from './FormRenderer';

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}
export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
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
  color?: string;   // tailwind text color e.g. 'text-blue-600'
  icon?: React.ReactNode;
}
export function KpiCard({ label, value, color = 'text-gray-900', icon }: KpiCardProps) {
  return (
    <div className="kpi-card flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      {icon && <div className="text-gray-300">{icon}</div>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'violet' | 'indigo';
interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}
export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl';
  icon?: React.ReactNode;
}
const MODAL_SIZES = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-xl', '2xl':'max-w-2xl', '5xl': 'max-w-5xl' };

export function Modal({ title, subtitle, onClose, children, footer, size = 'lg', icon }: ModalProps) {
  return (
    <div className="modal-overlay">
      <div className={`modal-box ${MODAL_SIZES[size]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="modal-header sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100/50">
          <div className="flex items-center gap-2">
            {icon && <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold shadow-sm">{icon}</div>}
            <div>
              <h2 className="modal-title text-lg font-semibold tracking-tight leading-tight">{title}</h2>
              {subtitle && <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon bg-muted/50 hover:bg-muted hover:rotate-90 transition-all"><X className="w-4 h-4" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}
export function ConfirmModal({ title, message, confirmLabel = 'Confirm', variant = 'danger', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onCancel} size="sm"
      icon={<AlertTriangle className="w-4 h-4" />}
      footer={
        <>
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────
interface Column<T> {
  key: string;
  header: string;
  render: (row: T, idx: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
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
export function DataTable<T>({ columns, data, emptyIcon, emptyTitle, emptySubtitle, rowKey, footer }: DataTableProps<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={col.className}
                  style={{ textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state py-10">
                    {emptyIcon && <div className="empty-state-icon">{emptyIcon}</div>}
                    {emptyTitle && <p className="empty-state-title">{emptyTitle}</p>}
                    {emptySubtitle && <p className="empty-state-sub">{emptySubtitle}</p>}
                  </div>
                </td>
              </tr>
            ) : data.map((row, idx) => {
              const key = rowKey(row) || `row-${idx}`;
              return (
                <tr key={key}>
                  {columns.map(col => (
                    <td key={col.key} style={{ textAlign: col.align || 'left' }}
                      className={col.className}>
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footer && <div className="border-t border-gray-100 bg-gray-50">{footer}</div>}
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
export function Pagination({ page, totalPages, totalItems, perPage, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2);
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-xs text-gray-500">Showing {start}–{end} of {totalItems}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((p, i) => {
          const prev = pages[i - 1];
          return (
            <React.Fragment key={p}>
              {prev && p - prev > 1 && <span className="text-xs text-gray-400 px-1">…</span>}
              <button onClick={() => onPageChange(p)}
                className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {p}
              </button>
            </React.Fragment>
          );
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
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
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="search-input" />
    </div>
  );
}

// ─── FilterTabs ───────────────────────────────────────────────────────────────
interface FilterTab { key: string; label: string; }
interface FilterTabsProps {
  tabs: FilterTab[];
  active: string;
  onChange: (key: string) => void;
}
export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="filter-tabs">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={active === t.key ? 'filter-tab-active' : 'filter-tab'}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}
export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="form-label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
export function FileUploadZone({ onFile, accept = '.xlsx,.xls,.csv', label = 'Click to upload or drag & drop', hint, inputRef }: FileUploadZoneProps) {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef || defaultRef;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };
  return (
    <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
      onClick={() => ref.current?.click()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
export function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
  );
}

// ─── PlanBadge ────────────────────────────────────────────────────────────────
interface PlanBadgeProps { name: string; code: string; color?: string; }
const CC: Record<string, string> = {
  blue:'bg-blue-100 text-blue-800 border-blue-200', violet:'bg-violet-100 text-violet-800 border-violet-200',
  emerald:'bg-emerald-100 text-emerald-800 border-emerald-200', rose:'bg-rose-100 text-rose-800 border-rose-200',
  amber:'bg-amber-100 text-amber-800 border-amber-200', cyan:'bg-cyan-100 text-cyan-800 border-cyan-200',
  indigo:'bg-indigo-100 text-indigo-800 border-indigo-200', teal:'bg-teal-100 text-teal-800 border-teal-200',
};
export function PlanBadge({ name, code, color = 'blue' }: PlanBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-gray-900">{name}</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${CC[color] || CC.blue}`}>{code}</span>
    </div>
  );
}
