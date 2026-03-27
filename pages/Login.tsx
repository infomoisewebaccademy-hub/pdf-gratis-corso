
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Footer } from '../components/Footer';
import { LandingPageConfig } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
    landingConfig?: LandingPageConfig;
}

export const Login: React.FC<LoginProps> = ({ landingConfig }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email o password non validi. Riprova.');
        }
        throw error;
      }
      // Il listener su App.tsx gestirà il reindirizzamento
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante il login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-900 relative">
        {/* Main Content Area */}
        <div className="flex-grow flex justify-center items-center relative overflow-hidden pt-24 pb-12">
            {/* Background Image */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    background: `url('https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png') no-repeat center center fixed`,
                    backgroundSize: 'cover',
                    opacity: 0.3 // Leggermente oscurato per contrasto
                }}
            ></div>
            
            {/* Overlay Scuro */}
            <div className="absolute inset-0 bg-black/40 z-0"></div>

            <style>{`
                @keyframes floatIn {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-float-in {
                    animation: floatIn 1s ease-out forwards;
                }
            `}</style>

            {/* Login Card */}
            <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/20 rounded-[20px] p-10 w-[350px] shadow-[0_0_40px_rgba(2,83,157,0.3)] animate-float-in">
                <h2 className="text-center text-white mb-6 font-semibold text-2xl tracking-wide">Bentornato</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-5 relative">
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            placeholder="Email" 
                            disabled={isLoading}
                            className="w-full p-3 pl-4 rounded-[10px] bg-white/10 border border-white/20 text-white text-sm outline-none transition-all duration-300 focus:border-[#02539D] focus:shadow-[0_0_8px_rgba(2,83,157,0.6)] placeholder-gray-300 disabled:opacity-50"
                        />
                    </div>
                    <div className="mb-5 relative">
                        <input 
                            type="password" 
                            name="password" 
                            required 
                            placeholder="Password" 
                            disabled={isLoading}
                            className="w-full p-3 pl-4 rounded-[10px] bg-white/10 border border-white/20 text-white text-sm outline-none transition-all duration-300 focus:border-[#02539D] focus:shadow-[0_0_8px_rgba(2,83,157,0.6)] placeholder-gray-300 disabled:opacity-50"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full p-3 bg-[#02539D] text-white font-semibold rounded-[10px] cursor-pointer transition-all duration-300 hover:bg-[#024482] hover:shadow-[0_0_15px_rgba(2,83,157,0.6)] mb-5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Accesso in corso...
                            </>
                        ) : (
                            'Accedi'
                        )}
                    </button>
                </form>

                <div className="text-center text-xs text-[#888] mt-6">
                    Password dimenticata? | <span onClick={() => navigate('/register')} className="text-[#02539D] no-underline cursor-pointer hover:underline ml-1">Registrati</span>
                </div>
            </div>
        </div>

        {/* Footer */}
        {landingConfig?.footer && (
            <Footer config={landingConfig.footer} />
        )}
    </div>
  );
};
