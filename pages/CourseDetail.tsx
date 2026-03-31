
import React, { useState, useEffect } from 'react';
import { Course, Lesson, UserProfile, PlatformSettings } from '../types';
import { Clock, Book, BarChart, Check, Lock, Play, PlayCircle, Sparkles, AlertCircle, ShoppingCart, Zap, CheckCircle2, Download, FileText, Star, StarHalf, ShieldCheck, Award, Users, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { trackInitiateCheckout, trackAddToCart } from '../services/metaPixel';
import { supabase } from '../services/supabase';

interface CourseDetailProps {
  course: Course;
  onPurchase: () => void;
  isPurchased: boolean;
  onBack: () => void;
  user: UserProfile | null;
  settings: PlatformSettings;
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

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

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
                } catch (err) {
                    console.error("Errore nel generare URL sicuro:", err);
                    if (isMounted) setIsLoading(false);
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
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
            {isLoading ? (
                <div className="flex items-center justify-center h-full text-white/50"><p>Caricamento video...</p></div>
            ) : videoUrl ? (
                videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
                    <iframe 
                        src={videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video 
                        src={videoUrl} 
                        controls 
                        controlsList="nodownload" 
                        onContextMenu={e => e.preventDefault()} 
                        className="w-full h-full" 
                        onEnded={onEnded}
                        autoPlay
                    />
                )
            ) : (
                <div className="flex items-center justify-center h-full text-white/50">
                    <p>Video non disponibile per questa lezione.</p>
                </div>
            )}
        </div>
    );
};

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onPurchase, isPurchased, onBack, user, settings }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const [upsellCourse, setUpsellCourse] = useState<Course | null>(null);
  const [isBuying, setIsBuying] = useState(false);

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

  const isFull = course.status === 'full';
  const isComingSoon = course.status === 'coming_soon';
  const isPurchasable = !isFull && !isComingSoon;

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
            <div className="lg:col-span-2 space-y-8">
                
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
                
                {/* I blocchi di download sono stati spostati nella sidebar */}

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
                                                        {lesson.title}
                                                    </h4>
                                                    {lesson.description && <p className="text-xs text-gray-400 line-clamp-1">{lesson.description}</p>}
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
            </div>

            <div className="lg:col-span-1">
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
                                                else addToCart(course);
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
                                        <p className="text-red-600 text-xs">Questo corso ha raggiunto il limite massimo di studenti per questo mese.</p>
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
                                 <span className="text-gray-600 flex items-center"><Clock className="h-4 w-4 mr-2 text-brand-500" /> Durata</span>
                                 <span className="font-bold text-gray-900">{course.duration}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-600 flex items-center"><Book className="h-4 w-4 mr-2 text-brand-500" /> Lezioni</span>
                                 <span className="font-bold text-gray-900">{course.lessons_content?.length || course.lessons}</span>
                             </div>
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
        </div>
      </div>
    </div>
  );
};