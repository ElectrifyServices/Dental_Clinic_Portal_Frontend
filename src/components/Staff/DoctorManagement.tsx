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
  Loading,
  Pagination,
} from "@/components/ui";
import { useSidebar } from "../../contexts/SidebarContext";

interface DoctorManagementProps {
  staffMembers: UserType[];
  onAddDoctor: () => void;
  onEditDoctor: (id: string) => void;
  onDeleteDoctor: (id: string) => void;
  onUpdateStaff: (staff: any) => void;
  onManageSchedule: (id: string, name: string) => void;
  onPaySalary?: (id: string, name: string) => void;
  onViewSalaryHistory?: (id: string, name: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  roleFilter?: string;
  onRoleFilterChange?: (val: string) => void;
  isLoading?: boolean;
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
    label: "STAFF",
    variant: "amber",
    icon: <User className="w-3 h-3" />,
  },
};

const ROLE_FILTERS = [
  { key: "all", label: "All Roles" },
  { key: "doctor", label: "Doctors" },
  { key: "receptionist", label: "Receptionist" },
  { key: "staff", label: "STAFF" }, 
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
  search: propSearch,
  onSearchChange: propOnSearchChange,
  roleFilter: propRoleFilter,
  onRoleFilterChange: propOnRoleFilterChange,
  isLoading,
}: DoctorManagementProps) {
  const { collapsed } = useSidebar();
  const [localSearch, setLocalSearch] = useState("");
  const [localRoleFilter, setLocalRoleFilter] = useState("all");

  const search = propSearch !== undefined ? propSearch : localSearch;
  const setSearch = propOnSearchChange || setLocalSearch;
  const roleFilter = propRoleFilter !== undefined ? propRoleFilter : localRoleFilter;
  const setRoleFilter = propOnRoleFilterChange || setLocalRoleFilter;

  const [statusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const filtered = (staffMembers || []).filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      (s.specialization || "").toLowerCase().includes(q);
    const isDoctor = s.role === "doctor" || s.originalRoleName?.toLowerCase()?.includes("doctor");
    const matchRole = roleFilter === "all" || 
                      (roleFilter === "doctor" && isDoctor) ||
                      (roleFilter !== "doctor" && s.role === roleFilter);
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
        <Button
          variant="ghost"
          onClick={() => {
            onUpdateStaff({ ...staff, isActive: !staff.isActive });
            setOpenMenuId(null);
          }}
          className="w-full justify-start px-3 py-2 text-sm hover:bg-muted rounded-xl flex items-center gap-2.5 text-muted-foreground font-medium transition-colors"
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
        </Button>
        {(staff.role?.toLowerCase() === "doctor" || staff.originalRoleName?.toLowerCase().includes("doctor")) && (
          <Button
            variant="ghost"
            onClick={() => {
              onManageSchedule(staff.id, staff.name);
              setOpenMenuId(null);
            }}
            className="w-full justify-start px-3 py-2 text-sm hover:bg-muted rounded-xl flex items-center gap-2.5 text-muted-foreground font-medium transition-colors"
          >
            <Calendar className="w-4 h-4 text-blue-500" /> Manage Schedule
          </Button>
        )}
        {onPaySalary && (
          <Button
            variant="ghost"
            onClick={() => {
              onPaySalary(staff.id, staff.name);
              setOpenMenuId(null);
            }}
            className="w-full justify-start px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-2.5 text-emerald-600 font-medium transition-colors dark:hover:bg-emerald-950/20"
          >
            <IndianRupee className="w-4 h-4" /> Pay Salary
          </Button>
        )}
        {onViewSalaryHistory && (
          <Button
            variant="ghost"
            onClick={() => {
              onViewSalaryHistory(staff.id, staff.name);
              setOpenMenuId(null);
            }}
            className="w-full justify-start px-3 py-2 text-sm hover:bg-muted rounded-xl flex items-center gap-2.5 text-muted-foreground font-medium transition-colors"
          >
            <IndianRupee className="w-4 h-4 text-amber-500" /> Salary History
          </Button>
        )}
        <div className="h-px bg-muted my-1 mx-2" />
        <Button
          variant="ghost"
          onClick={() => {
            onDeleteDoctor(staff.id);
            setOpenMenuId(null);
          }}
          className="w-full justify-start px-3 py-2 text-sm hover:bg-destructive/10 hover:text-destructive rounded-xl flex items-center gap-2.5 text-destructive font-medium transition-colors dark:hover:bg-destructive/20"
        >
          <Trash2 className="w-4 h-4" /> Remove
        </Button>
      </div>
    </>
  );

  const columns = [
    {
      key: "member",
      header: "Staff Member",
      render: (staff: UserType) => (
        <div className="flex items-center gap-3">
          {staff.avatar && !imgErrors[staff.id] ? (
            <img
              src={staff.avatar}
              alt={staff.name}
              onError={() => setImgErrors(prev => ({ ...prev, [staff.id]: true }))}
              className="w-10 h-10 rounded-2xl object-cover flex-shrink-0 border border-border shadow-sm bg-muted/20"
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
        const isDoctor = staff.role?.toLowerCase() === "doctor" || staff.originalRoleName?.toLowerCase()?.includes("doctor");
        const rm = isDoctor ? ROLE_META.doctor : (ROLE_META[staff.role] || ROLE_META.assistant);
        const rawLabel = (staff as any).originalRoleName || rm.label;
        const displayLabel = rawLabel.replace(/_/g, ' ');
        return (
          <Badge
            variant={rm.variant}
            className="gap-1.5 uppercase font-bold text-[10px]"
          >
            {rm.icon}
            {displayLabel}
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
              <Phone className="w-3 h-3" /> {staff.phone.startsWith("+") ? staff.phone : `${(staff as any).country_code || "+91"} ${staff.phone}`}
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
          <div className="flex justify-between gap-4 mb-0.5">
            <span className="text-muted-foreground/60 font-medium">Monthly:</span>
            <span className="text-foreground">₹{(staff as any).monthlySalary?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex justify-between gap-4 mb-0.5">
            <span className="text-muted-foreground/60 font-medium">Paid:</span>
            <span className="text-emerald-600">₹{(staff as any).salaryPaid?.toLocaleString() || "0"}</span>
          </div>
          {/* <div className="flex justify-between gap-4">
            <span className="text-muted-foreground/60 font-medium">Due:</span>
            <span className="text-amber-600">
              ₹{(staff as any).salaryPending?.toLocaleString() || "0"}
            </span>
          </div> */}
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
            size="icon-sm"
            className="text-primary hover:bg-primary/10 hover:text-primary transition-all"
            onClick={() => onEditDoctor(staff.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginationUI = totalPages > 1 ? (
    <div className="py-4 px-6 border-t border-border/50 bg-muted/20 mt-4 rounded-xl">
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        perPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff Directory"
        subtitle={`Manage ${filtered.length} team members`}
        action={
          <Button onClick={onAddDoctor} className="gap-2">
            <Plus className="w-4 h-4" /> Add Staff Member
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-3 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or role…"
          className="flex-1 w-full"
        />
        <div className="flex flex-row items-center justify-between gap-4 w-full lg:w-auto overflow-hidden">
          <div className="overflow-x-auto scrollbar-none flex-1">
            <FilterTabs
              tabs={ROLE_FILTERS}
              active={roleFilter}
              onChange={setRoleFilter}
            />
          </div>
          <div className="flex items-center bg-muted p-1 rounded-xl border border-border shrink-0">
            <Button
              variant="ghost"
              onClick={() => setViewMode("grid")}
              className={`h-7 w-7 p-0 rounded-lg transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-primary hover:bg-card hover:text-primary" : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted-foreground/10"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setViewMode("list")}
              className={`h-7 w-7 p-0 rounded-lg transition-all ${viewMode === "list" ? "bg-card shadow-sm text-primary hover:bg-card hover:text-primary" : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted-foreground/10"}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card className="flex flex-col items-center justify-center py-24 rounded-2xl">
          <Loading type="spinner" text="Fetching staff directory..." />
        </Card>
      ) : viewMode === "list" ? (
        <DataTable
          columns={columns}
          data={paginatedData}
          rowKey={(s) => s.id}
          emptyTitle="No staff members found"
          emptyIcon={<User className="w-12 h-12 text-muted-foreground/30" />}
          footer={paginationUI || undefined}
        />
      ) : (
        <>
          <div className={
            collapsed
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
              : "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          }>
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
            paginatedData.map((staff) => {
              const isDoctor = staff.role?.toLowerCase() === "doctor" || staff.originalRoleName?.toLowerCase()?.includes("doctor");
              const rm = isDoctor ? ROLE_META.doctor : (ROLE_META[staff.role] || ROLE_META.assistant);
              return (
                <Card
                  key={staff.id}
                  className="group relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm"
                >
                  {/* Subtle top gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div className="relative">
                        {staff.avatar && !imgErrors[staff.id] ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            onError={() => setImgErrors(prev => ({ ...prev, [staff.id]: true }))}
                            className="w-16 h-16 rounded-2xl object-cover border-4 border-card shadow-sm group-hover:scale-105 transition-transform duration-300 bg-muted/20"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-xl border-4 border-card shadow-sm group-hover:scale-105 transition-transform duration-300">
                            {getInitials(staff.name)}
                          </div>
                        )}
                        {/* Status dot on avatar */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${staff.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                          title={staff.isActive ? "Active" : "Inactive"}
                        />
                      </div>

                      <div className="flex gap-1 bg-muted/30 rounded-xl p-1 border border-border/50">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          onClick={() => onEditDoctor(staff.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            onClick={(e) => openMenu(e, staff.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                          {openMenuId === staff.id &&
                            createPortal(renderStaffMenu(staff), document.body)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {staff.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={rm.variant}
                          className="text-[10px] font-black uppercase px-2 py-0.5 shadow-sm"
                        >
                          {((staff as any).originalRoleName || rm.label).replace(/_/g, ' ')}
                        </Badge>
                        <Badge
                          variant={staff.isActive ? "green" : "gray"}
                          className="text-[10px] font-black uppercase px-2 py-0.5 shadow-sm"
                        >
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {staff.specialization && (
                        <p className="text-xs font-bold text-primary/80 uppercase tracking-wider mt-1">
                          {staff.specialization}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 space-y-3 border-t border-border/50 pt-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium truncate group-hover:text-foreground/80 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-blue-500/20">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span className="truncate">{staff.email}</span>
                      </div>
                      {staff.phone && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium group-hover:text-foreground/80 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-emerald-500/20">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <span>{staff.phone.startsWith("+") ? staff.phone : `${(staff as any).country_code || "+91"} ${staff.phone}`}</span>
                        </div>
                      )}
                      {(staff as any).experience && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium group-hover:text-foreground/80 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-amber-500/20">
                            <Stethoscope className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <span>{(staff as any).experience} Years Exp.</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="p-2 bg-muted/20 rounded-xl border border-border/50 group-hover:bg-muted/40 transition-colors">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                          Monthly
                        </p>
                        <p className="text-xs font-black text-foreground truncate" title={(staff as any).monthlySalary?.toLocaleString()}>
                          ₹{(staff as any).monthlySalary?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-50/30 rounded-xl border border-emerald-100/50 group-hover:bg-emerald-50 transition-colors">
                        <p className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-wider mb-1">
                          Paid
                        </p>
                        <p className="text-xs font-black text-emerald-600 truncate" title={(staff as any).salaryPaid?.toLocaleString()}>
                          ₹{(staff as any).salaryPaid?.toLocaleString() || "0"}
                        </p>
                      </div>
                      {/* <div className="p-2 bg-amber-50/30 rounded-xl border border-amber-100/50 group-hover:bg-amber-50 transition-colors">
                        <p className="text-[9px] text-amber-600/70 font-bold uppercase tracking-wider mb-1">
                          Due
                        </p>
                        <p className="text-xs font-black text-amber-600 truncate" title={(staff as any).salaryPending?.toLocaleString()}>
                          ₹{(staff as any).salaryPending?.toLocaleString() || "0"}
                        </p>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        {paginationUI}
        </>
      )}
    </div>
  );
}
