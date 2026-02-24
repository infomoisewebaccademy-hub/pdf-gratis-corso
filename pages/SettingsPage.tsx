import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../services/supabase';

interface SettingsPageProps {
    user: UserProfile;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
    const navigate = useNavigate();
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
        <div className="pt-32 min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate(-1)} className="mb-8 text-gray-500 hover:text-gray-900 font-medium flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Torna Indietro
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Impostazioni Account</h1>
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Modifica Password</h2>
                    <p className="text-gray-500 mb-6">Inserisci una nuova password per il tuo account. Ti consigliamo di usare una password sicura che non utilizzi per altri servizi.</p>
                    
                    <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full border border-gray-300 rounded-lg p-3"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading || password.length < 6}
                            className="w-full flex items-center justify-center px-6 py-3 bg-brand-600 text-white rounded-lg font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {loading ? 'Salvataggio...' : 'Salva Nuova Password'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-lg text-sm font-bold ${
                            message.type === 'success' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
