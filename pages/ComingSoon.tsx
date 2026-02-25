import React, { useState, useEffect } from 'react';
import { Timer, Mail, Zap, CheckCircle, Lock, Key, User, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PreLaunchConfig } from '../types';

interface ComingSoonProps {
    launchDate?: string;
    config?: PreLaunchConfig;
}

// Helper per convertire HEX in RGBA per le trasparenze
const hexToRgba = (hex: string, alpha: number): string => {
    if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return '';
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const num = parseInt(c.join(''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


// Configurazione di Default
const DEFAULT_CONFIG: PreLaunchConfig = {
    meta_pixel_id: '1825625164777432',
    headline_solid: "ACCESSO ESCLUSIVO",
    headline_gradient: "AL MONDO DELL'AI",
    subheadline: "Il futuro dello sviluppo web è qui, ed è gratuito.",
    description: "Accedi gratuitamente al nostro percorso base. Impara a creare siti web e software (SaaS) con l'Intelligenza Artificiale, senza costi nascosti. Iscriviti ora per ricevere il tuo accesso personale il 30 Gennaio.",
    offer_badge: "Offerta Gratuita",
    offer_title: "Accesso Gratuito al Percorso Base",
    offer_text: "Lascia i tuoi dati per essere tra i primi a ricevere l'accesso esclusivo al video-percorso gratuito. Scopri le basi per trasformare le tue idee in realtà con l'AI.",
    cta_text: "SÌ, VOGLIO L'ACCESSO GRATUITO",
    success_title: "Registrazione Completata!",
    success_text: "Perfetto! Ci vediamo il 30 Gennaio. Riceverai una mail con le tue credenziali di accesso personali per iniziare il percorso gratuito.",
    title_color: "#ffffff",
    gradient_start: "#60a5fa",
    gradient_end: "#c084fc",
    button_color: "#2563eb",
    admin_login_badge_text: "Area Riservata",
    spots_remaining_text: "{spots} Posti Rimanenti",
    spots_soldout_text: "Posti Prioritari Esauriti",
    spots_taken_text: "{taken} / {max} Iscritti",
    soldout_cta_text: "Le iscrizioni prioritarie sono chiuse, ma puoi comunque registrarti per ricevere l'accesso.",
    available_cta_text: "Iscriviti ora per assicurarti il tuo posto.",
    form_disclaimer_text: "Nessuno spam. Riceverai solo l'accesso e comunicazioni sul lancio.",
    admin_login_text: "Area Riservata Staff",
    form_name_placeholder: "Il tuo nome",
    form_email_placeholder: "La tua email migliore",
    submitting_button_text: "Registrazione in corso...",
    success_priority_title: "Sei ufficialmente in lista!",
    success_priority_subtitle: "Hai bloccato il tuo accesso gratuito al percorso base.",
    success_standard_title: "Sei in lista d'attesa!",
    success_standard_subtitle: "Ti avviseremo appena il percorso sarà disponibile il 30 Gennaio.",
    // Fix: Added missing color properties to satisfy the PreLaunchConfig interface.
    bg_color_main: '#020617',
    text_color_body: '#94a3b8',
    accent_color: '#facc15',
    error_color: '#ef4444',
    success_color: '#22c55e',
    container_bg_color: '#1e293b',
    container_border_color: '#334155',
    input_bg_color: '#020617'
};

const MAX_SPOTS = 100; // Numero massimo posti prioritari

export const ComingSoon: React.FC<ComingSoonProps> = ({ launchDate: initialLaunchDate, config: initialConfig }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';

    // Lo stato liveConfig gestisce gli aggiornamenti in tempo reale dall'editor
    const [liveConfig, setLiveConfig] = useState(initialConfig);
    
    // Lo stato della data di lancio viene gestito internamente per l'anteprima
    const [launchDate, setLaunchDate] = useState(initialLaunchDate);

    // Effetto per l'ascolto dei messaggi in modalità anteprima
    useEffect(() => {
        if (isPreview) {
            const handleMessage = (event: MessageEvent) => {
                // Semplice validazione per assicurarci di ricevere un oggetto di configurazione
                if (event.data && typeof event.data === 'object' && 'headline_solid' in event.data) {
                    setLiveConfig(event.data);
                }
            };
            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }
    }, [isPreview]);

    // Determina quale configurazione usare: quella live dall'editor o quella passata dalle props
    const config = isPreview ? liveConfig : initialConfig;

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [spotsTaken, setSpotsTaken] = useState<number>(0);
    const [userPosition, setUserPosition] = useState<number | null>(null);

    // Unisce la configurazione attuale con quella di default per evitare errori
    const text = { ...DEFAULT_CONFIG, ...config };
    const displaySolid = text.headline_solid || DEFAULT_CONFIG.headline_solid;
    const displayGradient = text.headline_gradient || DEFAULT_CONFIG.headline_gradient;

    // Fetch dei posti occupati solo in modalità reale
    useEffect(() => {
        if (!isPreview) {
            const fetchCount = async () => {
                const { count } = await supabase.from('waiting_list').select('*', { count: 'exact', head: true });
                setSpotsTaken(count || 0);
            };
            fetchCount();
            const interval = setInterval(fetchCount, 30000);
            return () => clearInterval(interval);
        } else {
            setSpotsTaken(Math.floor(MAX_SPOTS / 2));
        }
    }, [isPreview]);

    // Logica del Countdown
    useEffect(() => {
        const target = launchDate ? new Date(launchDate).getTime() : new Date("2025-01-30T09:00:00").getTime(); 
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = target - now;
            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [launchDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPreview || !fullName.trim() || !email.trim()) return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('waiting_list').insert([{ email, full_name: fullName }]);
            if (error) {
                if (error.code === '23505') {
                     alert("Questa email è già in lista d'attesa!");
                     setIsSuccess(true);
                } else throw error;
            } else {
                setUserPosition(spotsTaken + 1);
                setSpotsTaken(prev => prev + 1);
                setIsSuccess(true);
            }
        } catch (error: any) { alert("Errore: " + error.message); } 
        finally { setIsSubmitting(false); }
    };

    const progressPercent = Math.min((spotsTaken / MAX_SPOTS) * 100, 100);
    const spotsRemaining = Math.max(0, MAX_SPOTS - spotsTaken);
    const isSoldOut = spotsTaken >= MAX_SPOTS;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden font-sans p-4" style={{ backgroundColor: text.bg_color_main }}>
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: text.gradient_start }}></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-10" style={{ backgroundColor: text.gradient_end }}></div>

            <div className="relative z-10 max-w-4xl w-full text-center">
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 border border-white/10 text-white/70 font-bold text-xs uppercase tracking-[0.2em] mb-8 animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <Zap className="h-3 w-3 text-yellow-400" /> ACCESSO IL 30 GENNAIO
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 tracking-tight leading-tight uppercase">
                    <span style={{ color: text.title_color }}>{displaySolid}</span><br/>
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${text.gradient_start}, ${text.gradient_end})` }}>{displayGradient}</span>
                </h1>

                <p className="text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed whitespace-pre-wrap" style={{ color: text.text_color_body }}>
                    {text.description} <br/>
                    <span className="text-white font-bold">{text.subheadline}</span>
                </p>

                <div className="flex flex-row justify-center gap-2 md:gap-8 max-w-3xl mx-auto mb-12 md:mb-16">
                    {[{ label: 'Giorni', value: timeLeft.days }, { label: 'Ore', value: timeLeft.hours }, { label: 'Minuti', value: timeLeft.minutes }, { label: 'Secondi', value: timeLeft.seconds }].map((item, idx) => (
                        <div key={idx} className="backdrop-blur-md border p-2 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center shadow-2xl min-w-[70px] md:min-w-[120px]" style={{ backgroundColor: hexToRgba(text.container_bg_color, 0.5), borderColor: text.container_border_color }}>
                            <span className="text-2xl md:text-6xl font-black text-white font-mono">{String(item.value).padStart(2, '0')}</span>
                            <span className="text-[10px] md:text-xs uppercase tracking-widest mt-1 md:mt-2" style={{color: text.text_color_body}}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="p-6 md:p-8 rounded-3xl border shadow-2xl max-w-xl mx-auto relative overflow-hidden group text-left md:text-center" style={{ background: text.container_bg_color, borderColor: text.container_border_color }}>
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl group-hover:opacity-60 transition-all opacity-30" style={{backgroundColor: text.accent_color}}></div>
                    
                    {!isSuccess ? (
                        <>
                            <div className="flex items-center justify-start md:justify-center gap-2 font-bold text-sm uppercase tracking-widest mb-2" style={{color: text.accent_color}}>
                                <Zap className="h-4 w-4 fill-current" /> {text.offer_badge}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{text.offer_title}</h3>
                            
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                    <span style={{ color: isSoldOut ? text.error_color : text.success_color }}>
                                        {isSoldOut ? text.spots_soldout_text : text.spots_remaining_text.replace('{spots}', String(spotsRemaining))}
                                    </span>
                                    <span style={{color: text.text_color_body}}>{text.spots_taken_text.replace('{taken}', String(spotsTaken)).replace('{max}', String(MAX_SPOTS))}</span>
                                </div>
                                <div className="h-3 rounded-full overflow-hidden border relative" style={{backgroundColor: hexToRgba(text.container_border_color, 0.3), borderColor: hexToRgba(text.container_border_color, 0.5)}}>
                                    <div className={`h-full transition-all duration-1000 ease-out`} style={{ width: `${progressPercent}%`, backgroundColor: isSoldOut ? text.error_color : text.accent_color }}></div>
                                </div>
                                <p className="text-xs mt-2 text-left md:text-center" style={{color: text.text_color_body}}>
                                    {isSoldOut ? text.soldout_cta_text : text.available_cta_text}
                                </p>
                            </div>

                            <p className="mb-6 text-sm whitespace-pre-wrap" style={{color: text.text_color_body}}>{text.offer_text}</p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5" style={{color: text.text_color_body}} /></div>
                                    <input type="text" required placeholder={text.form_name_placeholder} value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded-xl py-4 pl-10 pr-4 placeholder-opacity-50 focus:ring-1 outline-none transition-all" style={{backgroundColor: text.input_bg_color, borderColor: text.container_border_color, color: text.title_color, '::placeholder': {color: text.text_color_body}}} />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5" style={{color: text.text_color_body}} /></div>
                                    <input type="email" required placeholder={text.form_email_placeholder} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-xl py-4 pl-10 pr-4 placeholder-opacity-50 focus:ring-1 outline-none transition-all" style={{backgroundColor: text.input_bg_color, borderColor: text.container_border_color, color: text.title_color, '::placeholder': {color: text.text_color_body}}} />
                                </div>
                                <button type="submit" disabled={isSubmitting} style={{ backgroundColor: text.button_color }} className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-wide mt-2">
                                    {isSubmitting ? text.submitting_button_text : text.cta_text}
                                </button>
                            </form>
                            <p className="text-[10px] mt-4 text-center" style={{color: text.text_color_body}}>{text.form_disclaimer_text}</p>
                        </>
                    ) : (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor: hexToRgba(text.success_color, 0.2)}}>
                                <CheckCircle className="h-10 w-10" style={{color: text.success_color}} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{text.success_title}</h3>
                            
                            <div className="border p-4 rounded-xl mb-4 inline-block" style={{backgroundColor: hexToRgba(text.accent_color, 0.1), borderColor: hexToRgba(text.accent_color, 0.3)}}>
                                <p className="font-bold flex items-center justify-center gap-2" style={{color: text.accent_color}}><TrendingUp className="h-5 w-5" />{text.success_priority_title.replace('{position}', String(userPosition))}</p>
                                <p className="text-sm mt-1" style={{color: text.text_color_body}}>{text.success_priority_subtitle}</p>
                            </div>
                            
                            <p className="max-w-sm mx-auto whitespace-pre-wrap" style={{color: text.text_color_body}}>{text.success_text}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-50">
                <button onClick={() => navigate('/login')} className="flex items-center gap-2 p-2 text-xs font-bold uppercase tracking-widest opacity-10 hover:opacity-100 transition-all duration-300" title="Area Staff" style={{color: text.text_color_body}}>
                    <Key className="h-3 w-3" /> {text.admin_login_text}
                </button>
            </div>
            
            <div className="absolute bottom-4 w-full text-center pointer-events-none opacity-30">
                 <div className="text-[10px]" style={{color: text.text_color_body}}>&copy; {new Date().getFullYear()} Moise Web Academy</div>
            </div>
        </div>
    );
};
