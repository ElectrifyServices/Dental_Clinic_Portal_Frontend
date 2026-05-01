import React from "react";
import { User, Mail, Phone, Calendar, Heart, MapPin, Activity, UserPlus, TrendingUp } from "lucide-react";

interface OverviewTabProps {
  patient: any;
  patientAppointments: any[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ patient, patientAppointments }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Personal Information */}
      <div className="xl:col-span-2 bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900 break-all leading-tight">
                {patient.email}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">
                {patient.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium text-gray-900">
                {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <User className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium text-gray-900 capitalize">
                {patient.gender}
              </p>
            </div>
          </div>
          {patient.bloodGroup && (
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-medium text-red-600">
                  {patient.bloodGroup}
                </p>
              </div>
            </div>
          )}
          {patient.occupation && (
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Occupation</p>
                <p className="font-medium text-gray-900">
                  {patient.occupation}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium text-gray-900">
                {patient.address}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Emergency Contact</p>
              <p className="font-medium text-gray-900">
                {patient.emergencyContact}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Patient Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">Total Visits</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {patientAppointments.filter((a) => a.status === "completed").length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center">
                <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">Registered on</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'New Registration'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
