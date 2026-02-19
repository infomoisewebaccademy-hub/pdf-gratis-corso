
import React, { useState, useEffect, useRef } from 'react';
import { Course, UserProfile, PlatformSettings, LandingPageConfig, PreLaunchConfig, PdfGuideConfig } from '../types';
// FIX: Added missing Loader2 import from lucide-react
import { Plus, Edit2, Trash2, Search, DollarSign, BookOpen, Clock, Eye, Lock, Unlock, Loader, Loader2, Settings, Image, LayoutTemplate, Activity, HelpCircle, Terminal, AlignLeft, AlignCenter, MoveHorizontal, Sparkles, Wand2, X, MessageCircle, Megaphone, Target, ListOrdered, Book, Pin, Type, ExternalLink, Rocket, Calendar, Palette, Download, Facebook, Instagram, Linkedin, Youtube, Move, Quote, MoveVertical, AlignVerticalJustifyCenter, Maximize, Check, Columns, ArrowRightLeft, BrainCircuit, GitMerge, UserCheck, XCircle, Video, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { GoogleGenAI } from "@google/genai";

// Fix: Added missing usp_section and cta_section to satisfy LandingPageConfig interface
const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
  announcement_bar: {
    text: '🚀 Novità: Accedi subito ai corsi e inizia a creare progetti reali.',
    is_visible: true,
    is_sticky: false,
    type: 'static',
    bg_color: '#fbbf24',
    text_color: '#1e3a8a'
  },
  hero: {
    title: "Crea Siti Web Professionali o Piattaforme con l'AI in Poche Ore",
    subtitle: 'Senza Scrivere Una Riga di Codice.',
    text: "MWA vi insegna le stesse competenze che usiamo ogni giorno...\n\nImpara a costruire siti web, e-commerce e CRM personalizzati usando l'intelligenza artificiale. Trasforma la tua idea in un business online o offri servizi da €1.000+ ai tuoi clienti.",
    benefits: [
        "Accesso a vita ai contenuti",
        "Assistenza 7 giorni su 7",
        "Nessuna esperienza richiesta",
        "Accesso alla community",
        "Supporto PERSONALE diretto su whatsapp",
        "Soddisfatto o rimborsato in 30 giorni"
    ],
    cta_primary: 'Scopri i corsi disponibili',
    cta_secondary: '', 
    image_url: '', 
    show_badges: true
  },
  ai_era_section: {
      title: 'La Nuova Era del Web',
      subtitle: "Benvenuto Nell'Era dell'Intelligenza Artificiale",
      text: "Fino a ieri, creare un sito web significava: imparare a programmare per anni, spendere migliaia di euro per agenzie, o accontentarsi di template limitati.\n\nOggi tutto è cambiato.\nL'intelligenza artificiale ha reso la creazione web accessibile a chiunque. In poche ore puoi ottenere risultati che prima richiedevano settimane di lavoro e competenze avanzate.\n\nIl risultato?\n• Imprenditori che diventano autonomi e risparmiano migliaia di euro\n• Persone comuni che si creano un'entrata extra da €1.000-5.000 al mese\n• Idee che diventano realtà senza barriere tecniche\n\nE tu? Sei pronto a far parte di questa rivoluzione?",
      is_visible: true
  },
  about_section: {
    title: 'Chi Siamo',
    subtitle: 'Perché nasce Moise Web Academy',
    text: "Moise Web Academy nasce per rendere semplice ciò che sembra complesso.\nIn un mondo in cui creare siti e piattaforme digitali è sempre più fondamentale, vogliamo dimostrare che non serve essere programmatori per costruire progetti professionali.\nCon un metodo pratico e guidato, ti mostriamo come usare Google AppSheet e gli strumenti Google per dare vita alle tue idee, anche se parti da zero.\nSiamo Moise Web Academy. Negli ultimi anni abbiamo costruito piattaforme AI, siti web dinamici e automazioni per decine di progetti reali. Ma nel mercato della formazione c'è una cosa che ci ha sempre dato fastidio:",
    mission_points: [
        "I corsi che promettono soldi veloci",
        "I “guru” che non hanno mai creato nulla",
        "Le lezioni che obbligano a comprare tool da 30–100€/mese"
    ],
    image_url: 'https://res.cloudinary.com/dhj0ztos6/video/upload/v1765452611/Home_page_rnk0zw.webm',
    quote: '"Non vi promettiamo guadagni facili, vi diamo competenze reali."',
    quote_author: 'DANIEL MOISE',
    quote_author_image: '', 
    quote_author_image_size: 48,
    quote_author_image_offset_x: 0,
    quote_author_image_offset_y: 0,
    quote_author_image_alignment: 'center',
    quote_author_image_scale: 1,
    is_visible: true
  },
  features_section: {
    title: 'Cosa imparerete con noi',
    subtitle: 'Competenze tecniche verticali, divise per obiettivi.',
    is_visible: true,
    cards: [
      { icon: 'Cpu', title: 'AI & Sviluppo Low-Code', desc: 'Google AI Studio (Zero Costi)\nDatabase Supabase\nDeploy su Vercel\nGestione Domini & DNS' },
      { icon: 'Layout', title: 'Landing Page & Siti Web', desc: 'Elementor (versione base)\nStruttura & Copy\nTemplate pronti all\'uso\nOttimizzazione Mobile' },
      { icon: 'Zap', title: 'Automazioni a Costo Zero', desc: 'Notifiche intelligenti\nEmail automatiche\nWebhook Make/N8N\nAPI Integration' },
      { icon: 'Target', title: 'Pubblicità & Ads', desc: 'Meta Ads (FB/IG)\nTikTok Ads\nStrategie E-commerce\nLead Generation' }
    ]
  },
  how_it_works_section: {
      title: 'Come Funziona Moise Web Academy',
      subtitle: 'Tre semplici passi per diventare un Web Creator professionista',
      is_visible: true,
      steps: [
          { title: 'Impara', desc: "Segui i video passo-passo. Daniel ti guida dalla A alla Z, senza dare nulla per scontato.", icon: 'BookOpen' },
          { title: 'Crea', desc: "Applichi subito quello che impari. In poche ore avrai il tuo primo sito web professionale online.", icon: 'Rocket' },
          { title: 'Monetizza', desc: "Offri i tuoi servizi ad aziende locali oppure lancia i tuoi progetti digitali.", icon: 'Banknote' }
      ]
  },
  ai_showcase_section: {
      title: 'Cosa Può Creare l’Intelligenza Artificiale per Te',
      subtitle: 'Potenza Creativa Senza Limiti',
      text: "L'AI non è solo uno strumento di scrittura. Oggi puoi generare interfacce complete, backend scalabili e design mozzafiato in tempo reale.",
      is_visible: true,
      urls: []
  },
  testimonials_section: {
    title: 'Cosa Dicono i Nostri Studenti',
    subtitle: 'Testimonianze',
    is_visible: true,
    reviews: []
  },
  // Fix: Added missing usp_section to default config
  usp_section: {
    title: 'Perché siamo diversi dagli altri corsi',
    is_visible: true,
    items: [
      { title: 'TUTTO SENZA SPESE EXTRA', desc: 'Ogni corso è pensato per lavorare con AI a costo zero.' },
      { title: 'Lezioni pratiche, non teoria', desc: 'Ogni modulo contiene schermate reali e processi passo-passo.' },
      { title: 'Nessuna fuffa', desc: 'Non vi promettiamo guadagni, vi diamo competenze tecniche solide.' },
      { title: 'Prezzi onesti', desc: 'Ogni corso lo pagate singolarmente. Niente abbonamenti.' }
    ]
  },
  // Fix: Added missing cta_section to default config
  cta_section: {
    title: 'Iniziate a costruire qualcosa di reale.',
    subtitle: 'Usate l’AI a costo zero, create progetti veri e portate le vostre competenze al livello successivo.',
    button_text: 'Guarda tutti i corsi',
    is_visible: true
  },
  footer: {
      text: 'Moise Web Academy',
      copyright: 'Tutti i diritti riservati.',
      is_visible: true,
      logo_height: 40,
      social_links: { facebook: '', instagram: '', linkedin: '', youtube: '' }
  }
};

const DEFAULT_PRE_LAUNCH_CONFIG: PreLaunchConfig = {
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
    bg_color_main: '#020617',
    text_color_body: '#94a3b8',
    accent_color: '#facc15',
    error_color: '#ef4444',
    success_color: '#22c55e',
    container_bg_color: '#1e293b',
    container_border_color: '#334155',
    input_bg_color: '#020617'
};

const DEFAULT_PDF_GUIDE_CONFIG: PdfGuideConfig = {
    ...DEFAULT_PRE_LAUNCH_CONFIG,
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
};

interface AdminDashboardProps {
  courses: Course[];
  user: UserProfile;
  onDelete: (id: string) => void;
  onRefresh: () => Promise<void>;
  currentSettings: PlatformSettings;
  onUpdateSettings: (newSettings: PlatformSettings) => Promise<void>;
}

const ColorInput: React.FC<{label: string, value: string, name: string, onChange: (name: string, value: string) => void}> = ({label, value, name, onChange}) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
            <input type="color" value={value} onChange={e => onChange(name, e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
            <input type="text" value={value} onChange={e => onChange(name, e.target.value)} className="w-24 border-none p-1 text-xs font-mono" />
        </div>
    </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses, user, onDelete, onRefresh, currentSettings, onUpdateSettings }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'courses' | 'general' | 'landing_manual' | 'landing_ai' | 'launch' | 'pdf_guide' | 'community'>('courses');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  
  const [localSettings, setLocalSettings] = useState<PlatformSettings>(currentSettings);
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(() => ({ ...DEFAULT_LANDING_CONFIG, ...currentSettings.landing_page_config }));
  const [preLaunchConfig, setPreLaunchConfig] = useState<PreLaunchConfig>(currentSettings.pre_launch_config || DEFAULT_PRE_LAUNCH_CONFIG);
  const [pdfGuideConfig, setPdfGuideConfig] = useState<PdfGuideConfig>(currentSettings.pdf_guide_config || DEFAULT_PDF_GUIDE_CONFIG);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const launchIframeRef = useRef<HTMLIFrameElement>(null);
  const pdfGuideIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLocalSettings(currentSettings);
    if (currentSettings.landing_page_config) setLandingConfig({ ...DEFAULT_LANDING_CONFIG, ...currentSettings.landing_page_config });
    if (currentSettings.pre_launch_config) setPreLaunchConfig({ ...DEFAULT_PRE_LAUNCH_CONFIG, ...currentSettings.pre_launch_config });
    if (currentSettings.pdf_guide_config) setPdfGuideConfig({ ...DEFAULT_PDF_GUIDE_CONFIG, ...currentSettings.pdf_guide_config });
  }, [currentSettings]);

  // Invia le modifiche all'iframe di anteprima
  useEffect(() => {
      if (activeTab === 'launch' && launchIframeRef.current?.contentWindow) {
          launchIframeRef.current.contentWindow.postMessage(preLaunchConfig, '*');
      }
      if (activeTab === 'pdf_guide' && pdfGuideIframeRef.current?.contentWindow) {
          pdfGuideIframeRef.current.contentWindow.postMessage(pdfGuideConfig, '*');
      }
  }, [preLaunchConfig, pdfGuideConfig, activeTab]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
        const finalSettings = {
            ...localSettings,
            landing_page_config: landingConfig,
            pre_launch_config: preLaunchConfig,
            pdf_guide_config: pdfGuideConfig
        };
        await onUpdateSettings(finalSettings);
        alert("Impostazioni salvate con successo!"); 
    } catch (error: any) { alert("Errore: " + error.message); } 
    finally { setIsSavingSettings(false); }
  };

  const handleReviewUpdate = (idx: number, field: string, value: string) => {
    const newReviews = [...(landingConfig.testimonials_section.reviews || [])];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    setLandingConfig({ ...landingConfig, testimonials_section: { ...landingConfig.testimonials_section, reviews: newReviews } });
  };

  const handleExportCSV = async () => {
      try {
          const { data, error } = await supabase.from('waiting_list').select('*').order('created_at', { ascending: true });
          if (error) throw error;
          if (!data || data.length === 0) { alert("Nessun iscritto da esportare."); return; }
          let csvContent = "data:text/csv;charset=utf-8,Posizione,Email,Nome,Data Iscrizione,Fonte\n";
          data.forEach((row, index) => {
              const date = new Date(row.created_at).toLocaleDateString();
              csvContent += `${index + 1},${row.email},"${row.full_name || 'N/A'}",${date},${row.source || 'pre_launch'}\n`;
          });
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "mwa_lista_attesa.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (err: any) { alert("Errore: " + err.message); }
  };

  const handleClearCommunityChat = async () => {
      if (!confirm("⚠️ ATTENZIONE: Questa azione eliminerà TUTTI i messaggi della community chat per sempre. Confermi?")) return;
      setIsClearingChat(true);
      try {
          const { error } = await supabase
              .from('community_messages')
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          alert("Chat ripulita correttamente!");
      } catch (err: any) {
          alert("Errore reset chat: " + err.message);
      } finally {
          setIsClearingChat(false);
      }
  };

  const handleAiGeneration = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.generateContent({ 
            model: "gemini-3-flash-preview",
            contents: `Modifica questo JSON CMS: ${JSON.stringify(landingConfig)}. Richiesta utente: "${aiPrompt}". Ritorna SOLO il JSON valido.`
        });
        const jsonStr = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
        setLandingConfig(JSON.parse(jsonStr));
        alert("✨ Configurazione generata!");
    } catch (error: any) { alert("Errore AI: " + error.message); } finally { setIsAiLoading(false); }
  };

  const FONT_OPTIONS = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Lato', 'Open Sans'];

  const handlePreLaunchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPreLaunchConfig(prev => ({ ...prev, [name]: value }));
  };
  const handlePdfGuideChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPdfGuideConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePreLaunchColorChange = (name: string, value: string) => {
    setPreLaunchConfig(prev => ({ ...prev, [name]: value }));
  };
  const handlePdfGuideColorChange = (name: string, value: string) => {
    setPdfGuideConfig(prev => ({ ...prev, [name]: value }));
  };

  // Funzione generica per creare l'editor
  const renderCapturePageEditor = (
      title: string, 
      icon: React.ElementType,
      config: PreLaunchConfig | PdfGuideConfig,
      handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
      handleColorChange: (name: string, value: string) => void
  ) => (
      <div className="space-y-6">
          <h3 className="text-xl font-bold mb-6 flex items-center">{React.createElement(icon, { className: "mr-2 text-red-600" })} {title}</h3>
          
          <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <summary className="font-bold cursor-pointer flex items-center gap-2"><Palette/> Stile & Colori</summary>
              <div className="mt-4 space-y-3">
                  <ColorInput label="Sfondo Pagina" name="bg_color_main" value={config.bg_color_main} onChange={handleColorChange} />
                  <hr/>
                  <ColorInput label="Testo Principale" name="title_color" value={config.title_color} onChange={handleColorChange} />
                  <ColorInput label="Testo Secondario" name="text_color_body" value={config.text_color_body} onChange={handleColorChange} />
                  <ColorInput label="Gradiente Inizio" name="gradient_start" value={config.gradient_start} onChange={handleColorChange} />
                  <ColorInput label="Gradiente Fine" name="gradient_end" value={config.gradient_end} onChange={handleColorChange} />
              </div>
          </details>

          <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <summary className="font-bold cursor-pointer">Contenuti Principali</summary>
              <div className="mt-4 space-y-3">
                  <input name="headline_solid" value={config.headline_solid} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Titolo Fisso" />
                  <input name="headline_gradient" value={config.headline_gradient} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Titolo Gradiente" />
                  <textarea name="description" rows={3} value={config.description} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Descrizione"></textarea>
                  <input name="subheadline" value={config.subheadline} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Sottotitolo secondario" />
              </div>
          </details>

          <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <summary className="font-bold cursor-pointer">Box Iscrizione</summary>
              <div className="mt-4 space-y-3">
                  <input name="offer_badge" value={config.offer_badge} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Badge Offerta (es. AI Revolution)" />
                  <input name="offer_title" value={config.offer_title} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Titolo Box" />
                  <textarea name="offer_text" rows={2} value={config.offer_text} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Testo Offerta"></textarea>
                  <input name="form_name_placeholder" value={config.form_name_placeholder} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Placeholder Nome" />
                  <input name="form_email_placeholder" value={config.form_email_placeholder} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Placeholder Email" />
                  <input name="cta_text" value={config.cta_text} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Testo Bottone" />
                  <input name="form_disclaimer_text" value={config.form_disclaimer_text} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Disclaimer Sotto il Form" />
              </div>
          </details>

          <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <summary className="font-bold cursor-pointer">Messaggi di Successo</summary>
              <div className="mt-4 space-y-3">
                   <input name="success_title" value={config.success_title} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Titolo Successo Generico" />
                   <textarea name="success_text" rows={2} value={config.success_text} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Testo Successo Generico"></textarea>
              </div>
          </details>
      </div>
  );

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestione Piattaforma</h1>
                <p className="text-gray-500 mt-1">Controlla ogni aspetto della tua Academy.</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => setShowHelp(!showHelp)} className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all flex items-center">
                    <Terminal className="h-5 w-5 mr-2" /> SQL Help
                </button>
                <button onClick={() => navigate('/admin/course/new')} className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all flex items-center">
                    <Plus className="h-5 w-5 mr-2" /> Nuovo Corso
                </button>
            </div>
        </div>

        {showHelp && (
            <div className="bg-slate-900 text-slate-200 p-6 rounded-xl mb-8 shadow-xl border border-slate-700 font-mono text-sm relative">
                <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-5 w-5"/></button>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center"><Terminal className="mr-2 h-5 w-5"/> Comandi Database Utili</h3>
                <p className="text-slate-400 mb-4">Esegui questi comandi nell'SQL Editor di Supabase per aggiornare la struttura.</p>
                <div className="bg-black p-4 rounded border border-slate-700 mb-2">
                    <code className="text-green-400 select-all block mb-2">ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS active_mode text DEFAULT 'public';</code>
                    <code className="text-green-400 select-all block">ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS pdf_guide_config jsonb;</code>
                </div>
            </div>
        )}

        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-8 space-x-8 overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab('courses')} className={`pb-4 font-bold text-sm border-b-2 transition-all flex items-center whitespace-nowrap ${activeTab === 'courses' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                <Book className="h-4 w-4 mr-2" /> Corsi
            </button>
            <button onClick={() => setActiveTab('launch')} className={`pb-4 font-bold text-sm border-b-2 transition-all flex items-center whitespace-nowrap ${activeTab === 'launch' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                <Rocket className="h-4 w-4 mr-2" /> Pre-Lancio
            </button>
            <button onClick={() => setActiveTab('pdf_guide')} className={`pb-4 font-bold text-sm border-b-2 transition-all flex items-center whitespace-nowrap ${activeTab === 'pdf_guide' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                <Download className="h-4 w-4 mr-2" /> Guida PDF
            </button>
            <button onClick={() => setActiveTab('landing_manual')} className={`pb-4 font-bold text-sm border-b-2 transition-all flex items-center whitespace-nowrap ${activeTab === 'landing_manual' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                <LayoutTemplate className="h-4 w-4 mr-2" /> Editor Home
            </button>
            <button onClick={() => setActiveTab('community')} className={`pb-4 font-bold text-sm border-b-2 transition-all flex items-center whitespace-nowrap ${activeTab === 'community' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                <Users className="h-4 w-4 mr-2" /> Community
            </button>
            <button onClick={() => setActiveTab('general')} className={`pb-4 font-bold text-sm border-b-2 transition-all flex items-center whitespace-nowrap ${activeTab === 'general' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                <Settings className="h-4 w-4 mr-2" /> Impostazioni
            </button>
        </div>

        {/* CONTENT */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                            <div className="relative h-48">
                                <img src={course.image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold">{course.level}</div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-4 line-clamp-1">{course.title}</h3>
                                <div className="mt-auto flex gap-2">
                                    <button onClick={() => navigate(`/admin/course/${course.id}`)} className="flex-1 bg-brand-50 text-brand-700 py-2 rounded-lg font-bold hover:bg-brand-100 flex items-center justify-center"><Edit2 className="h-4 w-4 mr-2"/> Edit</button>
                                    <button onClick={() => onDelete(course.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"><Trash2 className="h-5 w-5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'community' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center"><Users className="mr-2 text-brand-600"/> Gestione Community</h3>
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h4 className="font-bold text-red-800 mb-2 flex items-center"><Trash2 className="h-4 w-4 mr-2"/> Reset Messaggi</h4>
                        <p className="text-sm text-red-600 mb-6">Questa funzione permette di svuotare completamente la chat della community.</p>
                        {/* FIX: Changed isClearing to isClearingChat */}
                        <button onClick={handleClearCommunityChat} disabled={isClearingChat} className="w-full md:w-auto bg-red-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
                            {/* FIX: Changed isClearing to isClearingChat and ensured Loader2 is imported */}
                            {isClearingChat ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />} Svuota Chat Ora
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'launch' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-h-[85vh] overflow-y-auto scrollbar-thin">
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center"><Rocket className="mr-2 text-red-600"/> Editor Pagina Pre-Lancio</h3>
                             <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Data del Lancio (Countdown)</label>
                                        <input type="datetime-local" value={localSettings.pre_launch_date || ''} onChange={(e) => setLocalSettings({...localSettings, pre_launch_date: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 shadow-sm" />
                                    </div>
                                    <div>
                                        <button onClick={handleExportCSV} className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-bold hover:bg-black flex items-center justify-center gap-2 text-sm transition-all">
                                            <Download className="h-4 w-4" /> Esporta Iscritti (CSV)
                                        </button>
                                    </div>
                                </div>
                            </div>
                           {renderCapturePageEditor("Editor Pre-Lancio", Rocket, preLaunchConfig, handlePreLaunchChange, handlePreLaunchColorChange)}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="sticky top-20">
                           <h3 className="text-lg font-bold mb-2">Anteprima Live</h3>
                           <iframe ref={launchIframeRef} src="/#/coming-soon?preview=true" className="w-full h-[75vh] border-4 border-gray-300 rounded-lg shadow-lg" title="Anteprima Pre-lancio"></iframe>
                        </div>
                    </div>
                </div>
            )}

             {activeTab === 'pdf_guide' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-h-[85vh] overflow-y-auto scrollbar-thin">
                        {renderCapturePageEditor("Editor Guida PDF", Download, pdfGuideConfig, handlePdfGuideChange, handlePdfGuideColorChange)}
                    </div>
                    <div className="relative">
                        <div className="sticky top-20">
                           <h3 className="text-lg font-bold mb-2">Anteprima Live</h3>
                           <iframe ref={pdfGuideIframeRef} src="/#/get-guide?preview=true" className="w-full h-[75vh] border-4 border-gray-300 rounded-lg shadow-lg" title="Anteprima Guida PDF"></iframe>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'general' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center"><Settings className="mr-2 text-brand-600"/> Impostazioni Globali</h3>
                    <div className="grid md:grid-cols-2 gap-12">
                        
                        <div className="space-y-6">
                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Generale</h4>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Modalità Piattaforma</label>
                                <select 
                                    value={localSettings.active_mode || 'public'} 
                                    onChange={(e) => setLocalSettings({...localSettings, active_mode: e.target.value as any})}
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 focus:border-brand-500 shadow-sm font-medium"
                                >
                                    <option value="public">✅ Pubblico</option>
                                    <option value="pre_launch">🚀 Pre-Lancio</option>
                                    <option value="pdf_guide">🎁 Guida PDF</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    Determina quale pagina vedono gli utenti non autenticati.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2">Font di Sistema</label>
                                <select value={localSettings.font_family} onChange={(e) => setLocalSettings({...localSettings, font_family: e.target.value})} className="w-full border-gray-300 rounded-xl p-3 focus:ring-brand-500 shadow-sm bg-white font-medium">
                                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest flex items-center"><Image className="h-4 w-4 mr-2"/> Branding</h4>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">URL Logo</label>
                                <input type="text" value={localSettings.logo_url || ''} onChange={(e) => setLocalSettings({...localSettings, logo_url: e.target.value})} className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"/>
                                <div className="mt-4"><label className="block text-sm font-bold mb-2">Altezza: {localSettings.logo_height}px</label><input type="range" min="20" max="150" value={localSettings.logo_height || 20} onChange={(e) => setLocalSettings({...localSettings, logo_height: parseInt(e.target.value, 10) || 20})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"/></div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === 'landing_manual' && (
                <div className="space-y-8 pb-20">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center"><Megaphone className="mr-2 text-brand-600"/> Barra Annuncio</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <input type="text" value={landingConfig.announcement_bar.text} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, text: e.target.value}})} className="w-full border p-3 rounded-xl" placeholder="Testo avviso..." />
                            <div className="flex gap-4 items-center">
                                <input type="color" value={landingConfig.announcement_bar.bg_color} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, bg_color: e.target.value}})} className="h-10 w-20 rounded" />
                                <label className="text-sm font-bold">Colore Sfondo</label>
                                <input type="checkbox" checked={landingConfig.announcement_bar.is_visible} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, is_visible: e.target.checked}})} className="h-6 w-6 accent-brand-600" />
                                <label className="text-sm font-bold">Visibile</label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center"><Target className="mr-2 text-brand-600"/> Hero Section</h3>
                        <div className="space-y-4">
                            <input type="text" value={landingConfig.hero.title} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, title: e.target.value}})} className="w-full border p-3 rounded-xl font-bold text-lg" placeholder="Titolo Principale" />
                            <input type="text" value={landingConfig.hero.subtitle} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, subtitle: e.target.value}})} className="w-full border p-3 rounded-xl" placeholder="Sottotitolo" />
                            <textarea rows={4} value={landingConfig.hero.text} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, text: e.target.value}})} className="w-full border p-3 rounded-xl" placeholder="Testo descrittivo"></textarea>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="fixed bottom-6 right-6 z-50 flex gap-4">
             <button onClick={handleSaveSettings} disabled={isSavingSettings} className="px-10 py-5 bg-brand-600 text-white rounded-full font-black hover:bg-brand-700 shadow-2xl shadow-brand-500/50 flex items-center text-xl transform hover:scale-110 transition-all disabled:opacity-70">
                {isSavingSettings ? <Loader className="h-6 w-6 animate-spin mr-3"/> : <Settings className="mr-3 h-6 w-6" />} Salva Tutto
            </button>
        </div>

      </div>
    </div>
  );
};
