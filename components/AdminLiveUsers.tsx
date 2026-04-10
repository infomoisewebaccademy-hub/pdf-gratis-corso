import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Activity, User, Globe, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const AdminLiveUsers: React.FC = () => {
  const [liveUsers, setLiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase.channel('online-users');

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = [];
      for (const id in state) {
        users.push(...state[id]);
      }
      users.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLiveUsers(users);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-green-500 animate-pulse" />
          Utenti Live ({liveUsers.length})
        </h2>
      </div>
      <div className="p-0">
        {liveUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nessun utente attualmente online.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-sm text-slate-500">
                  <th className="p-4 font-medium">Utente</th>
                  <th className="p-4 font-medium">Pagina Attuale</th>
                  <th className="p-4 font-medium">Ultima Azione</th>
                </tr>
              </thead>
              <tbody>
                {liveUsers.map((u, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                          {u.full_name ? u.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{u.full_name || 'Visitatore Anonimo'}</div>
                          {u.email && <div className="text-sm text-slate-500">{u.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-slate-600">
                        <Globe className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="font-mono text-sm">{u.path}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        {u.timestamp ? formatDistanceToNow(new Date(u.timestamp), { addSuffix: true, locale: it }) : 'Ora'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
