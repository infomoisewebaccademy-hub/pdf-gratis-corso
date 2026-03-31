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
        <div className="pt-20 min-h-screen bg-white flex flex-col lg:flex-row relative">
            <Sidebar activeItem={location.pathname.substring(1) || 'profile'} onNavigate={(path) => navigate(path)} unreadCount={unreadChatCount} />
            
            <main className="flex-1 bg-gray-50/50 pb-20 relative z-10">
                <div className="max-w-4xl mx-auto px-6 py-10 lg:px-12">
                    <button onClick={() => navigate(-1)} className="mb-8 text-gray-500 hover:text-gray-900 font-medium flex items-center transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Torna Indietro
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Profilo Utente</h1>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <p className="text-lg text-gray-500">Questa sezione è in costruzione. Presto qui potrai modificare i tuoi dati personali, aggiornare la password e gestire le preferenze di notifica.</p>
                        <div className="mt-8 space-y-3">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">User ID</span>
                                <span className="font-mono text-sm text-gray-700">{user.id}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Email</span>
                                <span className="font-mono text-sm text-gray-700">{user.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
