import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Course } from '../types';
import { Loader2, Search, Mail, BookOpen, Shield, User } from 'lucide-react';

interface AdminUsersListProps {
  courses: Course[];
}

interface UserWithCourses {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at: string;
  purchased_courses: Course[];
}

export const AdminUsersList: React.FC<AdminUsersListProps> = ({ courses }) => {
  const [users, setUsers] = useState<UserWithCourses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsersAndPurchases();
  }, [courses]);

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

      // 3. Map purchases to users
      const usersWithCourses: UserWithCourses[] = (profilesData || []).map(profile => {
        const userPurchases = purchasesData?.filter(p => p.user_id === profile.id) || [];
        const purchasedCourses = userPurchases
          .map(p => courses.find(c => c.id === p.course_id))
          .filter((c): c is Course => c !== undefined);

        return {
          id: profile.id,
          email: profile.email || 'N/D',
          full_name: profile.full_name || 'Utente',
          is_admin: profile.is_admin || false,
          created_at: profile.created_at || new Date().toISOString(),
          purchased_courses: purchasedCourses
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Utente</th>
                <th className="px-6 py-4 font-medium">Contatto</th>
                <th className="px-6 py-4 font-medium">Percorsi Acquistati</th>
                <th className="px-6 py-4 font-medium text-right">Data Iscrizione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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
                            <span 
                              key={course.id} 
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                              title={course.title}
                            >
                              <BookOpen className="w-3 h-3 mr-1" />
                              {course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Nessun percorso</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
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
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Totale utenti trovati: <span className="font-semibold text-gray-900">{filteredUsers.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
