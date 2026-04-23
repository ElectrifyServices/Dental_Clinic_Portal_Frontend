import React from 'react';
import { DollarSign, Stethoscope, User } from 'lucide-react';

interface ProfitSharingPageProps {
  treatments: any[];
  doctorsWithSchedules: any[];
}

export const ProfitSharingPage: React.FC<ProfitSharingPageProps> = ({ treatments, doctorsWithSchedules }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profit Sharing Report</h1>
        <p className="text-gray-600 mt-1">Track doctor earnings and profit distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white text-center">
            <p className="text-blue-100 text-xs uppercase font-bold mb-1">Total Revenue</p>
            <p className="text-2xl font-black">₹{treatments.reduce((sum, t) => sum + (t.cost || 0), 0).toLocaleString()}</p>
        </div>
        {/* ... more stats ... */}
      </div>

      <div className="space-y-6">
        {doctorsWithSchedules.map((doctor) => {
          const doctorTreatments = treatments.filter((t) => t.doctorId === doctor.id);
          const totalEarnings = doctorTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
          const profitShare = (totalEarnings * (doctor.profitPercentage || 0)) / 100;

          return (
            <div key={doctor.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialization} · {doctor.profitPercentage}% Share</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase">Estimated Share</p>
                  <p className="text-xl font-black text-green-600">₹{profitShare.toLocaleString()}</p>
                </div>
              </div>
              {/* Simplified table for now */}
              <div className="p-4 overflow-x-auto text-xs">
                <table className="w-full">
                   <thead>
                     <tr className="text-left text-gray-400 border-b">
                       <th className="pb-2">Patient</th>
                       <th className="pb-2">Procedure</th>
                       <th className="pb-2">Cost</th>
                       <th className="pb-2">Doctor Share</th>
                     </tr>
                   </thead>
                   <tbody>
                     {doctorTreatments.map(t => (
                       <tr key={t.id} className="border-b last:border-0">
                         <td className="py-2 font-medium">{t.patientName}</td>
                         <td className="py-2 text-gray-500">{t.procedure}</td>
                         <td className="py-2 font-bold">₹{t.cost.toLocaleString()}</td>
                         <td className="py-2 font-bold text-green-600">₹{((t.cost * doctor.profitPercentage) / 100).toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
