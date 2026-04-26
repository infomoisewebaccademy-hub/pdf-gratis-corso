import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { X, Mail, BookOpen, Clock, Shield, User, Ticket, Bell, Plus, Loader2 } from 'lucide-react';
import { UserWithCourses } from './AdminUsersList';

interface UserDetailModalProps {
  user: UserWithCourses;
  availableCourses: Course[];
  onClose: () => void;
  onUpdate?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, availableCourses, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'courses' | 'notifications' | 'tickets'>('details');
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [notifRes, ticketRes] = await Promise.all([
        supabase.from('notification_history').select('*').eq('user_id', user.id).order('sent_at', { ascending: false }),
        supabase.from('support_tickets').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
      ]);
      if (!notifRes.error) setNotificationHistory(notifRes.data || []);
      if (!ticketRes.error) setTickets(ticketRes.data || []);
      setIsLoading(false);
    };
    fetchData();
  }, [user.id]);

  const handleAssignCourse = async () => {
    if (!selectedCourseId) return;
    setIsAssigning(true);
    try {
        const { error } = await supabase
            .from('purchases')
            .insert([{ user_id: user.id, course_id: selectedCourseId }]);
        
        if (error) throw error;
        
        alert('Percorso assegnato con successo!');
        setSelectedCourseId('');
        if (onUpdate) onUpdate();
    } catch (err: any) {
        console.error("Errore assegnazione corso:", err);
        alert("Errore nell'assegnazione: " + err.message);
    } finally {
        setIsAssigning(false);
    }
  };

  // Filtra i corsi che l'utente NON ha ancora
  const coursesToAssign = availableCourses.filter(c => !user.purchased_courses.some(pc => pc.id === c.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Dettagli Utente: {user.full_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
        </div>
        
        <div className="flex border-b border-gray-100">
          {(['details', 'courses', 'notifications', 'tickets'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold capitalize ${activeTab === tab ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Data Iscrizione:</strong> {new Date(user.created_at).toLocaleString('it-IT')}</p>
              <p><strong>Admin:</strong> {user.is_admin ? 'Sì' : 'No'}</p>
            </div>
          )}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 mb-6">
                <h4 className="text-brand-800 font-bold mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Assegna Nuovo Percorso
                </h4>
                <div className="flex gap-3">
                  <select 
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="">Seleziona un percorso...</option>
                    {coursesToAssign.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignCourse}
                    disabled={!selectedCourseId || isAssigning}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Assegna
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Percorsi In Possesso ({user.purchased_courses.length})</h4>
              <div className="space-y-4">
                {user.purchased_courses.length > 0 ? (
                    user.purchased_courses.map(course => (
                      <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-bold">{course.title}</p>
                            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Acquistato</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <p className="text-xs mt-1 text-gray-500">{course.progress}% completato</p>
                      </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic text-sm text-center py-4">L'utente non ha ancora nessun percorso.</p>
                )}
              </div>
            </div>
          )}
          {activeTab === 'notifications' && (
            <ul className="space-y-2">
              {notificationHistory.map(h => (
                <li key={h.id} className="p-3 bg-gray-50 rounded-lg flex justify-between text-sm">
                  <span>{h.notification_type}</span>
                  <span className="text-gray-500">{new Date(h.sent_at).toLocaleString('it-IT')}</span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'tickets' && (
            <ul className="space-y-2">
              {tickets.map(t => (
                <li key={t.id} className="p-3 bg-gray-50 rounded-lg flex justify-between text-sm">
                  <span>{t.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
