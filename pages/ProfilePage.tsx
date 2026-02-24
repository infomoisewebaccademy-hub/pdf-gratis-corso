import React from 'react';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
    user: UserProfile;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="pt-32 min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate(-1)} className="mb-8 text-gray-500 hover:text-gray-900 font-medium flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Torna Indietro
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Profilo Utente</h1>
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                    <p className="text-lg text-gray-600">Questa sezione è in costruzione. Presto qui potrai modificare i tuoi dati personali, aggiornare la password e gestire le preferenze di notifica.</p>
                    <div className="mt-8 space-y-3">
                        <p className="font-mono text-sm bg-gray-100 p-4 rounded-lg"><strong>User ID:</strong> {user.id}</p>
                        <p className="font-mono text-sm bg-gray-100 p-4 rounded-lg"><strong>Email:</strong> {user.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
