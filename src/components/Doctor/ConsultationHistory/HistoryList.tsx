import React from "react";
import { Search, Filter, X, MoreVertical, Eye, Activity, Stethoscope, Pill, FileText, Trash2 } from "lucide-react";

interface HistoryListProps {
  data: any[];
  pageData: any[];
  patients: any[];
  search: string;
  onSearchChange: (val: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterFollowUp: string;
  onFilterFollowUp: (val: string) => void;
  filterSort: string;
  onFilterSort: (val: string) => void;
  activeFilters: number;
  activeMenuId: number | null;
  onSetActiveMenuId: (id: number | null) => void;
  onSelectRecord: (record: any) => void;
  onDownloadPDF: (record: any, type: any) => void;
  onDeleteClick: (id: number, e: React.MouseEvent) => void;
  safePage: number;
  PAGE_SIZE: number;
}

export function HistoryList({
  data,
  pageData,
  patients,
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
  filterFollowUp,
  onFilterFollowUp,
  filterSort,
  onFilterSort,
  activeFilters,
  activeMenuId,
  onSetActiveMenuId,
  onSelectRecord,
  onDownloadPDF,
  onDeleteClick,
  safePage,
  PAGE_SIZE
}: HistoryListProps) {
  const initials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarColors = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];
  const avatarColor = (id: number) => avatarColors[id % avatarColors.length];

  const fmtShort = (d: any) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-5 py-2.5 border-b border-gray-100 bg-gray-50 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, diagnosis, contact..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => onSearchChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors font-medium whitespace-nowrap ${showFilters || activeFilters > 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {activeFilters > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-4 pt-0.5 animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500">Follow-up:</span>
              {(["all", "yes", "no"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => onFilterFollowUp(v)}
                  className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors font-medium ${filterFollowUp === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  {v === "all" ? "All" : v === "yes" ? "Required" : "Not Required"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500">Sort:</span>
              {(["newest", "oldest"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => onFilterSort(v)}
                  className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors font-medium ${filterSort === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  {v === "newest" ? "Newest" : "Oldest"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {pageData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-full p-4 mb-3">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">No results found</h3>
            <p className="text-xs text-gray-400 mt-1">Try a different search term or clear filters</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Diagnosis</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Cost</th>
                <th className="text-right px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-2.5 text-xs text-gray-400 tabular-nums align-middle">
                    {(safePage - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(item.id)}`}>
                        {initials(item.patientName || patients.find(p => p.id === item.patientId)?.patientName)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                          {item.patientName || patients.find(p => p.id === item.patientId)?.patientName || "Unknown Patient"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.patientId && <span className="text-xs text-gray-400 font-mono">{item.patientId}</span>}
                          {item.followUpRequired && (
                            <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium leading-tight">Follow-up</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell align-middle">
                    <span className="text-xs text-gray-600 truncate block max-w-[180px]">{item.diagnosis || "—"}</span>
                  </td>
                  <td className="px-3 py-2.5 hidden sm:table-cell align-middle">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{fmtShort(item.completedAt || item.consultationDate)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right hidden sm:table-cell align-middle">
                    {item.treatmentCost && item.treatmentCost > 0
                      ? <span className="text-xs font-semibold text-gray-700">₹{item.treatmentCost}</span>
                      : <span className="text-xs text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-2.5 align-middle">
                    <div className="flex items-center justify-end relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${activeMenuId === item.id ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-500"}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in zoom-in duration-200">
                          <button
                            onClick={() => {
                              onSelectRecord(item);
                              onSetActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Download Reports</div>
                          <button
                            onClick={() => { onDownloadPDF(item, 'CLINICAL'); onSetActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                          >
                            <Activity className="w-3.5 h-3.5" /> Clinical
                          </button>
                          <button
                            onClick={() => { onDownloadPDF(item, 'TREATMENT'); onSetActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2 transition-colors"
                          >
                            <Stethoscope className="w-3.5 h-3.5" /> Treatment
                          </button>
                          <button
                            onClick={() => { onDownloadPDF(item, 'PRESCRIPTION'); onSetActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                          >
                            <Pill className="w-3.5 h-3.5" /> Prescription
                          </button>
                          <button
                            onClick={() => { onDownloadPDF(item, 'FULL'); onSetActiveMenuId(null); }}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Full Report
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={(e) => onDeleteClick(item.id, e)}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
