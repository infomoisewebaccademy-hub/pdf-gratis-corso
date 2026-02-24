import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Loader, AlertCircle, User, Mail, ArrowRight, CheckCircle, Monitor, Code, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PdfGuideLanding: React.FC = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !fullName) {
            setError("Per favore, compila tutti i campi.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: functionError } = await supabase.functions.invoke('create-free-user', {
                body: { email, full_name: fullName },
            });

            if (functionError) throw functionError;
            if (data.userExists) {
                alert("Questa email è già registrata! Controlla la tua casella di posta per le credenziali.");
            }
            navigate('/thank-you-pdf-gratuita');
        } catch (error: any) {
            setError(error.message || "Si è verificato un errore. Riprova più tardi.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderForm = () => (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Scarica la Guida Pratica</h3>
            <p className="text-gray-600 text-center mb-6">Ricevi subito via email il PDF gratuito.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Il tuo nome completo" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-3 pr-4 pl-12 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition" />
                </div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" placeholder="La tua email principale" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-3 pr-4 pl-12 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full text-lg font-bold py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center group bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                    {isLoading ? <Loader className="animate-spin h-6 w-6" /> : <>Voglio la Guida <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></>}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-4 text-center flex items-center justify-center"><AlertCircle className="h-4 w-4 mr-2"/> {error}</p>}
            <p className="text-xs text-gray-500 mt-4 text-center">Rispettiamo la tua privacy. Niente spam.</p>
        </div>
    );

    return (
        <div className="bg-gray-50 text-gray-800 font-sans">
            {/* 1. HERO SECTION */}
            <header className="bg-white text-center pt-24 pb-20 px-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900">Il Tuo Sito Web Online in 1 Ora, Senza Scrivere Codice.</h1>
                <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-gray-600">Usa l'intelligenza artificiale di Google per creare e pubblicare il tuo sito, anche se parti da zero. Ti guido io, passo dopo passo.</p>
                <a href="#form-section" className="mt-8 inline-block text-lg font-bold py-4 px-10 rounded-lg transition-all duration-300 ease-in-out group bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                    Scarica la Guida Gratuita
                </a>
            </header>

            <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-24">
                {/* 2. PROBLEMA */}
                <section className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">“Vorrei un sito, ma da dove inizio?”</h2>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto">Se questo pensiero ti suona familiare, non sei solo. Molti credono di dover imparare a programmare, spendere migliaia di euro o capire termini tecnici come 'hosting' e 'dominio'. La verità? Il problema non sei tu, ma gli strumenti complicati che ti hanno proposto finora.</p>
                </section>

                {/* 3. SOLUZIONE */}
                <section id="form-section" className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">La soluzione è un metodo, non più codice.</h2>
                        <p className="text-lg text-gray-700 mb-6">In questa guida PDF ti mostro un sistema pratico per dire a una macchina cosa vuoi, e vederlo realizzato in pochi minuti. Niente teoria, solo pratica. <br/><br/> All'interno troverai:</p>
                        <ul className="space-y-4">
                            <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span><strong>Il processo esatto, passo-passo:</strong> Dalla pagina bianca al sito online, senza saltare un solo passaggio.</span></li>
                            <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span><strong>Esempi reali e istruzioni chiare:</strong> Vedrai cosa scrivere e dove cliccare per ottenere un risultato professionale.</span></li>
                            <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span><strong>Il risultato finale:</strong> Un sito vetrina semplice, pulito e funzionante, pronto per essere mostrato al mondo.</span></li>
                        </ul>
                    </div>
                    {renderForm()}
                </section>

                {/* 4. PROVA E RISULTATI */}
                <section>
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Cosa puoi costruire DAVVERO con questo metodo?</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <Monitor className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                            <h3 className="font-bold text-xl mb-2">Siti Vetrina</h3>
                            <p className="text-gray-600">Per presentare la tua attività, il tuo portfolio o un progetto personale.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <Code className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                            <h3 className="font-bold text-xl mb-2">Pagine Semplici</h3>
                            <p className="text-gray-600">Per lanciare un prodotto, un evento o raccogliere contatti in modo rapido.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <Coffee className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                            <h3 className="font-bold text-xl mb-2">Progetti Reali</h3>
                            <p className="text-gray-600">L'AI non sostituisce un programmatore, ma ti dà un'autonomia che prima era impensabile.</p>
                        </div>
                    </div>
                </section>

                {/* 5. PER CHI È / PER CHI NON È */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-green-800 mb-4">Questa guida è per te se:</h3>
                        <ul className="space-y-2 text-green-700">
                            <li>- Vuoi un risultato concreto e visibile.</li>
                            <li>- Parti da zero e non hai competenze tecniche.</li>
                            <li>- Sei disposto a seguire un metodo passo-passo.</li>
                            <li>- Vuoi capire come usare l'AI in modo pratico.</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-red-800 mb-4">Questa guida NON è per te se:</h3>
                        <ul className="space-y-2 text-red-700">
                            <li>- Cerchi un modo per fare soldi facili online.</li>
                            <li>- Vuoi creare un e-commerce complesso in 5 minuti.</li>
                            <li>- Non hai voglia di imparare un nuovo strumento.</li>
                            <li>- Pensi che l'AI faccia tutto da sola senza input.</li>
                        </ul>
                    </div>
                </section>

                {/* 6. COSA SUCCEDE DOPO */}
                <section className="text-center bg-white border border-gray-200 rounded-2xl p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Cosa succede dopo aver scaricato la guida?</h2>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">Riceverai subito il PDF e potrai iniziare a creare. Questa guida è il primo passo per darti autonomia. Una volta che avrai il tuo sito base, potresti voler fare il passo successivo: registrarlo con un dominio personalizzato (.it o .com), renderlo più sicuro e pubblicarlo in modo professionale. Quello è un percorso più avanzato, ma le fondamenta le costruiamo oggi, insieme.</p>
                </section>

                {/* 7. CTA FINALE */}
                <section className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto a mettere online la tua idea?</h2>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">Scarica la guida gratuita. È un PDF, senza fronzoli, che ti mostra esattamente cosa fare. Nessun costo, nessun rischio.</p>
                    <a href="#form-section" className="inline-block text-lg font-bold py-4 px-10 rounded-lg transition-all duration-300 ease-in-out group bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                        Voglio la Guida, Ora
                    </a>
                </section>
            </main>
        </div>
    );
};
