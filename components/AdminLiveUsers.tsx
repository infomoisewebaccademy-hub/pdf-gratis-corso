import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Activity, User, Globe, Clock, Monitor, Smartphone, Laptop } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const AdminLiveUsers: React.FC = () => {
  const [liveUsers, setLiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase.channel('online-users');

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users: any[] = [];
      for (const id in state) {
        const userEntries = state[id] as any[];
        users.push(...userEntries);
      }
      // Sort by timestamp descending
      users.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLiveUsers(users);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getDeviceIcon = (userAgent: string) => {
    if (/mobile/i.test(userAgent)) return <Smartphone className="w-4 h-4 text-slate-400" />;
    if (/tablet/i.test(userAgent)) return <Laptop className="w-4 h-4 text-slate-400" />;
    return <Monitor className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-emerald-500 animate-pulse" />
          Utenti Attivi Ora ({liveUsers.length})
        </h2>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">LIVE</span>
      </div>
      <div className="overflow-x-auto">
        {liveUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Activity className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="font-medium">Nessun utente attivo in questo momento.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Utente</th>
                <th className="px-6 py-4 font-semibold">Percorso / Pagina</th>
                <th className="px-6 py-4 font-semibold">Ultima Attività</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveUsers.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{u.full_name || 'Visitatore Anonimo'}</div>
                        {u.email && <div className="text-xs text-slate-500">{u.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit text-xs font-mono">
                      <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {u.path || '/'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {u.timestamp ? formatDistanceToNow(new Date(u.timestamp), { addSuffix: true, locale: it }) : 'Ora'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
