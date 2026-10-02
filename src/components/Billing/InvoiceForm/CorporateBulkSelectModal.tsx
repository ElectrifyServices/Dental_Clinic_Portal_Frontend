import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { Button, DataTable } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Search, CheckCircle2 } from "lucide-react";

interface CorporateBulkSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  linkedItemIds: string[];
  onAddMultiple: (items: any[]) => void;
  onRemoveMultiple: (ids: string[]) => void;
}

export const CorporateBulkSelectModal: React.FC<CorporateBulkSelectModalProps> = ({
  isOpen,
  onClose,
  employees,
  linkedItemIds,
  onAddMultiple,
  onRemoveMultiple,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelection, setLocalSelection] = useState<Set<string>>(new Set(linkedItemIds));

  // Sync local selection when modal opens or linkedItemIds change
  React.useEffect(() => {
    if (isOpen) {
      setLocalSelection(new Set(linkedItemIds));
    }
  }, [isOpen, linkedItemIds]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone?.includes(searchTerm) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const allFilteredSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => localSelection.has(emp.enrollment_id));

  const toggleAll = () => {
    const newSelection = new Set(localSelection);
    if (allFilteredSelected) {
      filteredEmployees.forEach((emp) => newSelection.delete(emp.enrollment_id));
    } else {
      filteredEmployees.forEach((emp) => newSelection.add(emp.enrollment_id));
    }
    setLocalSelection(newSelection);
  };

  const toggleOne = (id: string) => {
    const newSelection = new Set(localSelection);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setLocalSelection(newSelection);
  };

  const handleSave = () => {
    // Determine which ones to add (in localSelection but not in linkedItemIds)
    const toAddIds = Array.from(localSelection).filter(id => !linkedItemIds.includes(id));
    // Determine which ones to remove (in linkedItemIds but not in localSelection)
    const toRemoveIds = linkedItemIds.filter(id => !localSelection.has(id));

    if (toAddIds.length > 0) {
      const itemsToAdd = employees
        .filter(emp => toAddIds.includes(emp.enrollment_id))
        .map(emp => ({
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
    }

    if (toRemoveIds.length > 0) {
      onRemoveMultiple(toRemoveIds);
    }

    onClose();
  };

  const columns = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={allFilteredSelected}
          onChange={toggleAll}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      ),
      className: "w-12 text-center p-4",
      align: "center" as const,
      render: (emp: any) => (
        <input
          type="checkbox"
          checked={localSelection.has(emp.enrollment_id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(emp.enrollment_id);
          }}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      ),
    },
    {
      key: "name",
      header: "Employee Name",
      className: "p-4 font-bold text-indigo-900",
      render: (emp: any) => (
        <div>
          <p className="font-bold text-slate-800">{emp.name || "Unknown Name"}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{emp.plan_name}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Details",
      className: "p-4 font-bold text-indigo-900",
      render: (emp: any) => (
        <div>
          <p className="text-xs text-slate-600">📞 {emp.phone || "N/A"}</p>
          {emp.email && <p className="text-xs text-slate-600">📧 {emp.email}</p>}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount (₹)",
      className: "p-4 font-bold text-indigo-900 text-right",
      align: "right" as const,
      render: (emp: any) => (
        <span className="font-black text-emerald-600">
          ₹{(emp.billing_amount || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl text-indigo-950">Select Specific Members</DialogTitle>
          <DialogDescription>
            Use checkboxes to hand-pick specific employees to add to the invoice. You have selected {localSelection.size} member(s).
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search in list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 h-10 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="text-sm font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl">
            {localSelection.size} / {employees.length} Selected
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0 min-h-[300px]">
          <DataTable
            columns={columns}
            data={filteredEmployees}
            rowKey={(emp: any) => emp.enrollment_id}
            onRowClick={(emp: any) => toggleOne(emp.enrollment_id)}
            emptyTitle="No members match your search criteria."
            rowClassName={(emp: any) =>
              `hover:bg-indigo-50/30 transition-colors cursor-pointer ${
                localSelection.has(emp.enrollment_id) ? 'bg-indigo-50/40' : ''
              }`
            }
            disableRowAnimation
          />
        </div>

        <DialogFooter className="p-4 border-t bg-muted/10 flex sm:justify-between items-center">
          <Button type="button" variant="ghost" onClick={onClose} className="text-slate-500">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Apply Selection ({localSelection.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
