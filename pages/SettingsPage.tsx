import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Sidebar } from '../components/Sidebar';

interface SettingsPageProps {
    user: UserProfile;
    unreadChatCount?: number;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, unreadChatCount = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setMessage({ type: 'error', text: 'La password deve essere di almeno 6 caratteri.' });
            return;
        }
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({ password });

        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: `Errore: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: 'Password aggiornata con successo!' });
            setPassword('');
        }
    };

    return (
        <div className="pt-20 min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[120px]" />
            </div>

            <Sidebar activeItem={location.pathname.substring(1) || 'settings'} onNavigate={(path) => navigate(path)} unreadCount={unreadChatCount} />
            
            <main className="flex-1 bg-slate-900/50 pb-20 relative z-10">
                <div className="max-w-4xl mx-auto px-6 py-10 lg:px-12">
                    <button onClick={() => navigate(-1)} className="mb-8 text-slate-400 hover:text-white font-medium flex items-center transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Torna Indietro
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Impostazioni Account</h1>
                    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-8">
                        <h2 className="text-2xl font-bold text-slate-100 mb-4">Modifica Password</h2>
                        <p className="text-slate-400 mb-6">Inserisci una nuova password per il tuo account. Ti consigliamo di usare una password sicura che non utilizzi per altri servizi.</p>
                        
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nuova Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-white placeholder:text-slate-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || password.length < 6}
                                className="w-full flex items-center justify-center px-6 py-3.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {loading ? 'Salvataggio...' : 'Salva Nuova Password'}
                            </button>
                        </form>

                        {message && (
                            <div className={`mt-6 p-4 rounded-xl text-sm font-bold ${
                                message.type === 'success' 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
