import React from 'react';
import { User, UserCheck, UserX, Download, QrCode, Phone, Mail, MapPin, AlertTriangle, Building2, Edit, Trash2, Calendar, CreditCard, Eye, UserPlus, PowerOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'new';
  avatar?: string;
  address?: string;
  category?: string;
  medicalHistory?: string[];
  allergies?: string[];
  totalVisits?: number;
  outstandingBalance?: number;
  lastVisit?: string;
  dateOfBirth?: string;
  gender?: string;
  barcode?: string;
  corporatePlanName?: string;
  registeredDate?: string;
}

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
  onToggleCategory
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="w-3 h-3" />;
      case 'inactive': return <UserX className="w-3 h-3" />;
      case 'new': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'new': return 'blue';
      default: return 'gray';
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
    <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
                {patient.avatar ? (
                  <img src={patient.avatar} alt={patient.name} className="w-16 h-16 object-cover" />
                ) : (
                  <User className="w-8 h-8 text-blue-500" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 leading-none">{patient.name.toLowerCase()}</h3>
                {patient.category && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px] font-bold px-1.5 py-0">
                    {patient.category.toUpperCase()}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-tight">{patient.id}</p>
              <Badge variant={getStatusVariant(patient.status)} className="mt-2 text-[10px] font-bold px-3">
                <span className="flex items-center gap-1">
                  {getStatusIcon(patient.status)}
                  {patient.status.toUpperCase()}
                </span>
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={() => onExport(patient.id)}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => onPrintBarcode(patient)}>
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="font-medium truncate">{patient.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="font-medium truncate">{patient.address || 'N/A'}</span>
          </div>
        </div>

        {/* Medical Alerts */}
        <div className="mb-6 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-900">Medical Alerts</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-orange-800">
              <span className="font-bold">Allergies:</span> {patient.allergies?.join(', ') || 'None'}
            </p>
            <p className="text-xs font-medium text-orange-800">
              <span className="font-bold">Conditions:</span> {patient.medicalHistory?.join(', ') || 'None'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-blue-600 leading-none mb-1">{patient.totalVisits || 0}</p>
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Visits</p>
          </div>
          <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-emerald-600 leading-none mb-1">{age}</p>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Age</p>
          </div>
          <div className="bg-purple-50/30 border border-purple-100 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-purple-600 leading-none mb-1">₹{(patient.outstandingBalance || 0).toLocaleString()}</p>
            <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Balance</p>
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-blue-50/20 border border-blue-50 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700">
              <UserPlus className="w-4 h-4" />
              <span className="text-xs font-semibold">Registered period</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{patient.registeredDate || '1/5/2026'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold">Last Visit</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{patient.lastVisit || 'No visits yet'}</span>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-6" />

        {/* Action Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" className="h-9 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs gap-2" onClick={() => onView(patient.id)}>
              <Eye className="w-4 h-4" /> View
            </Button>
            <Button variant="ghost" className="h-9 px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs gap-2" onClick={() => onEdit(patient.id)}>
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button variant="ghost" className="h-9 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs gap-2" onClick={() => onToggleCategory(patient.id, patient.category || 'regular')}>
              <UserPlus className="w-4 h-4" /> Person
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 bg-purple-50 text-purple-600 hover:bg-purple-100" onClick={() => onExport(patient.id)}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => onDelete(patient.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button variant="ghost" className="w-full mt-2 h-9 bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold text-xs gap-2" onClick={() => onToggleStatus(patient.id, patient.status)}>
          <PowerOff className="w-4 h-4" /> Deactivate
        </Button>
      </CardContent>
    </Card>
  );
};
