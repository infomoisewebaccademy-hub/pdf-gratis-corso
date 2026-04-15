import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import { Loader2, Search, Mail, BookOpen, Shield, User, Clock, Send, RefreshCw, Download, Key } from 'lucide-react';

interface AdminUsersListProps {
  courses: Course[];
}

interface WaitingListEntry {
  id: string;
  email: string;
  full_name: string;
  course_id: string | null;
  source: string;
  created_at: string;
}

interface UserWithCourses {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  purchased_courses: (Course & { progress: number })[];
  notification_count: number;
}

export const AdminUsersList: React.FC<AdminUsersListProps> = ({ courses }) => {
  const [users, setUsers] = useState<UserWithCourses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'waiting_list'>('students');
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [isNotifying, setIsNotifying] = useState<string | null>(null);
  const [isBulkNotifying, setIsBulkNotifying] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  useEffect(() => {
    if (activeSubTab === 'students') {
      fetchUsersAndPurchases();
    } else {
      fetchWaitingList();
    }
  }, [courses, activeSubTab]);

  const fetchWaitingList = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWaitingList(data || []);
    } catch (error) {
      console.error("Errore nel caricamento della lista d'attesa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotifyUser = async (entry: WaitingListEntry) => {
    if (!confirm(`Vuoi inviare una notifica email a ${entry.email} per il percorso ${entry.course_id ? courses.find(c => c.id === entry.course_id)?.title : 'generale'}?`)) return;
    
    setIsNotifying(entry.id);
    try {
      await sendNotification(entry);
      alert('Notifica inviata con successo!');
    } catch (error: any) {
      console.error("Errore notifica:", error);
      alert("Errore nell'invio della notifica: " + error.message);
    } finally {
      setIsNotifying(null);
    }
  };

  const sendNotification = async (entry: WaitingListEntry) => {
    const courseTitle = entry.course_id ? courses.find(c => c.id === entry.course_id)?.title : 'un nuovo percorso';
    const response = await fetch('/api/notify-waiting-list-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: entry.email,
        name: entry.full_name,
        courseTitle: courseTitle,
        courseId: entry.course_id
      })
    });

    if (!response.ok) throw new Error('Errore nell\'invio della notifica');
    return response.json();
  };

  const handleBulkNotify = async () => {
    if (selectedEntries.length === 0) return;
    if (!confirm(`Vuoi inviare una notifica email a TUTTI i ${selectedEntries.length} iscritti selezionati?`)) return;
    
    setIsBulkNotifying(true);
    setNotificationStatus('idle');
    let successCount = 0;
    let failCount = 0;

    for (const entryId of selectedEntries) {
      const entry = waitingList.find(e => e.id === entryId);
      if (!entry) continue;
      try {
        await sendNotification(entry);
        successCount++;
      } catch (error) {
        console.error(`Errore notifica per ${entry.email}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
        setNotificationStatus('success');
        setTimeout(() => setNotificationStatus('idle'), 3000);
    } else {
        setNotificationStatus('error');
        setTimeout(() => setNotificationStatus('idle'), 3000);
    }
    
    setIsBulkNotifying(false);
    setSelectedEntries([]);
  };

  const handleSendCredentials = async (entry: WaitingListEntry) => {
    if (!confirm(`Vuoi inviare una email con le credenziali di accesso a ${entry.email}?`)) return;
    
    setIsNotifying(entry.id);
    try {
      const functionUrl = `${supabaseUrl}/functions/v1/resend-credentials`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: entry.email,
          name: entry.full_name
        })
      });
      if (!response.ok) throw new Error('Errore nell\'invio delle credenziali');
      alert('Email con credenziali inviata con successo!');
    } catch (error: any) {
      console.error("Errore invio credenziali:", error);
      alert("Errore nell'invio delle credenziali: " + error.message);
    } finally {
      setIsNotifying(null);
    }
  };

  const handleBulkSendCredentials = async () => {
    if (selectedEntries.length === 0) return;
    if (!confirm(`Vuoi inviare una email con le credenziali a TUTTI i ${selectedEntries.length} iscritti selezionati?`)) return;
    
    setIsBulkNotifying(true);
    setNotificationStatus('idle');
    let successCount = 0;
    let failCount = 0;

    for (const entryId of selectedEntries) {
      const entry = waitingList.find(e => e.id === entryId);
      if (!entry) continue;
      try {
        const functionUrl = `${supabaseUrl}/functions/v1/resend-credentials`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: entry.email,
            name: entry.full_name
          })
        });
        if (!response.ok) throw new Error('Errore');
        successCount++;
      } catch (error) {
        console.error(`Errore invio credenziali per ${entry.email}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
        setNotificationStatus('success');
        setTimeout(() => setNotificationStatus('idle'), 3000);
    } else {
        setNotificationStatus('error');
        setTimeout(() => setNotificationStatus('idle'), 3000);
    }
    
    setIsBulkNotifying(false);
    setSelectedEntries([]);
  };

  const handleBulkSendCredentialsToStudents = async () => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Vuoi inviare una email con le credenziali a TUTTI i ${selectedUsers.length} studenti selezionati?`)) return;
    
    setIsBulkNotifying(true);
    setNotificationStatus('idle');
    let successCount = 0;
    let failCount = 0;

    for (const userId of selectedUsers) {
      const user = users.find(u => u.id === userId);
      if (!user) continue;
      try {
        const functionUrl = `${supabaseUrl}/functions/v1/resend-credentials`;
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.full_name
          })
        });
        if (!response.ok) throw new Error('Errore');
        successCount++;
      } catch (error) {
        console.error(`Errore invio credenziali per ${user.email}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
        setNotificationStatus('success');
        setTimeout(() => setNotificationStatus('idle'), 3000);
    } else {
        setNotificationStatus('error');
        setTimeout(() => setNotificationStatus('idle'), 3000);
    }
    
    setIsBulkNotifying(false);
    setSelectedUsers([]);
  };


  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [userToNotify, setUserToNotify] = useState<UserWithCourses | null>(null);

  const openNotificationModal = (user: UserWithCourses) => {
    setUserToNotify(user);
    setIsNotificationModalOpen(true);
  };

  const handleSendNotification = async (type: 'pdf-reminder') => {
    if (!userToNotify) return;
    setIsNotificationModalOpen(false);
    
    if (!confirm(`Vuoi inviare la notifica "${type}" a ${userToNotify.email}?`)) return;
    
    setIsNotifying(userToNotify.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-pdf-reminder', {
        body: {
          email: userToNotify.email,
          name: userToNotify.full_name
        }
      });
      
      if (error) {
          console.error("Errore Edge Function:", error);
          throw error;
      }
      
      setUsers(prev => prev.map(u => u.id === userToNotify.id ? { ...u, notification_count: (u.notification_count || 0) + 1 } : u));
      alert('Notifica inviata con successo!');
    } catch (error: any) {
      console.error("Errore invio notifica:", error);
      alert("Errore nell'invio della notifica: " + error.message);
    } finally {
      setIsNotifying(null);
      setUserToNotify(null);
    }
  };
  const handleExportWaitingList = () => {
    if (waitingList.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,Nome,Email,Percorso,Data Iscrizione,Fonte\n";
    waitingList.forEach((row) => {
      const courseTitle = row.course_id ? courses.find(c => c.id === row.course_id)?.title || 'N/A' : 'N/A';
      const date = new Date(row.created_at).toLocaleDateString();
      csvContent += `"${row.full_name || 'N/A'}",${row.email},"${courseTitle}",${date},${row.source || 'pre_launch'}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lista_attesa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchUsersAndPurchases = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // 2. Fetch all purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('user_id, course_id');

      if (purchasesError) throw purchasesError;

      // 3. Fetch all lesson progress
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('user_id, course_id, lesson_id, completed')
        .eq('completed', true);

      if (progressError) throw progressError;

      // 4. Map purchases and progress to users
      const usersWithCourses: UserWithCourses[] = (profilesData || []).map(profile => {
        const userPurchases = purchasesData?.filter(p => p.user_id === profile.id) || [];
        const userProgress = progressData?.filter(p => p.user_id === profile.id) || [];
        
        const purchasedCourses = userPurchases
          .map(p => {
            const course = courses.find(c => c.id === p.course_id);
            if (!course) return null;
            
            const completedLessons = userProgress.filter(p => p.course_id === course.id).length;
            const totalLessons = course.lessons || 0;
            const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            
            return { ...course, progress };
          })
          .filter((c): c is (Course & { progress: number }) => c !== null);

        return {
          id: profile.id,
          email: profile.email || 'N/D',
          full_name: profile.full_name || 'Utente',
          is_admin: profile.is_admin || false,
          created_at: profile.created_at || new Date().toISOString(),
          purchased_courses: purchasedCourses,
          notification_count: profile.notification_count || 0
        };
      });

      setUsers(usersWithCourses);
    } catch (error) {
      console.error("Errore nel caricamento degli utenti:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWaitingList = waitingList.filter(entry => {
    const matchesSearch = entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCourse = false;
    if (selectedCourseFilter === 'all') {
        matchesCourse = true;
    } else if (selectedCourseFilter === 'pdf_guide') {
        matchesCourse = entry.source === 'pdf_guide';
    } else if (selectedCourseFilter === 'null') {
        matchesCourse = entry.course_id === null;
    } else {
        matchesCourse = entry.course_id === selectedCourseFilter;
    }
    
    return matchesSearch && matchesCourse;
  });

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'pdf_guide': return 'Guida PDF';
      case 'course_full_waiting_list': return 'Corso Pieno';
      case 'pre_launch': return 'Pre-Lancio';
      default: return 'Generale';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSubTab === 'students'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Utenti
          </button>
          <button
            onClick={() => setActiveSubTab('waiting_list')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSubTab === 'waiting_list'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lista d'Attesa
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeSubTab === 'waiting_list' && (
            <>
              {filteredWaitingList.length > 0 && (
                <div className="flex items-center gap-2">
                  {notificationStatus === 'success' && (
                    <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                      <Check className="h-4 w-4" /> Inviate!
                    </span>
                  )}
                  {notificationStatus === 'error' && (
                    <span className="text-red-600 text-sm font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                      <XCircle className="h-4 w-4" /> Errore!
                    </span>
                  )}
                  <button
                    onClick={handleBulkNotify}
                    disabled={isBulkNotifying || selectedEntries.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
                  >
                    {isBulkNotifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Notifica Selezionati ({selectedEntries.length})
                  </button>
                  <button
                    onClick={handleBulkSendCredentials}
                    disabled={isBulkNotifying || selectedEntries.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    {isBulkNotifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Invia Credenziali Selezionati ({selectedEntries.length})
                  </button>
                </div>
              )}
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Tutti i percorsi</option>
                <option value="null">Generale (Pre-Lancio)</option>
                <option value="pdf_guide">Guida PDF</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button
                onClick={handleExportWaitingList}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-black transition-all"
              >
                <Download className="h-4 w-4" /> Esporta CSV
              </button>
            </>
          )}
          {activeSubTab === 'students' && (
            <div className="flex items-center gap-2">
              {notificationStatus === 'success' && (
                <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                  <Check className="h-4 w-4" /> Inviate!
                </span>
              )}
              {notificationStatus === 'error' && (
                <span className="text-red-600 text-sm font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                  <XCircle className="h-4 w-4" /> Errore!
                </span>
              )}
              <button
                onClick={handleBulkSendCredentialsToStudents}
                disabled={isBulkNotifying || selectedUsers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                {isBulkNotifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Invia Credenziali Selezionati ({selectedUsers.length})
              </button>
            </div>
          )}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeSubTab === 'students' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                    />
                  </th>
                  <th className="px-6 py-4 font-medium">Utente</th>
                  <th className="px-6 py-4 font-medium">Contatto</th>
                  <th className="px-6 py-4 font-medium">Percorsi Acquistati</th>
                  <th className="px-6 py-4 font-medium text-right">Notifiche</th>
                  <th className="px-6 py-4 font-medium text-right">Data Iscrizione</th>
                  <th className="px-6 py-4 font-medium text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg mr-3">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                              {user.full_name}
                              {user.is_admin && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  <Shield className="w-3 h-3 mr-1" /> Admin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <User className="w-3 h-3 mr-1" /> ID: {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={`mailto:${user.email}`} className="hover:text-brand-600 transition-colors">
                            {user.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.purchased_courses.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {user.purchased_courses.map(course => (
                              <div 
                                key={course.id} 
                                className="inline-flex flex-col items-start px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                title={course.title}
                              >
                                <div className="flex items-center">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title}
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-1 mt-1">
                                    <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                </div>
                                <span className="text-[10px] mt-0.5">{course.progress}% completato</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Nessun percorso</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {user.notification_count || 0}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openNotificationModal(user)}
                          disabled={isNotifying === user.id}
                          className="inline-flex items-center px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
                        >
                          {isNotifying === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Key className="h-3 w-3 mr-1" />
                          )}
                          Notifica Mail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">Nessun utente trovato</p>
                        <p className="text-sm">Prova a cercare con un termine diverso.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">
                    <input 
                      type="checkbox" 
                      checked={selectedEntries.length === filteredWaitingList.length && filteredWaitingList.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntries(filteredWaitingList.map(e => e.id));
                        } else {
                          setSelectedEntries([]);
                        }
                      }}
                      className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                    />
                  </th>
                  <th className="px-6 py-4 font-medium">Utente</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Percorso Interessato</th>
                  <th className="px-6 py-4 font-medium">Data Iscrizione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWaitingList.length > 0 ? (
                  filteredWaitingList.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedEntries.includes(entry.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries([...selectedEntries, entry.id]);
                            } else {
                              setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                            }
                          }}
                          className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg mr-3">
                            {(entry.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{entry.full_name || 'Utente'}</p>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1" /> {getSourceLabel(entry.source)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={`mailto:${entry.email}`} className="hover:text-brand-600 transition-colors">
                            {entry.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {entry.course_id ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {courses.find(c => c.id === entry.course_id)?.title || 'Corso Eliminato'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Generale</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleNotifyUser(entry)}
                          disabled={isNotifying === entry.id}
                          className="inline-flex items-center px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
                        >
                          {isNotifying === entry.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Notifica
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">Nessun iscritto trovato</p>
                        <p className="text-sm">La lista d'attesa è vuota.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Totale {activeSubTab === 'students' ? 'utenti' : 'iscritti'} trovati: <span className="font-semibold text-gray-900">{activeSubTab === 'students' ? filteredUsers.length : filteredWaitingList.length}</span>
          </p>
        </div>
        {isNotificationModalOpen && userToNotify && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h3 className="text-lg font-bold mb-4">Seleziona Notifica per {userToNotify.full_name}</h3>
              <button
                onClick={() => handleSendNotification('pdf-reminder')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                Promemoria Guida PDF
              </button>
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                className="w-full mt-4 text-gray-500 hover:text-gray-700"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
