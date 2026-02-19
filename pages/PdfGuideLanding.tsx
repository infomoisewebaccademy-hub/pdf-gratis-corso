import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, User, Zap, Lock } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PdfGuideConfig } from '../types';

interface PdfGuideLandingProps {
    config?: PdfGuideConfig;
}

// Helper per convertire HEX in RGBA per le trasparenze
const hexToRgba = (hex: string, alpha: number): string => {
    if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return `rgba(255,255,255,${alpha})`;
    let c = hex.substring(1).split('');
    if (c.length === 3) { c = [c[0], c[0], c[1], c[1], c[2], c[2]]; }
    const num = parseInt(c.join(''), 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

// Configurazione di Default robusta
const DEFAULT_CONFIG: PdfGuideConfig = {
    headline_solid: "CREA SITI CON L'AI",
    headline_gradient: "La Guida Gratuita",
    subheadline: "Sblocca il potenziale dell'Intelligenza Artificiale e impara a creare siti web professionali, senza scrivere codice.",
    description: "Ricevi subito via email la nostra guida PDF passo-passo e accedi alla nostra piattaforma per un video-tutorial esclusivo. Inizia oggi a trasformare le tue idee in realtà.",
    offer_badge: "100% Gratuito",
    offer_title: "Ottieni la Guida e l'Accesso Immediato",
    offer_text: "Inserisci i tuoi dati qui sotto. Riceverai la guida via email e le credenziali per accedere subito alla tua area riservata.",
    cta_text: "SÌ, INVIATEMI LA GUIDA!",
    success_title: "Accesso Inviato!",
    success_text: "Perfetto! Controlla la tua casella di posta (anche SPAM) per trovare la guida e le tue credenziali di accesso. Ci vediamo dentro!",
    title_color: "#ffffff", gradient_start: "#60a5fa", gradient_end: "#c084fc", button_color: "#2563eb",
    admin_login_badge_text: "Area Riservata", spots_remaining_text: "", spots_soldout_text: "", spots_taken_text: "",
    soldout_cta_text: "", available_cta_text: "", admin_login_text: "Area Riservata Staff",
    form_disclaimer_text: "Inserisci i dati per ricevere la guida e creare il tuo accesso gratuito alla nostra piattaforma.",
    form_name_placeholder: "Il tuo nome", form_email_placeholder: "La tua email migliore",
    submitting_button_text: "Invio in corso...", success_priority_title: "Accesso Inviato!",
    success_priority_subtitle: "Controlla la tua email per la guida e le credenziali.", success_standard_title: "", success_standard_subtitle: "",
    bg_color_main: '#020617', text_color_body: '#94a3b8', accent_color: '#facc15', error_color: '#ef4444', success_color: '#22c55e',
    container_bg_color: '#1e293b', container_border_color: '#334155', input_bg_color: '#020617'
};

export const PdfGuideLanding: React.FC<PdfGuideLandingProps> = ({ config: initialConfig }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';
    const [liveConfig, setLiveConfig] = useState(initialConfig);

    useEffect(() => {
        if (isPreview) {
            const handleMessage = (event: MessageEvent) => {
                if (event.data && typeof event.data === 'object' && 'headline_solid' in event.data) {
                    setLiveConfig(event.data);
                }
            };
            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }
    }, [isPreview]);

    const config = isPreview ? liveConfig : initialConfig;
    const text = { ...DEFAULT_CONFIG, ...config };
    const displaySolid = text.headline_solid || DEFAULT_CONFIG.headline_solid;
    const displayGradient = text.headline_gradient || DEFAULT_CONFIG.headline_gradient;

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPreview || !fullName.trim() || !email.trim()) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('waiting_list').insert([{ email, full_name: fullName, source: 'pdf_guide' }]);
            if (error) {
                if (error.code === '23505') { // Codice per violazione 'unique'
                     alert("Questa email è già registrata! Controlla la tua casella di posta per le credenziali.");
                     setIsSuccess(true);
                } else throw error;
            } else {
                setIsSuccess(true);
            }
        } catch (error: any) { alert("Si è verificato un errore: " + error.message); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden font-sans p-4" style={{ backgroundColor: text.bg_color_main }}>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: text.gradient_start }}></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-10" style={{ backgroundColor: text.gradient_end }}></div>

            <main className="relative z-10 max-w-4xl w-full text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight uppercase">
                    <span style={{ color: text.title_color }}>{displaySolid}</span><br/>
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${text.gradient_start}, ${text.gradient_end})` }}>{displayGradient}</span>
                </h1>

                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: text.text_color_body }}>
                    {text.description} <br/>
                    <span className="text-white font-medium">{text.subheadline}</span>
                </p>

                <div className="p-6 md:p-8 rounded-3xl border shadow-2xl max-w-xl mx-auto relative overflow-hidden text-left" style={{ background: text.container_bg_color, borderColor: text.container_border_color }}>
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30" style={{backgroundColor: text.accent_color}}></div>
                    
                    {!isSuccess ? (
                        <>
                            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest mb-2" style={{color: text.accent_color}}>
                                <Zap className="h-4 w-4 fill-current" /> {text.offer_badge}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{text.offer_title}</h3>
                            <p className="mb-6 text-sm" style={{color: text.text_color_body}}>{text.offer_text}</p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <div className="relative">
                                    <User className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color: text.text_color_body}} />
                                    <input type="text" required placeholder={text.form_name_placeholder} value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded-xl py-4 pl-10 pr-4 placeholder-opacity-50 focus:ring-1 outline-none transition-all" style={{backgroundColor: text.input_bg_color, borderColor: text.container_border_color, color: text.title_color, '::placeholder': {color: text.text_color_body}}} />
                                </div>
                                <div className="relative">
                                    <Mail className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color: text.text_color_body}} />
                                    <input type="email" required placeholder={text.form_email_placeholder} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-xl py-4 pl-10 pr-4 placeholder-opacity-50 focus:ring-1 outline-none transition-all" style={{backgroundColor: text.input_bg_color, borderColor: text.container_border_color, color: text.title_color, '::placeholder': {color: text.text_color_body}}} />
                                </div>
                                <button type="submit" disabled={isSubmitting} style={{ backgroundColor: text.button_color }} className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:brightness-110 disabled:opacity-70 flex items-center justify-center uppercase tracking-wide mt-2">
                                    {isSubmitting ? text.submitting_button_text : text.cta_text}
                                </button>
                            </form>
                            <p className="text-xs mt-4 text-center" style={{color: text.text_color_body}}>{text.form_disclaimer_text}</p>
                        </>
                    ) : (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: hexToRgba(text.success_color, 0.2)}}>
                                <CheckCircle className="h-10 w-10" style={{color: text.success_color}} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{text.success_title}</h3>
                            <p className="max-w-sm mx-auto" style={{color: text.text_color_body}}>{text.success_text}</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="absolute bottom-4 w-full flex justify-between items-center px-4">
                 <div className="text-[10px] opacity-30" style={{color: text.text_color_body}}>&copy; {new Date().getFullYear()} Moise Web Academy</div>
                 <button onClick={() => navigate('/login')} className="flex items-center gap-2 p-2 text-xs font-bold uppercase tracking-widest opacity-10 hover:opacity-100 transition-all" title="Area Staff" style={{color: text.text_color_body}}>
                    <Lock className="h-3 w-3" /> {text.admin_login_text}
                 </button>
            </footer>
        </div>
    );
};
