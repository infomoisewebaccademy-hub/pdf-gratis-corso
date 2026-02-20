import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ThankYouPdf: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 font-sans">
            <div className="text-center bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl shadow-slate-950/50 p-8 md:p-12 max-w-2xl animate-in fade-in-5 zoom-in-90 duration-500">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/50">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-400 mb-4">
                    Grazie!
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-lg mx-auto mb-8">
                    Controlla la tua casella di posta. Ti abbiamo inviato un'email con la guida PDF e le credenziali per accedere alla tua area riservata.
                </p>
                <button 
                    onClick={() => navigate('/')} 
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center mx-auto group"
                >
                    <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                    Torna alla Home
                </button>
            </div>
            <div className="absolute bottom-4 text-xs text-slate-600">
                &copy; {new Date().getFullYear()} Moise Web Academy
            </div>
        </div>
    );
};
