import React from 'react';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface CertificatesPageProps {
    user: UserProfile;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="pt-32 min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate(-1)} className="mb-8 text-gray-500 hover:text-gray-900 font-medium flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Torna Indietro
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-6">I miei Certificati</h1>
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                    <p className="text-lg text-gray-600">Questa sezione è in costruzione. A breve, qui potrai visualizzare e scaricare i certificati di completamento per ogni corso terminato.</p>
                </div>
            </div>
        </div>
    );
};
