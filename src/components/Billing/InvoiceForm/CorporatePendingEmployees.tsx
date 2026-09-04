import React, { useState, useRef } from "react";
import {
  Users,
  Search,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ListChecks,
  RotateCcw,
  X,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { CorporateBulkSelectModal } from "./CorporateBulkSelectModal";

interface CorporatePendingEmployeesProps {
  employees: any[];
  linkedItemIds: string[];
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
  onAddMultiple: (items: any[]) => void;
  onRemoveMultiple: (ids: string[]) => void;
}

export const CorporatePendingEmployees: React.FC<
  CorporatePendingEmployeesProps
> = ({
  employees,
  linkedItemIds,
  onAdd,
  onRemove,
  onAddMultiple,
  onRemoveMultiple,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!employees || employees.length === 0) return null;

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.includes(searchTerm) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedCount = employees.filter((emp) =>
    linkedItemIds.includes(emp.enrollment_id),
  ).length;

  const handleScroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddAll = () => {
    const unadded = filteredEmployees.filter(
      (emp) => !linkedItemIds.includes(emp.enrollment_id),
    );
    if (unadded.length === 0) return;

    const itemsToAdd = unadded.map((emp) => ({
      id: emp.enrollment_id,
      type: "membership",
      description: `Employee Membership - ${emp.name} ${emp.phone ? `(${emp.phone})` : ""}`,
      rate: emp.billing_amount || 0,
      date: new Date().toISOString(),
      doctor_name: emp.plan_name,
      status: emp.status,
      rawItem: emp,
    }));
    onAddMultiple(itemsToAdd);
  };

  const handleClearAll = () => {
    const idsToRemove = employees
      .filter((emp) => linkedItemIds.includes(emp.enrollment_id))
      .map((emp) => emp.enrollment_id);
    if (idsToRemove.length > 0) {
      onRemoveMultiple(idsToRemove);
    }
  };

  const allAdded =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => linkedItemIds.includes(emp.enrollment_id));

  return (
    <Card className="bg-indigo-50/40 border border-indigo-100 rounded-2xl shadow-sm mb-6 relative w-full overflow-hidden">
      <CardContent className="p-4 sm:p-5 w-full overflow-hidden space-y-3.5">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-indigo-950 font-extrabold text-sm">
                  Enrolled Employees
                </h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  {employees.length} Pending
                </span>
              </div>
              <p className="text-[11px] text-indigo-700/80 font-medium">
                Select employees to add to this corporate bill
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 p-0 h-4 w-4"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBulkModal(true)}
              className="text-xs font-bold h-8 px-3 rounded-xl border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 shadow-sm shrink-0"
            >
              <ListChecks className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              <span>Select Multiple</span>
            </Button>
          </div>
        </div>

        {/* Action Toolbar Row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              Selected:{" "}
              <span className="text-indigo-600 font-extrabold">
                {selectedCount}
              </span>{" "}
              / {employees.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                className="text-xs font-bold h-7 px-3 rounded-xl border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-sm"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear All ({selectedCount})
              </Button>
            )}

            <Button
              type="button"
              onClick={handleAddAll}
              disabled={allAdded || filteredEmployees.length === 0}
              className={`text-xs font-bold h-7 px-3 rounded-xl transition-all shadow-sm ${
                allAdded
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200 opacity-80 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {allAdded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add All (
                  {
                    filteredEmployees.filter(
                      (e) => !linkedItemIds.includes(e.enrollment_id),
                    ).length
                  }
                  )
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Employee Cards List */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-6 text-indigo-400 text-sm italic font-medium bg-white/50 rounded-xl border border-dashed border-indigo-200">
            No employees match "{searchTerm}".
          </div>
        ) : (
          <div className="relative group pt-1">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleScroll("left")}
                className="bg-white border-indigo-100 text-indigo-600 h-7 w-7 rounded-full shadow-md hover:bg-indigo-50 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            <div
              ref={scrollRef}
              className="flex flex-row overflow-x-auto gap-3 pb-2 snap-x scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredEmployees.map((emp) => {
                const isSelected = linkedItemIds.includes(emp.enrollment_id);

                const selectedBg =
                  "bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-100";
                const defaultBg =
                  "bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-sm";

                const textSelected = "text-white";
                const textDefault = "text-indigo-950";

                const subTextSelected = "text-indigo-100";
                const subTextDefault = "text-slate-500";

                const btnSelected =
                  "bg-indigo-800 text-white hover:bg-indigo-900 border-indigo-700";
                const btnDefault =
                  "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200";

                return (
                  <Card
                    key={emp.enrollment_id}
                    className={`min-w-[250px] max-w-[250px] snap-start transition-all duration-200 flex flex-col justify-between overflow-hidden border shrink-0 ${
                      isSelected ? selectedBg : defaultBg
                    }`}
                  >
                    <CardContent className="p-3.5 flex flex-col justify-between h-full gap-3">
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            EMPLOYEE
                          </span>
                          <code
                            className={`text-[11px] font-black ${isSelected ? textSelected : "text-emerald-600"}`}
                          >
                            ₹{(emp.billing_amount || 0).toLocaleString()}
                          </code>
                        </div>
                        <p
                          className={`text-sm leading-tight mb-1 font-black ${isSelected ? textSelected : textDefault} truncate`}
                          title={emp.name}
                        >
                          {emp.name || "Unknown Name"}
                        </p>
                        <p
                          className={`text-[10px] font-semibold ${isSelected ? subTextSelected : subTextDefault}`}
                        >
                          📞 {emp.phone || "No phone"}
                        </p>
                        {emp.email && (
                          <p
                            className={`text-[10px] font-medium mt-0.5 truncate ${isSelected ? subTextSelected : subTextDefault}`}
                            title={emp.email}
                          >
                            📧 {emp.email}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const invoiceItem = {
                            id: emp.enrollment_id,
                            type: "membership",
                            description: `Employee Membership - ${emp.name} ${emp.phone ? `(${emp.phone})` : ""}`,
                            rate: emp.billing_amount || 0,
                            date: new Date().toISOString(),
                            doctor_name: emp.plan_name,
                            status: emp.status,
                            rawItem: emp,
                          };
                          isSelected
                            ? onRemove(emp.enrollment_id)
                            : onAdd(invoiceItem);
                        }}
                        className={`w-full text-[10px] h-7 font-black uppercase tracking-wider transition-all ${
                          isSelected ? btnSelected : btnDefault
                        }`}
                        variant={isSelected ? "default" : "outline"}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> Added to Bill
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add to Bill
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleScroll("right")}
                className="bg-white border-indigo-100 text-indigo-600 h-7 w-7 rounded-full shadow-md hover:bg-indigo-50 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <CorporateBulkSelectModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          employees={employees}
          linkedItemIds={linkedItemIds}
          onAddMultiple={onAddMultiple}
          onRemoveMultiple={onRemoveMultiple}
        />
      </CardContent>
    </Card>
  );
};
