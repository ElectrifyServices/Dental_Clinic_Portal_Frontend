import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Stethoscope,
  Shield,
  User,
  IndianRupee,
  Calendar,
  MoreVertical,
  Phone,
  Mail,
  LayoutGrid,
  List,
  Users,
} from "lucide-react";
import { User as UserType } from "../../types";
import { createPortal } from "react-dom";
import {
  Button,
  PageHeader,
  DataTable,
  SearchInput,
  FilterTabs,
  Badge,
  Card,
  CardContent,
} from "@/components/ui";

interface DoctorManagementProps {
  staffMembers: UserType[];
  onAddDoctor: () => void;
  onEditDoctor: (id: string) => void;
  onDeleteDoctor: (id: string) => void;
  onUpdateStaff: (staff: any) => void;
  onManageSchedule: (id: string, name: string) => void;
  onPaySalary?: (id: string, name: string) => void;
  onViewSalaryHistory?: (id: string, name: string) => void;
}

const ROLE_META: Record<
  string,
  {
    label: string;
    variant: "violet" | "indigo" | "blue" | "green" | "amber" | "gray";
    icon: React.ReactNode;
  }
> = {
  superadmin: {
    label: "Super Admin",
    variant: "violet",
    icon: <Shield className="w-3 h-3" />,
  },
  admin: {
    label: "Admin",
    variant: "indigo",
    icon: <Shield className="w-3 h-3" />,
  },
  doctor: {
    label: "Doctor",
    variant: "blue",
    icon: <Stethoscope className="w-3 h-3" />,
  },
  receptionist: {
    label: "Receptionist",
    variant: "green",
    icon: <User className="w-3 h-3" />,
  },
  assistant: {
    label: "Assistant",
    variant: "amber",
    icon: <User className="w-3 h-3" />,
  },
};

const ROLE_FILTERS = [
  { key: "all", label: "All Roles" },
  { key: "doctor", label: "Doctors" },
  { key: "admin", label: "Admin" },
  { key: "receptionist", label: "Reception" },
  { key: "assistant", label: "Assistants" },
];

export function DoctorManagement({
  staffMembers,
  onAddDoctor,
  onEditDoctor,
  onDeleteDoctor,
  onUpdateStaff,
  onManageSchedule,
  onPaySalary,
  onViewSalaryHistory,
}: DoctorManagementProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const filtered = staffMembers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.specialization || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || s.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? s.isActive : !s.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 220;
    const windowHeight = window.innerHeight;

    let top = rect.bottom + 4;
    if (rect.bottom + menuHeight > windowHeight) {
      top = rect.top - menuHeight;
      if (top < 0) top = 10;
    }

    setMenuPos({ top, left: rect.right - 184 });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const renderStaffMenu = (staff: UserType) => (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setOpenMenuId(null)}
      />
      <div
        className="fixed z-[9999] bg-card rounded-2xl border border-border shadow-2xl w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5"
        style={{ top: menuPos.top, left: menuPos.left }}
      >
        <button
          onClick={() => {
            onUpdateStaff({ ...staff, isActive: !staff.isActive });
            setOpenMenuId(null);
          }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-xl flex items-center gap-2.5 text-muted-foreground font-medium transition-colors"
        >
          {staff.isActive ? (
            <>
              <UserX className="w-4 h-4 text-red-500" /> Deactivate
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-emerald-500" /> Activate
            </>
          )}
        </button>
        <button
          onClick={() => {
            onManageSchedule(staff.id, staff.name);
            setOpenMenuId(null);
          }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-xl flex items-center gap-2.5 text-muted-foreground font-medium transition-colors"
        >
          <Calendar className="w-4 h-4 text-blue-500" /> Manage Schedule
        </button>
        {onPaySalary && (
          <button
            onClick={() => {
              onPaySalary(staff.id, staff.name);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 rounded-xl flex items-center gap-2.5 text-emerald-700 font-medium transition-colors"
          >
            <IndianRupee className="w-4 h-4" /> Pay Salary
          </button>
        )}
        {onViewSalaryHistory && (
          <button
            onClick={() => {
              onViewSalaryHistory(staff.id, staff.name);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-xl flex items-center gap-2.5 text-muted-foreground font-medium transition-colors"
          >
            <IndianRupee className="w-4 h-4 text-amber-500" /> Salary History
          </button>
        )}
        <div className="h-px bg-muted my-1 mx-2" />
        <button
          onClick={() => {
            onDeleteDoctor(staff.id);
            setOpenMenuId(null);
          }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 text-destructive font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Remove
        </button>
      </div>
    </>
  );

  const columns = [
    {
      key: "member",
      header: "Staff Member",
      render: (staff: UserType) => (
        <div className="flex items-center gap-3">
          {staff.avatar ? (
            <img
              src={staff.avatar}
              alt={staff.name}
              className="w-10 h-10 rounded-2xl object-cover flex-shrink-0 border border-border shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs flex-shrink-0 border border-primary/5">
              {getInitials(staff.name)}
            </div>
          )}
          <div>
            <div className="font-bold text-foreground text-sm">
              {staff.name}
            </div>
            {staff.specialization && (
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {staff.specialization}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (staff: UserType) => {
        const rm = ROLE_META[staff.role] || ROLE_META.assistant;
        return (
          <Badge
            variant={rm.variant}
            className="gap-1.5 uppercase font-bold text-[10px]"
          >
            {rm.icon}
            {rm.label}
          </Badge>
        );
      },
    },
    {
      key: "contact",
      header: "Contact Info",
      render: (staff: UserType) => (
        <div className="space-y-1">
          <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> {staff.email}
          </div>
          {staff.phone && (
            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> {staff.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "salary",
      header: "Financials",
      render: (staff: any) => (
        <div className="text-[11px] font-bold">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground/60 font-medium">Paid:</span>
            <span className="text-emerald-600">₹{staff.salaryPaid || "0"}</span>
          </div>
          <div className="flex justify-between gap-4 mt-0.5">
            <span className="text-muted-foreground/60 font-medium">Due:</span>
            <span className="text-amber-600">
              ₹{staff.salaryPending || "0"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (staff: UserType) => (
        <Badge
          variant={staff.isActive ? "green" : "gray"}
          className="font-bold text-[10px]"
        >
          {staff.isActive ? "ACTIVE" : "INACTIVE"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center" as const,
      render: (staff: UserType) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => onEditDoctor(staff.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground/60"
              onClick={(e) => openMenu(e, staff.id)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {openMenuId === staff.id &&
              createPortal(renderStaffMenu(staff), document.body)}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Directory"
        subtitle={`${staffMembers.length} team members recorded`}
        action={
          <Button onClick={onAddDoctor} className="gap-2">
            <Plus className="w-4 h-4" /> Add New Staff
          </Button>
        }
      />

      <div className="flex flex-col xl:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or role…"
          className="flex-1 w-full"
        />
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <FilterTabs
            tabs={ROLE_FILTERS}
            active={roleFilter}
            onChange={setRoleFilter}
          />
          <div className="h-8 w-px bg-muted hidden md:block" />
          <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(s) => s.id}
          emptyTitle="No staff members found"
          emptyIcon={<User className="w-12 h-12 text-muted-foreground/30" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filtered.length === 0 ? (
            <div className="col-span-full py-20 bg-card rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
                No staff found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            filtered.map((staff) => {
              const rm = ROLE_META[staff.role] || ROLE_META.assistant;
              return (
                <Card
                  key={staff.id}
                  className="group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      {staff.avatar ? (
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                          {getInitials(staff.name)}
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onEditDoctor(staff.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground/60"
                            onClick={(e) => openMenu(e, staff.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                          {openMenuId === staff.id &&
                            createPortal(renderStaffMenu(staff), document.body)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {staff.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={rm.variant}
                          className="text-[9px] font-black uppercase px-1.5 h-4"
                        >
                          {rm.label}
                        </Badge>
                        {!staff.isActive && (
                          <Badge
                            variant="gray"
                            className="text-[9px] font-black uppercase px-1.5 h-4"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium truncate">
                        <Mail className="w-3 h-3 flex-shrink-0 text-blue-400" />{" "}
                        {staff.email}
                      </div>
                      {staff.phone && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          <Phone className="w-3 h-3 flex-shrink-0 text-emerald-400" />{" "}
                          {staff.phone}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted rounded-xl">
                        <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                          Salary Due
                        </p>
                        <p className="text-xs font-black text-amber-600 mt-0.5">
                          ₹{(staff as any).salaryPending || "0"}
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-50/50 rounded-xl">
                        <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                          Total Paid
                        </p>
                        <p className="text-xs font-black text-emerald-600 mt-0.5">
                          ₹{(staff as any).salaryPaid || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
