
import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, UserProfile, PlatformSettings } from '../types';
import { Clock, Book, BarChart, Check, Lock, Play, PlayCircle, Sparkles, AlertCircle, ShoppingCart, Zap, CheckCircle2, Download, FileText, Star, StarHalf, ShieldCheck, Award, Users, ArrowLeft, ChevronDown, ChevronUp, Bell, X, Target, TrendingUp, Shield, Laptop, Code, Brain, Loader2, CreditCard, Mail, Key, ArrowRight, DollarSign, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { trackInitiateCheckout, trackAddToCart } from '../services/metaPixel';
import { supabase } from '../services/supabase';
import { generateDefaultLandingPage } from '../utils/courseLandingGenerator';
import { Footer } from '../components/Footer';
import { Countdown3D } from '../components/Countdown3D';

interface CourseDetailProps {
  course: Course;
  onPurchase: () => void;
  isPurchased: boolean;
  onBack: () => void;
  user: UserProfile | null;
  settings: PlatformSettings;
  forceLanding?: boolean;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
      {hasHalfStar && <StarHalf className="h-4 w-4 fill-current" />}
      {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-gray-300" />
      ))}
      <span className="ml-2 text-sm font-bold text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

const SecureVideoPlayer: React.FC<{ lesson: Lesson, onEnded: () => void }> = ({ lesson, onEnded }) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setErrorMsg(null);

        // Priorità al video caricato
        if (lesson.video_storage_path) {
            const getSignedUrl = async () => {
                try {
                    const { data, error } = await supabase.storage
                        .from('course-videos')
                        .createSignedUrl(lesson.video_storage_path, 3600); // URL valido per 1 ora
                    
                    if (error) throw error;

                    if (isMounted) {
                        setVideoUrl(data.signedUrl);
                        setIsLoading(false);
                    }
                } catch (err: any) {
                    console.error("Errore nel generare URL sicuro:", err);
                    if (isMounted) {
                        setErrorMsg(err.message || String(err));
                        setIsLoading(false);
                    }
                }
            };
            getSignedUrl();
        } else if (lesson.videoUrl) {
            setVideoUrl(lesson.videoUrl);
            setIsLoading(false);
        } else {
            setVideoUrl(null);
            setIsLoading(false);
        }

        return () => { isMounted = false; };
    }, [lesson.video_storage_path, lesson.videoUrl]);

    return (
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group flex flex-col justify-center items-center">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    <p className="text-sm font-medium">Caricamento video sicuro...</p>
                </div>
            ) : errorMsg ? (
                <div className="flex flex-col items-center justify-center p-6 text-center h-full max-w-md mx-auto text-white/80 space-y-4">
                    <div className="bg-red-500/10 p-3 rounded-full text-red-500">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-red-400">Errore nel caricamento del video</h3>
                        <p className="text-sm text-gray-400 mt-2">
                            {errorMsg.includes('Object not found') 
                              ? 'Il file video associato a questa lezione non è stato trovato sul server (Object not found).'
                              : `Impossibile generare l\'URL sicuro del video: ${errorMsg}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-3 border-t border-white/10 pt-3">
                            Se sei l\'amministratore, accedi all\'area di modifica del corso, rimuovi l\'associazione del video attuale e ricaricalo o selezionalo nuovamente dalla libreria multimediale.
                        </p>
                    </div>
                </div>
            ) : videoUrl ? (
                videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
                    <iframe 
                        src={videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full absolute inset-0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video 
                        src={videoUrl} 
                        controls 
                        controlsList="nodownload" 
                        onContextMenu={e => e.preventDefault()} 
                        className="w-full h-full absolute inset-0" 
                        onEnded={onEnded}
                        autoPlay
                    />
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-2">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                    <p className="text-sm">Video non disponibile per questa lezione.</p>
                </div>
            )}
        </div>
    );
};

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onPurchase, isPurchased, onBack, user, settings, forceLanding }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const [upsellCourse, setUpsellCourse] = useState<Course | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [activeMockup, setActiveMockup] = useState(0);
  const touchStartX = useRef<number | null>(null);
  
  // Waiting list state
  const [waitingListEmail, setWaitingListEmail] = useState(user?.email || '');
  const [waitingListName, setWaitingListName] = useState(user?.full_name || '');
  const [isWaitingListLoading, setIsWaitingListLoading] = useState(false);
  const [waitingListSuccess, setWaitingListSuccess] = useState(false);
  const [waitingListError, setWaitingListError] = useState<string | null>(null);

  // Special check for the PDF guide course
  const isPdfGuideCourse = course.id === 'course_pdf_guide_free';
  const pdfUrl = settings.pdf_guide_config?.guide_pdf_url;

  // Carica corso upsell se presente
  useEffect(() => {
    if (course.upsell_course_id) {
      const fetchUpsell = async () => {
        const { data } = await supabase
          .from('courses')
          .select('*')
          .eq('id', course.upsell_course_id)
          .single();
        if (data) setUpsellCourse(data as Course);
      };
      fetchUpsell();
    } else {
      setUpsellCourse(null);
    }
  }, [course.upsell_course_id]);

  // Gestione annuncio popup
  useEffect(() => {
    if (course.announcement_title || course.announcement_content) {
      setShowAnnouncement(true);
    }
  }, [course.id]);

  // Carica progresso lezioni se acquistato
  useEffect(() => {
      if (isPurchased && user) {
          const fetchProgress = async () => {
              const { data } = await supabase
                  .from('lesson_progress')
                  .select('lesson_id')
                  .eq('user_id', user.id)
                  .eq('course_id', course.id)
                  .eq('completed', true);
              
              if (data) {
                  setCompletedLessons(data.map(p => p.lesson_id));
              }
          };
          fetchProgress();
      }
  }, [isPurchased, user, course.id]);

  const markLessonAsCompleted = async (lessonId: string) => {
      if (!user || !isPurchased) return;
      
      try {
          const { error } = await supabase
              .from('lesson_progress')
              .upsert({
                  user_id: user.id,
                  course_id: course.id,
                  lesson_id: lessonId,
                  completed: true,
                  updated_at: new Date().toISOString()
              }, { onConflict: 'user_id,lesson_id' });

          if (error) throw error;

          setCompletedLessons(prev => prev.includes(lessonId) ? prev : [...prev, lessonId]);
      } catch (err) {
          console.error("Errore salvataggio progresso:", err);
      }
  };

  const startLearning = () => {
    if (course.lessons_content && course.lessons_content.length > 0) {
        setActiveLesson(course.lessons_content[0]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!isPdfGuideCourse) { // Mostra avviso solo se non è il percorso guida (che può essere vuoto)
        alert("Questo percorso non ha ancora lezioni caricate dall'insegnante.");
    }
  };

  const isDiscountAvailable = user && course.discounted_price && course.discounted_price > 0 && !isPurchased;
  const finalPrice = isDiscountAvailable ? course.discounted_price! : course.price;
  const inCart = isInCart(course.id);

  const handleBuyNow = () => {
      if (course.status && course.status !== 'active') return;
      setIsBuying(true);
      trackInitiateCheckout([course.id], finalPrice);
      onPurchase();
  };

  const handleJoinWaitingList = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!waitingListEmail) return;
      
      setIsWaitingListLoading(true);
      setWaitingListError(null);
      
      try {
          const { error } = await supabase
              .from('waiting_list')
              .insert([{
                  email: waitingListEmail,
                  full_name: waitingListName,
                  course_id: course.id,
                  source: 'course_full_waiting_list'
              }]);
              
          if (error) {
              if (error.code === '23505') {
                  setWaitingListSuccess(true);
                  return;
              }
              throw error;
          }
          setWaitingListSuccess(true);
      } catch (err: any) {
          console.error("Errore iscrizione lista d'attesa:", err);
          setWaitingListError(err.message || "Si è verificato un errore. Riprova più tardi.");
      } finally {
          setIsWaitingListLoading(false);
      }
  };

  const isFull = course.status === 'full';
  const isComingSoon = course.status === 'coming_soon';
  const isPurchasable = !isFull && !isComingSoon;

  const renderLucideIcon = (iconName: string, className: string = "h-5 w-5") => {
    switch (iconName) {
        case 'Sparkles': return <Sparkles className={className} />;
        case 'Zap': return <Zap className={className} />;
        case 'Target': return <Target className={className} />;
        case 'TrendingUp': return <TrendingUp className={className} />;
        case 'Award': return <Award className={className} />;
        case 'Shield': return <ShieldCheck className={className} />;
        case 'Laptop': return <Laptop className={className} />;
        case 'Code': return <Code className={className} />;
        case 'Brain': return <Brain className={className} />;
        case 'Users': return <Users className={className} />;
        default: return <Sparkles className={className} />;
    }
  };

  const renderCourseLandingFunnel = () => {
    const lpd = course.landing_page_data || generateDefaultLandingPage(course.title, course.price, course.discounted_price);
    if (!lpd) return null;

    const activeShowcases = lpd.showcases && lpd.showcases.length > 0
      ? lpd.showcases.map((sc: any, index: number) => ({ ...sc, id: index }))
      : [
          { id: 0, title: "🍕 Ristorante Pizzeria", subtitle: "Fornace Gourmet", builtinIndex: 0 },
          { id: 1, title: "💇 Parrucchiera Elite", subtitle: "Taglio Sartoriale", builtinIndex: 1 },
          { id: 2, title: "💆 Salone di Bellezza", subtitle: "Aura Aesthetic", builtinIndex: 2 },
          { id: 3, title: "🦷 Studio Dentistico", subtitle: "Sorriso Sano", builtinIndex: 3 },
          { id: 4, title: "📸 Studio Foto & Creative", subtitle: "Luce Studio", builtinIndex: 4 },
        ];
    const activeShowcaseItem = activeShowcases[activeMockup] || activeShowcases[0];

    return (
      <div className="bg-slate-50 min-h-screen text-slate-800 pb-24">
        {/* UPPER SNEAK-PEEK PREMIUM BAR */}
        <div className="bg-slate-900 text-slate-250 text-center py-2.5 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
          <span>Presentazione Esclusiva dell'Academy • Accesso Riservato Clienti</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* HERO PREVIEW BLOCK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
            <div className="lg:col-span-7 space-y-6">
              {lpd.hero?.value_proposition && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Zap className="h-3 w-3 fill-current" />
                  {lpd.hero.value_proposition}
                </span>
              )}
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-none">
                {lpd.hero?.title}
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
                {lpd.hero?.subheadline}
              </p>

              {/* CORE BULLET POINTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(lpd.hero?.bullet_points || []).map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 leading-snug">{point}</span>
                  </div>
                ))}
              </div>
              
              {/* DYNAMIC 3D COUNTDOWN TIMER */}
              {(course.show_countdown || course.landing_page_data?.show_countdown) && (course.countdown_end || course.landing_page_data?.countdown_end) && (
                <div className="pt-6">
                  <Countdown3D targetDate={course.countdown_end || course.landing_page_data?.countdown_end} />
                </div>
              )}

              {/* ACTION AREA CALL TO ACTION */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                {isPurchasable ? (
                  <>
                    <button 
                        onClick={handleBuyNow}
                        disabled={isBuying}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold py-4 px-6 text-center text-lg shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isBuying ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Elaborazione...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 fill-current" />
                            Inizia Subito
                          </>
                        )}
                    </button>

                    <button 
                        onClick={() => {
                            if (inCart) navigate('/cart');
                            else addToCart(course, settings.add_to_cart_pixel_id);
                        }}
                        className={`flex-1 rounded-xl font-bold py-4 px-6 text-center text-lg transition-all border-2 flex items-center justify-center gap-2 cursor-pointer ${
                            inCart 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {inCart ? 'Vai al Carrello' : 'Aggiungi al Carrello'}
                    </button>
                  </>
                ) : (
                  <div className="w-full">
                    {isComingSoon ? (
                      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-center font-bold">
                        Disponibile a Breve! Resta Sintonizzato.
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center font-bold">
                        Iscrizioni Chiuse - Posti Esauriti!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* HERO MEDIA */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                <img src={course.image} alt={course.title} className="w-full h-64 sm:h-80 object-cover" />
                <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-[9px]">Prezzo Speciale</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-brand-650">€{finalPrice}</span>
                      {isDiscountAvailable && (
                        <span className="text-slate-400 line-through text-sm">€{course.price}</span>
                      )}
                    </div>
                  </div>
                  {isDiscountAvailable && (
                    <span className="bg-brand-100 text-brand-700 font-black text-xs px-2.5 py-1 rounded-lg">
                      Sconto Fedeltà {Math.round(((course.price - course.discounted_price!) / course.price) * 100)}% off
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PROBLEM & AGITATION PANEL */}
          {lpd.problem_solution && (
            <div className="mb-24">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-red-500 font-bold text-xs uppercase tracking-widest block mb-2 font-mono">Il Cambiamento</span>
                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Prima & Dopo: Un Metodo che Rivoluziona Tutto</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* PROBLEM */}
                <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="bg-red-50 text-red-600 h-12 w-12 rounded-xl flex items-center justify-center mb-6 border border-red-100">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{lpd.problem_solution.problem_title}</h3>
                    <p className="text-slate-650 leading-relaxed text-sm mb-6">{lpd.problem_solution.problem_desc}</p>
                  </div>
                  
                  {lpd.problem_solution.before_vs_after?.before_items && (
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-red-650 uppercase tracking-widest font-mono">Lo Stato Attuale di Frustrazione:</h4>
                      {lpd.problem_solution.before_vs_after.before_items.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-slate-500 text-sm">
                          <span className="text-red-500 font-black mt-0.5">✕</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOLUTION */}
                <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-45"></div>
                  <div className="relative z-10">
                    <div className="bg-emerald-50 text-emerald-600 h-12 w-12 rounded-xl flex items-center justify-center mb-6 border border-emerald-100">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{lpd.problem_solution.solution_title}</h3>
                    <p className="text-slate-655 leading-relaxed text-sm mb-6">{lpd.problem_solution.solution_desc}</p>
                  </div>

                  {lpd.problem_solution.before_vs_after?.after_items && (
                    <div className="space-y-3 pt-6 border-t border-slate-100 relative z-10">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest font-mono">Il Risultato di Successo:</h4>
                      {lpd.problem_solution.before_vs_after.after_items.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 text-slate-750 text-sm font-semibold">
                          <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BENEFIT GRID */}
          {lpd.benefits && (
            <div className="mb-24">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-brand-650 font-bold text-xs uppercase tracking-widest block mb-2 font-mono">{lpd.benefits.subtitle || "I Nostri Punti di Forza"}</span>
                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">{lpd.benefits.title || "Perché Questo Percorso è Diverso Da Tutti"}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(lpd.benefits.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-brand-50 text-brand-600 h-10 w-10 rounded-xl flex items-center justify-center mb-4 border border-brand-100">
                      {renderLucideIcon(item.icon, "h-5 w-5")}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CURRICULUM ACCORDION (REAL DATA) */}
          <div className="mb-24 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <span className="text-brand-600 font-bold text-xs uppercase tracking-widest block mb-2 font-mono">Didattica d'Elite</span>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">{course.program_title || "Programma Didattico Dettagliato"}</h2>
              <p className="text-sm text-slate-500 mt-2">Dalla teoria alla pratica reale: ecco l'elenco dei moduli che affronterai.</p>
            </div>

            <div className="space-y-3 max-w-4xl mx-auto">
              {!course.lessons_content || course.lessons_content.length === 0 ? (
                <p className="text-center text-slate-400 py-4">In arrivo...</p>
              ) : (
                course.lessons_content.map((lesson, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-slate-50 opacity-90 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 bg-slate-200 text-slate-600 font-bold rounded-lg flex items-center justify-center text-xs">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {lesson.title}
                        </h4>
                        {lesson.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lesson.description}</p>}
                      </div>
                    </div>
                    <Lock className="h-4 w-4 text-slate-400 shrink-0 ml-4 font-normal" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TESTIMONIALS */}
          {lpd.testimonials && lpd.testimonials.length > 0 && (
            <div className="mb-24">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-amber-500 font-bold text-xs uppercase tracking-widest block mb-2 font-mono">Successi Reali</span>
                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Cosa dicono i nostri studenti dell'Academy</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {lpd.testimonials.map((t: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between whitespace-pre-wrap relative">
                    <span className="absolute top-4 right-6 text-7xl font-serif text-slate-100 select-none pointer-events-none">“</span>
                    <div className="relative z-10">
                      <StarRating rating={5.0} />
                      <p className="text-slate-600 text-sm italic leading-relaxed mt-4 mb-6">"{t.text}"</p>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 font-bold text-sm flex items-center justify-center border border-brand-100">
                        {t.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{t.name}</h5>
                        <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase text-[8px]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRAINER BIO */}
          {lpd.host_bio && (
            <div className="mb-24 bg-slate-900 text-slate-100 p-8 sm:p-12 rounded-3xl relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center relative z-10">
                <div className="lg:col-span-1 flex justify-center">
                  <div className="h-28 w-28 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 select-none text-brand-400 font-black text-4xl shadow-inner">
                    MWA
                  </div>
                </div>
                <div className="lg:col-span-3 space-y-4">
                  <span className="text-brand-400 font-bold text-xs uppercase tracking-widest font-mono">Insegnante Straordinario</span>
                  <h3 className="text-2xl sm:text-3xl font-black">{lpd.host_bio.name}</h3>
                  <p className="text-brand-300 text-sm font-semibold tracking-wide">{lpd.host_bio.headline}</p>
                  
                  <div className="space-y-3 pt-2 text-slate-350 text-sm leading-relaxed max-w-2xl">
                    {(lpd.host_bio.bio_paragraphs || []).map((p: string, idx: number) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ SECTION */}
          {lpd.faq && lpd.faq.length > 0 && (
            <div className="mb-24 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-indigo-500 font-bold text-xs uppercase tracking-widest block mb-2 font-mono">Domande Frequenti</span>
                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Dubbi o Domande? Trova Risposta All'istante</h2>
              </div>

              <div className="space-y-3">
                {lpd.faq.map((fq: any, idx: number) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden transition-all duration-200">
                      <button 
                        onClick={() => setActiveFaq(isOpen ? null : idx)} 
                        className="w-full p-5 flex justify-between items-center text-left font-bold text-slate-900 hover:bg-slate-50/50 transition-colors cursor-pointer text-sm"
                      >
                        <span>{fq.question}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500 font-normal" /> : <ChevronDown className="h-4 w-4 text-slate-500 font-normal" />}
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/30">
                          {fq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

            {/* SEZIONE SPECIALE: IL POTENZIALE RIVOLUZIONARIO DEL WEB DESIGN CON IA IN ITALIA */}
          <div className="my-28 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-14 relative overflow-hidden border border-slate-800 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_50%)] pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <style>{`
              @keyframes autoScrollBgPizza {
                0%, 100% { transform: translateY(0); }
                45%, 55% { transform: translateY(-48%); }
              }
              @keyframes autoScrollBgHair {
                0%, 100% { transform: translateY(0); }
                45%, 55% { transform: translateY(-45%); }
              }
              @keyframes autoScrollBgBeauty {
                0%, 100% { transform: translateY(0); }
                45%, 55% { transform: translateY(-50%); }
              }
              @keyframes autoScrollBgDentist {
                0%, 100% { transform: translateY(0); }
                45%, 55% { transform: translateY(-44%); }
              }
              @keyframes autoScrollBgAgency {
                0%, 100% { transform: translateY(0); }
                45%, 55% { transform: translateY(-46%); }
              }
              .scroll-pizza { animation: autoScrollBgPizza 14s ease-in-out infinite; }
              .scroll-hair { animation: autoScrollBgHair 15s ease-in-out infinite; }
              .scroll-beauty { animation: autoScrollBgBeauty 16s ease-in-out infinite; }
              .scroll-dentist { animation: autoScrollBgDentist 13s ease-in-out infinite; }
              .scroll-agency { animation: autoScrollBgAgency 14s ease-in-out infinite; }
              .scroll-pause:hover { animation-play-state: paused; }
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="relative z-10 max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-400 rounded-full text-[11px] font-bold uppercase tracking-widest border border-brand-500/20 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
                  Siti Web ad Alta Conversione • No SaaS o App Complesse
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  Costruisci Veri Siti Web Commerciali con Google AI Studio
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-4 max-w-3xl mx-auto font-normal leading-relaxed">
                  <span className="text-brand-350 font-bold">Nota importante:</span> Questo percorso è focalizzato al 100% sulla creazione di <strong className="text-white">Siti Web Commerciali d'Elite</strong> per piccole e medie imprese locali, non su complesse applicazioni web o software SaaS. 
                  Insegna le competenze esatte per sviluppare, impaginare e vendere soluzioni web da <strong className="text-emerald-400 font-extrabold">€1.000 a €2.000</strong> a progetto con spese operative pari a zero per te!
                </p>
              </div>

              {/* Due Grandi Opportunità di Business: PMIs vs Freelance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* 1. Piccola Impresa Italiana */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 hover:border-brand-500/40 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest bg-brand-950 border border-brand-905/30 px-3 py-1 rounded-full">
                        Per Piccole Imprese Locali
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
                      Digitalizza la Tua Attività in Autonomia
                    </h3>
                    <p className="text-slate-350 text-sm leading-relaxed mb-6 font-normal">
                      Se hai un ristorante, una pizzeria, un salone o sei un medico, <strong className="text-brand-300">crea da solo il tuo sito web in meno di 1 ora</strong>. Non farti prosciugare migliaia di euro da agenzie esterne per modifiche banali che puoi controllare in pochi click.
                    </p>
                    <ul className="space-y-3.5 text-xs text-slate-300 mb-6">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span><strong>Controllo Totale:</strong> Cambia prezzi dei menu, orari, trattamenti o contatti istantaneamente grazie alla flessibilità di Google AI Studio.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span><strong>Layout Professionale Magnifico:</strong> Ottieni un design che infonde fiducia cieca rispetto a vecchi siti obsoleti degli anni 2000.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-800/80 pt-5 text-slate-400 text-xs italic">
                    Perfetto per: Ristoranti, Pizzerie, Parrucchiere, Centri Estetici, Dentisti e Studi Professionali.
                  </div>
                </div>

                {/* 2. Freelance / Aspirante Web Designer */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 border border-emerald-905/30 px-3 py-1 rounded-full">
                        Business Modello ad Alto Margine
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3">
                      Crea e Vendi Siti da €1.000 — €2.000
                    </h3>
                    <p className="text-slate-350 text-sm leading-relaxed mb-6 font-normal">
                      Sfrutta l'incredibile fame di digitalizzazione in Italia. Imparando a governare l'IA sarai in grado di fornire a commercianti e aziende locali siti web pazzeschi in tempi record, <strong className="text-emerald-400">intasgando il 99% dei margini</strong> grazie a costi di hosting zero.
                    </p>
                    <ul className="space-y-3.5 text-xs text-slate-300 mb-6">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span><strong>Sviluppo a Tempo di Record:</strong> Consegna siti completi in 48 ore lavorative invece di mesi di attesa.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span><strong>Costo Strumenti = Zero:</strong> Sfrutta l'hosting gratuito di Firebase e Google Cloud Run per non pagare canoni fissi sulle tue demo.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-800/80 pt-5 text-slate-450 text-[11px] italic flex justify-between items-center">
                    <span>Monetizzazione Target: da €3.000 a €6.000/mese</span>
                    <span className="text-emerald-400 font-bold text-xs">Profitto Puro</span>
                  </div>
                </div>
              </div>

              {/* LIVE WEBSITES SIMULATOR BLOCK */}
              <div className="space-y-8 mt-16">
                <div className="text-center max-w-2xl mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    Simulatore Live di Siti Web Realizzabili con l'IA
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Usa le schede, <strong className="text-brand-400">scorri lateralmente</strong> o clicca sulle <strong className="text-brand-400">frecce ai lati</strong> per cambiare sito web. I layout sottostanti sono completi e scorrono in automatico per farti apprezzare l'incredibile cura dei dettagli reale!
                  </p>
                </div>

                {/* Tab selector */}
                <div className="flex overflow-x-auto md:flex-wrap items-center md:justify-center gap-2 max-w-4xl mx-auto bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-xl no-scrollbar scroll-smooth snap-x snap-mandatory">
                  {activeShowcases.map((tab: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMockup(idx)}
                      className={`flex-none md:flex-1 min-w-[140px] md:min-w-[130px] py-2 px-3 rounded-xl transition-all duration-300 text-center snap-center ${
                        activeMockup === idx
                          ? "bg-brand-600 text-white font-extrabold shadow-md transform scale-102 border border-brand-500"
                          : "bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850"
                      }`}
                    >
                      <div className="text-xs truncate max-w-[155px] mx-auto">{tab.title || tab.label}</div>
                      <div className="text-[9px] opacity-70 font-mono tracking-tight font-normal truncate max-w-[155px] mx-auto">{tab.subtitle}</div>
                    </button>
                  ))}
                </div>

                {/* Simulated Macbook Browser Frame */}
                <div className="max-w-4xl mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative [perspective:1400px]">
                  {/* Browser Header Bar */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                      <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                    </div>
                    {/* URL Bar */}
                    <div className="bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-850/60 font-mono text-center text-xs text-slate-400 w-full max-w-sm sm:max-w-md mx-6 truncate select-all flex items-center justify-center gap-1.5 shadow-inner">
                      <span className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-emerald-950 rounded border border-emerald-900/50">SSL</span>
                      <span>
                        {activeShowcaseItem?.url || `https://www.${activeShowcaseItem?.subtitle?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'website'}.it`}
                      </span>
                    </div>
                    {/* Empty block to balance layout */}
                    <div className="text-[10px] text-slate-500 font-bold shrink-0 hidden sm:block uppercase tracking-wider bg-slate-950 px-2.5 py-1 rounded border border-slate-800 select-none">
                      AI Studio Mockup
                    </div>
                  </div>

                  {/* Browser Viewport */}
                  <div 
                    className="relative bg-white text-slate-800 h-[480px] overflow-hidden group touch-pan-y"
                    onTouchStart={(e) => {
                      touchStartX.current = e.touches[0].clientX;
                    }}
                    onTouchEnd={(e) => {
                      if (touchStartX.current === null) return;
                      const touchEndX = e.changedTouches[0].clientX;
                      const diffX = touchStartX.current - touchEndX;
                      // Threshold of 50px for swipe gesture
                      if (Math.abs(diffX) > 50) {
                        if (diffX > 0) {
                          // Swipe left -> next mockup
                          setActiveMockup((prev) => (prev + 1) % activeShowcases.length);
                        } else {
                          // Swipe right -> prev mockup
                          setActiveMockup((prev) => (prev - 1 + activeShowcases.length) % activeShowcases.length);
                        }
                      }
                      touchStartX.current = null;
                    }}
                  >
                    {/* Float prev/next buttons for desktop & mobile accessibility */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMockup((prev) => (prev - 1 + activeShowcases.length) % activeShowcases.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-slate-950/80 hover:bg-slate-950 text-white p-2.5 rounded-full border border-slate-800 hover:border-slate-700 shadow-2xl cursor-pointer transition-all duration-200 backdrop-blur-md opacity-80 hover:opacity-100 md:opacity-0 group-hover:opacity-100 flex items-center justify-center focus:outline-none"
                      title="Sito precedente"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMockup((prev) => (prev + 1) % activeShowcases.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-40 bg-slate-950/80 hover:bg-slate-950 text-white p-2.5 rounded-full border border-slate-800 hover:border-slate-700 shadow-2xl cursor-pointer transition-all duration-200 backdrop-blur-md opacity-80 hover:opacity-100 md:opacity-0 group-hover:opacity-100 flex items-center justify-center focus:outline-none"
                      title="Sito successivo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {activeShowcaseItem && (activeShowcaseItem.custom_html || activeShowcaseItem.url || activeShowcaseItem.builtinIndex === undefined) ? (
                      <div className="w-full h-full bg-white relative">
                        {activeShowcaseItem.custom_html ? (
                          <iframe
                            srcDoc={activeShowcaseItem.custom_html}
                            className="w-full h-full border-0 bg-white"
                            title={activeShowcaseItem.title}
                            sandbox="allow-scripts allow-same-origin"
                          />
                        ) : (
                          <iframe
                            src={activeShowcaseItem.url}
                            className="w-full h-full border-0 bg-white"
                            title={activeShowcaseItem.title}
                            sandbox="allow-scripts allow-same-origin"
                          />
                        )}
                      </div>
                    ) : (
                      /* Auto-scrolling interactive content container */
                      <div 
                        className={`w-full absolute top-0 left-0 scroll-pause ${
                          activeShowcaseItem?.builtinIndex === 0 ? "scroll-pizza" :
                          activeShowcaseItem?.builtinIndex === 1 ? "scroll-hair" :
                          activeShowcaseItem?.builtinIndex === 2 ? "scroll-beauty" :
                          activeShowcaseItem?.builtinIndex === 3 ? "scroll-dentist" :
                          "scroll-agency"
                        }`}
                      >
                        {/* SITE 0: PIZZERIA */}
                        {activeShowcaseItem?.builtinIndex === 0 && (
                        <div className="bg-slate-50 text-slate-850 font-sans">
                          {/* Site Header */}
                          <div className="bg-amber-600 text-white text-center py-2 px-4 text-[10px] uppercase font-bold tracking-widest">
                            🔥 CONSEGNA A DOMICILIO GRATUITA STASERA CON CODICE "PIZZA_IA"
                          </div>
                          <div className="bg-white/95 sticky top-0 border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm z-50">
                            <span className="font-extrabold text-base tracking-tight text-amber-600">🍕 FORNACE & BASILICO</span>
                            <div className="hidden sm:flex items-center gap-5 text-xs text-slate-600 font-bold">
                              <span>IL MENU</span>
                              <span>CHI SIAMO</span>
                              <span>PROMOZIONI</span>
                              <span className="bg-amber-500 text-white px-3 py-1.5 rounded-lg">PRENOTA</span>
                            </div>
                          </div>

                          {/* Site Hero */}
                          <div className="relative bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-8 py-16 text-center border-b border-slate-100">
                            <span className="inline-block bg-amber-500/15 text-amber-800 text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full mb-3">
                              Lievitazione Naturale 48 Ore
                            </span>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                              La Vera Pizza Napoletana Gourmet a Casa Tua
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                              Lavoriamo unicamente con farine biologiche macinate a pietra, pomodoro San Marzano DOP e mozzarella di bufala campana fresca ogni mattina.
                            </p>
                            <div className="flex justify-center gap-3 mt-6">
                              <span className="bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">Sfoglia il Menu</span>
                              <span className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-xs font-bold">Chiama Subito</span>
                            </div>
                          </div>

                          {/* Site Interactive Menu */}
                          <div className="p-8 space-y-6 bg-white">
                            <h2 className="text-center text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Le Nostre Specialità d'Elite</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-100 flex items-start gap-3 transition-colors">
                                <span className="text-2xl">🍕</span>
                                <div className="flex-1">
                                  <div className="flex justify-between font-bold text-xs text-slate-900">
                                    <span>Margherita di Bufala</span>
                                    <span className="text-amber-600">€8,50</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1">Pomodoro San Marzano DOP, mozzarella di bufala, basilico fresco, olio EVO.</p>
                                </div>
                              </div>
                              <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-100 flex items-start gap-3 transition-colors">
                                <span className="text-2xl">🥑</span>
                                <div className="flex-1">
                                  <div className="flex justify-between font-bold text-xs text-slate-900">
                                    <span>Pistacchiosa DOP</span>
                                    <span className="text-amber-600">€12,50</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1">Pesto di pistacchi di Bronte, fior di latte, mortadella IGP, granella e burrata intera.</p>
                                </div>
                              </div>
                              <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-100 flex items-start gap-3 transition-colors">
                                <span className="text-2xl">🌶️</span>
                                <div className="flex-1">
                                  <div className="flex justify-between font-bold text-xs text-slate-900">
                                    <span>Diavola Rustica</span>
                                    <span className="text-amber-600">€9,50</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1">Pomodoro San Marzano DOP, fior di latte, spianata calabrese piccante, olive nere.</p>
                                </div>
                              </div>
                              <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-100 flex items-start gap-3 transition-colors">
                                <span className="text-2xl">🍄</span>
                                <div className="flex-1">
                                  <div className="flex justify-between font-bold text-xs text-slate-900">
                                    <span>Funghi e Tartufo</span>
                                    <span className="text-amber-600">€13,00</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1">Salsa tartufata, scamorza affumicata, porcini freschi saltati, scaglie di grana.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Site Table Booking Form */}
                          <div className="p-8 bg-amber-500/5 border-t border-b border-slate-100">
                            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-lg">
                              <h3 className="text-sm font-bold text-center text-slate-950 mb-4">Riserva il tuo Tavolo in tempo reale</h3>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 mb-1">Nome Completo</label>
                                  <input type="text" placeholder="Mario Rossi" disabled className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] py-1.5 px-3 rounded-lg" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-1">Data</label>
                                    <input type="date" value="2026-06-10" disabled className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] py-1.5 px-3 rounded-lg" />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-1">Orario</label>
                                    <select disabled className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] py-1.5 px-3 rounded-lg">
                                      <option>20:30 (Consigliato)</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 mb-1">Numero Personaggi</label>
                                  <input type="number" value="4" disabled className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] py-1.5 px-3 rounded-lg" />
                                </div>
                                <button disabled className="w-full bg-amber-500 text-white font-extrabold text-[11px] py-2 px-4 rounded-lg shadow mt-2">
                                  Verifica Disponibilità & Prenota su WhatsApp
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Site Footer */}
                          <div className="bg-slate-900 text-slate-400 py-10 px-8 text-center text-xs">
                            <p className="font-bold text-white mb-2">Pizzeria Fornace & Basilico Gourmet</p>
                            <p className="text-[10px] text-slate-500">Via Toledo 44, 80134 Napoli | Tel: +39 081 2345 678</p>
                            <p className="text-[9px] text-slate-600 mt-6 shadow-sm">© {new Date().getFullYear()} Fornace & Basilico. Tutti i diritti riservati.</p>
                          </div>
                        </div>
                      )}

                      {/* SITE 1: PARRUCCHIERA */}
                      {activeShowcaseItem?.builtinIndex === 1 && (
                        <div className="bg-stone-50 text-stone-850 font-sans">
                          {/* Site Header */}
                          <div className="bg-rose-50 border-b border-rose-100/60 px-6 py-4 flex items-center justify-between">
                            <span className="font-serif italic font-black text-rose-700 tracking-wide">✂️ SARTORIALE HAIR SPA</span>
                            <div className="hidden sm:flex items-center gap-5 text-xs text-stone-600 font-bold uppercase tracking-wider">
                              <span>Servizi</span>
                              <span>Galleria</span>
                              <span>Filosofia</span>
                              <span className="border-b-2 border-rose-600 text-rose-700 pb-0.5">PRENOTA LIVE</span>
                            </div>
                          </div>

                          {/* Site Hero */}
                          <div className="bg-stone-100 px-8 py-16 text-center border-b border-stone-200">
                            <span className="inline-block bg-rose-100 text-rose-800 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-3">
                              Luxury Hair Stylist Milano
                            </span>
                            <h1 className="font-serif italic text-3xl font-black text-stone-900 leading-tight">
                              Definisci la Tua Unicità. Valorizza il Tuo Stile.
                            </h1>
                            <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                              Sperimenta trattamenti mirati per la rigenerazione profonda del capello, abbinati a tagli sartoriali studiati sulla base dell'analisi morfologica del viso.
                            </p>
                          </div>

                          {/* Services list with prices */}
                          <div className="p-8 space-y-6 bg-white">
                            <h2 className="font-serif italic text-center text-lg font-bold text-stone-950">Il Listino dei Servizi d'Elite</h2>
                            <div className="space-y-4">
                              <div className="border-b border-stone-100 pb-3 flex justify-between items-end gap-4">
                                <div>
                                  <span className="text-xs font-bold text-stone-900 block">Sinfonia Taglio & Piega Classica</span>
                                  <span className="text-[10px] text-stone-500">Comprensivo di shampoo purificante biologico ed impacco lenitivo.</span>
                                </div>
                                <span className="font-serif italic font-bold text-rose-700 shrink-0 text-sm">€45,00</span>
                              </div>
                              <div className="border-b border-stone-100 pb-3 flex justify-between items-end gap-4">
                                <div>
                                  <span className="text-xs font-bold text-stone-900 block">Balayage & Riflessi di Sole</span>
                                  <span className="text-[10px] text-stone-500">Schiariture ad alta definizione eseguite a mano libera con infuso di seta idratante.</span>
                                </div>
                                <span className="font-serif italic font-bold text-rose-700 shrink-0 text-sm">€120,00</span>
                              </div>
                              <div className="border-b border-stone-100 pb-3 flex justify-between items-end gap-4">
                                <div>
                                  <span className="text-xs font-bold text-stone-900 block">Rituale Ricostruzione Keratina Pura</span>
                                  <span className="text-[10px] text-stone-500">Trattamento termico profondo per eliminare il crespo e ridonare volume estremo.</span>
                                </div>
                                <span className="font-serif italic font-bold text-rose-700 shrink-0 text-sm">€75,00</span>
                              </div>
                            </div>
                          </div>

                          {/* Hair Salon Calendar Schedule */}
                          <div className="p-8 bg-rose-50/20 border-t border-neutral-100">
                            <div className="max-w-md mx-auto bg-white p-5 rounded-xl border border-stone-150 shadow">
                              <h3 className="text-xs font-bold text-stone-900 mb-3 text-center uppercase tracking-widest">Seleziona data ed ora per il salone</h3>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-stone-50 p-2.5 rounded border border-stone-200 text-center text-xs">
                                  <span className="block text-[8px] uppercase text-stone-400 font-bold">Giovedì</span>
                                  <span className="font-bold text-stone-900 text-xs">11 Giugno</span>
                                </div>
                                <div className="bg-rose-50/50 p-2.5 rounded border border-rose-200 text-center text-xs">
                                  <span className="block text-[8px] uppercase text-rose-600 font-bold">Venerdì</span>
                                  <span className="font-bold text-rose-705 text-xs">12 Giugno</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 mb-4">
                                <span className="bg-stone-50 border border-stone-200 text-stone-600 rounded text-[9px] py-1 text-center font-bold">09:30</span>
                                <span className="bg-rose-600 text-white rounded text-[9px] py-1 text-center font-bold shadow-sm">11:00</span>
                                <span className="bg-stone-50 border border-stone-200 text-stone-600 rounded text-[9px] py-1 text-center font-bold">14:30</span>
                              </div>
                              <button disabled className="w-full bg-rose-700 text-white font-bold text-[10px] py-2 px-3 rounded uppercase tracking-wider">
                                Blocca il Tuo Appuntamento Elite
                              </button>
                            </div>
                          </div>

                          {/* Site Footer */}
                          <div className="bg-stone-900 text-stone-400 py-10 px-8 text-center text-xs">
                            <p className="font-serif italic font-bold text-white mb-1 mb-2">Taglio Sartoriale & Hair Spa</p>
                            <p className="text-[10px] text-stone-500">Corso Como 12, 20154 Milano | Tel/WhatsApp: +39 02 9876 543</p>
                            <p className="text-[9px] text-stone-600 mt-6">© {new Date().getFullYear()} Taglio Sartoriale. Tutti i diritti riservati.</p>
                          </div>
                        </div>
                      )}

                      {/* SITE 2: SALONE DI BELLEZZA */}
                      {activeShowcaseItem?.builtinIndex === 2 && (
                        <div className="bg-[#fbfcfa] text-slate-800 font-sans">
                          {/* Site Header */}
                          <div className="bg-[#123026] text-white py-1.5 px-4 text-center text-[10px] tracking-widest uppercase">
                            🌿 BEAUTY REVOLUTION: TRATTAMENTI CLINICI BIOAVANZATI
                          </div>
                          <div className="bg-white/95 sticky top-0 border-b border-[#ebefe9] px-6 py-4 flex items-center justify-between">
                            <span className="font-serif font-black text-lg text-[#123026] tracking-tight">⭐ AURA BEAUTY LAB</span>
                            <div className="hidden sm:flex items-center gap-5 text-xs text-[#204136] font-bold">
                              <span>Viso</span>
                              <span>Corpo</span>
                              <span>Tecnologie</span>
                              <span className="bg-[#123026] text-white px-3 py-1.5 rounded">Consulenza Gratuita</span>
                            </div>
                          </div>

                          {/* Site Hero */}
                          <div className="bg-[#f4f7f2] px-8 py-16 text-center border-b border-[#ebefe9]">
                            <span className="inline-block bg-[#123026]/10 text-[#123026] text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-3">
                              Estetica Clinica di Lusso
                            </span>
                            <h1 className="font-serif text-3xl font-extrabold text-[#123026] tracking-tight leading-tight">
                              L'Arte Di Volersi Bene Con Trattamenti Sinergici
                            </h1>
                            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                              Rivoluzioniamo l'estetica tradizionale con tecnologie certificate FDA e linee cosmetiche prive di parabeni per risultati effettivi fin dalla prima seduta.
                            </p>
                          </div>

                          {/* Beauty Selector cards */}
                          <div className="p-8 space-y-6 bg-white">
                            <h2 className="text-center font-serif text-lg font-bold text-[#123026]">Tecnologie Viso & Corpo d'Avanguardia</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="bg-[#fbfcfa] border border-[#ebefe9] p-4 rounded-xl text-center">
                                <span className="text-2xl block mb-2">⭐</span>
                                <span className="text-xs font-bold text-slate-900 block">Trattamento Gold</span>
                                <p className="text-[9px] text-slate-500 mt-1">Idratazione molecolare profonda con oro 24k.</p>
                                <span className="text-xs font-extrabold text-[#123026] block mt-2">€90,00</span>
                              </div>
                              <div className="bg-[#fbfcfa] border border-[#ebefe9] p-4 rounded-xl text-center">
                                <span className="text-2xl block mb-2">⚡</span>
                                <span className="text-xs font-bold text-slate-900 block">Laser Diodo</span>
                                <p className="text-[9px] text-slate-500 mt-1">Epilazione laser progressiva medicale indolore.</p>
                                <span className="text-xs font-extrabold text-[#123026] block mt-2">€120,00</span>
                              </div>
                              <div className="bg-[#fbfcfa] border border-[#ebefe9] p-4 rounded-xl text-center">
                                <span className="text-2xl block mb-2">💆</span>
                                <span className="text-xs font-bold text-slate-900 block">Linfodrenaggio</span>
                                <p className="text-[9px] text-slate-500 mt-1">Massaggio corporale con oli essenziali biologici.</p>
                                <span className="text-xs font-extrabold text-[#123026] block mt-2">€65,00</span>
                              </div>
                            </div>
                          </div>

                          {/* Skin Advisor Form */}
                          <div className="p-8 bg-[#f4f7f2] border-t border-[#ebefe9]">
                            <div className="max-w-md mx-auto bg-white p-5 rounded-2xl border border-[#ebefe9] shadow">
                              <h3 className="text-sm font-bold text-center text-[#123026] mb-3 font-serif">Richiedi Analisi Viso Digitale Gratuita</h3>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[9px] font-bold text-[#204136] mb-1">Inestetismo che desideri trattare</label>
                                  <select disabled className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] py-1.5 px-3 rounded-lg">
                                    <option>Rughe & Linee Sottili (Antietà)</option>
                                    <option>Macchie cutanee & Iperpigmentazione</option>
                                    <option>Acne & Imperfezioni Pelle Grassa</option>
                                  </select>
                                </div>
                                <button disabled className="w-full bg-[#123026] hover:bg-[#1f4a3c] text-white font-serif font-bold text-xs py-2 px-4 rounded-lg shadow">
                                  Richiedi Consulenza Gratuita
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Site Footer */}
                          <div className="bg-[#123026] text-white/70 py-10 px-8 text-center text-xs">
                            <p className="font-serif font-bold text-white mb-1">Aura Aesthetic Lab</p>
                            <p className="text-[10px] text-white/50">Via dei Condotti 89, 00187 Roma | Telefono: +39 06 6543 210</p>
                            <p className="text-[9px] text-white/30 mt-6">© {new Date().getFullYear()} Aura Beauty. Tutti i diritti riservati.</p>
                          </div>
                        </div>
                      )}

                      {/* SITE 3: STUDIO MEDICO DENTISTICO */}
                      {activeShowcaseItem?.builtinIndex === 3 && (
                        <div className="bg-slate-50 text-slate-800 font-sans">
                          {/* Site Header */}
                          <div className="bg-sky-700 text-white text-center py-2 px-4 text-[9px] uppercase font-bold tracking-widest">
                            🚨 SERVIZIO PRONTO SOCCORSO DENTISTICO ATTIVO H24: +39 06 11122233
                          </div>
                          <div className="bg-white/95 sticky top-0 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <span className="font-black text-sky-800 tracking-tight flex items-center gap-1">🔬 STUDIO SORRISO FUTURO</span>
                            <div className="hidden sm:flex items-center gap-5 text-xs text-sky-950 font-bold">
                              <span>Trattamenti</span>
                              <span>Staff</span>
                              <span>Casi Clinici</span>
                              <span className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs">CHIEDI CONSULENZA</span>
                            </div>
                          </div>

                          {/* Site Hero */}
                          <div className="bg-sky-50 px-8 py-16 text-center border-b border-sky-100">
                            <span className="inline-block bg-sky-100 text-sky-800 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-3">
                              Studio Odontoiatrico Convenzionato Roma
                            </span>
                            <h1 className="text-3xl font-extrabold text-sky-950 tracking-tight leading-tight">
                              La Salute Dei Tuoi Denti, Progettata Con Tecnologie Digitali.
                            </h1>
                            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                              Utilizziamo radiografia 3D a bassissima emissione e impianti dentali personalizzati al computer per minimizzare il dolore ed i tempi di recupero post-intervento.
                            </p>
                          </div>

                          {/* Interactive treatments */}
                          <div className="p-8 space-y-6 bg-white">
                            <h2 className="text-center text-lg font-bold text-sky-950">Le Nostre Attività Cliniche Principali</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <span className="text-[10px] font-bold text-sky-600 tracking-widest block uppercase">01 / Implantologia</span>
                                <span className="text-xs font-extrabold text-slate-900 block mt-1">Impianti hitech mini-invasivi</span>
                                <p className="text-[10px] text-slate-500 mt-1">Nessun bisturi necessario per la maggior parte dei casi clinici controllati via software.</p>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                <span className="text-[10px] font-bold text-sky-600 tracking-widest block uppercase">02 / Allineamento</span>
                                <span className="text-xs font-extrabold text-slate-900 block mt-1">Invisalign® Platinum Elite Provider</span>
                                <p className="text-[10px] text-slate-500 mt-1">Sostituisci l'antico apparecchio di ferro con mascherine totalmente invisibili in resina termoplastica.</p>
                              </div>
                            </div>
                          </div>

                          {/* Site urgency ticket */}
                          <div className="p-8 bg-sky-50/20 border-t border-sky-100 text-center">
                            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-sky-100 shadow-lg">
                              <h3 className="text-xs font-bold text-sky-950 mb-2 uppercase tracking-wider">Hai bisogno di un controllo gratuito o d'urgenza?</h3>
                              <p className="text-[10px] text-slate-500 mb-4">Compila per ricevere priorità immediata.</p>
                              <div className="space-y-3">
                                <input type="text" placeholder="Nome Completo" disabled className="w-full bg-slate-50 border border-slate-200 text-[10px] py-1.5 px-3 rounded-lg" />
                                <input type="phone" placeholder="Cellulare per Conferma WhatsApp" disabled className="w-full bg-slate-50 border border-slate-200 text-[10px] py-1.5 px-3 rounded-lg" />
                                <button disabled className="w-full bg-sky-700 text-white font-bold text-xs py-2 px-4 rounded-lg">
                                  Invia Richiesta Prenotazione h24
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Site Footer */}
                          <div className="bg-slate-900 text-slate-400 py-10 px-8 text-center text-xs">
                            <p className="font-bold text-white mb-2">Studio Sorriso Futuro e Associazioni Partner</p>
                            <p className="text-[10px] text-slate-500">Piazza del Popolo 3, 00187 Roma | Centralino Emergenze: +39 06 111 222 33</p>
                            <p className="text-[9px] text-slate-600 mt-6">© {new Date().getFullYear()} Studio Sorriso Futuro. Tutti i diritti riservati.</p>
                          </div>
                        </div>
                      )}

                      {/* SITE 4: CREATIVE DESIGN STUDIO */}
                      {activeShowcaseItem?.builtinIndex === 4 && (
                        <div className="bg-[#0c0d10] text-[#dedee5] font-sans">
                          {/* Site Header */}
                          <div className="bg-white text-black py-4 px-8 flex items-center justify-between">
                            <span className="font-mono tracking-[4px] font-black text-sm">💡 LUCE STUDIO CREATIVO</span>
                            <div className="hidden sm:flex items-center gap-6 text-[10px] font-mono font-bold tracking-widest uppercase">
                              <span>PORTFOLIO</span>
                              <span>CHI SIAMO</span>
                              <span className="bg-black text-white px-3 py-1.5">CONTATTACI</span>
                            </div>
                          </div>

                          {/* Site Hero */}
                          <div className="px-8 py-20 text-center border-b border-zinc-900 bg-zinc-950">
                            <span className="inline-block bg-white text-black text-[9px] font-mono tracking-widest px-3 py-1 uppercase mb-3">
                              Web Photography & Branding
                            </span>
                            <h1 className="text-3xl font-bold tracking-tighter text-white uppercase leading-none font-serif">
                              Infonderemo la Luce Giusta al Tuo Brand.
                            </h1>
                            <p className="text-xs text-zinc-400 mt-3 max-w-sm mx-auto leading-relaxed font-mono">
                              Studio fotografico d'avanguardia specializzato in cataloghi commerciali per abbigliamento, e-commerce e brand di moda internazionali.
                            </p>
                          </div>

                          {/* Photo showcase project list */}
                          <div className="p-8 space-y-6 bg-black">
                            <h2 className="text-center font-serif text-lg font-bold text-white uppercase tracking-widest">Le Nostre Campagne Principali</h2>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-zinc-900/60 p-4 border border-zinc-800/80 rounded-lg">
                                <span className="font-mono text-[9px] text-zinc-500 block">SARTORIA MILANESE</span>
                                <span className="text-xs font-bold text-white block mt-1">Campagna Autunno Inverno 2026</span>
                                <div className="text-[9px] text-zinc-400 mt-2 italic">Valore Progetto: €12.500</div>
                              </div>
                              <div className="bg-zinc-900/60 p-4 border border-zinc-800/80 rounded-lg">
                                <span className="font-mono text-[9px] text-zinc-500 block">E-COMMERCE FRAGRANCE</span>
                                <span className="text-xs font-bold text-white block mt-1">Branding Visual Profumo "Aether"</span>
                                <div className="text-[9px] text-zinc-400 mt-2 italic">Valore Progetto: €8.900</div>
                              </div>
                            </div>
                          </div>

                          {/* Project Contact form */}
                          <div className="p-8 bg-zinc-950 border-t border-zinc-900">
                            <div className="max-w-md mx-auto bg-black p-5 rounded-2xl border border-zinc-900 shadow">
                              <h3 className="text-xs font-mono font-bold text-center text-white mb-3 tracking-widest uppercase">Dai Vita al Tuo Progetto</h3>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[8px] font-mono text-zinc-500 mb-1 uppercase tracking-widest">Servizio Richiesto</label>
                                  <select disabled className="w-full bg-zinc-900 border border-zinc-850 text-stone-200 text-[10px] py-1.5 px-3 rounded-lg">
                                    <option>Photoshoot Commerciale Moda</option>
                                    <option>Visual Identity & Logo Design</option>
                                    <option>Campagna Pubblicitaria Instagram & TikTok</option>
                                  </select>
                                </div>
                                <button disabled className="w-full bg-white text-black font-mono font-extrabold text-[10px] py-2 px-4 rounded uppercase tracking-wider">
                                  Invia Briefing Creativo
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Site Footer */}
                          <div className="bg-black text-zinc-500 py-10 px-8 text-center text-xs border-t border-zinc-900">
                            <p className="font-mono text-white mb-2 uppercase tracking-wide">LUCE Studio Fotografico & Creativo</p>
                            <p className="text-[10px] text-zinc-600">San Frediano, 50124 Firenze | Email: hello@lucestudio.it</p>
                            <p className="text-[9px] text-zinc-700 mt-6">© {new Date().getFullYear()} LUCE Studio. Tutti i diritti riservati.</p>
                          </div>
                        </div>
                      )}
                    </div>
                    )}

                    {/* Auto-scroll active notification pop */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white py-1 px-2.5 rounded-lg text-[9px] font-semibold flex items-center gap-1.5 pointer-events-none shadow backdrop-blur-sm tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>SCORRIMENTO AUTOMATICO LIVE (Sposta il mouse sopra per metterlo in pausa)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* FINAL BOTTOM CARD CALL TO ACTION */}

          {/* FINAL BOTTOM CARD CALL TO ACTION */}
          <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,_var(--tw-gradient-stops)) from-brand-600/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-brand-400 font-bold text-xs uppercase tracking-widest font-mono">Sblocca il tuo potenziale oggi</span>
              <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight">Trasforma le tue competenze in un vero superpotere</h3>
              <p className="text-slate-405 text-sm leading-relaxed max-w-lg mx-auto">Non rimandare la crescita personale. Entra ora nell'Academy e padroneggia le tecnologie di domani con i massimi esperti del settore.</p>
              
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-slate-500 line-through text-lg">€{course.price}</span>
                <span className="text-4xl font-black text-brand-400">€{finalPrice}</span>
              </div>

              {isPurchasable ? (
                <button 
                    onClick={handleBuyNow}
                    disabled={isBuying}
                    className="inline-flex bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold py-4 px-10 text-lg shadow-lg hover:shadow-brand-500/20 transition-all items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                    {isBuying ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Elaborazione ordine...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 fill-current" />
                        Acquista il Percorso d'Elite
                      </>
                    )}
                </button>
              ) : (
                <p className="text-amber-500 font-bold bg-amber-500/10 py-3 px-6 rounded-xl border border-amber-500/20 max-w-sm mx-auto text-sm">
                  Le iscrizioni non sono attualmente disponibili.
                </p>
              )}
            </div>
          </div>

          {/* TIMELINE PROCESSO D'ELITE CON ANIMAZIONI 3D */}
          <div className="my-24">
            <div className="text-center max-w-3xl mx-auto mb-16 px-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-100/80 text-brand-850 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-brand-200">
                <Sparkles className="h-3.5 w-3.5 text-brand-650 animate-pulse" />
                Dall'Iscrizione all'Onboarding: Flusso Automatizzato
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Come Funziona l'Iscrizione ed il Tuo Onboarding
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-2xl mx-auto">
                Un processo impeccabile e automatizzato al millisecondo per iniziare a formarti e fare level-up senza barriere.
              </p>
            </div>

            {/* Grid of Steps with 3D Perspective */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative [perspective:1200px]">
              {/* Timeline Connector Line in Background */}
              <div className="hidden md:block absolute top-[40%] left-[5%] right-[5%] h-1 bg-gradient-to-r from-blue-500 via-indigo-500 via-brand-500 to-emerald-500 opacity-20 -z-0"></div>

              {[
                {
                  step: "01",
                  title: "Pagamento Criptato & Sicuro",
                  desc: "Completa l'iscrizione inserendo i dettagli della carta. Transazione cifrata SSL / Stripe / PayPal con fattura immediata.",
                  icon: <CreditCard className="h-6 w-6 text-white" />,
                  badge: "Stripe & PayPal",
                  color: "from-blue-600 to-indigo-600",
                  shadowColor: "rgba(59,130,246,0.3)",
                  glow: "rgba(59,130,246,0.15)",
                },
                {
                  step: "02",
                  title: "Credential Delivery",
                  desc: "Il nostro sistema automatico genera il tuo account temporaneo entro 3 secondi e ti invia i dati d'accessi via email.",
                  icon: <Mail className="h-6 w-6 text-white" />,
                  badge: "In circa ~3 secondi",
                  color: "from-indigo-600 to-brand-600",
                  shadowColor: "rgba(124,58,237,0.3)",
                  glow: "rgba(124,58,237,0.15)",
                },
                {
                  step: "03",
                  title: "Accesso Accademico Vitalizio",
                  desc: "Accedi da qualsiasi dispositivo alla tua Dashboard d'elite con le credenziali. Tutto il materiale è sbloccato a vita.",
                  icon: <Key className="h-6 w-6 text-white" />,
                  badge: "Disponibilità H24",
                  color: "from-brand-600 to-emerald-600",
                  shadowColor: "rgba(13,148,136,0.3)",
                  glow: "rgba(13,148,136,0.15)",
                },
                {
                  step: "04",
                  title: "Supporto WhatsApp 1-to-1",
                  desc: "Nel corso trovi l'invito alla community e lo speciale contatto WhatsApp diretto del docente Daniel Moise per feedback reali.",
                  icon: <Users className="h-6 w-6 text-white" />,
                  badge: "Linea Diretta Docente",
                  color: "from-emerald-600 to-amber-600",
                  shadowColor: "rgba(16,185,129,0.3)",
                  glow: "rgba(16,185,129,0.15)",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out transform-gpu cursor-pointer hover:-translate-y-4 hover:rotate-x-6 hover:rotate-y-3 flex flex-col justify-between h-[320px] overflow-hidden"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: `0 10px 30px -5px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.01)`,
                  }}
                >
                  {/* Subtle 3D Depth Card Overlay Backdrop Glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${item.glow} 0%, transparent 70%)`
                    }}
                  />

                  {/* Big background number for absolute depth feel */}
                  <span 
                    className="absolute -right-4 -bottom-4 text-7xl font-black text-slate-100/50 select-none group-hover:text-slate-200/70 group-hover:scale-110 transition-all duration-500 pointer-events-none"
                    style={{
                      transform: "translateZ(10px)",
                    }}
                  >
                    {item.step}
                  </span>

                  <div>
                    {/* Icon element floating in 3D */}
                    <div 
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-6 transition-all duration-500 group-hover:scale-110`}
                      style={{
                        transform: "translateZ(30px)",
                        boxShadow: `0 8px 20px ${item.shadowColor}`
                      }}
                    >
                      {item.icon}
                    </div>

                    <div style={{ transform: "translateZ(20px)" }} className="space-y-2">
                      <span className="inline-block bg-slate-100 border border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-950 group-hover:text-brand-700 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Interactive flow navigation helper */}
                  <div 
                    style={{ transform: "translateZ(15px)" }}
                    className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono group-hover:text-slate-600 transition-colors duration-300"
                  >
                    <span>Fase {item.step}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <Footer 
          config={{
            is_visible: true,
            logo_height: 40,
            copyright: `© ${new Date().getFullYear()} Moise Web Academy. Tutti i diritti riservati.`,
            logo_margin_top: 0,
            logo_margin_bottom: 0,
            logo_margin_left: 0,
            logo_margin_right: 0,
            ...settings.landing_page_config?.footer,
          }} 
        />
      </div>
    );
  };

  if (!isPurchased || forceLanding) {
    return renderCourseLandingFunnel();
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        <button 
            onClick={() => {
                if (activeLesson) {
                    setActiveLesson(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    onBack();
                }
            }} 
            className="mb-8 text-gray-500 hover:text-gray-900 font-medium flex items-center"
        >
            ← {activeLesson ? 'Torna al Percorso' : 'Torna ai Percorsi'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 lg:order-2">
                <div className="sticky top-28 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {!activeLesson && (
                        <img src={course.image} alt={course.title} className={`w-full h-48 object-cover ${!isPurchasable && !isPurchased ? 'grayscale-[0.5]' : ''}`} />
                    )}
                    <div className="p-8">
                        {!isPurchased && (
                             <div className="mb-6">
                                {isDiscountAvailable ? (
                                    <>
                                        <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-2 animate-pulse">
                                            <Sparkles className="h-3 w-3 mr-1" /> Offerta Fedeltà Attiva
                                        </div>
                                        <div className="flex items-end">
                                            <span className="text-4xl font-bold text-purple-600">€{finalPrice}</span>
                                            <span className="text-gray-400 ml-2 mb-1 line-through text-lg">€{course.price}</span>
                                            {course.show_discount_badge !== false && (
                                                <span className="ml-3 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                    -{Math.round(((course.price - course.discounted_price!) / course.price) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-end">
                                        <span className="text-4xl font-bold text-gray-900">€{course.price}</span>
                                        <span className="text-gray-400 ml-2 mb-1 line-through">€{course.price * 1.5}</span>
                                        {course.show_discount_badge !== false && (
                                            <span className="ml-3 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                -33%
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {isPurchased ? (
                            <div className="flex flex-col gap-3 mb-4">
                                {!activeLesson ? (
                                    <button 
                                        onClick={startLearning}
                                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
                                    >
                                        <Play className="inline-block h-5 w-5 mr-2 mb-1" /> Inizia Percorso
                                    </button>
                                ) : (
                                    <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm text-center font-bold border border-green-100">
                                        Stai guardando il percorso
                                    </div>
                                )}

                                {/* BLOCCO DOWNLOAD GUIDA (Speciale) */}
                                {isPdfGuideCourse && pdfUrl && (
                                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-brand-50 text-brand-700 py-3 px-4 rounded-xl font-bold hover:bg-brand-100 transition-all flex items-center justify-center gap-2 border border-brand-200">
                                        <Download className="h-5 w-5"/> Scarica Guida PDF
                                    </a>
                                )}
                                
                                {/* BLOCCO DOWNLOAD MATERIALE CORSO (Generico) */}
                                {course.resource_file_url && (
                                    <a 
                                        href={course.resource_file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        download={course.resource_file_name || 'materiale_corso'}
                                        className="w-full bg-blue-50 text-blue-700 py-3 px-4 rounded-xl font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-200"
                                    >
                                        <FileText className="h-5 w-5"/> {isPdfGuideCourse ? 'Scarica Guida PDF' : (course.resource_file_name ? `Scarica ${course.resource_file_name}` : 'Scarica Materiale')}
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {isPurchasable ? (
                                    <>
                                        <button 
                                            onClick={handleBuyNow}
                                            disabled={isBuying}
                                            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 mb-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isBuying ? 'Caricamento...' : <><Zap className="mr-2 h-5 w-5 fill-current" /> Acquista Subito</>}
                                        </button>

                                        <button 
                                            onClick={() => {
                                                if (inCart) navigate('/cart');
                                                else addToCart(course, settings.add_to_cart_pixel_id);
                                            }}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center border-2 ${
                                                inCart 
                                                ? 'bg-green-50 border-green-200 text-green-600' 
                                                : 'bg-white border-brand-600 text-brand-600 hover:bg-brand-50'
                                            }`}
                                        >
                                            {inCart ? (
                                                <>Nel Carrello <Check className="ml-2 h-5 w-5" /></>
                                            ) : (
                                                <>Aggiungi al Carrello <ShoppingCart className="ml-2 h-5 w-5" /></>
                                            )}
                                        </button>
                                    </>
                                ) : isFull ? (
                                    <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-center">
                                        <Lock className="h-10 w-10 text-red-400 mx-auto mb-3" />
                                        <h4 className="text-red-800 font-bold text-lg mb-1">Posti Esauriti</h4>
                                        <p className="text-red-600 text-xs mb-6">Questo corso ha raggiunto il limite massimo di studenti per questo mese.</p>
                                        
                                        {course.has_waiting_list !== false && (
                                            <div className="mt-6 pt-6 border-t border-red-100 text-left">
                                                {waitingListSuccess ? (
                                                    <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm font-bold flex items-center gap-2">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        Ti abbiamo aggiunto alla lista d'attesa! Ti avviseremo appena riapriranno le iscrizioni.
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleJoinWaitingList} className="space-y-3">
                                                        <p className="text-sm font-bold text-red-900 mb-2">Iscriviti alla lista d'attesa:</p>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Il tuo nome" 
                                                            value={waitingListName}
                                                            onChange={(e) => setWaitingListName(e.target.value)}
                                                            className="w-full px-4 py-2 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                                            required
                                                        />
                                                        <input 
                                                            type="email" 
                                                            placeholder="La tua email" 
                                                            value={waitingListEmail}
                                                            onChange={(e) => setWaitingListEmail(e.target.value)}
                                                            className="w-full px-4 py-2 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                                            required
                                                        />
                                                        {waitingListError && <p className="text-xs text-red-500">{waitingListError}</p>}
                                                        <button 
                                                            type="submit"
                                                            disabled={isWaitingListLoading}
                                                            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-70"
                                                        >
                                                            {isWaitingListLoading ? 'Iscrizione...' : 'Avvisami quando riapre'}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
                                        <Clock className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                                        <h4 className="text-blue-800 font-bold text-lg mb-1">In Arrivo</h4>
                                        <p className="text-blue-600 text-xs">Stiamo ultimando le registrazioni. Sarà disponibile a breve!</p>
                                    </div>
                                )}

                                {isPurchasable && (
                                    <p className="text-xs text-gray-500 text-center mt-2 leading-tight">
                                        Non serve registrarsi ora. Riceverai le credenziali d'accesso via email subito dopo l'acquisto.
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <div className="space-y-4 pt-6 mt-6 border-t border-gray-100">
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-600 flex items-center"><Users className="h-4 w-4 mr-2 text-brand-500" /> Accesso</span>
                                 <span className="font-bold text-gray-900">Illimitato</span>
                             </div>
                        </div>

                        {course.additional_benefits && course.additional_benefits.length > 0 && course.additional_benefits.some(b => b.trim() !== '') && (
                            <div className="pt-6 mt-6 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                    <Sparkles className="h-4 w-4 mr-2 text-brand-500" />
                                    Cosa avrai in più
                                </h3>
                                <ul className="space-y-2">
                                    {course.additional_benefits.filter(b => b.trim() !== '').map((benefit, i) => (
                                        <li key={i} className="flex items-start text-sm text-gray-700">
                                            <Check className="h-4 w-4 text-brand-600 mr-2 mt-0.5 flex-shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 lg:order-1 space-y-8">
                
                {isPurchased && activeLesson ? (
                    <SecureVideoPlayer lesson={activeLesson} onEnded={() => markLessonAsCompleted(activeLesson.id)} />
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider border border-brand-100">{course.level}</span>
                            {course.rating && <StarRating rating={course.rating} />}
                            {isFull && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-red-200">Posti Esauriti</span>}
                            {isComingSoon && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-blue-200">In Arrivo</span>}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{course.title}</h1>
                        <div 
                            className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap max-w-3xl"
                            dangerouslySetInnerHTML={{ __html: course.description }}
                        />
                    </div>
                )}

                {/* BLOCCO UPSELL (Offerta Speciale) */}
                {isPurchased && upsellCourse && !user?.purchased_courses.includes(upsellCourse.id) && (() => {
                    const upsellDiscountAvailable = user && upsellCourse.discounted_price && upsellCourse.discounted_price > 0;
                    const upsellFinalPrice = upsellDiscountAvailable ? upsellCourse.discounted_price : upsellCourse.price;
                    
                    return (
                        <div className="bg-white border border-brand-200 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                            <div className="flex items-start gap-4 flex-1">
                                <div className="bg-brand-50 p-3 rounded-full hidden sm:block">
                                    <Sparkles className="h-6 w-6 text-brand-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">Passa al livello successivo</h3>
                                        {upsellDiscountAvailable && (
                                            <span className="inline-flex items-center px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                                Offerta Fedeltà
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">
                                        Scopri <strong>{upsellCourse.title}</strong> per completare la tua formazione.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-brand-600">€{upsellFinalPrice}</span>
                                        <span className="text-gray-400 line-through text-sm">€{upsellCourse.price * (upsellDiscountAvailable ? 1 : 1.5)}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/course/${upsellCourse.id}`)}
                                className="w-full sm:w-auto bg-brand-50 text-brand-700 border border-brand-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-100 transition-all flex items-center justify-center whitespace-nowrap"
                            >
                                Scopri di più <ArrowLeft className="h-4 w-4 rotate-180 ml-2" />
                            </button>
                        </div>
                    );
                })()}
                
                {isPurchased && activeLesson && (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.title}</h2>
                            <p className="text-gray-600 whitespace-pre-wrap">{activeLesson.description}</p>
                        </div>
                        <button 
                            onClick={() => markLessonAsCompleted(activeLesson.id)}
                            disabled={completedLessons.includes(activeLesson.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                                completedLessons.includes(activeLesson.id)
                                ? 'bg-green-50 text-green-600 border border-green-100'
                                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'
                            }`}
                        >
                            {completedLessons.includes(activeLesson.id) ? (
                                <><CheckCircle2 className="h-5 w-5" /> Completata</>
                            ) : (
                                <>Segna come completata</>
                            )}
                        </button>
                    </div>
                )}

                {!activeLesson && (
                    <div className="flex flex-wrap gap-6 py-6 border-y border-gray-200">
                        <div className="flex items-center text-gray-700">
                            <Clock className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="font-semibold">{course.duration}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Book className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="font-semibold">{course.lessons_content?.length || course.lessons} Lezioni</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <BarChart className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Livello {course.level}</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold mb-6">{course.program_title || "Programma del Percorso"}</h2>
                    
                    {isPdfGuideCourse && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                            <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                                <PlayCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900">Hai a disposizione anche i video!</h4>
                                <p className="text-sm text-amber-800">Oltre alla guida PDF, puoi seguire le lezioni video qui sotto per approfondire ogni concetto.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {(!course.lessons_content || course.lessons_content.length === 0) ? (
                            <div className="text-center text-gray-400 py-4">{isPdfGuideCourse ? "Usa il pulsante in alto per scaricare la guida PDF." : "Lezioni in arrivo..."}</div>
                        ) : (
                            course.lessons_content.map((lesson, idx) => {
                                const isCompleted = completedLessons.includes(lesson.id);
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            if (isPurchased) {
                                                setActiveLesson(lesson);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        className={`border rounded-lg p-4 transition-all cursor-pointer ${
                                            activeLesson?.id === lesson.id 
                                            ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-200' 
                                            : 'border-gray-100 hover:bg-gray-50'
                                        } ${!isPurchased && 'opacity-70'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded mr-4 font-bold text-sm ${
                                                    isCompleted ? 'bg-green-100 text-green-700' : 
                                                    activeLesson?.id === lesson.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : (idx + 1).toString().padStart(2, '0')}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold ${activeLesson?.id === lesson.id ? 'text-brand-900' : 'text-gray-900'} ${isCompleted ? 'text-green-800' : ''}`}>
                                                        {isPurchased ? lesson.title : `Lezione ${idx + 1}`}
                                                    </h4>
                                                    {isPurchased && lesson.description && <p className="text-xs text-gray-400 line-clamp-1">{lesson.description}</p>}
                                                </div>
                                            </div>
                                            {isPurchased ? (
                                                <div className="flex items-center gap-3">
                                                    {isCompleted && <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter bg-green-50 px-2 py-0.5 rounded border border-green-100">Fatto</span>}
                                                    <PlayCircle className={`h-5 w-5 ${activeLesson?.id === lesson.id ? 'text-brand-600' : 'text-gray-400'}`} />
                                                </div>
                                            ) : (
                                                <Lock className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {!activeLesson && course.show_features !== false && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold mb-6">Cosa Imparerai</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {course.features.map((feat, i) => (
                                <div key={i} className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-600">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isPurchased && activeLesson && activeLesson.notes && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center text-gray-900">
                                <FileText className="h-5 w-5 mr-2 text-brand-600" />
                                Appunti della Lezione
                            </h2>
                            <button 
                                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                                className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                            >
                                {isNotesExpanded ? (
                                    <>Chiudi <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                    <>Espandi <ChevronDown className="h-4 w-4" /></>
                                )}
                            </button>
                        </div>
                        
                        <div className={`overflow-hidden transition-all duration-300 relative ${!isNotesExpanded ? 'max-height-[200px]' : 'max-height-none'}`}
                             style={{ maxHeight: isNotesExpanded ? 'none' : '200px' }}>
                            <div 
                                className="prose prose-brand max-w-none text-gray-700 lesson-notes-content"
                                dangerouslySetInnerHTML={{ __html: activeLesson.notes }}
                            />
                            {!isNotesExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                            )}
                        </div>

                        {!isNotesExpanded && (
                            <button 
                                onClick={() => setIsNotesExpanded(true)}
                                className="w-full py-3 mt-2 text-sm font-bold text-gray-500 hover:text-brand-600 border-t border-gray-50 border-dashed"
                            >
                                Mostra tutti gli appunti
                            </button>
                        )}

                        <style>{`
                            .lesson-notes-content { white-space: pre-wrap; }
                            .lesson-notes-content h1 { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
                            .lesson-notes-content h2 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem; }
                            .lesson-notes-content h3 { font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; }
                            .lesson-notes-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                            .lesson-notes-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                            .lesson-notes-content p { margin-bottom: 1rem; }
                            .lesson-notes-content a { color: #8B5CF6; text-decoration: underline; }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* MODALE ANNUNCIO */}
      {showAnnouncement && (course.announcement_title || course.announcement_content) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAnnouncement(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-brand-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Bell className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Annuncio Importante</h3>
                    </div>
                    <button onClick={() => setShowAnnouncement(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-8">
                    {course.announcement_title && (
                        <h4 className="text-2xl font-black text-gray-900 mb-4 leading-tight">{course.announcement_title}</h4>
                    )}
                    {course.announcement_content && (
                        <div className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap mb-8">
                            {course.announcement_content}
                        </div>
                    )}
                    <button 
                        onClick={() => setShowAnnouncement(false)}
                        className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                    >
                        Ho capito, grazie!
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
