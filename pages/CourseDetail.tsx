
import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, UserProfile, PlatformSettings } from '../types';
import { Clock, Book, BarChart, Check, Lock, Play, PlayCircle, Sparkles, AlertCircle, ShoppingCart, Zap, CheckCircle2, Download, FileText, Star, StarHalf, ShieldCheck, Award, Users, ArrowLeft, ChevronDown, ChevronUp, Bell, X, Target, TrendingUp, Shield, Laptop, Code, Brain, Loader2, CreditCard, Mail, Key, ArrowRight, DollarSign, Briefcase, ChevronLeft, ChevronRight, Monitor, Smartphone, Layers, Globe } from 'lucide-react';
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

const getFormattedHtml = (htmlContent: string) => {
  if (!htmlContent) return '';
  let formatted = htmlContent;
  if (!formatted.includes('<meta name="viewport"')) {
    if (formatted.includes('<head>')) {
      formatted = formatted.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">');
    } else {
      formatted = `<meta name="viewport" content="width=device-width, initial-scale=1.0">${formatted}`;
    }
  }
  const customStyles = `
    <style>
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }
      body {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
    </style>
  `;
  if (formatted.includes('</head>')) {
    formatted = formatted.replace('</head>', `${customStyles}</head>`);
  } else {
    formatted = `${customStyles}${formatted}`;
  }
  return formatted;
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
  
  // Dynamic Scroll-Aware 3D Showcase States
  const showcaseSectionRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      if (!showcaseSectionRef.current) return;
      const rect = showcaseSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distance = elementCenter - viewportCenter;
      const maxDistance = windowHeight * 1.1;
      const ratio = Math.max(-1, Math.min(1, distance / maxDistance));
      setScrollRatio(ratio);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 3D Carousel dragging and sizing states
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [simulatorViewMode, setSimulatorViewMode] = useState<'explorer' | 'carousel'>('carousel');
  const [explorerDeviceMode, setExplorerDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragDirection = useRef<'none' | 'horizontal' | 'vertical'>('none');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  
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

  const isPrice27 = course.price === 27 || course.discounted_price === 27 || course.price === 22 || course.discounted_price === 22;
  const isDiscountAvailable = user && course.discounted_price && course.discounted_price > 0 && !isPurchased && !isPrice27;
  const finalPrice = isPrice27 ? 27 : (isDiscountAvailable ? course.discounted_price! : course.price);
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
    const N = activeShowcases.length;
    const activeShowcaseItem = activeShowcases[activeMockup] || activeShowcases[0];

    // High-converting pricing logic
    const isPrice27 = course.price === 27 || course.discounted_price === 27 || course.price === 22 || course.discounted_price === 22;
    const displayNewPrice = isPrice27 ? 27 : (course.discounted_price && course.discounted_price > 0 ? course.discounted_price : course.price);
    const displayOldPrice = isPrice27 ? 97 : (course.discounted_price && course.discounted_price > 0 ? course.price : Math.round(course.price * 2.5));
    const discountPercentage = Math.round(((displayOldPrice - displayNewPrice) / displayOldPrice) * 100);

    const showCountdown = (course.show_countdown || course.landing_page_data?.show_countdown) && (course.countdown_end || course.landing_page_data?.countdown_end);
    const targetDate = course.countdown_end || course.landing_page_data?.countdown_end;

    // Helper to scroll to pricing block smoothly
    const scrollToPricing = () => {
      const element = document.getElementById('pricing-block-desktop') || document.getElementById('pricing-block-mobile');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // High-fidelity Reusable Pricing and CTA Widget
    const renderPricingAndCTA = (deviceMode: 'desktop' | 'mobile') => {
      return (
        <div 
          id={`pricing-block-${deviceMode}`}
          className={`bg-slate-950 text-white rounded-3xl border border-brand-500/30 shadow-2xl overflow-hidden p-6 sm:p-8 relative ${
            deviceMode === 'desktop' ? 'space-y-6' : 'space-y-5 my-6'
          }`}
          style={{
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 40px rgba(124, 58, 237, 0.05)'
          }}
        >
          {/* Accent lighting strip */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-600 to-brand-400" />

          {/* Pricing Info Header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-5 pt-1">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-400 block font-mono">Offerta Speciale Riservata</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-4xl sm:text-5.5xl font-black text-white tracking-tight">€{displayNewPrice}</span>
                <span className="text-slate-500 line-through text-base sm:text-lg font-semibold">€{displayOldPrice}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="bg-brand-600 text-white font-extrabold text-[11px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md shadow-brand-500/20 animate-pulse border border-brand-500/20">
                -{discountPercentage}% ORA
              </span>
              <span className="text-[10px] text-brand-300 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
                Risparmi €{displayOldPrice - displayNewPrice}
              </span>
            </div>
          </div>

          {/* Social Proof Stars */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-850 p-2.5 rounded-2xl">
            <StarRating rating={4.9} />
            <span className="text-xs font-extrabold text-slate-300">
              (142 recensioni degli studenti)
            </span>
          </div>

          {/* Scarcity Countdown - STRICTLY RIGHT BELOW THE PRICE ON MOBILE! */}
          {showCountdown && targetDate && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-brand-400 uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  IL PREZZO AUMENTA TRA:
                </span>
                <span className="text-brand-450 animate-pulse font-black">ULTIMI POSTI DISPONIBILI</span>
              </div>
              <Countdown3D targetDate={targetDate} />
            </div>
          )}

          {/* Action CTA Buttons */}
          <div className="space-y-3 pt-2">
            {isPurchasable ? (
              <>
                {/* PRIMARY CTA: BUY NOW */}
                <button
                  onClick={handleBuyNow}
                  disabled={isBuying}
                  className="w-full bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white rounded-2xl font-black py-4.5 px-6 text-center text-lg sm:text-xl shadow-[0_10px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_30px_rgba(124,58,237,0.45)] border-b-[5px] border-brand-950 active:translate-y-[3px] active:border-b-[2px] transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer select-none group"
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Elaborazione Sicura SSL...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      SBLOCCA L'ACCESSO IMMEDIATO
                    </>
                  )}
                </button>

                {/* SECONDARY CTA: ADD TO CART */}
                <button
                  onClick={() => {
                    if (inCart) navigate('/cart');
                    else addToCart(course, settings.add_to_cart_pixel_id);
                  }}
                  className={`w-full rounded-2xl font-bold py-3.5 px-6 text-center text-sm transition-all border flex items-center justify-center gap-2 cursor-pointer select-none ${
                    inCart
                      ? 'bg-brand-950/80 text-brand-400 border-brand-850 hover:bg-brand-900/50 shadow-sm'
                      : 'bg-slate-900 text-slate-200 border-slate-850 hover:bg-slate-800/80'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {inCart ? 'Vai al Carrello per completare' : 'Aggiungi al Carrello'}
                </button>
              </>
            ) : (
              <div className="w-full">
                {isComingSoon ? (
                  <div className="bg-blue-950/80 border border-blue-900 text-blue-400 p-4 rounded-2xl text-center font-bold text-sm">
                    Disponibile a Breve! Resta Sintonizzato.
                  </div>
                ) : (
                  <div className="bg-red-950/80 border border-red-900 text-red-400 p-4 rounded-2xl text-center font-bold text-sm">
                    Iscrizioni Chiuse - Posti Esauriti!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Secure checkout assurances & badges */}
          <div className="border-t border-slate-900 pt-4.5 space-y-2.5">
            <div className="flex items-start gap-2.5 text-[10px] font-bold text-slate-400">
              <ShieldCheck className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <span className="leading-snug">GARANZIA 14 GIORNI SODDISFATTO O RIMBORSATO AL 100%</span>
            </div>
            <div className="flex items-start gap-2.5 text-[10px] font-bold text-slate-400">
              <Lock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span className="leading-snug">TRANSAZIONE SICURA SSL CON CRITTOGRAFIA DI GRADO MILITARE</span>
            </div>
            <div className="flex items-start gap-2.5 text-[10px] font-bold text-slate-400">
              <Zap className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
              <span className="leading-snug">MATERIALE RILASCIATO IMMEDIATAMENTE NELLA TUA AREA PERSONALE</span>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="bg-slate-50 min-h-screen text-slate-800 pb-24">
        {/* UPPER SNEAK-PEEK PREMIUM BAR */}
        <div className="bg-slate-900 text-slate-200 text-center py-2.5 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
          <span>Presentazione Esclusiva dell'Academy • Accesso Riservato Clienti</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* HERO PREVIEW BLOCK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
            {/* LEFT COLUMN: HERO INFORMATION */}
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

              {/* MOBILE ONLY: HERO MEDIA CARD, PRICING, COUNTDOWN, CTA (E-commerce Style) */}
              <div className="block lg:hidden space-y-6">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                  <img src={course.image} alt={course.title} className="w-full h-56 sm:h-72 object-cover" />
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-700">
                    SITO INTERATTIVO IA
                  </div>
                </div>

                {/* Pricing + Countdown (Right below price) + CTA Buttons */}
                {renderPricingAndCTA('mobile')}
              </div>

              {/* CORE BULLET POINTS */}
              <div className="bg-white lg:bg-transparent p-6 lg:p-0 rounded-2xl border border-slate-100 lg:border-0 shadow-sm lg:shadow-none">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono mb-4 lg:hidden">
                  COSA ACQUISTI OGGI:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(lpd.hero?.bullet_points || []).map((point: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="bg-emerald-50 text-emerald-600 p-1 rounded-lg border border-emerald-100 shrink-0 mt-0.5">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elegant Call to Action below hero bullet points */}
              <div className="pt-4 pb-2">
                <button
                  onClick={scrollToPricing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base rounded-2xl border-b-[5px] border-brand-950 shadow-[0_10px_25px_-5px_rgba(124,58,237,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(124,58,237,0.55)] active:translate-y-[3px] active:border-b-[2px] active:shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all duration-150 cursor-pointer group select-none text-center"
                >
                  <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-pulse group-hover:scale-110 transition-transform shrink-0" />
                  SBLOCCA ACCESSO IMMEDIATO ALL'ACADEMY
                </button>
                <p className="text-[10px] text-slate-400 font-mono mt-2 pl-1">⚡ Accesso istantaneo e illimitato H24 • Garanzia 100%</p>
              </div>

              {/* Extra social proof anchors for trust under bullet points */}
              <div className="hidden lg:flex items-center gap-6 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand-600" />
                  <span className="text-xs font-bold text-slate-500">Certificazione Finale</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-600" />
                  <span className="text-xs font-bold text-slate-500">Accesso alla Community VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-600" />
                  <span className="text-xs font-bold text-slate-500">Soddisfatto o Rimborsato</span>
                </div>
              </div>
            </div>

            {/* DESKTOP ONLY: HERO MEDIA AND FLOATING E-COMMERCE CARD */}
            <div className="hidden lg:col-span-5 lg:block sticky top-6 space-y-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                <img src={course.image} alt={course.title} className="w-full h-64 sm:h-80 object-cover" />
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-700">
                  STUDIO DI SVILUPPO IA
                </div>
              </div>

              {/* Pricing, Countdown, CTA Sidebar */}
              {renderPricingAndCTA('desktop')}
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

                  <div className="pt-4">
                    <button
                      onClick={scrollToPricing}
                      className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl border-b-[4px] border-brand-800 hover:border-brand-900 shadow-[0_6px_15px_rgba(124,58,237,0.3)] active:translate-y-[2px] active:border-b-[1px] transition-all duration-150 cursor-pointer group select-none"
                    >
                      <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300 group-hover:animate-spin animate-pulse" />
                      INIZIA ORA IL TUO PERCORSO
                    </button>
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

              <div className="mt-8 text-center bg-slate-100/50 p-6 rounded-2xl border border-slate-200/60 max-w-2xl mx-auto">
                <p className="text-sm text-slate-800 font-bold mb-3">Hai ancora dei dubbi o vuoi iniziare subito?</p>
                <button
                  onClick={scrollToPricing}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl border-b-[4px] border-slate-800 active:translate-y-[2px] active:border-b-[1px] shadow-lg hover:shadow-xl transition-all duration-150 cursor-pointer select-none"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  SÌ, SBLOCCA ORA IL MIO ACCESSO SICURO (GARANZIA 14 GIORNI)
                </button>
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

               /* 3D Cinematic Deck Styles */
              .deck-scene {
                position: relative;
                width: 100%;
                perspective: 1200px;
                transform-style: preserve-3d;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: visible;
                user-select: none;
                -webkit-user-select: none;
              }
              .deck-card {
                position: absolute;
                transform-style: preserve-3d;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                            opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                            filter 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                            box-shadow 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                            width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                            height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
              }
              .deck-card-active {
                opacity: 1 !important;
                filter: none !important;
                z-index: 30;
                box-shadow: 0 35px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
              }
              .deck-card-background {
                opacity: 0.35;
                filter: brightness(0.4) blur(1.5px);
                cursor: pointer;
                z-index: 10;
              }
              .deck-card-background:hover {
                opacity: 0.55;
                filter: brightness(0.6) blur(0.5px);
              }
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

              {/* Opportunity CTA Banner */}
              <div className="text-center mt-12 mb-4 max-w-xl mx-auto relative z-10">
                <button
                  onClick={scrollToPricing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl border-b-[5px] border-emerald-800 hover:border-emerald-900 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_-5px_rgba(16,185,129,0.45)] active:translate-y-[3px] active:border-b-[2px] transition-all duration-150 cursor-pointer group select-none"
                >
                  <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-pulse group-hover:scale-110 transition-transform" />
                  INIZIA A GUADAGNARE CON L'IA ORA
                </button>
                <p className="text-[10px] text-slate-450 font-mono mt-2">⚠️ SOLO POCHI POSTI ANCORA DISPONIBILI CON SCONTO ATTIVO</p>
              </div>

              {/* LIVE WEBSITES SIMULATOR BLOCK */}
              <div ref={showcaseSectionRef} className="space-y-12 mt-20 overflow-hidden py-14 bg-slate-950 relative border-t border-b border-white/5">
                {/* Space mesh grid overlay for cinematic Stripe/Linear style */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-60"></div>
                
                {/* Accent background glow spots */}
                <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="text-center max-w-3xl mx-auto px-4 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 mb-3 select-none">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    Anteprime Interattive Real-Time
                  </span>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                    Siti Web Reali Creati GRATIS con l'Intelligenza Artificiale
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed max-w-2xl mx-auto font-normal">
                    Esplora la qualità, la fluidità ed il design dei progetti completi generati a costo zero. 
                    <span className="text-white font-bold"> Trascina o usa le frecce per ruotare il carosello 3D</span>, e scorri in verticale all'interno delle anteprime per provarle dal vivo!
                  </p>
                </div>

                {/* Horizontal Category Navigation Bar */}
                <div className="relative z-10 max-w-5xl mx-auto px-4">
                  <div className="w-full overflow-x-auto pb-4 pt-1 px-2 scrollbar-none">
                    <div className="flex gap-2.5 min-w-max mx-auto justify-center">
                      {[
                        { id: 0, label: "Ristorazione", subtitle: "Food & Gourmet", icon: "🍔", badge: "Live Preview 01" },
                        { id: 1, label: "Hair & Styling", subtitle: "Sartorial Salon", icon: "✂️", badge: "Live Preview 02" },
                        { id: 2, label: "Estetica & Lab", subtitle: "Aesthetic & Care", icon: "🌿", badge: "Live Preview 03" },
                        { id: 3, label: "Studio Medico", subtitle: "Dental Care", icon: "🦷", badge: "Live Preview 04" },
                        { id: 4, label: "Creative Agency", subtitle: "Visual Studio", icon: "💡", badge: "Live Preview 05" }
                      ].map((pill) => {
                        const isActive = pill.id === activeMockup;
                        return (
                          <button
                            key={pill.id}
                            onClick={() => setActiveMockup(pill.id)}
                            className={`px-4 py-2.5 rounded-2xl border transition-all duration-350 flex items-center gap-3 shrink-0 cursor-pointer text-left select-none relative overflow-hidden ${
                              isActive
                                ? 'bg-gradient-to-r from-brand-600/95 to-indigo-600/95 text-white border-brand-500/50 shadow-lg shadow-brand-500/20 scale-[1.02]'
                                : 'bg-slate-900/60 backdrop-blur-md text-slate-400 border-white/5 hover:bg-slate-800/40 hover:text-white hover:border-white/10'
                            }`}
                          >
                            <div className={`p-1.5 rounded-xl shrink-0 text-lg ${isActive ? 'bg-white/15' : 'bg-slate-950/80 border border-white/5'}`}>
                              {pill.icon}
                            </div>
                            <div className="min-w-0 pr-1">
                              <div className="text-xs font-black uppercase tracking-wider leading-tight">{pill.label}</div>
                              <div className={`text-[9px] font-mono tracking-tight mt-0.5 ${isActive ? 'text-brand-200' : 'text-slate-500'}`}>
                                {pill.subtitle}
                              </div>
                            </div>
                            {isActive && (
                              <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[7px] font-mono font-bold text-emerald-300 uppercase tracking-widest">{pill.badge}</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Device responsive toggle switch container */}
                <div className="flex items-center justify-center gap-1.5 bg-slate-900/60 backdrop-blur-md border border-white/5 p-1 rounded-2xl max-w-xs mx-auto relative z-10">
                  <button
                    type="button"
                    onClick={() => setExplorerDeviceMode('desktop')}
                    className={`flex-1 py-1.5 px-3 rounded-xl transition-all duration-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                      explorerDeviceMode === 'desktop'
                        ? 'bg-white/10 text-white shadow-sm shadow-black/20'
                        : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    <Laptop className="h-3.5 w-3.5 text-brand-400" />
                    Laptop
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplorerDeviceMode('mobile')}
                    className={`flex-1 py-1.5 px-3 rounded-xl transition-all duration-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                      explorerDeviceMode === 'mobile'
                        ? 'bg-white/10 text-white shadow-sm shadow-black/20'
                        : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5 text-brand-400" />
                    Cellulare
                  </button>
                </div>

                {/* Main Cinematic 3D Deck Canvas */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 mt-8 flex flex-col items-center justify-center">
                  <div 
                    className="deck-scene relative w-full flex items-center justify-center"
                    style={{ 
                      height: isMobile ? '590px' : '560px',
                    }}
                    onMouseDown={(e) => {
                      if (e.button === 0) {
                        setIsDragging(true);
                        dragStartX.current = e.clientX;
                        setDragOffset(0);
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!isDragging) return;
                      const deltaX = e.clientX - dragStartX.current;
                      setDragOffset(deltaX);
                    }}
                    onMouseUp={() => {
                      if (!isDragging) return;
                      setIsDragging(false);
                      const threshold = 60;
                      if (dragOffset > threshold) {
                        setActiveMockup((prev) => (prev - 1 + N) % N);
                      } else if (dragOffset < -threshold) {
                        setActiveMockup((prev) => (prev + 1) % N);
                      }
                      setDragOffset(0);
                    }}
                    onMouseLeave={() => {
                      if (isDragging) {
                        setIsDragging(false);
                        setDragOffset(0);
                      }
                    }}
                    onTouchStart={(e) => {
                      setIsDragging(true);
                      dragStartX.current = e.touches[0].clientX;
                      setDragOffset(0);
                    }}
                    onTouchMove={(e) => {
                      if (!isDragging) return;
                      const deltaX = e.touches[0].clientX - dragStartX.current;
                      setDragOffset(deltaX);
                    }}
                    onTouchEnd={() => {
                      if (!isDragging) return;
                      setIsDragging(false);
                      const threshold = 60;
                      if (dragOffset > threshold) {
                        setActiveMockup((prev) => (prev - 1 + N) % N);
                      } else if (dragOffset < -threshold) {
                        setActiveMockup((prev) => (prev + 1) % N);
                      }
                      setDragOffset(0);
                    }}
                  >
                    {/* Floating navigation arrows */}
                    {!isMobile && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMockup((prev) => (prev - 1 + N) % N);
                          }}
                          className="absolute left-4 lg:left-8 z-45 p-3 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-200 shadow-xl shadow-black/40 cursor-pointer hover:scale-110 active:scale-95"
                          title="Progetto Precedente"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMockup((prev) => (prev + 1) % N);
                          }}
                          className="absolute right-4 lg:right-8 z-45 p-3 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-white/20 transition-all duration-200 shadow-xl shadow-black/40 cursor-pointer hover:scale-110 active:scale-95"
                          title="Progetto Successivo"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Rendering the Deck cards */}
                    {activeShowcases.map((tab: any, idx: number) => {
                      const isActive = idx === activeMockup;
                      
                      // 3D placement math
                      let diff = idx - activeMockup;
                      if (diff < -N / 2) diff += N;
                      if (diff > N / 2) diff -= N;

                      // Styles calculation
                      let transformStyle = "";
                      let opacity = 0;
                      let zIndex = 10;
                      let pointerEvents: "auto" | "none" = "none";
                      let filter = "none";

                      const scrollTiltX = scrollRatio * 14; 
                      const scrollTranslateY = scrollRatio * -25; 
                      const scrollScale = 1 - (Math.abs(scrollRatio) * 0.06);

                      if (isActive) {
                        zIndex = 30;
                        opacity = 1;
                        pointerEvents = "auto";
                        transformStyle = `perspective(1200px) rotateX(${scrollTiltX + mouseTilt.y}deg) rotateY(${mouseTilt.x}deg) translateY(${scrollTranslateY}px) scale(${scrollScale})`;
                      } else if (diff === -1) {
                        zIndex = 20;
                        opacity = isMobile ? 0.12 : 0.45;
                        filter = "blur(1.5px) brightness(0.45)";
                        const xOffset = isMobile ? "-140px" : "-380px";
                        const zOffset = isMobile ? "-120px" : "-240px";
                        const yRotation = isMobile ? "14deg" : "22deg";
                        transformStyle = `perspective(1200px) translateX(${xOffset}) translateZ(${zOffset}) rotateX(${scrollTiltX}deg) rotateY(${yRotation}) translateY(${scrollTranslateY}px) scale(0.8)`;
                      } else if (diff === 1) {
                        zIndex = 20;
                        opacity = isMobile ? 0.12 : 0.45;
                        filter = "blur(1.5px) brightness(0.45)";
                        const xOffset = isMobile ? "140px" : "380px";
                        const zOffset = isMobile ? "-120px" : "-240px";
                        const yRotation = isMobile ? "-14deg" : "-22deg";
                        transformStyle = `perspective(1200px) translateX(${xOffset}) translateZ(${zOffset}) rotateX(${scrollTiltX}deg) rotateY(${yRotation}) translateY(${scrollTranslateY}px) scale(0.8)`;
                      } else {
                        zIndex = 10;
                        opacity = 0;
                        transformStyle = `perspective(1200px) translateZ(-400px) scale(0.6)`;
                      }

                      // Card width/height morph animation parameters based on desktop/mobile view toggle
                      const isPhoneFrame = explorerDeviceMode === 'mobile' || isMobile;
                      const cardWidth = isPhoneFrame ? '335px' : '720px';
                      const cardHeight = isPhoneFrame ? '550px' : '480px';

                      return (
                        <div
                          key={tab.id}
                          onClick={() => {
                            if (!isActive) {
                              setActiveMockup(idx);
                            }
                          }}
                          className={`deck-card bg-slate-950 border border-white/5 flex flex-col ${
                            isActive ? "deck-card-active" : "deck-card-background"
                          }`}
                          style={{
                            width: cardWidth,
                            height: cardHeight,
                            transform: transformStyle,
                            opacity: opacity,
                            filter: filter,
                            pointerEvents: pointerEvents,
                            cursor: isActive ? 'auto' : 'pointer',
                          }}
                          onMouseMove={isActive ? (e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const nX = (x / rect.width) * 2 - 1;
                            const nY = (y / rect.height) * 2 - 1;
                            setMouseTilt({ x: nX * 7, y: -nY * 7 });
                          } : undefined}
                          onMouseLeave={isActive ? () => setMouseTilt({ x: 0, y: 0 }) : undefined}
                        >
                          {isPhoneFrame ? (
                            /* HIGH-FIDELITY SMARTPHONE HANDSET FRAME (iPhone 16 look) */
                            <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden relative border-4 border-slate-800 rounded-[36px] shadow-2xl">
                              {/* Notch / Dynamic Island speaker */}
                              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center gap-1">
                                <div className="w-12 h-1 bg-zinc-900 rounded-full" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-950/80" />
                              </div>

                              {/* Top status bar indicators */}
                              <div className="bg-slate-900 px-6 pt-3 pb-1 flex justify-between items-center text-[9px] font-mono text-zinc-400 select-none shrink-0 border-b border-white/5">
                                <span>09:41</span>
                                <div className="flex items-center gap-1.5">
                                  <span>5G</span>
                                  <span className="w-3.5 h-1.5 bg-zinc-500 rounded-sm relative inline-block border border-zinc-600">
                                    <span className="absolute top-0 left-0 bottom-0 bg-zinc-200 w-[80%] rounded-2xs" />
                                  </span>
                                </div>
                              </div>

                              {/* Unbranded Sleek Address/Title bar */}
                              <div className="bg-slate-900 border-b border-white/5 py-2 px-3 flex items-center justify-center shrink-0 select-none">
                                <div className="bg-slate-950/90 border border-white/5 px-2.5 py-1 rounded-xl font-mono text-[9px] text-slate-400 flex items-center justify-center gap-1.5 w-full max-w-[210px] shadow-inner">
                                  <span className="text-emerald-500 text-[8px] uppercase font-bold tracking-widest px-1 py-0.2 bg-emerald-950/80 rounded border border-emerald-900/50 scale-90 shrink-0 leading-none">SSL</span>
                                  <span className="truncate tracking-wide text-slate-450">ai-sandbox.io/preview</span>
                                </div>
                              </div>

                              {/* Scrollable Website Frame */}
                              <div 
                                className="relative bg-white text-slate-850 flex-1 overflow-y-auto overflow-x-hidden touch-pan-y select-text custom-scrollbar"
                                style={{ scrollbarWidth: 'thin' }}
                              >
                                {tab.custom_html || tab.url || tab.builtinIndex === undefined ? (
                                  <div className={`w-full h-full bg-white relative ${!isActive ? 'pointer-events-none' : ''}`}>
                                    {tab.custom_html ? (
                                      <iframe
                                        srcDoc={getFormattedHtml(tab.custom_html)}
                                        className="w-full h-full border-0 bg-white"
                                        title={tab.title}
                                        sandbox="allow-scripts allow-same-origin"
                                      />
                                    ) : (
                                      <iframe
                                        src={tab.url}
                                        className="w-full h-full border-0 bg-white"
                                        title={tab.title}
                                        sandbox="allow-scripts allow-same-origin"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  renderMockupContent(tab.builtinIndex)
                                )}
                              </div>
                            </div>
                          ) : (
                            /* HIGH-FIDELITY BROWSER FRAME (Safari macOS Look) */
                            <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden border border-white/5 rounded-2xl shadow-2xl">
                              {/* Window Dots & Navigation Bar */}
                              <div className="bg-slate-900 border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0 select-none">
                                {/* Window dots */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-md" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-md" />
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-md" />
                                </div>

                                {/* Completely unbranded generic URL Bar */}
                                <div className="bg-slate-950/90 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-center text-[11px] text-slate-400 flex-1 max-w-[360px] mx-4 truncate flex items-center justify-center gap-2 shadow-inner">
                                  <span className="text-[8px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-900/50 px-1 py-0.2 rounded shrink-0 leading-none scale-90">SSL ATTIVO</span>
                                  <span className="truncate text-slate-450 tracking-wide">https://ai-generated.site/active-demo</span>
                                </div>

                                {/* Active status badge */}
                                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm shrink-0 flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                  IA LIVE
                                </span>
                              </div>

                              {/* Scrollable Website Frame */}
                              <div 
                                className="relative bg-white text-slate-800 flex-1 overflow-y-auto overflow-x-hidden touch-pan-y select-text custom-scrollbar"
                                style={{ scrollbarWidth: 'thin' }}
                              >
                                {tab.custom_html || tab.url || tab.builtinIndex === undefined ? (
                                  <div className="w-full h-full bg-white relative">
                                    {tab.custom_html ? (
                                      <iframe
                                        srcDoc={getFormattedHtml(tab.custom_html)}
                                        className="w-full h-full border-0 bg-white"
                                        title={tab.title}
                                        sandbox="allow-scripts allow-same-origin"
                                      />
                                    ) : (
                                      <iframe
                                        src={tab.url}
                                        className="w-full h-full border-0 bg-white"
                                        title={tab.title}
                                        sandbox="allow-scripts allow-same-origin"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  renderMockupContent(tab.builtinIndex)
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Elegant fluid liquid-pill progress dots navigation */}
                <div className="flex justify-center items-center gap-2.5 mt-4 relative z-10 select-none">
                  {activeShowcases.map((_, idx) => {
                    const isActive = idx === activeMockup;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveMockup(idx)}
                        className={`h-2.5 rounded-full transition-all duration-500 ease-out cursor-pointer ${
                          isActive 
                            ? 'w-9 bg-brand-500 shadow-[0_0_10px_#3b82f6] shadow-brand-500/50' 
                            : 'w-2.5 bg-slate-800 hover:bg-slate-700'
                        }`}
                        title={`Sito template ${idx + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Micro-instructions footer with mono styling */}
                <div className="text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1 select-none pointer-events-none mt-6 relative z-10">
                  <span className="font-mono text-slate-400">💡 Gestione Interazione Tridimensionale:</span>
                  <span>Trascina con il cursore per far scorrere • Usa lo scroll della rotellina all'interno del sito attivo</span>
                </div>
              </div>

              {/* FINAL BOTTOM CARD CALL TO ACTION */}
          <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,_var(--tw-gradient-stops)) from-brand-600/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-brand-400 font-bold text-xs uppercase tracking-widest font-mono">Sblocca il tuo potenziale oggi</span>
              <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight">Trasforma le tue competenze in un vero superpotere</h3>
              <p className="text-slate-405 text-sm leading-relaxed max-w-lg mx-auto">Non rimandare la crescita personale. Entra ora nell'Academy e padroneggia le tecnologie di domani con i massimi esperti del settore.</p>
              
              <div className="flex items-center justify-center gap-3 py-2">
                <span className="text-slate-500 line-through text-lg">€{isPrice27 ? 97 : (course.discounted_price && course.discounted_price > 0 ? course.price : Math.round(course.price * 2.5))}</span>
                <span className="text-4xl font-black text-brand-400">€{isPrice27 ? 27 : finalPrice}</span>
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 text-brand-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-brand-500/20 select-none">
                <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
                Dall'Iscrizione all'Onboarding: Flusso Automatizzato
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Come Funziona l'Iscrizione ed il Tuo Onboarding
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-4 max-w-2xl mx-auto font-normal leading-relaxed">
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
                                            <span className="text-4xl font-bold text-purple-600">€{isPrice27 ? 27 : finalPrice}</span>
                                            <span className="text-gray-400 ml-2 mb-1 line-through text-lg">€{isPrice27 ? 97 : course.price}</span>
                                            {course.show_discount_badge !== false && (
                                                <span className="ml-3 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                    -{isPrice27 ? 72 : Math.round(((course.price - course.discounted_price!) / course.price) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-end">
                                        <span className="text-4xl font-bold text-gray-900">€{isPrice27 ? 27 : course.price}</span>
                                        <span className="text-gray-400 ml-2 mb-1 line-through">€{isPrice27 ? 97 : course.price * 1.5}</span>
                                        {course.show_discount_badge !== false && (
                                            <span className="ml-3 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                -{isPrice27 ? 72 : 33}%
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
