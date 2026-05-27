import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const UpdatePassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mantiene la sessione se è un recupero, altrimenti rimanda al login
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Se non c'è sessione, rimanda al login (il link era scaduto o non valido)
        navigate('/login');
      }
    };
    checkSession();
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (password.length < 6) {
        throw new Error("La password deve essere di almeno 6 caratteri.");
      }

      const { error } = await supabase.auth.updateUser({ password: password });
      
      if (error) throw error;

      setSuccessMsg("Password aggiornata con successo! Ti stiamo reindirizzando alla tua Dashboard...");
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (error: any) {
      setErrorMsg(error.message || "Si è verificato un errore durante l'aggiornamento della password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex justify-center items-center overflow-hidden bg-slate-900 relative">
        {/* Background Image (stesso stile del Login) */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                background: `url('https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png') no-repeat center center fixed`,
                backgroundSize: 'cover',
                opacity: 0.3
            }}
        ></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/20 rounded-[20px] p-10 w-[350px] shadow-[0_0_40px_rgba(0,255,224,0.2)]">
            <h2 className="text-center text-white mb-2 font-semibold text-2xl tracking-wide">Imposta Password</h2>
            <p className="text-center text-gray-400 text-sm mb-6">Inserisci la tua nuova password per completare l'attivazione o il ripristino dell'account.</p>
            
            {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                </div>
            )}

            {successMsg && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-start gap-2 text-emerald-200 text-xs">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                </div>
            )}

            <form onSubmit={handleUpdatePassword}>
                <div className="mb-5 relative">
                    <input 
                        type="password" 
                        required 
                        minLength={6}
                        placeholder="Nuova Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading || !!successMsg}
                        className="w-full p-3 pl-4 rounded-[10px] bg-white/10 border border-white/20 text-white text-sm outline-none transition-all duration-300 focus:border-[#00ffe0] focus:shadow-[0_0_8px_#00ffe0aa] placeholder-gray-300 disabled:opacity-50"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading || !!successMsg}
                    className="w-full p-3 bg-[#00ffe0] text-black font-semibold rounded-[10px] cursor-pointer transition-all duration-300 hover:bg-[#00c6b5] hover:shadow-[0_0_15px_#00ffe0aa] mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Salvataggio...' : 'Salva e Accedi'}
                </button>
            </form>
        </div>
    </div>
  );
};
