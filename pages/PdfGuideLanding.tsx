import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Loader, AlertCircle, User, Mail, ArrowRight, CheckCircle, Monitor, Code, Coffee, Star, ShieldCheck, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlatformSettings, PdfGuideConfig } from '../types';

const DEFAULT_PDF_CONFIG: PdfGuideConfig = {
    meta_pixel_id: '1825625164777432',
    headline_solid: "CREA PIATTAFORME CON",
    headline_gradient: "L'INTELLIGENZA ARTIFICIALE",
    description: "Ricevi subito via email la nostra guida PDF passo-passo e accedi alla nostra piattaforma per un video-tutorial esclusivo. Inizia oggi a trasformare le tue idee in realtà.",
    subheadline: "Sblocca il potenziale dell'Intelligenza Artificiale e impara a creare siti web professionali, senza scrivere codice.",
    offer_badge: "100% Gratuito",
    offer_title: "Ottieni la Guida e l'Accesso Immediato",
    offer_text: "Inserisci i tuoi dati qui sotto. Riceverai la guida via email e le credenziali per accedere subito alla tua area riservata.",
    cta_text: "SÌ, INVIATEMI LA GUIDA!",
    success_title: "Accesso Inviato!",
    success_text: "Perfetto! Controlla la tua casella di posta (anche SPAM) per trovare la guida e le tue credenziali di accesso. Ci vediamo dentro!",
    form_disclaimer_text: "Inserisci i dati per ricevere la guida e creare il tuo accesso gratuito alla nostra piattaforma.",
    bg_color_main: "#020617",
    title_color: "#ffffff",
    text_color_body: "#94a3b8",
    gradient_start: "#6366f1",
    gradient_end: "#a855f7",
    testimonials_section: {
        title: 'Cosa Dicono i Nostri Studenti',
        subtitle: 'Testimonianze',
        is_visible: true,
        reviews: [
            {
                name: 'Elena G.',
                role: 'Imprenditrice Digitale',
                text: 'Ho sempre pensato che creare un e-commerce fosse un incubo tecnico. Con questo corso ho messo online il mio shop in un weekend, senza scrivere una riga di codice. Incredibile!',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
                verified: true
            },
            {
                name: 'Davide F.',
                role: 'Consulente Marketing',
                text: "Finalmente un corso che va dritto al punto. L'approccio pratico con l'AI mi ha permesso di offrire landing page ai miei clienti a un prezzo competitivo, aumentando il mio fatturato del 40%.",
                avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
                verified: true
            },
            {
                name: 'Sofia L.',
                role: 'Studentessa',
                text: "Partivo da zero assoluto. Ora ho creato il sito per l'attività di famiglia e sto già ricevendo richieste da altri commercianti. Una competenza che mi ha aperto un mondo.",
                avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
                verified: true
            }
        ]
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
                    // Mantieni i colori del tema scuro di default, aggiorna solo il contenuto
                    const { 
                        bg_color_main,
                        title_color,
                        text_color_body,
                        gradient_start,
                        gradient_end,
                        ...contentConfig 
                    } = data.pdf_guide_config;

                    const fetchedConfig = { ...DEFAULT_PDF_CONFIG, ...contentConfig };
                    
                    // Logic to ensure 10 reviews
                    if (!fetchedConfig.testimonials_section?.reviews || fetchedConfig.testimonials_section.reviews.length < 10) {
                        fetchedConfig.testimonials_section = {
                            ...(fetchedConfig.testimonials_section || DEFAULT_PDF_CONFIG.testimonials_section!),
                            reviews: DEFAULT_PDF_CONFIG.testimonials_section!.reviews
                        };
                    }
                    setConfig(fetchedConfig);
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

    useEffect(() => {
        const styleId = 'pdf-dynamic-colors-style';
        let style = document.getElementById(styleId) as HTMLStyleElement;
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        const getShade = (hex: string, percent: number) => {
            if (!hex || typeof hex !== 'string') return hex;
            if (!hex.startsWith('#')) hex = '#' + hex;
            if (hex.length !== 7) return hex;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const adjust = (val: number) => {
                const res = Math.round(val + (255 - val) * percent);
                return Math.min(255, Math.max(0, res)).toString(16).padStart(2, '0');
            };
            const darken = (val: number) => {
                const res = Math.round(val * (1 + percent));
                return Math.min(255, Math.max(0, res)).toString(16).padStart(2, '0');
            };
            if (percent > 0) return `#${adjust(r)}${adjust(g)}${adjust(b)}`;
            return `#${darken(r)}${darken(g)}${darken(b)}`;
        };

        const brand = config.gradient_start;
        let css = ':root {\n';
        css += `  --brand-50: ${getShade(brand, 0.9)};\n`;
        css += `  --brand-100: ${getShade(brand, 0.8)};\n`;
        css += `  --brand-200: ${getShade(brand, 0.6)};\n`;
        css += `  --brand-300: ${getShade(brand, 0.4)};\n`;
        css += `  --brand-400: ${getShade(brand, 0.2)};\n`;
        css += `  --brand-500: ${brand};\n`;
        css += `  --brand-600: ${getShade(brand, -0.1)};\n`;
        css += `  --brand-700: ${getShade(brand, -0.2)};\n`;
        css += `  --brand-800: ${getShade(brand, -0.3)};\n`;
        css += `  --brand-900: ${getShade(brand, -0.4)};\n`;
        css += `  --brand-950: ${getShade(brand, -0.6)};\n`;
        css += `  --bg-main: ${config.bg_color_main};\n`;
        css += `}\n`;
        css += `body { background-color: ${config.bg_color_main} !important; }\n`;
        
        style.innerHTML = css;
    }, [config.gradient_start, config.bg_color_main]);

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
        <div id={isBottom ? "bottom-form" : "form-section"} className={`bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden ${isBottom ? 'max-w-xl mx-auto' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-30 pointer-events-none"></div>
            <div className="relative z-10">
                <div className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: `${config.gradient_start}1a`, color: config.gradient_start }}>
                    {config.offer_badge}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{config.offer_title}</h3>
                <p className="text-slate-400 mb-6">{config.offer_text}</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input type="text" placeholder={config.form_name_placeholder || "Il tuo nome completo"} value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-4 pl-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-500/50 transition outline-none" />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input type="email" placeholder={config.form_email_placeholder || "La tua email principale"} value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-4 pl-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-500/50 transition outline-none" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full text-lg font-bold py-4 rounded-xl transition-all duration-300 ease-in-out flex items-center justify-center group text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.7)] transform hover:-translate-y-1" style={{ backgroundColor: config.gradient_start }}>
                        {isLoading ? <Loader className="animate-spin h-6 w-6" /> : <>{config.cta_text} <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></>}
                    </button>
                </form>
                {error && <p className="text-red-400 text-sm mt-4 text-center flex items-center justify-center"><AlertCircle className="h-4 w-4 mr-2"/> {error}</p>}
                <p className="text-xs text-slate-500 mt-4 text-center">{config.form_disclaimer_text}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans text-slate-200 selection:bg-brand-500/30" style={{ backgroundColor: config.bg_color_main }}>
            {/* Background Glows */}
            <div className="fixed top-0 w-full h-screen -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
            </div>

            {/* 1. HERO SECTION */}
            <header className="relative text-center pt-32 pb-24 px-4 overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-brand-400 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-8 backdrop-blur-md">
                        <Monitor className="h-3 w-3" />
                        Guida PDF Gratuita 2025
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95] mb-8">
                        {config.headline_solid} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${config.gradient_start}, ${config.gradient_end})` }}>
                            {config.headline_gradient}
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto mt-8 text-xl md:text-2xl text-slate-400 leading-relaxed" style={{ color: config.text_color_body }}>
                        {config.subheadline}
                    </p>
                    <div className="mt-12">
                        <a href="#form-section" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white rounded-2xl transition-all shadow-[0_0_50px_-10px_rgba(99,102,241,0.6)] group transform hover:-translate-y-1" style={{ backgroundColor: config.gradient_start }}>
                            Scarica la Guida Gratuita <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 space-y-32 pb-32">
                {/* 2. PROBLEMA & SOLUZIONE */}
                <section className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">“Vorrei un sito, ma da dove inizio?”</h2>
                            <p className="text-lg text-slate-400 leading-relaxed">Se questo pensiero ti suona familiare, non sei solo. Molti credono di dover imparare a programmare o spendere migliaia di euro. La verità? Il problema non sei tu, ma gli strumenti complicati che ti hanno proposto finora.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-white">La soluzione è un metodo, non più codice.</h3>
                            <p className="text-lg text-slate-400">In questa guida PDF ti mostro un sistema pratico per dire a una macchina cosa vuoi, e vederlo realizzato in pochi minuti. All'interno troverai:</p>
                            <ul className="space-y-4">
                                {[
                                    { title: "Il processo esatto, passo-passo", desc: "Dalla pagina bianca al sito online, senza saltare un solo passaggio." },
                                    { title: "Esempi reali e istruzioni chiare", desc: "Vedrai cosa scrivere e dove cliccare per ottenere un risultato professionale." },
                                    { title: "Il risultato finale", desc: "Un sito vetrina semplice, pulito e funzionante, pronto per essere mostrato al mondo." }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="mt-1 flex-shrink-0 h-6 w-6 rounded-full bg-brand-500/20 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-brand-400" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-white">{item.title}</span>
                                            <span className="text-slate-400 text-sm">{item.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-brand-500/20 blur-3xl rounded-full opacity-20 pointer-events-none"></div>
                        {renderForm()}
                    </div>
                </section>

                {/* 3. PROVA E RISULTATI */}
                <section className="space-y-16">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Cosa puoi costruire DAVVERO?</h2>
                        <p className="text-xl text-slate-400">L'AI non sostituisce un programmatore, ma ti dà un'autonomia che prima era impensabile.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Monitor, title: "Siti Vetrina", desc: "Per presentare la tua attività, il tuo portfolio o un progetto personale." },
                            { icon: Code, title: "Pagine Semplici", desc: "Per lanciare un prodotto, un evento o raccogliere contatti in modo rapido." },
                            { icon: Coffee, title: "Progetti Reali", desc: "Trasforma le tue idee in piattaforme funzionanti senza barriere tecniche." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-brand-500/30 transition-all group">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-brand-500/10 ring-1 ring-brand-500/20 group-hover:scale-110 transition-transform">
                                    <item.icon className="h-7 w-7 text-brand-400" />
                                </div>
                                <h3 className="font-bold text-xl text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* WEBSITE SHOWCASE */}
                <section className="space-y-16 py-20">
                    <div className="text-center space-y-4 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-brand-300 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-4">
                            <Monitor className="h-3 w-3" />
                            Esempi Reali
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Cosa puoi creare davvero</h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Questi sono esempi reali di siti e piattaforme creati interamente con l'AI. 
                            <span className="text-brand-400 font-semibold block mt-2">
                                Nella guida PDF questi siti sono già compresi e potrai modificarli a tuo piacimento per poi pubblicarli online.
                            </span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            "https://please-make-the-55.aura.build/",
                            "https://real-estate-developer-99.aura.build/",
                            "https://ferdousmikdad-test.aura.build/",
                            "https://luxury-coastal-60.aura.build/",
                            "https://minimal-landing.aura.build/"
                        ].map((url, idx) => (
                            <div key={idx} className="group relative bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-brand-500/50 transition-all duration-500">
                                <div className="h-10 bg-slate-900 flex items-center px-4 gap-2 border-b border-white/5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <div className="flex-1 text-[10px] text-slate-500 font-mono truncate text-center opacity-50">
                                        {url.replace('https://', '')}
                                    </div>
                                </div>
                                <div className="h-[450px] overflow-hidden relative">
                                    <iframe 
                                        src={url} 
                                        className="w-full h-full border-none"
                                        title={`Showcase PDF ${idx}`}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-400">Template Incluso #{idx + 1}</span>
                                    <div className="flex items-center gap-2 text-brand-400 text-xs font-bold">
                                        <CheckCircle className="h-3 w-3" />
                                        EDITABILE
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. TESTIMONIALS */}
                {config.testimonials_section?.is_visible && config.testimonials_section.reviews.length > 0 && (
                    <section className="space-y-16">
                        <div className="text-center space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-400">{config.testimonials_section.subtitle}</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{config.testimonials_section.title}</h3>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {config.testimonials_section.reviews.map((review, idx) => (
                                <div key={idx} className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col h-full">
                                    <div className="flex items-center gap-4 mb-6">
                                        <img src={review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random`} alt={review.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10" referrerPolicy="no-referrer" />
                                        <div>
                                            <h4 className="font-bold text-white leading-tight">{review.name}</h4>
                                            <p className="text-xs text-slate-500">{review.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />)}
                                    </div>
                                    <p className="text-slate-300 italic leading-relaxed flex-grow">"{review.text}"</p>
                                    {review.verified && (
                                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2 text-brand-400">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Studente Verificato</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. PER CHI È / PER CHI NON È */}
                <section className="grid md:grid-cols-2 gap-8">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-10 space-y-6">
                        <h3 className="text-2xl font-bold text-emerald-400">Questa guida è per te se:</h3>
                        <ul className="space-y-4">
                            {[
                                "Vuoi un risultato concreto e visibile.",
                                "Parti da zero e non hai competenze tecniche.",
                                "Sei disposto a seguire un metodo passo-passo.",
                                "Vuoi capire come usare l'AI in modo pratico."
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-10 space-y-6">
                        <h3 className="text-2xl font-bold text-rose-400">Questa guida NON è per te se:</h3>
                        <ul className="space-y-4">
                            {[
                                "Cerchi un modo per fare soldi facili online.",
                                "Vuoi creare un e-commerce complesso in 5 minuti.",
                                "Non hai voglia di imparare un nuovo strumento.",
                                "Pensi che l'AI faccia tutto da sola senza input."
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 6. CTA FINALE */}
                <section className="text-center space-y-12 py-20 relative">
                    <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-full opacity-30 pointer-events-none"></div>
                    <div className="max-w-3xl mx-auto space-y-6 relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Pronto a mettere online la tua idea?</h2>
                        <p className="text-xl text-slate-400 leading-relaxed">Scarica la guida gratuita. È un PDF pratico che ti mostra esattamente cosa fare. Nessun costo, nessun rischio.</p>
                    </div>
                    <div className="relative z-10">
                        {renderForm(true)}
                    </div>
                </section>
            </main>

            {/* 7. FOOTER */}
            {config.footer?.is_visible && (
                <footer className="bg-slate-950 border-t border-white/5 py-16">
                    <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
                        <h4 className="text-2xl font-black tracking-tighter text-white">{config.footer.text}</h4>
                        <div className="flex justify-center gap-8">
                            {[
                                { icon: Facebook, link: config.footer.social_links?.facebook, color: "hover:text-blue-500" },
                                { icon: Instagram, link: config.footer.social_links?.instagram, color: "hover:text-pink-500" },
                                { icon: Linkedin, link: config.footer.social_links?.linkedin, color: "hover:text-blue-400" },
                                { icon: Youtube, link: config.footer.social_links?.youtube, color: "hover:text-red-500" }
                            ].map((social, i) => social.link && (
                                <a key={i} href={social.link} className={`text-slate-500 transition-colors ${social.color}`}>
                                    <social.icon className="h-6 w-6"/>
                                </a>
                            ))}
                        </div>
                        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} {config.footer.copyright}</p>
                    </div>
                </footer>
            )}
        </div>
    );
};
