import React from 'react';
import { User, Phone, Calendar, TrendingUp } from 'lucide-react';

export function RecentPatients() {
  const [patients, setPatients] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('patients') || '[]');
      const sorted = [...stored].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setPatients(sorted.slice(0, 6));
    } catch {}
  }, []);

  const STATUS_CLS: Record<string, string> = {
    active: 'badge badge-green', new: 'badge badge-blue', inactive: 'badge badge-gray',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Recent Patients</h2>
          <p className="text-xs text-gray-400 mt-0.5">Recently registered</p>
        </div>
        <TrendingUp className="w-4 h-4 text-gray-400" />
      </div>
      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-blue-50/50">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-1 uppercase tracking-tight">Begin your practice</h3>
          <p className="text-xs text-gray-500 text-center max-w-[220px] leading-relaxed">
            Your patient directory is currently empty. Start by registering your first patient to begin tracking.
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <TrendingUp className="w-3 h-3" />
            Ready for Growth
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {patients.map((p, i) => (
            <div key={p.id || i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                {p.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900 truncate">{p.name}</span>
                  <span className={STATUS_CLS[p.status] || STATUS_CLS.new}>{p.status || 'new'}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{p.phone}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {p.totalVisits || 0} visit{p.totalVisits !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
