import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PdfGuideConfig } from '../types';
import { Loader, CheckCircle, AlertCircle, User, Mail, ArrowRight, Sparkles, ShieldCheck, DollarSign } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface PdfGuideLandingProps {
    config: PdfGuideConfig;
}

const BenefitCard: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center transform hover:-translate-y-2 transition-transform duration-300">
        <Icon className="h-10 w-10 mx-auto mb-4 text-purple-400" />
        <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{children}</p>
    </div>
);

export const PdfGuideLanding: React.FC<PdfGuideLandingProps> = ({ config: initialConfig }) => {
    const [config, setConfig] = useState(initialConfig);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const isPreview = new URLSearchParams(location.search).get('preview') === 'true';

    useEffect(() => {
        if (isPreview) {
            const handleMessage = (event: MessageEvent) => {
                if (typeof event.data === 'object' && event.data !== null && Object.keys(event.data).length > 0) {
                    setConfig(prevConfig => ({ ...prevConfig, ...event.data }));
                }
            };
            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }
    }, [isPreview]);

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

    const renderForm = (isSticky = false) => (
        <div className={`bg-slate-900 p-8 rounded-xl border border-slate-700 shadow-2xl shadow-black/50 ${isSticky ? 'sticky top-8' : ''}`}>
            <h3 className="text-2xl font-bold text-white text-center mb-2">{config.offer_title}</h3>
            <p className="text-slate-400 text-center mb-6">{config.offer_text}</p>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input type="text" placeholder={config.form_name_placeholder} value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg py-3 pr-4 pl-12 text-white focus:ring-purple-500 focus:border-purple-500 transition" />
                </div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input type="email" placeholder={config.form_email_placeholder} value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg py-3 pr-4 pl-12 text-white focus:ring-purple-500 focus:border-purple-500 transition" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full text-lg font-bold py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center group bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/50">
                    {isLoading ? <Loader className="animate-spin h-6 w-6" /> : <>{config.cta_text} <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></>}
                </button>
            </form>
            {error && <p className="text-red-400 text-sm mt-4 text-center flex items-center justify-center"><AlertCircle className="h-4 w-4 mr-2"/> {error}</p>}
            <p className="text-xs text-slate-600 mt-4 text-center">{config.form_disclaimer_text}</p>
        </div>
    );

    return (
        <div style={{ backgroundColor: config.bg_color_main, color: config.text_color_body }} className="min-h-screen font-sans text-slate-300">
            <div className="text-center pt-20 pb-16 px-4 bg-slate-900/70">
                <span className="inline-block bg-purple-500/20 text-purple-300 text-sm font-bold px-4 py-1 rounded-full mb-4 border border-purple-500/30">{config.offer_badge}</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white">
                    {config.headline_solid} <span style={{ backgroundImage: `linear-gradient(to right, ${config.gradient_start}, ${config.gradient_end})` }} className="text-transparent bg-clip-text">{config.headline_gradient}</span>
                </h1>
                <p className="max-w-3xl mx-auto mt-6 text-lg sm:text-xl text-slate-400">{config.subheadline}</p>
                <a href="#form-section" className="mt-8 inline-block text-lg font-bold py-4 px-10 rounded-lg transition-all duration-300 ease-in-out group bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/50">
                    Scarica la Guida Ora <ArrowRight className="inline-block h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
            </div>

            <div id="form-section" className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
                        <h2 className="text-3xl font-bold text-white mb-4">La Creazione Web è <span className="text-red-400">Complicata e Costosa</span>. O forse no?</h2>
                        <p className="mb-4">Fino a ieri, per avere un sito professionale dovevi scegliere: spendere 5.000€ per un'agenzia, passare mesi a imparare a programmare, o accontentarti di un template mediocre. Tempi lunghi, costi alti e zero controllo.</p>
                        <p className="font-bold text-purple-300">Oggi, l'Intelligenza Artificiale ha cambiato le regole del gioco.</p>
                    </div>

                    {(config.showcase_items || []).length > 0 && (
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6 text-center">Cosa Creerai con Queste Competenze</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {config.showcase_items?.map((item, idx) => (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" key={idx} className="block bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden group">
                                        <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"/>
                                        <div className="p-4">
                                            <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{item.title}</h4>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">Cosa Sbloccherai con la Guida</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <BenefitCard icon={Sparkles} title="Struttura AI-Driven">Impara a generare layout professionali e testi persuasivi in pochi minuti.</BenefitCard>
                            <BenefitCard icon={ShieldCheck} title="Sicurezza e Hosting">Metti online il tuo sito in modo sicuro su infrastrutture a costo zero.</BenefitCard>
                            <BenefitCard icon={DollarSign} title="Monetizzazione">Scopri come trasformare questa competenza in un servizio da vendere a 1.000€+.</BenefitCard>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {renderForm(true)}
                </div>
            </div>

            {config.stats_section?.is_visible && (config.stats_section?.stats || []).length > 0 && (
                <section className="max-w-7xl mx-auto p-4 sm:p-8 mt-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">{config.stats_section.title}</h2>
                        <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-400">{config.stats_section.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {config.stats_section.stats.map((stat, idx) => (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                                <div className="text-5xl font-black text-transparent bg-clip-text mb-2" style={{ backgroundImage: `linear-gradient(to right, ${config.gradient_start}, ${config.gradient_end})` }}>
                                    {stat.value}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">{stat.label}</h4>
                                <p className="text-slate-400">{stat.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
