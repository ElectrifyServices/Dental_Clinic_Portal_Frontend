import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import React, { useState, useRef } from "react";
import {
  Building2,
  Users,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  Download,
  FileText,
  Search,
  X,
  CreditCard,
  Gift,
} from "lucide-react";
import { Modal, Button, ContentCard } from "@/components/ui";
import { useCorporatePlansQuery } from "@/hooks/corporate/useCorporatePlansQuery";
import * as XLSX from "xlsx";

interface CorporatePlan {
  id: string;
  name: string;
  discountPercent: number;
  freeConsultation: boolean;
  creditLimit: number;
  contactPerson: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

interface BulkPatient {
  name: string;
  phone: string;
  email: string;
  gender: string;
  companyId: string;
  emp_id?: string;
  company_name?: string;
  designation?: string;
  department?: string;
  corporate_plan_id?: string;
  date_of_birth?: string;
  eligible_date?: string;
}

interface CorporateManagementProps {
  corporatePlans: CorporatePlan[];
  onSavePlan: (plan: CorporatePlan) => void;
  onDeletePlan: (id: string) => void;
  onBulkAddPatients: (patients: BulkPatient[]) => void;
  corporateEmployees: any[];
  onDeleteEmployee: (name: string, email: string) => void;
  onUpdateEmployee: (
    oldName: string,
    oldEmail: string,
    updatedEmp: any,
  ) => void;
  onClose: () => void;
}

export function CorporateManagement({
  corporatePlans,
  onSavePlan,
  onDeletePlan,
  onBulkAddPatients,
  corporateEmployees,
  onDeleteEmployee,
  onUpdateEmployee,
  onClose,
}: CorporateManagementProps) {
  // Fetch corporate plans when modal is open
  useCorporatePlansQuery({ enabled: true });

  const [activeTab, setActiveTab] = useState<"plans" | "bulk">("plans");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CorporatePlan | null>(null);
  const [viewingEmployeesPlanId, setViewingEmployeesPlanId] = useState<
    string | null
  >(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [tempEmpData, setTempEmpData] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Outside click for search suggestions
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bulk Import State
  const [bulkPatients, setBulkPatients] = useState<BulkPatient[]>([
    { 
      name: "", 
      phone: "", 
      email: "", 
      gender: "male", 
      companyId: "", 
      emp_id: "", 
      company_name: "", 
      designation: "", 
      department: "", 
      corporate_plan_id: "", 
      date_of_birth: "", 
      eligible_date: "" 
    },
  ]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const plan: CorporatePlan = {
      id: editingPlan?.id || `CORP-${Date.now()}`,
      name: formData.get("name") as string,
      discountPercent: parseInt(formData.get("discount") as string),
      freeConsultation: formData.get("freeConsultation") === "on",
      creditLimit: parseInt(formData.get("creditLimit") as string) || 0,
      contactPerson: formData.get("contactPerson") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      status: "active",
    };
    onSavePlan(plan);
    setShowPlanForm(false);
    setEditingPlan(null);
  };

  const handleBulkAddRow = () => {
    setBulkPatients([
      ...bulkPatients,
      {
        name: "",
        phone: "",
        email: "",
        gender: "male",
        companyId: selectedCompanyId,
        emp_id: "",
        company_name: "",
        designation: "",
        department: "",
        corporate_plan_id: selectedCompanyId,
        date_of_birth: "",
        eligible_date: "",
      },
    ]);
  };

  const handleRemoveBulkRow = (index: number) => {
    const updated = [...bulkPatients];
    updated.splice(index, 1);
    setBulkPatients(updated);
  };

  const handleBulkChange = (
    index: number,
    field: keyof BulkPatient,
    value: string,
  ) => {
    const updated = [...bulkPatients];
    updated[index] = { ...updated[index], [field]: value };
    setBulkPatients(updated);
  };

  const checkDuplicate = (emp: BulkPatient) => {
    if (!emp.name || !emp.email) return false;
    const targetCompanyId = emp.companyId || selectedCompanyId;
    return corporateEmployees.some(
      (existing) =>
        existing.name.toLowerCase() === emp.name.toLowerCase() &&
        existing.email?.toLowerCase() === emp.email?.toLowerCase() &&
        existing.companyId === targetCompanyId,
    );
  };

  const fuzzySearch = (text: string, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    if (t.includes(q)) return true;

    // Simple fuzzy: check if characters are present in order
    let i = 0;
    let j = 0;
    while (i < q.length && j < t.length) {
      if (q[i] === t[j]) i++;
      j++;
    }
    return i === q.length;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeSearchQuery && !recentSearches.includes(employeeSearchQuery)) {
      setRecentSearches((prev) => [employeeSearchQuery, ...prev].slice(0, 5));
    }
    setShowSearchSuggestions(false);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      const importedPatients: BulkPatient[] = rows
        .map((row: any) => {
          const getVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => keys.some(key => k.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, '')));
            return foundKey ? String(row[foundKey]).trim() : '';
          };

          const name = getVal(['name', 'fullname', 'username']);
          if (!name) return null;

          return {
            name,
            phone: getVal(['phone', 'phonenumber', 'mobile', 'contact']),
            email: getVal(['email', 'emailaddress']).toLowerCase(),
            gender: getVal(['gender']) || 'male',
            companyId: selectedCompanyId,
            emp_id: getVal(['employeeid', 'empid', 'id']),
            company_name: getVal(['companyname', 'company', 'company_name']),
            designation: getVal(['designation', 'role', 'occupation']),
            department: getVal(['department', 'dept']),
            corporate_plan_id: getVal(['corporateplanid', 'planid', 'corporate_plan_id']) || selectedCompanyId,
            date_of_birth: getVal(['dateofbirth', 'dob', 'date_of_birth']),
            eligible_date: getVal(['eligibledate', 'eligible_date', 'eligibilitydate']),
          };
        })
        .filter((p) => p !== null) as BulkPatient[];

      const newUniqueList = [...bulkPatients.filter((p) => p.name !== "")];
      importedPatients.forEach((imp) => {
        newUniqueList.push(imp);
      });

      setBulkPatients(
        newUniqueList.length > 0
          ? newUniqueList
          : [
              {
                name: "",
                phone: "",
                email: "",
                gender: "male",
                companyId: selectedCompanyId,
                emp_id: "",
                company_name: "",
                designation: "",
                department: "",
                corporate_plan_id: selectedCompanyId,
                date_of_birth: "",
                eligible_date: "",
              },
            ],
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFinalBulkSubmit = () => {
    const validPatients = bulkPatients.filter(
      (p) => p.name && (p.phone || p.email),
    );
    if (validPatients.length === 0) {
      alert("Please enter at least one employee with name and contact info.");
      return;
    }

    const duplicates = validPatients.filter((newEmp) =>
      corporateEmployees.some(
        (existing) =>
          existing.name.toLowerCase() === newEmp.name.toLowerCase() &&
          existing.email?.toLowerCase() === newEmp.email?.toLowerCase(),
      ),
    );

    if (duplicates.length > 0) {
      alert(
          `Duplicate entries detected for: ${duplicates.map((d) => d.name).join(", ")}. These will be skipped.`,
      );
    }

    const uniqueNewPatients = validPatients.filter(
      (newEmp) =>
        !corporateEmployees.some(
          (existing) =>
            existing.name.toLowerCase() === newEmp.name.toLowerCase() &&
            existing.email?.toLowerCase() === newEmp.email?.toLowerCase(),
        ),
    );

    if (uniqueNewPatients.length === 0) {
      alert("All entered employees already exist in the master list.");
      return;
    }

    const finalPatients = uniqueNewPatients.map((p) => ({
      ...p,
      companyId: p.companyId || selectedCompanyId,
      corporate_plan_id: p.corporate_plan_id || p.companyId || selectedCompanyId,
      company_name: p.company_name || corporatePlans.find(cp => cp.id === (p.companyId || selectedCompanyId))?.name || "Corporate",
    }));
    onBulkAddPatients(finalPatients);
    onClose();
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Name,Phone,Email,Gender(male/female),Employee ID,Company Name,Designation,Department,Corporate Plan ID,Date of Birth,Eligible Date\nJohn Doe,9876543210,john@example.com,male,BULK001,Google,Developer,IT,e5e8ae28-d088-4db2-91df-931500725fa5,1995-01-01,2026-06-01\nJane Smith,8765432109,jane@example.com,female,BULK002,Google,Tester,QA,e5e8ae28-d088-4db2-91df-931500725fa5,1996-02-02,2026-06-01";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bulk_patient_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      title="Corporate Management"
      subtitle="Manage company plans and bulk employee registration"
      onClose={onClose}
      size="5xl"
      icon={<Building2 className="w-5 h-5" />}
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <Button
            onClick={() => setActiveTab("plans")}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 relative ${
              activeTab === "plans"
                ? "text-primary border-primary"
                : "text-muted-foreground/60 border-transparent hover:text-muted-foreground"
            }`}
          >
            Corporate Plans
          </Button>
          <Button
            onClick={() => setActiveTab("bulk")}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 relative ${
              activeTab === "bulk"
                ? "text-primary border-primary"
                : "text-muted-foreground/60 border-transparent hover:text-muted-foreground"
            }`}
          >
            Bulk Employee Registration
          </Button>
        </div>

        <div className="min-h-[500px]">
          {activeTab === "plans" ? (
            <div className="space-y-6">
              {!showPlanForm ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-widest">
                      Active Corporate Plans
                    </h3>
                    <Button
                      onClick={() => {
                        setEditingPlan(null);
                        setShowPlanForm(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Plan
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {corporatePlans.map((plan) => (
                      <ContentCard
                        key={plan.id}
                        title={plan.name}
                        subtitle={plan.status.toUpperCase()}
                        icon={<Building2 className="w-5 h-5" />}
                        className="group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
                        action={
                          <div className="flex gap-1">
                            <Button
                              onClick={() => {
                                setEditingPlan(plan);
                                setShowPlanForm(true);
                              }}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => onDeletePlan(plan.id)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        }
                        footer={
                          <Button
                            variant="secondary"
                            onClick={() => setViewingEmployeesPlanId(plan.id)}
                            className="w-full text-primary bg-primary/5 hover:bg-primary hover:text-white border-none shadow-none font-bold uppercase tracking-widest text-[10px]"
                          >
                            View Employee List
                          </Button>
                        }
                      >
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-muted p-2 rounded-xl border border-border">
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                              Discount
                            </p>
                            <p className="text-lg font-black text-primary">
                              {plan.discountPercent}%
                            </p>
                          </div>
                          <div className="bg-muted p-2 rounded-xl border border-border">
                            <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                              Consultation
                            </p>
                            <p className="text-lg font-black text-emerald-600">
                              {plan.freeConsultation ? "FREE" : "Paid"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest gap-4">
                          <span className="flex items-center">
                            <CreditCard className="w-3 h-3 mr-1 text-primary/60" />{" "}
                            ₹{plan.creditLimit.toLocaleString()} Limit
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1 text-primary/60" />
                            {
                              corporateEmployees.filter(
                                (e) => e.companyId === plan.id,
                              ).length
                            }{" "}
                            Registered
                          </span>
                        </div>
                      </ContentCard>
                    ))}
                    {corporatePlans.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-card rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
                          No plans created
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create a new corporate plan to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <ContentCard
                  title={
                    editingPlan ? "Edit Corporate Plan" : "New Corporate Plan"
                  }
                  subtitle="Define discount rules and credit limits"
                  className="max-w-2xl mx-auto"
                  icon={<Building2 className="w-5 h-5" />}
                  action={
                    <Button
                      onClick={() => setShowPlanForm(false)}
                      className="text-muted-foreground/60 hover:text-muted-foreground"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  }
                >
                  <form onSubmit={handleAddPlan} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest">
                          Company Name
                        </Label>
                        <Input
                          name="name"
                          defaultValue={editingPlan?.name}
                          required
                          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                          placeholder="e.g. Google India"
                        />
                      </div>
                      <div>
                        <Label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest">
                          Discount Percent (%)
                        </Label>
                        <Input
                          name="discount"
                          type="number"
                          defaultValue={editingPlan?.discountPercent}
                          required
                          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                          placeholder="e.g. 20"
                        />
                      </div>
                      <div>
                        <Label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest">
                          Credit Limit (₹)
                        </Label>
                        <Input
                          name="creditLimit"
                          type="number"
                          defaultValue={editingPlan?.creditLimit}
                          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
                          placeholder="0 for no credit"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <Input
                          name="freeConsultation"
                          type="checkbox"
                          defaultChecked={editingPlan?.freeConsultation}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                        />
                        <Label className="ml-3 text-xs font-black text-primary uppercase tracking-widest">
                          Enable Free Consultation for all employees
                        </Label>
                        <Gift className="w-5 h-5 ml-auto text-primary/40" />
                      </div>
                    </div>
                    <div className="border-t border-border pt-6">
                      <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-4">
                        Contact Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          name="contactPerson"
                          defaultValue={editingPlan?.contactPerson}
                          placeholder="Contact Person"
                          className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                        <Input
                          name="phone"
                          defaultValue={editingPlan?.phone}
                          placeholder="Phone Number"
                          className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                        <Input
                          name="email"
                          type="email"
                          defaultValue={editingPlan?.email}
                          placeholder="Email Address"
                          className="w-full md:col-span-2 px-4 py-3 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-6">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowPlanForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Save Plan
                      </Button>
                    </div>
                  </form>
                </ContentCard>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl mx-auto">
              <ContentCard
                title="Bulk Employee Upload"
                subtitle="Quickly add multiple employees to a corporate plan"
                icon={<Upload className="w-5 h-5" />}
                action={
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={downloadSampleCsv}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4 text-primary" />
                      Sample CSV
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Upload className="w-4 h-4" />
                      Upload CSV
                    </Button>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCsvUpload}
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                    />
                  </div>
                }
              >
                <div className="mb-6">
                  <Label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-3">
                    Target Corporate Plan
                  </Label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-3 bg-muted border border-border rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  >
                    <option value="">Select Company</option>
                    {corporatePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border border-border rounded-2xl overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-muted text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest border-b border-border">
                      <tr>
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Gender</th>
                        <th className="px-6 py-4">Employee ID</th>
                        <th className="px-6 py-4">Designation</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {bulkPatients.map((p, idx) => {
                        const isDup = checkDuplicate(p);
                        return (
                          <tr
                            key={idx}
                            className={`group transition-colors ${isDup ? "bg-destructive/5" : "hover:bg-muted/50"}`}
                          >
                            <td className="px-6 py-3">
                              <div className="relative">
                                <Input
                                  value={p.name}
                                  onChange={(e) =>
                                    handleBulkChange(
                                      idx,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Name"
                                  className={`w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-primary/50 pb-1 ${isDup ? "text-destructive" : "text-foreground"}`}
                                />
                                {isDup && (
                                  <div className="absolute -top-8 left-0 bg-destructive text-white text-[10px] px-2 py-1 rounded shadow-lg font-black uppercase tracking-widest animate-bounce">
                                    Already Registered!
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <Input
                                value={p.phone}
                                onChange={(e) =>
                                  handleBulkChange(idx, "phone", e.target.value)
                                }
                                placeholder="Phone"
                                className={`w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-primary/50 pb-1 ${isDup ? "text-destructive" : "text-foreground"}`}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <Input
                                value={p.email}
                                onChange={(e) =>
                                  handleBulkChange(idx, "email", e.target.value)
                                }
                                placeholder="Email"
                                className={`w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-primary/50 pb-1 ${isDup ? "text-destructive" : "text-foreground"}`}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <select
                                value={p.gender}
                                onChange={(e) =>
                                  handleBulkChange(
                                    idx,
                                    "gender",
                                    e.target.value,
                                  )
                                }
                                className="bg-transparent text-sm font-bold text-foreground outline-none"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </td>
                            <td className="px-6 py-3">
                              <Input
                                value={p.emp_id || ""}
                                onChange={(e) =>
                                  handleBulkChange(idx, "emp_id", e.target.value)
                                }
                                placeholder="Employee ID"
                                className="w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-primary/50 pb-1 text-foreground"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <Input
                                value={p.designation || ""}
                                onChange={(e) =>
                                  handleBulkChange(idx, "designation", e.target.value)
                                }
                                placeholder="Designation"
                                className="w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-primary/50 pb-1 text-foreground"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <Input
                                value={p.department || ""}
                                onChange={(e) =>
                                  handleBulkChange(idx, "department", e.target.value)
                                }
                                placeholder="Department"
                                className="w-full bg-transparent outline-none text-sm font-bold border-b border-transparent focus:border-primary/50 pb-1 text-foreground"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <Button
                                onClick={() => handleRemoveBulkRow(idx)}
                                className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Button
                  onClick={handleBulkAddRow}
                  className="mt-6 w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Row
                </Button>
              </ContentCard>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleFinalBulkSubmit}
                  disabled={!selectedCompanyId}
                  className="px-8"
                >
                  Confirm & Import Patients
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Employee List View Modal Overlay */}
        {viewingEmployeesPlanId && (
          <div className="absolute inset-0 bg-card z-[60] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setViewingEmployeesPlanId(null)}
                  className="p-2 hover:bg-card rounded-lg transition-all text-primary"
                >
                  <X className="w-6 h-6" />
                </Button>
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                    {
                      corporatePlans.find(
                        (p) => p.id === viewingEmployeesPlanId,
                      )?.name
                    }{" "}
                    Employees
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                    Total{" "}
                    {
                      corporateEmployees.filter(
                        (e) => e.companyId === viewingEmployeesPlanId,
                      ).length
                    }{" "}
                    Employees Registered
                  </p>
                </div>
              </div>
              <div className="relative group" ref={searchRef}>
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    placeholder="Search name, phone, or email..."
                    value={employeeSearchQuery}
                    onChange={(e) => {
                      setEmployeeSearchQuery(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => setShowSearchSuggestions(true)}
                    className="pl-12 pr-6 py-3 bg-card border-2 border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary min-w-[450px] shadow-sm transition-all"
                  />
                </form>

                {showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-2xl border border-border z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {recentSearches.length > 0 && (
                      <div className="p-4 border-b border-border">
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-3">
                          Recent Searches
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((s, i) => (
                            <Button
                              key={i}
                              onClick={() => {
                                setEmployeeSearchQuery(s);
                                setShowSearchSuggestions(false);
                              }}
                              className="px-3 py-1 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              {s}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-3">
                        Quick Suggestions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Male", "Female", "Manager", "@gmail.com", "Dev"].map(
                          (s, i) => (
                            <Button
                              key={i}
                              onClick={() => {
                                setEmployeeSearchQuery(s);
                                setShowSearchSuggestions(false);
                              }}
                              className="px-3 py-1 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              {s}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest border-b border-border">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Gender</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {corporateEmployees
                    .filter((e) => e.companyId === viewingEmployeesPlanId)
                    .filter(
                      (e) =>
                        fuzzySearch(e.name, employeeSearchQuery) ||
                        fuzzySearch(e.email || "", employeeSearchQuery) ||
                        fuzzySearch(e.phone, employeeSearchQuery),
                    )
                    .map((emp, i) => {
                      const isEditing =
                        editingEmployee?.name === emp.name &&
                        editingEmployee?.email === emp.email;

                      return (
                        <tr
                          key={i}
                          className={`hover:bg-muted/50 transition-colors group ${isEditing ? "bg-primary/5" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm font-black shadow-sm ring-4 ring-primary/5 group-hover:scale-110 transition-transform">
                                {emp.name[0].toUpperCase()}
                              </div>
                              {isEditing ? (
                                <Input
                                  value={tempEmpData.name}
                                  onChange={(e) =>
                                    setTempEmpData({
                                      ...tempEmpData,
                                      name: e.target.value,
                                    })
                                  }
                                  className="px-3 py-1 border border-primary/20 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              ) : (
                                <div>
                                  <div className="font-bold text-foreground text-sm">
                                    {emp.name}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">
                                    ID: CORP-{i + 100}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-foreground">
                            {isEditing ? (
                              <Input
                                value={tempEmpData.phone}
                                onChange={(e) =>
                                  setTempEmpData({
                                    ...tempEmpData,
                                    phone: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-1 border border-primary/20 rounded-lg text-xs font-bold outline-none"
                                placeholder="Phone"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                {emp.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isEditing ? (
                              <Input
                                value={tempEmpData.email}
                                onChange={(e) =>
                                  setTempEmpData({
                                    ...tempEmpData,
                                    email: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-1 border border-primary/20 rounded-lg text-xs font-bold outline-none"
                                placeholder="Email"
                              />
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest w-fit border border-primary/10">
                                <FileText className="w-3.5 h-3.5" />
                                {emp.email}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <select
                                value={tempEmpData.gender}
                                onChange={(e) =>
                                  setTempEmpData({
                                    ...tempEmpData,
                                    gender: e.target.value,
                                  })
                                }
                                className="px-3 py-1 border border-primary/20 rounded-lg text-xs font-bold"
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            ) : (
                              <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-black rounded-lg uppercase tracking-widest border border-border">
                                {emp.gender}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    onClick={() => {
                                      onUpdateEmployee(
                                        editingEmployee!.name,
                                        editingEmployee!.email,
                                        tempEmpData,
                                      );
                                      setEditingEmployee(null);
                                    }}
                                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => setEditingEmployee(null)}
                                    className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => {
                                      setEditingEmployee({
                                        name: emp.name,
                                        email: emp.email,
                                      });
                                      setTempEmpData({ ...emp });
                                    }}
                                    className="p-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-all bg-primary/5 border border-primary/10"
                                    title="Edit Employee"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      onDeleteEmployee(emp.name, emp.email)
                                    }
                                    className="p-2 text-destructive hover:bg-destructive hover:text-white rounded-lg transition-all bg-destructive/5 border border-destructive/10"
                                    title="Delete Employee"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {corporateEmployees.filter(
                    (e) => e.companyId === viewingEmployeesPlanId,
                  ).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                          No employees registered yet.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
