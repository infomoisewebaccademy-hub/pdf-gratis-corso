
import React, { useState } from 'react';
import { Course, UserProfile } from '../types';
import { CheckCircle, ShoppingCart, Lock, Zap, ArrowRight, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CoursesPageProps {
  courses: Course[];
  onCourseSelect: (courseId: string) => void;
  user?: UserProfile | null;
}

// Componente Card estratto per gestire lo stato "Espanso/Ridotto" singolarmente
const CourseCard: React.FC<{ 
    course: Course; 
    onCourseSelect: (id: string) => void; 
    user?: UserProfile | null 
}> = ({ course, onCourseSelect, user }) => {
    const { addToCart, isInCart } = useCart();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Configurazione lunghezza massima anteprima
    const MAX_PREVIEW_LENGTH = 100;
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (course.status && course.status !== 'active') return;
        addToCart(course);
    };

    const isPurchased = user?.purchased_courses.includes(course.id);
    const inCart = isInCart(course.id);
    const isFull = course.status === 'full';
    const isComingSoon = course.status === 'coming_soon';
    const isNotActive = isFull || isComingSoon;
    
    // Logica per troncare il testo
    const shouldTruncate = course.description.length > MAX_PREVIEW_LENGTH;
    
    // Testo da mostrare: usa whitespace-pre-wrap per mantenere gli a capo
    const descriptionText = isExpanded || !shouldTruncate
        ? course.description
        : course.description.slice(0, MAX_PREVIEW_LENGTH).trim() + "...";

    return (
        <div className={`group relative flex flex-col p-2 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-4 ${isNotActive ? 'opacity-80' : ''}`}>
            {/* Top Accent Line */}
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 z-30"></div>
            
            <div className="relative h-full bg-[#0B1120] rounded-[2.25rem] p-8 overflow-hidden flex flex-col shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border-b border-white/5">
                {/* Background Orb */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-500/20 transition-colors duration-500"></div>

                <div className="relative z-10 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Zap className="h-6 w-6 text-brand-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-brand-400 uppercase tracking-widest border border-white/10 shadow-lg">
                                {course.level}
                            </div>
                            {isFull && (
                                <div className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-500/30 shadow-lg">
                                    Posti Esauriti
                                </div>
                            )}
                            {isComingSoon && (
                                <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30 shadow-lg">
                                    In Arrivo
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight line-clamp-2 group-hover:text-brand-400 transition-colors cursor-pointer" onClick={() => onCourseSelect(course.id)}>
                        {course.title}
                    </h3>
                    
                    <div className="relative">
                        <p className="text-sm text-slate-400 font-medium leading-relaxed whitespace-pre-wrap">
                            {descriptionText}
                        </p>
                        {shouldTruncate && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="text-brand-400 text-[10px] font-bold mt-2 hover:text-white uppercase tracking-widest transition-colors focus:outline-none"
                            >
                                {isExpanded ? "Mostra meno" : "Leggi tutto"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative z-10 mb-8 flex items-baseline gap-1">
                    <span className="text-5xl font-semibold text-white tracking-tighter">€{course.price}</span>
                    <span className="text-slate-500 font-medium ml-1 text-sm uppercase tracking-widest">Investimento</span>
                </div>

                <div className="relative z-10 mb-10">
                    {isPurchased ? (
                        <button 
                            onClick={() => onCourseSelect(course.id)}
                            className="relative w-full py-4 rounded-xl bg-gradient-to-b from-green-500 to-green-700 border-t border-green-400 shadow-[0_4px_15px_rgba(34,197,94,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] text-white text-sm font-bold hover:brightness-110 active:translate-y-[1px] active:shadow-none transition-all duration-200 overflow-hidden group/btn"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Vai al Percorso <ArrowRight className="h-4 w-4" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                        </button>
                    ) : isFull ? (
                        <button 
                            disabled
                            className="relative w-full py-4 rounded-xl bg-slate-800 border border-white/5 shadow-[0_2px_5px_rgba(0,0,0,0.2)] text-slate-500 text-sm font-bold cursor-not-allowed"
                        >
                            Posti Esauriti
                        </button>
                    ) : isComingSoon ? (
                        <button 
                            disabled
                            className="relative w-full py-4 rounded-xl bg-slate-800 border border-white/5 shadow-[0_2px_5px_rgba(0,0,0,0.2)] text-slate-500 text-sm font-bold cursor-not-allowed"
                        >
                            In Arrivo
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button 
                                onClick={(e) => {
                                    if (inCart) navigate('/cart');
                                    else handleAddToCart(e);
                                }}
                                className={`p-4 rounded-xl border transition-all duration-200 shadow-[0_2px_5px_rgba(0,0,0,0.2)] ${inCart ? 'bg-brand-500/20 border-brand-500/50 text-brand-400' : 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                title={inCart ? "Vai al carrello" : "Aggiungi al carrello"}
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={() => onCourseSelect(course.id)}
                                className="relative flex-1 py-4 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 border-t border-brand-400 shadow-[0_4px_15px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] text-white text-sm font-bold hover:brightness-110 active:translate-y-[1px] active:shadow-none transition-all duration-200 overflow-hidden group/btn"
                            >
                                <span className="relative z-10">Dettagli</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-4 relative z-10 mt-auto">
                    {course.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-3 group/item">
                            <div className="w-5 h-5 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                <CheckCircle className="h-3 w-3 text-brand-400 group-hover/item:text-brand-300 transition-colors" />
                            </div>
                            <span className="text-sm text-slate-400 group-hover/item:text-slate-300 transition-colors line-clamp-1">
                                {feat}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const CoursesPage: React.FC<CoursesPageProps> = ({ courses, onCourseSelect, user }) => {
  return (
    <div className="pt-32 min-h-screen bg-black pb-32 font-sans text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="mb-28 relative w-full">
            <div className="flex items-center gap-8 mb-16">
                <span className="text-xs text-brand-400 tracking-[0.4em] font-mono">
                    01
                </span>
                <div className="h-px w-20 bg-gradient-to-r from-brand-500/60 to-transparent"></div>
                <span className="text-xs uppercase font-semibold text-white/60 tracking-[0.35em]">
                    Catalogo Percorsi
                </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end gap-16 justify-between">
                <div className="flex-1 space-y-8">
                    <h1 className="leading-[1.05] md:text-7xl text-5xl text-white tracking-tight font-bold max-w-3xl">
                        Semplice, trasparente
                        <br />
                        <span className="bg-clip-text font-medium text-transparent bg-gradient-to-b from-white to-white/40">
                            formazione per il futuro
                        </span>
                    </h1>
                </div>

                <div className="flex-1 max-w-xl space-y-10">
                    <p className="leading-relaxed text-lg font-light text-neutral-400">
                        Scegli il percorso che più si adatta alle tue esigenze. 
                        Accesso a vita, aggiornamenti inclusi e nessun abbonamento ricorrente. 
                        Inizia oggi la tua trasformazione con l'Intelligenza Artificiale.
                    </p>
                </div>
            </div>
        </div>

        {/* Griglia Percorsi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {courses.filter(c => !c.is_hidden).map((course) => (
                <CourseCard 
                    key={course.id} 
                    course={course} 
                    onCourseSelect={onCourseSelect} 
                    user={user} 
                />
            ))}
        </div>
      </div>
    </div>
  );
};
