import React from 'react';
import { UserProfile } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

interface ProfilePageProps {
    user: UserProfile;
    unreadChatCount?: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, unreadChatCount = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="pt-20 min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[120px]" />
            </div>

            <Sidebar activeItem={location.pathname.substring(1) || 'profile'} onNavigate={(path) => navigate(path)} unreadCount={unreadChatCount} />
            
            <main className="flex-1 bg-slate-900/50 pb-20 relative z-10">
                <div className="max-w-4xl mx-auto px-6 py-10 lg:px-12">
                    <button onClick={() => navigate(-1)} className="mb-8 text-slate-400 hover:text-white font-medium flex items-center transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Torna Indietro
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Profilo Utente</h1>
                    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-8">
                        <p className="text-lg text-slate-400">Questa sezione è in costruzione. Presto qui potrai modificare i tuoi dati personali, aggiornare la password e gestire le preferenze di notifica.</p>
                        <div className="mt-8 space-y-3">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">User ID</span>
                                <span className="font-mono text-sm text-slate-200">{user.id}</span>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Email</span>
                                <span className="font-mono text-sm text-slate-200">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
