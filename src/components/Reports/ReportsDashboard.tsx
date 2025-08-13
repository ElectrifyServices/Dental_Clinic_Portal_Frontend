import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, Filter, Eye } from 'lucide-react';

export function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('earnings');

  const reportTypes = [
    { id: 'earnings', label: 'Earnings Report', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { id: 'patients', label: 'Patient Analytics', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { id: 'appointments', label: 'Appointment Stats', icon: Calendar, color: 'from-purple-500 to-violet-500' },
    { id: 'treatments', label: 'Treatment Analysis', icon: BarChart3, color: 'from-orange-500 to-amber-500' },
  ];

  const earningsData = {
    thisMonth: 125000,
    lastMonth: 98000,
    growth: 27.6,
    dailyAverage: 4167,
    topServices: [
      { service: 'Root Canal', revenue: 45000, count: 9 },
      { service: 'Crown Fitting', revenue: 32000, count: 4 },
      { service: 'Dental Cleaning', revenue: 22500, count: 15 },
      { service: 'Filling', revenue: 16000, count: 8 },
      { service: 'Extraction', revenue: 9500, count: 9 }
    ]
  };

  const patientData = {
    totalPatients: 1234,
    newPatients: 45,
    returningPatients: 89,
    ageGroups: [
      { group: '0-18', count: 156, percentage: 12.6 },
      { group: '19-35', count: 445, percentage: 36.1 },
      { group: '36-50', count: 378, percentage: 30.6 },
      { group: '51-65', count: 189, percentage: 15.3 },
      { group: '65+', count: 66, percentage: 5.4 }
    ]
  };

  const appointmentData = {
    totalAppointments: 234,
    completed: 198,
    cancelled: 18,
    noShow: 18,
    completionRate: 84.6,
    peakHours: [
      { hour: '10:00 AM', count: 28 },
      { hour: '2:00 PM', count: 32 },
      { hour: '4:00 PM', count: 25 },
      { hour: '11:00 AM', count: 22 }
    ]
  };

  const renderEarningsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">This Month</p>
              <p className="text-3xl font-bold">₹{earningsData.thisMonth.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Last Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{earningsData.lastMonth.toLocaleString()}</p>
            </div>
            <div className="text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="font-semibold">+{earningsData.growth}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div>
            <p className="text-gray-600">Daily Average</p>
            <p className="text-2xl font-bold text-gray-900">₹{earningsData.dailyAverage.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div>
            <p className="text-gray-600">Growth Rate</p>
            <p className="text-2xl font-bold text-green-600">+{earningsData.growth}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Revenue Services</h3>
        <div className="space-y-4">
          {earningsData.topServices.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{service.service}</p>
                  <p className="text-sm text-gray-600">{service.count} procedures</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{service.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">₹{(service.revenue / service.count).toLocaleString()} avg</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPatientsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Patients</p>
              <p className="text-3xl font-bold">{patientData.totalPatients}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div>
            <p className="text-gray-600">New Patients</p>
            <p className="text-2xl font-bold text-gray-900">{patientData.newPatients}</p>
            <p className="text-sm text-green-600 mt-1">This month</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div>
            <p className="text-gray-600">Returning Patients</p>
            <p className="text-2xl font-bold text-gray-900">{patientData.returningPatients}</p>
            <p className="text-sm text-blue-600 mt-1">This month</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Age Distribution</h3>
        <div className="space-y-4">
          {patientData.ageGroups.map((group, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-700">{group.group}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{group.count}</p>
                <p className="text-sm text-gray-600">{group.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppointmentsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Appointments</p>
              <p className="text-3xl font-bold">{appointmentData.totalAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div>
            <p className="text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{appointmentData.completed}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div>
            <p className="text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-orange-600">{appointmentData.cancelled}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div>
            <p className="text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-purple-600">{appointmentData.completionRate}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Appointment Hours</h3>
        <div className="space-y-4">
          {appointmentData.peakHours.map((hour, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                </div>
                <p className="font-semibold text-gray-900">{hour.hour}</p>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full"
                    style={{ width: `${(hour.count / 32) * 100}%` }}
                  ></div>
                </div>
                <p className="font-bold text-gray-900">{hour.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (selectedReport) {
      case 'earnings': return renderEarningsReport();
      case 'patients': return renderPatientsReport();
      case 'appointments': return renderAppointmentsReport();
      default: return renderEarningsReport();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive clinic performance insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg transition-all duration-200">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                selectedReport === report.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${report.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{report.label}</h3>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
}