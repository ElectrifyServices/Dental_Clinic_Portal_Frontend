import React from "react";
import {
  User,
  UserCheck,
  UserX,
  Download,
  QrCode,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Edit,
  Trash2,
  Calendar,
  Eye,
  UserPlus,
  PowerOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Patient } from "@/types";

interface PatientCardProps {
  patient: Patient;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onPrintBarcode: (patient: Patient) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onToggleCategory: (id: string, currentCategory: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onView,
  onEdit,
  onDelete,
  onExport,
  onPrintBarcode,
  onToggleStatus,
  onToggleCategory,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="w-3 h-3" />;
      case "inactive":
        return <UserX className="w-3 h-3" />;
      case "new":
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "gray";
      case "new":
        return "blue";
      default:
        return "gray";
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category?.toLowerCase()) {
      case "vip":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "corporate":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "family":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
      case "staff":
      case "clinic_staff":
        return "bg-indigo-100 text-indigo-700 hover:bg-indigo-100";
      case "complimentary":
        return "bg-pink-100 text-pink-700 hover:bg-pink-100";
      default:
        return "bg-amber-50 text-amber-600 hover:bg-amber-50";
    }
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const age = calculateAge(patient.dateOfBirth);

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-fit">
      <CardContent className="p-4 sm:p-5">
        {/* Header Section - More compact */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
          <div className="flex gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
                {patient.avatar ? (
                  <img
                    src={patient.avatar}
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
                  {(patient.name || "Unknown").toLowerCase()}
                </h3>
                {patient.category && (
                  <Badge className={`border-none text-[9px] font-black px-1.5 py-0 whitespace-nowrap ${getCategoryStyles(patient.category)}`}>
                    {patient.category.toUpperCase()}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-bold mt-0.5 uppercase tracking-tight truncate">
                {patient.id}
              </p>
              <Badge
                variant={getStatusVariant(patient.status || "active")}
                className="mt-1.5 text-[9px] font-black px-2 py-0"
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(patient.status || "active")}
                  {(patient.status || "active").toUpperCase()}
                </span>
              </Badge>
            </div>
          </div>
          <div className="flex sm:flex-col gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              onClick={() => onExport(patient.id)}
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-primary/10 text-primary hover:bg-primary/10"
              onClick={() => onPrintBarcode(patient)}
            >
              <QrCode className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Contact Info - Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground min-w-0">
            <Phone className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="font-bold truncate">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground min-w-0">
            <Mail className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="font-bold truncate">{patient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground min-w-0 sm:col-span-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="font-bold truncate">
              {patient.address || "N/A"}
            </span>
          </div>
        </div>

        {/* Medical Alerts - Slimmed down */}
        <div className="mb-4 p-2.5 bg-orange-50/50 border border-orange-100 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-[10px] font-black text-orange-900 uppercase">
              Medical Alerts
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-orange-800 leading-tight">
              <span className="font-black">ALLERGIES:</span>{" "}
              {patient.allergyNames?.join(", ") || patient.allergies?.join(", ") || "None"}
            </p>
            <p className="text-[10px] font-medium text-orange-800 leading-tight">
              <span className="font-black">CONDITIONS:</span>{" "}
              {patient.medicalHistoryNames?.join(", ") || patient.medicalHistory?.join(", ") || "None"}
            </p>
          </div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-primary/30 border border-primary/10 rounded-xl p-2 text-center">
            <p className="text-sm sm:text-base font-black text-primary leading-none mb-0.5">
              {patient.totalVisits || 0}
            </p>
            <p className="text-[8px] font-black text-primary uppercase tracking-wider">
              Visits
            </p>
          </div>
          <div className="bg-emerald-50/30 border border-emerald-50 rounded-xl p-2 text-center">
            <p className="text-sm sm:text-base font-black text-emerald-600 leading-none mb-0.5">
              {age}
            </p>
            <p className="text-[8px] font-black text-emerald-800 uppercase tracking-wider">
              Age
            </p>
          </div>
          <div className="bg-purple-50/30 border border-purple-50 rounded-xl p-2 text-center">
            <p className="text-sm sm:text-base font-black text-purple-600 leading-none mb-0.5">
              ₹{(patient.outstandingBalance || 0).toLocaleString()}
            </p>
            <p className="text-[8px] font-black text-purple-800 uppercase tracking-wider">
              Balance
            </p>
          </div>
        </div>

        {/* Timeline Rows - Slimmer */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between p-2 bg-primary/10 border border-primary/10 rounded-lg">
            <div className="flex items-center gap-1.5 text-primary">
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Registered</span>
            </div>
            <span className="text-[10px] font-black text-foreground">
              {patient.registeredDate || "1/5/2026"}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted/50 border border-border rounded-lg">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Last Visit</span>
            </div>
            <span className="text-[10px] font-black text-foreground truncate ml-2 text-right">
              {patient.lastVisit || "No visits yet"}
            </span>
          </div>
        </div>

        <div className="h-px bg-muted mb-4" />

        {/* Action Footer - Responsive Wrapping */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 grow">
            <Button
              variant="ghost"
              className="h-8 px-2.5 bg-primary/10 text-primary hover:bg-primary/10 font-black text-[10px] gap-1.5"
              onClick={() => onView(patient.id)}
            >
              <Eye className="w-3.5 h-3.5" /> VIEW
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-black text-[10px] gap-1.5"
              onClick={() => onEdit(patient.id)}
            >
              <Edit className="w-3.5 h-3.5" /> EDIT
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black text-[10px] gap-1.5"
              onClick={() =>
                onToggleCategory(patient.id, patient.category || "regular")
              }
            >
              <UserPlus className="w-3.5 h-3.5" /> PERSON
            </Button>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(patient.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          className={`w-full mt-2 h-8 font-black text-[10px] gap-1.5 ${
                patient.status === "inactive"
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100"
              }`}
              onClick={() => onToggleStatus(patient.id, patient.status)}
            >
              {patient.status === "inactive" ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" /> ACTIVATE
                </>
              ) : (
                <>
                  <PowerOff className="w-3.5 h-3.5" /> DEACTIVATE
                </>
              )}
            </Button>
      </CardContent>
    </Card>
  );
};
