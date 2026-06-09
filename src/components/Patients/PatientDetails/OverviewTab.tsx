import React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  MapPin,
  Activity,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui";

interface OverviewTabProps {
  patient: any;
  patientAppointments: any[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  patient,
  patientAppointments,
}) => {
  const formatLastVisitDate = (visitVal?: string | number | Date) => {
    if (!visitVal) return "No visits yet";
    try {
      const d = new Date(visitVal);
      return !isNaN(d.getTime())
        ? d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : String(visitVal);
    } catch (e) {
      return String(visitVal);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Personal Information */}
      <div className="xl:col-span-2 bg-primary/10 rounded-xl p-5 border border-primary/20">
        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-muted-foreground/60 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground break-all leading-tight">
                {patient.email}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-muted-foreground/60 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{patient.phone}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-muted-foreground/60 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium text-foreground">
                {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <User className="w-5 h-5 text-muted-foreground/60 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium text-foreground capitalize">
                {patient.gender}
              </p>
            </div>
          </div>
          {patient.bloodGroup && (
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-muted-foreground/60 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium text-destructive">
                  {patient.bloodGroup}
                </p>
              </div>
            </div>
          )}
          {patient.occupation && (
            <div className="flex items-center">
              <User className="w-5 h-5 text-muted-foreground/60 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Occupation</p>
                <p className="font-medium text-foreground">
                  {patient.occupation}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-muted-foreground/60 mr-3 mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium text-foreground">{patient.address}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-muted-foreground/60 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Emergency Contact</p>
              <p className="font-medium text-foreground">
                {patient.emergencyContact}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <Card className="rounded-2xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Patient Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary mr-3" />
                <span className="text-sm text-muted-foreground">
                  Total Visits
                </span>
              </div>
              <span className="text-xl font-bold text-primary">
                {patient.total_visits ?? patient.totalVisits ?? patientAppointments.filter((a) => a.status === "completed").length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
              <div className="flex items-center">
                <UserPlus className="w-5 h-5 text-primary mr-3" />
                <span className="text-sm text-muted-foreground">
                  Registered on
                </span>
              </div>
              <span className="text-sm font-bold text-primary">
                {patient.created_at || patient.createdAt
                  ? new Date(patient.created_at || patient.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "New Registration"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary mr-3" />
                <span className="text-sm text-muted-foreground">
                  Last Visit
                </span>
              </div>
              <span className="text-sm font-bold text-primary">
                {formatLastVisitDate(patient.last_visit_date || patient.lastVisit)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
