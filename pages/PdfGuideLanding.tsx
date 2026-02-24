import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Loader, AlertCircle, User, Mail, ArrowRight, CheckCircle, Monitor, Code, Coffee, Star, ShieldCheck, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlatformSettings, PdfGuideConfig } from '../types';

const DEFAULT_PDF_CONFIG: PdfGuideConfig = {
    headline_solid: "CREA SITI CON L'AI",
    headline_gradient: "La Guida Gratuita",
    description: "Ricevi subito via email la nostra guida PDF passo-passo e accedi alla nostra piattaforma per un video-tutorial esclusivo. Inizia oggi a trasformare le tue idee in realtà.",
    subheadline: "Sblocca il potenziale dell'Intelligenza Artificiale e impara a creare siti web professionali, senza scrivere codice.",
    offer_badge: "100% Gratuito",
    offer_title: "Ottieni la Guida e l'Accesso Immediato",
    offer_text: "Inserisci i tuoi dati qui sotto. Riceverai la guida via email e le credenziali per accedere subito alla tua area riservata.",
    cta_text: "SÌ, INVIATEMI LA GUIDA!",
    success_title: "Accesso Inviato!",
    success_text: "Perfetto! Controlla la tua casella di posta (anche SPAM) per trovare la guida e le tue credenziali di accesso. Ci vediamo dentro!",
    form_disclaimer_text: "Inserisci i dati per ricevere la guida e creare il tuo accesso gratuito alla nostra piattaforma.",
    bg_color_main: "#f9fafb",
    title_color: "#111827",
    text_color_body: "#4b5563",
    gradient_start: "#2563eb",
    gradient_end: "#1d4ed8",
    testimonials_section: {
        title: 'Cosa Dicono i Nostri Studenti',
        subtitle: 'Testimonianze',
        is_visible: true,
        reviews: []
    },
    footer: {
        text: 'Moise Web Academy',
        copyright: 'Tutti i diritti riservati.',
        is_visible: true
    }
};

export const PdfGuideLanding: React.FC = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<PdfGuideConfig>(DEFAULT_PDF_CONFIG);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('platform_settings')
                    .select('pdf_guide_config')
                    .single();
                
                if (error) throw error;
                if (data?.pdf_guide_config) {
                    setConfig({ ...DEFAULT_PDF_CONFIG, ...data.pdf_guide_config });
                }
            } catch (err) {
                console.error("Errore caricamento settings:", err);
            }
        };

        fetchSettings();

        // Listen for preview messages from AdminDashboard
        const handleMessage = (event: MessageEvent) => {
            if (event.data && typeof event.data === 'object' && 'headline_solid' in event.data) {
                setConfig(prev => ({ ...prev, ...event.data }));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

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

    const renderForm = (isBottom = false) => (
        <div id={isBottom ? "bottom-form" : "form-section"} className={`bg-white p-8 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 ${isBottom ? 'max-w-xl mx-auto' : ''}`}>
            <div className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: `${config.gradient_start}1a`, color: config.gradient_start }}>
                {config.offer_badge}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.offer_title}</h3>
            <p className="text-gray-600 mb-6">{config.offer_text}</p>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder={config.form_name_placeholder || "Il tuo nome completo"} value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-3 pr-4 pl-12 text-gray-900 focus:ring-2 transition" style={{ '--tw-ring-color': config.gradient_start } as any} />
                </div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" placeholder={config.form_email_placeholder || "La tua email principale"} value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-3 pr-4 pl-12 text-gray-900 focus:ring-2 transition" style={{ '--tw-ring-color': config.gradient_start } as any} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full text-lg font-bold py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center group text-white shadow-lg" style={{ backgroundColor: config.gradient_start, boxShadow: `0 10px 15px -3px ${config.gradient_start}4d` }}>
                    {isLoading ? <Loader className="animate-spin h-6 w-6" /> : <>{config.cta_text} <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></>}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-4 text-center flex items-center justify-center"><AlertCircle className="h-4 w-4 mr-2"/> {error}</p>}
            <p className="text-xs text-gray-500 mt-4 text-center">{config.form_disclaimer_text}</p>
        </div>
    );

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: config.bg_color_main }}>
            {/* 1. HERO SECTION */}
            <header className="bg-white text-center pt-24 pb-20 px-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900" style={{ color: config.title_color }}>
                    {config.headline_solid} <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${config.gradient_start}, ${config.gradient_end})` }}>{config.headline_gradient}</span>
                </h1>
                <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-gray-600" style={{ color: config.text_color_body }}>{config.subheadline}</p>
                <a href="#form-section" className="mt-8 inline-block text-lg font-bold py-4 px-10 rounded-lg transition-all duration-300 ease-in-out group text-white shadow-lg" style={{ backgroundColor: config.gradient_start }}>
                    Scarica la Guida Gratuita
                </a>
            </header>

            <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-24">
                {/* 2. PROBLEMA */}
                <section className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">“Vorrei un sito, ma da dove inizio?”</h2>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto">Se questo pensiero ti suona familiare, non sei solo. Molti credono di dover imparare a programmare, spendere migliaia di euro o capire termini tecnici come 'hosting' e 'dominio'. La verità? Il problema non sei tu, ma gli strumenti complicati che ti hanno proposto finora.</p>
                </section>

                {/* 3. SOLUZIONE */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
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
                            <Monitor className="h-12 w-12 mx-auto mb-4" style={{ color: config.gradient_start }} />
                            <h3 className="font-bold text-xl mb-2">Siti Vetrina</h3>
                            <p className="text-gray-600">Per presentare la tua attività, il tuo portfolio o un progetto personale.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <Code className="h-12 w-12 mx-auto mb-4" style={{ color: config.gradient_start }} />
                            <h3 className="font-bold text-xl mb-2">Pagine Semplici</h3>
                            <p className="text-gray-600">Per lanciare un prodotto, un evento o raccogliere contatti in modo rapido.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <Coffee className="h-12 w-12 mx-auto mb-4" style={{ color: config.gradient_start }} />
                            <h3 className="font-bold text-xl mb-2">Progetti Reali</h3>
                            <p className="text-gray-600">L'AI non sostituisce un programmatore, ma ti dà un'autonomia che prima era impensabile.</p>
                        </div>
                    </div>
                </section>

                {/* 5. TESTIMONIALS */}
                {config.testimonials_section?.is_visible && config.testimonials_section.reviews.length > 0 && (
                    <section className="py-12">
                        <div className="text-center mb-12">
                            <h2 className="font-bold tracking-widest uppercase text-sm mb-2" style={{ color: config.gradient_start }}>{config.testimonials_section.subtitle}</h2>
                            <h3 className="text-3xl md:text-4xl font-black text-gray-900">{config.testimonials_section.title}</h3>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {config.testimonials_section.reviews.map((review, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random`} alt={review.name} className="h-12 w-12 rounded-full object-cover border-2 border-gray-50" referrerPolicy="no-referrer" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight">{review.name}</h4>
                                            <p className="text-xs text-gray-500">{review.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mb-3">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                    <p className="text-gray-600 text-sm italic leading-relaxed">"{review.text}"</p>
                                    {review.verified && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-green-600">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Recensione Verificata</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. PER CHI È / PER CHI NON È */}
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

                {/* 7. CTA FINALE + FORM */}
                <section className="text-center space-y-12 pb-20">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto a mettere online la tua idea?</h2>
                        <p className="text-lg text-gray-700 mb-8">Scarica la guida gratuita. È un PDF, senza fronzoli, che ti mostra esattamente cosa fare. Nessun costo, nessun rischio.</p>
                    </div>
                    {renderForm(true)}
                </section>
            </main>

            {/* 8. FOOTER */}
            {config.footer?.is_visible && (
                <footer className="bg-white border-t border-gray-200 py-12">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <h4 className="text-xl font-black tracking-tighter text-gray-900 mb-4">{config.footer.text}</h4>
                        <div className="flex justify-center gap-6 mb-8">
                            {config.footer.social_links?.facebook && <a href={config.footer.social_links.facebook} className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook className="h-5 w-5"/></a>}
                            {config.footer.social_links?.instagram && <a href={config.footer.social_links.instagram} className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram className="h-5 w-5"/></a>}
                            {config.footer.social_links?.linkedin && <a href={config.footer.social_links.linkedin} className="text-gray-400 hover:text-blue-700 transition-colors"><Linkedin className="h-5 w-5"/></a>}
                            {config.footer.social_links?.youtube && <a href={config.footer.social_links.youtube} className="text-gray-400 hover:text-red-600 transition-colors"><Youtube className="h-5 w-5"/></a>}
                        </div>
                        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {config.footer.copyright}</p>
                    </div>
                </footer>
            )}
        </div>
    );
};
