import React, { useState, useMemo } from 'react';
import { Search, Plus, User, Phone, Mail, Edit, Trash2, UserCheck, UserX, Stethoscope, Calendar, Shield, Clock, MapPin, IndianRupee } from 'lucide-react';
import { User as UserType } from '../../types';

// Staff data is now managed centrally via staffMembers prop

interface DoctorManagementProps {
  staffMembers: UserType[];
  onAddDoctor: () => void;
  onEditDoctor: (doctorId: string) => void;
  onDeleteDoctor: (doctorId: string) => void;
  onUpdateStaff: (staff: any) => void;
  onManageSchedule: (doctorId: string, doctorName: string) => void;
  onPaySalary?: (staffId: string, staffName: string) => void;
  onViewSalaryHistory?: (staffId: string, staffName: string) => void;
}

export function DoctorManagement({ 
  staffMembers, 
  onAddDoctor, 
  onEditDoctor, 
  onDeleteDoctor, 
  onUpdateStaff, 
  onManageSchedule,
  onPaySalary,
  onViewSalaryHistory
}: DoctorManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      case 'doctor': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'receptionist': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'assistant': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'doctor': return Stethoscope;
      case 'receptionist': return User;
      case 'assistant': return User;
      default: return User;
    }
  };

  const getWorkingDays = (workingHours: any) => {
    if (!workingHours) return 'Not set';
    const workingDays = Object.entries(workingHours)
      .filter(([_, schedule]: [string, any]) => schedule.isWorking)
      .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
      .join(', ');
    return workingDays || 'No working days';
  };

  const getWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Not set';
    const firstWorkingDay = Object.values(workingHours).find((schedule: any) => schedule.isWorking) as any;
    if (!firstWorkingDay) return 'Not set';
    return `${firstWorkingDay.startTime} - ${firstWorkingDay.endTime}`;
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (staff.specialization && staff.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && staff.isActive) ||
                         (filterStatus === 'inactive' && !staff.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleStatus = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (staff) {
      onUpdateStaff({ ...staff, isActive: !staff.isActive });
    }
  };

  const handleDelete = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (window.confirm(`Are you sure you want to delete ${staff?.name}? This action cannot be undone.`)) {
      onDeleteDoctor(staffId);
    }
  };

  const activeStaffCount = staffMembers.filter(s => s.isActive).length;
  const doctorCount = staffMembers.filter(s => s.role === 'doctor' || s.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h2>
            <p className="text-gray-600">Manage doctors, assistants, and clinic staff</p>
            <div className="flex items-center space-x-6 mt-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">{activeStaffCount} Active Staff</span>
              </div>
              <div className="flex items-center">
                <Stethoscope className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-gray-700">{doctorCount} Medical Professionals</span>
              </div>
            </div>
          </div>
          <button
            onClick={onAddDoctor}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </button>
        </div>
      </div>
{/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your search criteria or filters.'
              : 'Start by adding doctors and staff to your clinic.'
            }
          </p>
          <button
            onClick={onAddDoctor}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add First Staff Member
          </button>
        </div>
      )}

      {/* Statistics Footer */}
      {filteredStaff.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredStaff.length}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredStaff.filter(s => s.isActive).length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{filteredStaff.filter(s => s.role === 'doctor' || s.role === 'admin').length}</div>
              <div className="text-sm text-gray-600">Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{filteredStaff.filter(s => s.role === 'receptionist' || s.role === 'assistant').length}</div>
              <div className="text-sm text-gray-600">Support Staff</div>
            </div>
          </div>
        </div>
      )}
      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="assistant">Assistant</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => {
          const RoleIcon = getRoleIcon(staff.role);
          
          return (
            <div key={staff.id} className={`bg-white rounded-2xl border-2 p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              staff.isActive ? 'border-gray-200 hover:border-blue-300' : 'border-gray-300 bg-gray-50'
            }`}>
              {/* Staff Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                      {staff.avatar ? (
                        <img src={staff.avatar} alt={staff.name} className="w-16 h-16 object-cover rounded-2xl" />
                      ) : (
                        <User className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                      staff.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {staff.isActive ? <UserCheck className="w-3 h-3 text-white" /> : <UserX className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900 text-lg">{staff.name}</h3>
                    <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border mt-1 ${getRoleColor(staff.role)}`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {staff.role.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 truncate">{staff.email}</span>
                </div>
                {staff.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{staff.phone}</span>
                  </div>
                )}
                {staff.specialization && (
                  <div className="flex items-center text-sm">
                    <Stethoscope className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{staff.specialization}</span>
                  </div>
                )}
              </div>

              {/* Working Schedule */}
              {staff.workingHours && (
                <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Schedule</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Working Days:</span>
                      <span className="font-medium text-gray-800">{getWorkingDays(staff.workingHours)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Hours:</span>
                      <span className="font-medium text-gray-800">{getWorkingHours(staff.workingHours)}</span>
                    </div>
                    {staff.timeSlots && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Slot Duration:</span>
                        <span className="font-medium text-gray-800">{staff.timeSlots.duration} min</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Salary Section */}
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Salary
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onPaySalary && onPaySalary(staff.id, staff.name)}
                      className="px-2 py-1 text-[10px] font-bold text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors uppercase tracking-wider"
                    >
                      Pay Salary
                    </button>
                    <button 
                      onClick={() => onViewSalaryHistory && onViewSalaryHistory(staff.id, staff.name)}
                      className="px-2 py-1 text-[10px] font-bold text-gray-600 border border-gray-400 rounded-md hover:bg-gray-50 transition-colors uppercase tracking-wider"
                    >
                      History
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Paid</span>
                    <span className="text-sm font-bold text-emerald-600">₹{staff.salaryPaid || '0'}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Pending</span>
                    <span className="text-sm font-bold text-orange-600">₹{staff.salaryPending || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {staff.permissions.slice(0, 3).map((permission, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                      {permission === 'all' ? 'Full Access' : permission}
                    </span>
                  ))}
                  {staff.permissions.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                      +{staff.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className={`text-sm font-semibold flex items-center ${staff.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${staff.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleStatus(staff.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      staff.isActive 
                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                    title={staff.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {staff.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onEditDoctor(staff.id)}
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Edit Staff"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {(staff.role === 'doctor' || staff.role === 'admin') && (
                    <button
                      onClick={() => onManageSchedule(staff.id, staff.name)}
                      className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200"
                      title="Manage Schedule"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(staff.id)}
                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete Staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
}