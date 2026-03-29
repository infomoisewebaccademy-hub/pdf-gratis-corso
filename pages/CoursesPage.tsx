
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
        <div className={`bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col ${isNotActive ? 'opacity-80' : ''}`}>
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => onCourseSelect(course.id)}>
                <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>
                
                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
                        {course.level}
                    </span>
                    {isFull && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Posti Esauriti
                        </span>
                    )}
                    {isComingSoon && (
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            In Arrivo
                        </span>
                    )}
                </div>
            </div>
            
            {/* Content Section */}
            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-3 cursor-pointer hover:text-brand-400 transition-colors line-clamp-2" onClick={() => onCourseSelect(course.id)}>
                    {course.title}
                </h3>
                
                <div className="relative mb-6 flex-grow">
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {descriptionText}
                    </p>
                    {shouldTruncate && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-brand-400 text-xs font-bold mt-2 hover:text-brand-300 transition-colors focus:outline-none"
                        >
                            {isExpanded ? "Mostra meno" : "Leggi tutto"}
                        </button>
                    )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                    {course.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-300 line-clamp-2">{feat}</span>
                        </div>
                    ))}
                </div>

                {/* Price & Actions */}
                <div className="mt-auto pt-6 border-t border-slate-800">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <span className="text-sm text-slate-500 block mb-1">Prezzo</span>
                            <span className="text-4xl font-black text-white tracking-tight">€{course.price}</span>
                        </div>
                    </div>

                    {isPurchased ? (
                        <button 
                            onClick={() => onCourseSelect(course.id)}
                            className="w-full py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                            Vai al Percorso <ArrowRight className="h-5 w-5" />
                        </button>
                    ) : isFull ? (
                        <button 
                            disabled
                            className="w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-bold cursor-not-allowed"
                        >
                            Posti Esauriti
                        </button>
                    ) : isComingSoon ? (
                        <button 
                            disabled
                            className="w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-bold cursor-not-allowed"
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
                                className={`p-4 rounded-xl transition-all duration-300 flex items-center justify-center ${inCart ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                title={inCart ? "Vai al carrello" : "Aggiungi al carrello"}
                            >
                                <ShoppingCart className="h-6 w-6" />
                            </button>
                            <button 
                                onClick={() => onCourseSelect(course.id)}
                                className="flex-1 py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20"
                            >
                                Scopri di più
                            </button>
                        </div>
                    )}
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
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 relative w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Catalogo <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Percorsi</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
                Scegli il percorso che più si adatta alle tue esigenze. 
                Accesso a vita, aggiornamenti inclusi e nessun abbonamento ricorrente. 
                Inizia oggi la tua trasformazione con l'Intelligenza Artificiale.
            </p>
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
