
import React, { useState, useEffect } from 'react';
import { Course, UserProfile } from '../types';
import { PlayCircle, Book, RefreshCw, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Sidebar } from '../components/Sidebar';

interface DashboardProps {
  user: UserProfile;
  courses: Course[];
  onRefresh: () => Promise<void>;
  unreadChatCount?: number;
}

interface CourseProgress {
    [courseId: string]: number; // Percentuale 0-100
}

export const Dashboard: React.FC<DashboardProps> = ({ user, courses, onRefresh, unreadChatCount = 0 }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [progressMap, setProgressMap] = useState<CourseProgress>({});
  
  // Filter courses the user has purchased
  const myCourses = courses.filter(c => user.purchased_courses.includes(c.id));

  const fetchProgress = async () => {
      try {
          const { data, error } = await supabase
              .from('lesson_progress')
              .select('course_id, completed')
              .eq('user_id', user.id)
              .eq('completed', true);

          if (error) throw error;

          const map: CourseProgress = {};
          
          myCourses.forEach(course => {
              const totalLessons = course.lessons_content?.length || course.lessons || 1;
              const completedCount = data?.filter(p => p.course_id === course.id).length || 0;
              const percentage = Math.min(Math.round((completedCount / totalLessons) * 100), 100);
              map[course.id] = percentage;
          });

          setProgressMap(map);
      } catch (err) {
          console.error("Errore caricamento progresso:", err);
      }
  };

  useEffect(() => {
    if (localStorage.getItem('mwa_welcome_setup') === 'true') {
        setShowWelcome(true);
        localStorage.removeItem('mwa_welcome_setup');
    }
    fetchProgress();
  }, [user.id, myCourses.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    await fetchProgress();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="pt-20 min-h-screen bg-white flex">
      {/* Sidebar Menu - Come richiesto nell'immagine */}
      <Sidebar activeItem="my-courses" onNavigate={(path) => navigate(path)} unreadCount={unreadChatCount} />

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50/50 pb-20">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-12">
          
          {showWelcome && (
              <div className="bg-blue-600 rounded-xl p-6 mb-8 text-white shadow-lg relative animate-in slide-in-from-top-4">
                  <button onClick={() => setShowWelcome(false)} className="absolute top-4 right-4 text-blue-200 hover:text-white"><X className="h-5 w-5"/></button>
                  <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/20 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-yellow-300" />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold mb-1">Account Attivato con Successo!</h3>
                          <p className="text-blue-100 mb-4 max-w-2xl">
                              Sei entrato automaticamente. Per accedere in futuro da altri dispositivi, ti consigliamo di impostare una password sicura ora.
                          </p>
                          <button 
                              onClick={() => navigate('/update-password')}
                              className="bg-white text-blue-700 px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                          >
                              Imposta Password Ora
                          </button>
                      </div>
                  </div>
              </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bentornato, {user.full_name || 'Studente'}!</h1>
                  <p className="text-gray-500 mt-1">Ecco i tuoi progressi di apprendimento.</p>
              </div>
              
              <button 
                onClick={handleRefresh}
                className="flex items-center text-sm font-bold text-brand-600 bg-white border border-brand-100 hover:bg-brand-50 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Aggiornamento...' : 'Verifica nuovi acquisti'}
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Corsi Attivi</div>
                  <div className="text-4xl font-black text-gray-900">{myCourses.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Completamento Medio</div>
                  <div className="text-4xl font-black text-gray-900">
                      {myCourses.length > 0 
                          /* Fix: Added explicit type cast to Object.values result to resolve arithmetic operation type error */
                          ? Math.round((Object.values(progressMap) as number[]).reduce((a: number, b: number) => a + b, 0) / myCourses.length) 
                          : 0}%
                  </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Certificati</div>
                  <div className="text-4xl font-black text-gray-900">
                      {Object.values(progressMap).filter(v => v === 100).length}
                  </div>
              </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">I Tuoi Corsi</h2>

          {myCourses.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm p-16 text-center border border-gray-100">
                  <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Book className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Non hai ancora acquistato corsi</h3>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">Inizia oggi il tuo percorso di formazione con i nostri corsi pratici sull'AI.</p>
                  <button 
                      onClick={() => navigate('/courses')} 
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                  >
                      Vai al Catalogo
                  </button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {myCourses.map(course => {
                      const progress = progressMap[course.id] || 0;
                      return (
                          <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                              <div className="relative h-48 overflow-hidden">
                                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                                        <PlayCircle className="h-12 w-12 text-white" />
                                      </div>
                                  </div>
                                  {progress === 100 && (
                                      <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                          <CheckCircle2 className="h-5 w-5" />
                                      </div>
                                  )}
                              </div>
                              <div className="p-8 flex-1 flex flex-col">
                                  <h3 className="font-bold text-xl text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">{course.title}</h3>
                                  
                                  <div className="flex justify-between items-center mb-3">
                                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progresso</span>
                                      <span className="text-sm font-black text-brand-600">{progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                                      <div 
                                          className={`h-full rounded-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-brand-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]'}`} 
                                          style={{ width: `${progress}%` }}
                                      ></div>
                                  </div>

                                  <div className="flex justify-between text-sm text-gray-500 mb-8 border-t border-gray-50 pt-4">
                                      <div className="flex items-center gap-1.5">
                                          <div className={`w-2 h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                          <span className="font-bold">{progress === 100 ? 'Completato' : 'In corso'}</span>
                                      </div>
                                      <span className="font-medium text-gray-400">{course.lessons_content?.length || course.lessons} Lezioni</span>
                                  </div>
                                  
                                  <button className="mt-auto w-full bg-brand-50 text-brand-700 py-3.5 rounded-2xl font-bold hover:bg-brand-600 hover:text-white transition-all duration-300">
                                      Accedi al Corso
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}

        </div>
      </main>
    </div>
  );
};
