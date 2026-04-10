
import React, { useState, useEffect, useRef } from 'react';
import { Course, UserProfile, PlatformSettings, LandingPageConfig, PreLaunchConfig, PdfGuideConfig, SupportTicket, SupportMessage } from '../types';
// FIX: Added missing Loader2 import from lucide-react
import { Plus, Edit2, Trash2, Search, DollarSign, BookOpen, Clock, Eye, EyeOff, Lock, Unlock, Loader, Loader2, Settings, Image, LayoutTemplate, Activity, HelpCircle, Terminal, AlignLeft, AlignCenter, MoveHorizontal, Sparkles, Wand2, X, MessageCircle, Megaphone, Target, ListOrdered, Book, Pin, Type, ExternalLink, Rocket, Calendar, Palette, Download, Facebook, Instagram, Linkedin, Youtube, Move, Quote, MoveVertical, AlignVerticalJustifyCenter, Maximize, Check, Columns, ArrowRightLeft, BrainCircuit, GitMerge, UserCheck, XCircle, Video, AlertTriangle, TrendingUp, Users, File, UploadCloud, Copy, RefreshCw, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { GoogleGenAI } from "@google/genai";
import { Sidebar, SidebarItem } from '../components/Sidebar';
import { ImagePicker } from '../components/ImagePicker';
import { AdminAnalyticsDashboard } from '../components/AdminAnalyticsDashboard';
import { AdminUsersList } from '../components/AdminUsersList';
import { AdminSupportManager } from '../components/AdminSupportManager';
import { AdminLiveUsers } from '../components/AdminLiveUsers';
import { TimeRange } from '../components/AdminAnalyticsDashboard';

// Fix: Added missing usp_section and cta_section to satisfy LandingPageConfig interface
const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
  announcement_bar: {
    text: '🚀 Novità: Accedi subito ai percorsi e inizia a creare progetti reali.',
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
    cta_primary: 'Scopri i percorsi disponibili',
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
        "I percorsi che promettono soldi veloci",
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
      },
      {
          name: 'Alessandro M.',
          role: 'Fotografo Freelance',
          text: "Volevo un portfolio online che si distinguesse, ma le agenzie mi chiedevano cifre folli. Grazie a Daniel ho costruito un sito magnifico in poche ore, completamente da solo. Consigliatissimo.",
          avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          verified: true
      },
      {
          name: 'Chiara B.',
          role: 'Social Media Manager',
          text: "La parte sulle automazioni è oro colato. Ho integrato form di contatto, email automatiche e notifiche per i miei clienti, facendogli risparmiare ore di lavoro manuale. Valore immenso.",
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          verified: true
      },
      {
          name: 'Matteo V.',
          role: 'Titolare di Ristorante',
          text: "Pagavo 100€ al mese per un sito obsoleto. Ora ho un sito moderno con prenotazione online che gestisco io, a costo quasi zero. Ho ammortizzato il costo del corso in una settimana.",
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          verified: true
      },
      {
          name: 'Valentina C.',
          role: 'Coach Olistico',
          text: "Il supporto su WhatsApp è la vera svolta. Avevo un dubbio sul dominio e Daniel mi ha risposto in 10 minuti, risolvendo tutto. Non sei mai lasciato solo. Questo non ha prezzo.",
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          verified: true
      },
      {
          name: 'Riccardo T.',
          role: 'Agente Immobiliare',
          text: "Ho creato landing page specifiche per ogni immobile di lusso che vendo. Risultati? Tassi di conversione triplicati e clienti impressionati. Il miglior investimento del 2024.",
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          verified: true
      },
      {
          name: 'Laura P.',
          role: 'Artista',
          text: "Finalmente posso mostrare le mie opere online senza dipendere da nessuno. Il processo è stato così semplice e intuitivo che mi sono sentita una vera 'tech artist'. Grazie!",
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          verified: true
      },
      {
          name: 'Simone R.',
          role: 'Personal Trainer',
          text: "Ho creato un'area riservata per i miei clienti con schede di allenamento e video esclusivi. Una funzionalità che pensavo costasse migliaia di euro, realizzata in un pomeriggio. Fenomenale.",
          avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          verified: true
      }
    ]
  },
  // Fix: Added missing usp_section to default config
  usp_section: {
    title: 'Perché siamo diversi dagli altri percorsi',
    is_visible: true,
    items: [
      { title: 'QUALITÀ SENZA COMPROMESSI', desc: 'Contenuti aggiornati e processi testati su progetti reali.' },
      { title: 'ASSISTENZA 6 GIORNI SU 7', desc: 'Supporto diretto su WhatsApp o in piattaforma per non lasciarti mai solo.' },
      { title: 'PARTNER GOOGLE & GEMINI', desc: 'Siamo specialisti certificati nell’uso delle tecnologie AI di Google.' },
      { title: 'ZERO COSTI RICORRENTI', desc: 'Impari a usare strumenti gratuiti o low-code senza abbonamenti pesanti.' }
    ]
  },
  // Fix: Added missing cta_section to default config
  cta_section: {
    title: 'Iniziate a costruire qualcosa di reale.',
    subtitle: 'Usate l’AI a costo zero, create progetti veri e portate le vostre competenze al livello successivo.',
    button_text: 'Guarda tutti i percorsi',
    is_visible: true
  },
  footer: {
      text: 'Moise Web Academy',
      copyright: 'Tutti i diritti riservati.',
      is_visible: true,
      logo_height: 40,
      social_links: { facebook: '', instagram: '', linkedin: '', youtube: '' }
  },
  videos: {
    hero_video_id: 'v1765326450/home_2_bbhedx',
    ai_era_video_id: 'v1765328025/home_page_3_tnvnqm',
    how_it_works_video_id: 'v1765456382/come-funziona-MWA_mpdave',
    target_section_video_id: 'v1765392297/uomo-affari-consegna-carta_f3tj6t',
    about_video_url: 'https://res.cloudinary.com/dhj0ztos6/video/upload/v1765452611/Home_page_rnk0zw.webm'
  }
};

const DEFAULT_PRE_LAUNCH_CONFIG: PreLaunchConfig = {
    meta_pixel_id: '',
    headline_solid: "ACCESSO ESCLUSIVO",
    headline_gradient: "AL MONDO DELL'AI",
    subheadline: "Il futuro dello sviluppo web è qui, ed è gratuito.",
    text: "Accedi gratuitamente al nostro percorso base. Impara a creare siti web e software (SaaS) con l'Intelligenza Artificiale, senza costi nascosti. Iscriviti ora per ricevere il tuo accesso personale il 30 Gennaio.",
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
    meta_pixel_id: '',
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
    bg_color_main: "#020617",
    title_color: "#f8fafc",
    text_color_body: "#94a3b8",
    gradient_start: "#3b82f6",
    gradient_end: "#8b5cf6",
    showcase_section: {
      is_visible: true,
      title: 'Cosa Puoi Creare Davvero',
      subtitle: 'Questi non sono template. Sono progetti reali, creati in poche ore con le tecniche che scoprirai nella guida.',
      items: []
    },
    showcase_items: [],
    stats_section: {
      is_visible: true,
      title: 'I Nostri Numeri',
      subtitle: 'I risultati parlano da soli. Ecco cosa hanno ottenuto i nostri studenti grazie a questa guida.',
      stats: [
        { value: '93%', label: 'Tasso di Successo', description: 'Dei nostri studenti pubblica il proprio sito entro 48 ore.' },
        { value: '+200%', label: 'Aumento Leads', description: 'L\'aumento medio di contatti generati dai siti creati con le nostre tecniche.' },
        { value: '1 Ora', label: 'Tempo Medio', description: 'Il tempo medio necessario per creare e lanciare un sito completo partendo da zero.' },
      ]
    },
    testimonials_section: {
      title: 'Cosa Dicono i Nostri Studenti',
      subtitle: 'Testimonianze',
      is_visible: true,
      reviews: [
        {
            name: 'Elena G.',
            role: 'Imprenditrice Digitale',
          text: 'Ho sempre pensato che creare un e-commerce fosse un incubo tecnico. Con questo percorso ho messo online il mio shop in un weekend, senza scrivere una riga di codice. Incredibile!',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Davide F.',
            role: 'Consulente Marketing',
            text: "Finalmente un percorso che va dritto al punto. L'approccio pratico con l'AI mi ha permesso di offrire landing page ai miei clienti a un prezzo competitivo, aumentando il mio fatturato del 40%.",
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Sofia L.',
            role: 'Studentessa',
            text: "Partivo da zero assoluto. Ora ho creato il sito per l'attività di famiglia e sto già ricevendo richieste da altri commercianti. Una competenza che mi ha aperto un mondo.",
            avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Alessandro M.',
            role: 'Fotografo Freelance',
            text: "Volevo un portfolio online che si distinguesse, ma le agenzie mi chiedevano cifre folli. Grazie a Daniel ho costruito un sito magnifico in poche ore, completamente da solo. Consigliatissimo.",
            avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Chiara B.',
            role: 'Social Media Manager',
            text: "La parte sulle automazioni è oro colato. Ho integrato form di contatto, email automatiche e notifiche per i miei clienti, facendogli risparmiare ore di lavoro manuale. Valore immenso.",
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Matteo V.',
            role: 'Titolare di Ristorante',
            text: "Pagavo 100€ al mese per un sito obsoleto. Ora ho un sito moderno con prenotazione online che gestisco io, a costo quasi zero. Ho ammortizzato il costo del percorso in una settimana.",
            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Valentina C.',
            role: 'Coach Olistico',
            text: "Il supporto su WhatsApp è la vera svolta. Avevo un dubbio sul dominio e Daniel mi ha risposto in 10 minuti, risolvendo tutto. Non sei mai lasciato solo. Questo non ha prezzo.",
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Riccardo T.',
            role: 'Agente Immobiliare',
            text: "Ho creato landing page specifiche per ogni immobile di lusso che vendo. Risultati? Tassi di conversione triplicati e clienti impressionati. Il miglior investimento del 2024.",
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Laura P.',
            role: 'Artista',
            text: "Finalmente posso mostrare le mie opere online senza dipendere da nessuno. Il processo è stato così semplice e intuitivo che mi sono sentita una vera 'tech artist'. Grazie!",
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        },
        {
            name: 'Simone R.',
            role: 'Personal Trainer',
            text: "Ho creato un'area riservata per i miei clienti con schede di allenamento e video esclusivi. Una funzionalità che pensavo costasse migliaia di euro, realizzata in un pomeriggio. Fenomenale.",
            avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            verified: true
        }
      ]
    },
    footer: {
      text: 'Moise Web Academy',
      copyright: 'Tutti i diritti riservati.',
      is_visible: true,
      social_links: { facebook: '', instagram: '', linkedin: '', youtube: '' }
    }
};

interface AdminDashboardProps {
  courses: Course[];
  user: UserProfile;
  onDelete: (id: string) => void;
  onRefresh: () => Promise<void>;
  currentSettings: PlatformSettings;
  onUpdateSettings: (newSettings: PlatformSettings) => Promise<void>;
  initialTab?: 'dashboard' | 'live' | 'users' | 'courses' | 'general' | 'landing_manual' | 'landing_ai' | 'launch' | 'pdf_guide' | 'community' | 'support';
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses, user, onDelete, onRefresh, currentSettings, onUpdateSettings, initialTab = 'dashboard' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState<string | null>(null);
  
  const [localSettings, setLocalSettings] = useState<PlatformSettings>(currentSettings);
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(() => {
    const config = { ...DEFAULT_LANDING_CONFIG, ...currentSettings.landing_page_config };
    if (!config.testimonials_section.reviews || config.testimonials_section.reviews.length < 10) {
      config.testimonials_section.reviews = DEFAULT_LANDING_CONFIG.testimonials_section.reviews;
    }
    return config;
  });
  const [preLaunchConfig, setPreLaunchConfig] = useState<PreLaunchConfig>(currentSettings.pre_launch_config || DEFAULT_PRE_LAUNCH_CONFIG);
  const [pdfGuideConfig, setPdfGuideConfig] = useState<PdfGuideConfig>(currentSettings.pdf_guide_config || DEFAULT_PDF_GUIDE_CONFIG);
  
  // Stati per l'upload del PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [isLoadingWaitingList, setIsLoadingWaitingList] = useState(false);
  const [showPdfFormImagePicker, setShowPdfFormImagePicker] = useState(false);

  useEffect(() => {
    if (activeTab === 'launch') {
      fetchWaitingList();
    }
  }, [activeTab]);

  const fetchWaitingList = async () => {
    setIsLoadingWaitingList(true);
    try {
      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWaitingList(data || []);
    } catch (err) {
      console.error("Error fetching waiting list:", err);
    } finally {
      setIsLoadingWaitingList(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm("⚠️ Questa azione svuoterà la cache locale del browser (LocalStorage, SessionStorage) e forzerà il ricaricamento della pagina. Continuare?")) return;
    
    setIsClearingCache(true);
    try {
        // Clear LocalStorage
        localStorage.clear();
        // Clear SessionStorage
        sessionStorage.clear();
        
        // Unregister Service Workers if any
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }

        alert("✨ Cache svuotata con successo! La pagina verrà ricaricata.");
        window.location.reload();
    } catch (err: any) {
        alert("Errore durante lo svuotamento della cache: " + err.message);
    } finally {
        setIsClearingCache(false);
    }
  };

  const handleAssignPreview = async (courseId: string) => {
    if (assigningCourse) return;
    setAssigningCourse(courseId);
    try {
      const { error } = await supabase
        .from('purchases')
        .insert({ user_id: user.id, course_id: courseId });

      if (error && error.code !== '23505') { // 23505 è il codice per violazione di unicità (già posseduto)
        throw error;
      }

      await onRefresh(); // Aggiorna i dati dell'utente per riflettere il nuovo acquisto
      alert(`Percorso assegnato! Ora puoi vederlo nella tua dashboard.`);
      navigate('/dashboard');

    } catch (err: any) {
      console.error("Errore assegnazione percorso:", err);
      alert("Errore durante l'assegnazione del percorso: " + err.message);
    } finally {
      setAssigningCourse(null);
    }
  };
  const launchIframeRef = useRef<HTMLIFrameElement>(null);
  const pdfGuideIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLocalSettings(currentSettings);
    if (currentSettings.landing_page_config) {
      const config = { ...DEFAULT_LANDING_CONFIG, ...currentSettings.landing_page_config };
      if (!config.testimonials_section.reviews || config.testimonials_section.reviews.length < 10) {
        config.testimonials_section.reviews = DEFAULT_LANDING_CONFIG.testimonials_section.reviews;
      }
      setLandingConfig(config);
    }
    if (currentSettings.pre_launch_config) setPreLaunchConfig({ ...DEFAULT_PRE_LAUNCH_CONFIG, ...currentSettings.pre_launch_config });
    if (currentSettings.pdf_guide_config) {
      const config = { ...DEFAULT_PDF_GUIDE_CONFIG, ...currentSettings.pdf_guide_config };
      if (!config.testimonials_section?.reviews || config.testimonials_section.reviews.length < 10) {
        config.testimonials_section = {
          ...(config.testimonials_section || DEFAULT_PDF_GUIDE_CONFIG.testimonials_section!),
          reviews: DEFAULT_PDF_GUIDE_CONFIG.testimonials_section!.reviews
        };
      }
      setPdfGuideConfig(config);
    }
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

  const handlePdfDelete = async () => {
    if (!pdfGuideConfig.guide_pdf_url) return;
    if (!confirm("Sei sicuro di voler eliminare il PDF?")) return;
    
    setIsUploading(true);
    try {
      console.log("Attempting to delete file at:", pdfGuideConfig.guide_pdf_url);
      const url = new URL(pdfGuideConfig.guide_pdf_url);
      const pathParts = url.pathname.split('/');
      const oldFilePath = pathParts[pathParts.length - 1]; // Get the filename
      
      if (oldFilePath) {
        await supabase.storage.from('pdf-guides').remove([decodeURIComponent(oldFilePath)]);
      }
      setPdfGuideConfig(prev => ({ ...prev, guide_pdf_url: undefined }));
      alert("PDF eliminato con successo! Ricorda di salvare le impostazioni.");
    } catch (err: any) {
      console.error("Errore eliminazione PDF:", err);
      alert("Errore eliminazione PDF: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) { alert("Seleziona prima un file PDF."); return; }
    setIsUploading(true);
    try {
      // 1. Rimuovi il vecchio file se esiste
      if (pdfGuideConfig.guide_pdf_url) {
        console.log("Attempting to remove old file at:", pdfGuideConfig.guide_pdf_url);
        const url = new URL(pdfGuideConfig.guide_pdf_url);
        const pathParts = url.pathname.split('/');
        const oldFilePath = pathParts[pathParts.length - 1]; // Get the filename
        
        if (oldFilePath) {
          await supabase.storage.from('pdf-guides').remove([decodeURIComponent(oldFilePath)]);
        }
      }

      // 2. Carica il nuovo file con un nome unico
      const fileName = `guida-mwa-${Date.now()}.pdf`;
      const { data, error } = await supabase.storage
        .from('pdf-guides')
        .upload(fileName, pdfFile, {
          cacheControl: '3600',
          upsert: false // è più sicuro non fare upsert per evitare sovrascritture accidentali
        });
      
      if (error) throw error;

      // 3. Ottieni l'URL pubblico e salvalo nello stato
      const { data: { publicUrl } } = supabase.storage.from('pdf-guides').getPublicUrl(data.path);
      
      setPdfGuideConfig(prev => ({ ...prev, guide_pdf_url: publicUrl }));
      setPdfFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      alert("PDF caricato con successo! Ricorda di salvare le impostazioni.");

    } catch (err: any) {
      console.error("Errore upload PDF:", err);
      const msg = err.message || '';
      if (msg.includes('row-level security')) {
        alert('Errore di permessi (RLS): Esegui lo script SQL per configurare le policy del bucket "pdf-guides".');
      } else {
        alert("Errore upload PDF: " + err.message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReviewUpdate = (idx: number, field: string, value: string) => {
    const newReviews = [...(landingConfig.testimonials_section.reviews || [])];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    setLandingConfig({ ...landingConfig, testimonials_section: { ...landingConfig.testimonials_section, reviews: newReviews } });
  };

  const handlePdfReviewUpdate = (idx: number, field: string, value: string) => {
    const newReviews = [...(pdfGuideConfig.testimonials_section?.reviews || [])];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    setPdfGuideConfig({ ...pdfGuideConfig, testimonials_section: { ...(pdfGuideConfig.testimonials_section || DEFAULT_PDF_GUIDE_CONFIG.testimonials_section!), reviews: newReviews } });
  };

  const handleExportCSV = async () => {
      try {
          const { data, error } = await supabase.from('waiting_list').select('*').order('created_at', { ascending: true });
          if (error) throw error;
          if (!data || data.length === 0) { alert("Nessun iscritto da esportare."); return; }
          let csvContent = "data:text/csv;charset=utf-8,Posizione,Email,Nome,Data Iscrizione,Fonte,Corso ID\n";
          data.forEach((row, index) => {
              const date = new Date(row.created_at).toLocaleDateString();
              csvContent += `${index + 1},${row.email},"${row.full_name || 'N/A'}",${date},${row.source || 'pre_launch'},${row.course_id || 'N/A'}\n`;
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
      handleColorChange: (name: string, value: string) => void,
      isPdfPage: boolean = false
  ) => (
      <div className="space-y-6">
          <h3 className="text-xl font-bold mb-6 flex items-center">{React.createElement(icon, { className: "mr-2 text-red-600" })} {title}</h3>
          
          {isPdfPage && (
              <>
                  <div className="bg-purple-50 p-6 rounded-2xl border-2 border-dashed border-purple-200">
                      <h4 className="font-bold text-purple-800 mb-2 flex items-center"><File className="h-5 w-5 mr-2"/> Gestione Guida PDF</h4>
                      <p className="text-sm text-purple-600 mb-4">Carica qui il file PDF che verrà automaticamente mostrato agli utenti nel loro percorso gratuito.</p>
                      <div className="bg-white p-3 rounded-lg border border-purple-200 mb-4">
                          <p className="text-xs text-purple-500 font-bold">URL Landing Page Condivisibile:</p>
                          <div className="flex items-center gap-2">
                              <a href={"/guida-pdf-gratuita"} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-800 font-mono truncate hover:underline">{window.location.origin + '/guida-pdf-gratuita'}</a>
                              <button onClick={() => navigator.clipboard.writeText(window.location.origin + '/guida-pdf-gratuita')} className="text-purple-500 hover:text-purple-800"><Copy className="h-3 w-3"/></button>
                          </div>
                      </div>
                      {pdfGuideConfig.guide_pdf_url && (
                          <div className="bg-white p-3 rounded-lg border border-purple-200 mb-4">
                              <p className="text-xs text-purple-500 font-bold">PDF Attualmente Caricato:</p>
                              <div className="flex items-center gap-2">
                                  <a href={pdfGuideConfig.guide_pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-800 font-mono truncate hover:underline">{pdfGuideConfig.guide_pdf_url}</a>
                                  <button onClick={() => navigator.clipboard.writeText(pdfGuideConfig.guide_pdf_url || '')} className="text-purple-500 hover:text-purple-800"><Copy className="h-3 w-3"/></button>
                                  <button onClick={handlePdfDelete} className="text-red-500 hover:text-red-800"><Trash2 className="h-3 w-3"/></button>
                              </div>
                          </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3">
                          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                          <button onClick={handlePdfUpload} disabled={isUploading || !pdfFile} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
                              {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <UploadCloud className="h-4 w-4"/>}
                              {pdfGuideConfig.guide_pdf_url ? 'Sostituisci' : 'Carica'}
                          </button>
                      </div>
                      <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Altezza Immagine Form (px)</label>
                          <input 
                              type="number" 
                              value={pdfGuideConfig.form_image_height || ''} 
                              onChange={e => setPdfGuideConfig(prev => ({...prev, form_image_height: parseInt(e.target.value) || undefined}))} 
                              className="w-full border p-2 rounded text-sm" 
                              placeholder="es. 100" 
                          />
                      </div>
                  </div>

                  <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <summary className="font-bold cursor-pointer flex items-center gap-2"><Sparkles/> Showcase Progetti</summary>
                      <div className="mt-4 space-y-4">
                          {(pdfGuideConfig.showcase_items || []).map((item, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 relative">
                                  <button onClick={() => { const newItems = [...(pdfGuideConfig.showcase_items || [])]; newItems.splice(idx, 1); setPdfGuideConfig(prev => ({...prev, showcase_items: newItems})); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                      <XCircle className="h-4 w-4"/>
                                  </button>
                                  <input value={item.title} onChange={e => { const newItems = [...(pdfGuideConfig.showcase_items || [])]; newItems[idx].title = e.target.value; setPdfGuideConfig(prev => ({...prev, showcase_items: newItems})); }} className="w-full border p-2 rounded text-sm font-bold" placeholder="Titolo Progetto" />
                                  <input value={item.image_url} onChange={e => { const newItems = [...(pdfGuideConfig.showcase_items || [])]; newItems[idx].image_url = e.target.value; setPdfGuideConfig(prev => ({...prev, showcase_items: newItems})); }} className="w-full border p-2 rounded text-sm" placeholder="URL Immagine (es. https://.../screenshot.jpg)" />
                                  <input value={item.url} onChange={e => { const newItems = [...(pdfGuideConfig.showcase_items || [])]; newItems[idx].url = e.target.value; setPdfGuideConfig(prev => ({...prev, showcase_items: newItems})); }} className="w-full border p-2 rounded text-sm" placeholder="URL Progetto (es. https://...)" />
                              </div>
                          ))}
                          <button onClick={() => { const newItems = [...(pdfGuideConfig.showcase_items || []), {title: '', url: '', image_url: ''}]; setPdfGuideConfig(prev => ({...prev, showcase_items: newItems})); }} className="w-full bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300 text-sm flex items-center justify-center gap-2">
                              <Plus className="h-4 w-4"/> Aggiungi Esempio
                          </button>
                      </div>
                   </details>

                    <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <summary className="font-bold cursor-pointer flex items-center gap-2"><TrendingUp/> Sezione Statistiche</summary>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <input type="text" value={pdfGuideConfig.stats_section?.title || ''} onChange={e => setPdfGuideConfig(prev => ({...prev, stats_section: {...prev.stats_section, title: e.target.value}}))} className="w-full border p-2 rounded text-sm" placeholder="Titolo Sezione" />
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={pdfGuideConfig.stats_section?.is_visible || false} onChange={e => setPdfGuideConfig(prev => ({...prev, stats_section: {...prev.stats_section, is_visible: e.target.checked}}))} className="h-5 w-5 accent-purple-600" />
                                    <span className="text-sm font-medium">Visibile</span>
                                </div>
                            </div>
                            <textarea value={pdfGuideConfig.stats_section?.subtitle || ''} onChange={e => setPdfGuideConfig(prev => ({...prev, stats_section: {...prev.stats_section, subtitle: e.target.value}}))} rows={2} className="w-full border p-2 rounded text-sm" placeholder="Sottotitolo Sezione"></textarea>
                            
                            <h5 className="font-bold text-xs uppercase text-gray-500 pt-2">Elenco Statistiche</h5>
                            {(pdfGuideConfig.stats_section?.stats || []).map((stat, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 relative">
                                    <button onClick={() => { const newStats = [...(pdfGuideConfig.stats_section?.stats || [])]; newStats.splice(idx, 1); setPdfGuideConfig(prev => ({...prev, stats_section: {...prev.stats_section, stats: newStats}})); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                        <XCircle className="h-4 w-4"/>
                                    </button>
                                    <div className="flex gap-2">
                                        <input value={stat.value} onChange={e => { const newStats = [...pdfGuideConfig.stats_section.stats]; newStats[idx].value = e.target.value; setPdfGuideConfig(prev => ({...prev, stats_section: {...prev.stats_section, stats: newStats}})); }} className="w-1/3 border p-2 rounded text-sm font-bold" placeholder="Valore (es. 93%)" />
                                        <input value={stat.label} onChange={e => { const newStats = [...pdfGuideConfig.stats_section.stats]; newStats[idx].label = e.target.value; setPdfGuideConfig(prev => ({...prev, stats_section: {...prev.stats_section, stats: newStats}})); }} className="w-2/3 border p-2 rounded text-sm" placeholder="Etichetta (es. Tasso di Successo)" />
                                    </div>
                                    <textarea value={stat.description} onChange={e => { const newStats = [...pdfGuideConfig.stats_section.stats]; newStats[idx].description = e.target.value; setPdfGuideConfig(prev => ({...prev, stats_section: {...prev.stats_section, stats: newStats}})); }} rows={2} className="w-full border p-2 rounded text-sm" placeholder="Descrizione..."></textarea>
                                </div>
                            ))}
                            <button onClick={() => { const newStats = [...(pdfGuideConfig.stats_section?.stats || []), {value: '', label: '', description: ''}]; setPdfGuideConfig(prev => ({...prev, stats_section: {...(prev.stats_section || DEFAULT_PDF_GUIDE_CONFIG.stats_section), stats: newStats}})); }} className="w-full bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300 text-sm flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4"/> Aggiungi Statistica
                            </button>
                        </div>
                   </details>

                   <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <summary className="font-bold cursor-pointer flex items-center gap-2"><MessageCircle/> Sezione Recensioni</summary>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <input type="text" value={pdfGuideConfig.testimonials_section?.title || ''} onChange={e => setPdfGuideConfig(prev => ({...prev, testimonials_section: {...(prev.testimonials_section || DEFAULT_PDF_GUIDE_CONFIG.testimonials_section!), title: e.target.value}}))} className="w-full border p-2 rounded text-sm" placeholder="Titolo Sezione" />
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={pdfGuideConfig.testimonials_section?.is_visible || false} onChange={e => setPdfGuideConfig(prev => ({...prev, testimonials_section: {...(prev.testimonials_section || DEFAULT_PDF_GUIDE_CONFIG.testimonials_section!), is_visible: e.target.checked}}))} className="h-5 w-5 accent-purple-600" />
                                    <span className="text-sm font-medium">Visibile</span>
                                </div>
                            </div>
                            <input type="text" value={pdfGuideConfig.testimonials_section?.subtitle || ''} onChange={e => setPdfGuideConfig(prev => ({...prev, testimonials_section: {...(prev.testimonials_section || DEFAULT_PDF_GUIDE_CONFIG.testimonials_section!), subtitle: e.target.value}}))} className="w-full border p-2 rounded text-sm" placeholder="Sottotitolo" />
                            
                            <h5 className="font-bold text-xs uppercase text-gray-500 pt-2">Elenco Recensioni ({(pdfGuideConfig.testimonials_section?.reviews || []).length})</h5>
                            {(pdfGuideConfig.testimonials_section?.reviews || []).map((review, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 relative">
                                    <button onClick={() => { const newReviews = [...(pdfGuideConfig.testimonials_section?.reviews || [])]; newReviews.splice(idx, 1); setPdfGuideConfig(prev => ({...prev, testimonials_section: {...prev.testimonials_section!, reviews: newReviews}})); }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                        <XCircle className="h-4 w-4"/>
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input value={review.name} onChange={e => handlePdfReviewUpdate(idx, 'name', e.target.value)} className="border p-2 rounded text-sm font-bold" placeholder="Nome" />
                                        <input value={review.role} onChange={e => handlePdfReviewUpdate(idx, 'role', e.target.value)} className="border p-2 rounded text-sm" placeholder="Ruolo" />
                                    </div>
                                    <textarea value={review.text} onChange={e => handlePdfReviewUpdate(idx, 'text', e.target.value)} rows={2} className="w-full border p-2 rounded text-sm" placeholder="Testo..."></textarea>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={review.verified} onChange={e => {
                                            const newReviews = [...(pdfGuideConfig.testimonials_section?.reviews || [])];
                                            newReviews[idx] = { ...newReviews[idx], verified: e.target.checked };
                                            setPdfGuideConfig(prev => ({ ...prev, testimonials_section: { ...prev.testimonials_section!, reviews: newReviews } }));
                                        }} className="h-4 w-4 accent-green-600" />
                                        <span className="text-xs font-bold text-green-700">Verificata</span>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => { const newReviews = [...(pdfGuideConfig.testimonials_section?.reviews || []), {name: '', role: '', text: '', verified: true}]; setPdfGuideConfig(prev => ({...prev, testimonials_section: {...(prev.testimonials_section || DEFAULT_PDF_GUIDE_CONFIG.testimonials_section!), reviews: newReviews}})); }} className="w-full bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300 text-sm flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4"/> Aggiungi Recensione
                            </button>
                        </div>
                   </details>

                   <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <summary className="font-bold cursor-pointer flex items-center gap-2"><LayoutTemplate/> Footer</summary>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <input type="text" value={pdfGuideConfig.footer?.text || ''} onChange={e => setPdfGuideConfig(prev => ({...prev, footer: {...(prev.footer || DEFAULT_PDF_GUIDE_CONFIG.footer!), text: e.target.value}}))} className="w-full border p-2 rounded text-sm" placeholder="Testo Footer" />
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={pdfGuideConfig.footer?.is_visible || false} onChange={e => setPdfGuideConfig(prev => ({...prev, footer: {...(prev.footer || DEFAULT_PDF_GUIDE_CONFIG.footer!), is_visible: e.target.checked}}))} className="h-5 w-5 accent-purple-600" />
                                    <span className="text-sm font-medium">Visibile</span>
                                </div>
                            </div>
                            <input type="text" value={pdfGuideConfig.footer?.copyright || ''} onChange={e => setPdfGuideConfig(prev => ({...prev, footer: {...(prev.footer || DEFAULT_PDF_GUIDE_CONFIG.footer!), copyright: e.target.value}}))} className="w-full border p-2 rounded text-sm" placeholder="Copyright" />
                        </div>
                   </details>
              </>
          )}

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
                  {isPdfPage && (
                      <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Immagine Modulo Guida PDF</label>
                          <div className="flex items-center gap-4">
                              {localSettings.pdf_guide_form_image && (
                                  <img src={localSettings.pdf_guide_form_image} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                              )}
                              <button 
                                  onClick={() => setShowPdfFormImagePicker(true)}
                                  className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl py-4 px-4 text-gray-500 hover:border-brand-500 hover:text-brand-500 transition-all flex items-center justify-center gap-2"
                              >
                                  <Image className="h-5 w-5" /> {localSettings.pdf_guide_form_image ? 'Cambia Immagine' : 'Seleziona Immagine'}
                              </button>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-2">
                              Immagine mostrata nel modulo di iscrizione della guida PDF.
                          </p>
                      </div>
                  )}
              </div>
          </details>

          <details className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <summary className="font-bold cursor-pointer">Messaggi di Successo</summary>
              <div className="mt-4 space-y-3">
                   <input name="success_title" value={config.success_title} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Titolo Successo Generico" />
                   <textarea name="success_text" rows={2} value={config.success_text} onChange={handleChange} className="w-full border p-2 rounded text-sm" placeholder="Testo Successo Generico"></textarea>
              </div>
          </details>
          {isPdfPage && showPdfFormImagePicker && (
              <ImagePicker 
                  isOpen={showPdfFormImagePicker}
                  onSelect={(url) => {
                      setLocalSettings({...localSettings, pdf_guide_form_image: url});
                      setShowPdfFormImagePicker(false);
                  }}
                  onClose={() => setShowPdfFormImagePicker(false)}
              />
          )}
      </div>
  );

  const adminMenuItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'live', label: 'Utenti Live', icon: Activity },
    { id: 'users', label: 'Utenti', icon: Users },
    { id: 'courses', label: 'Corsi', icon: Book },
    { id: 'launch', label: 'Pre-Lancio', icon: Rocket },
    { id: 'pdf_guide', label: 'Guida PDF', icon: Download },
    { id: 'landing_manual', label: 'Editor Home', icon: LayoutTemplate },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'support', label: 'Supporto', icon: HelpCircle },
    { id: 'general', label: 'Gestione Piattaforma', icon: Settings },
  ];

  return (
    <div className="pt-20 min-h-screen bg-white flex flex-col lg:flex-row">
      <Sidebar 
        activeItem={activeTab} 
        items={adminMenuItems} 
        onItemClick={(id) => { setActiveTab(id as any); navigate(`/admin/${id}`); }} 
      />

      <main className="flex-1 bg-gray-50/50 pb-20 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                      {adminMenuItems.find(item => item.id === activeTab)?.label || 'Admin'}
                  </h1>
                  <p className="text-gray-500 mt-1">
                      {activeTab === 'dashboard' && 'Panoramica delle performance della tua Academy.'}
                      {activeTab === 'users' && 'Gestisci gli iscritti e i loro progressi.'}
                      {activeTab === 'courses' && 'Crea e modifica i tuoi percorsi formativi.'}
                      {activeTab === 'launch' && 'Configura la pagina di pre-lancio.'}
                      {activeTab === 'pdf_guide' && 'Gestisci il funnel della guida PDF.'}
                      {activeTab === 'landing_manual' && 'Personalizza la pagina di vendita.'}
                      {activeTab === 'community' && 'Modera le discussioni della community.'}
                      {activeTab === 'support' && 'Gestisci i ticket di assistenza degli studenti.'}
                      {activeTab === 'general' && 'Controlla ogni aspetto della tua Academy.'}
                  </p>
              </div>
              <div className="flex items-center gap-3">
                  {activeTab === 'dashboard' && (
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        <select 
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="bg-transparent text-sm font-bold text-gray-700 px-3 py-2 outline-none cursor-pointer"
                        >
                            <option value="today">Oggi</option>
                            <option value="yesterday">Ieri</option>
                            <option value="7d">Ultimi 7 giorni</option>
                            <option value="30d">Ultimi 30 giorni</option>
                            <option value="90d">Ultimi 90 giorni</option>
                            <option value="all">Sempre</option>
                            <option value="custom">Personalizzato</option>
                        </select>
                        {timeRange === 'custom' && (
                          <div className="flex items-center gap-2 px-2 border-l border-gray-200">
                            <input 
                              type="date" 
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="text-sm border-none outline-none bg-transparent text-gray-700"
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                              type="date" 
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="text-sm border-none outline-none bg-transparent text-gray-700"
                            />
                          </div>
                        )}
                    </div>
                  )}
                  {activeTab === 'general' && (
                      <button onClick={() => setShowHelp(!showHelp)} className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all flex items-center">
                          <Terminal className="h-5 w-5 mr-2" /> SQL Help
                      </button>
                  )}
                  {activeTab === 'courses' && (
                      <button onClick={() => navigate('/admin/course/new')} className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all flex items-center">
                          <Plus className="h-5 w-5 mr-2" /> Nuovo Percorso
                      </button>
                  )}
              </div>
          </div>

          {showHelp && activeTab === 'general' && (
              <div className="bg-slate-900 text-slate-200 p-6 rounded-xl mb-8 shadow-xl border border-slate-700 font-mono text-sm relative">
                  <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-5 w-5"/></button>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center"><Terminal className="mr-2 h-5 w-5"/> Comandi Database Utili</h3>
                  <p className="text-slate-400 mb-4">Esegui questi comandi nell'SQL Editor di Supabase per aggiornare la struttura.</p>
                      <div className="bg-black p-4 rounded border border-slate-700 mb-2">
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS active_mode text DEFAULT 'public';</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS pdf_guide_config jsonb;</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.platform_settings ADD COLUMN IF NOT EXISTS favicon_url text;</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 5.0;</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS show_discount_badge boolean DEFAULT true;</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS show_features boolean DEFAULT true;</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS upsell_course_id text;</code>
                          <code className="text-green-400 select-all block mb-2">ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;</code>
                          <code className="text-green-400 select-all block mb-2">UPDATE public.profiles SET email = auth.users.email FROM auth.users WHERE public.profiles.id = auth.users.id;</code>
                      </div>
              </div>
          )}

          {/* CONTENT */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {activeTab === 'dashboard' && (
                <AdminAnalyticsDashboard 
                  courses={courses} 
                  timeRange={timeRange} 
                  customStartDate={customStartDate} 
                  customEndDate={customEndDate} 
                />
            )}

            {activeTab === 'live' && (
                <AdminLiveUsers />
            )}

            {activeTab === 'users' && (
                <AdminUsersList courses={courses} />
            )}

            {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                            <div className="relative h-48">
                                <img src={course.image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                                    <div className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{course.level}</div>
                                    {course.is_hidden && (
                                        <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center">
                                            <EyeOff className="h-3 w-3 mr-1" /> Nascosto
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg mb-4 line-clamp-1">{course.title}</h3>
                                <div className="mt-auto flex gap-2">
                                    <button onClick={() => navigate(`/admin/course/${course.id}`)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 flex items-center justify-center text-sm"><Edit2 className="h-4 w-4 mr-2"/> Modifica</button>
                                    <button 
                                        onClick={() => handleAssignPreview(course.id)} 
                                        disabled={!!assigningCourse} 
                                        className="flex-1 bg-brand-50 text-brand-700 py-2 rounded-lg font-bold hover:bg-brand-100 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {assigningCourse === course.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Eye className="h-4 w-4 mr-2"/>}
                                        Anteprima
                                    </button>
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

                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-brand-600" /> Iscritti Recenti ({waitingList.length})
                                    </h4>
                                    <button onClick={fetchWaitingList} className="text-brand-600 hover:text-brand-700 p-1 rounded-full hover:bg-brand-50 transition-colors">
                                        <RefreshCw className={`h-4 w-4 ${isLoadingWaitingList ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <div className="max-h-60 overflow-y-auto scrollbar-thin">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-2 font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Nome</th>
                                                <th className="px-4 py-2 font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Email</th>
                                                <th className="px-4 py-2 font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Corso/Fonte</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {waitingList.map((entry, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-2 font-medium text-gray-900">{entry.full_name || 'N/A'}</td>
                                                    <td className="px-4 py-2 text-gray-600">{entry.email}</td>
                                                    <td className="px-4 py-2">
                                                        {entry.course_id ? (
                                                            <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold border border-brand-100">
                                                                {courses.find(c => c.id === entry.course_id)?.title || 'Corso Eliminato'}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold border border-gray-200">
                                                                {entry.source === 'pdf_guide' ? 'Guida PDF' : 'Pre-Lancio'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {waitingList.length === 0 && !isLoadingWaitingList && (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">Nessun iscritto trovato.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
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
                        {renderCapturePageEditor("Editor Guida PDF", Download, pdfGuideConfig, handlePdfGuideChange, handlePdfGuideColorChange, true)}
                    </div>
                    <div className="relative">
                        <div className="sticky top-20">
                           <h3 className="text-lg font-bold mb-2">Anteprima Live</h3>
                           <iframe ref={pdfGuideIframeRef} src="/guida-pdf-gratuita?preview=true" className="w-full h-[75vh] border-4 border-gray-300 rounded-lg shadow-lg" title="Anteprima Guida PDF"></iframe>
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
                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest flex items-center"><Activity className="h-4 w-4 mr-2"/> Manutenzione</h4>
                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                <h4 className="font-bold text-amber-800 mb-2 flex items-center"><RefreshCw className="h-4 w-4 mr-2"/> Svuota Cache Piattaforma</h4>
                                <p className="text-sm text-amber-600 mb-4">Usa questa funzione se noti problemi di caricamento o se le modifiche non appaiono correttamente.</p>
                                <button 
                                    onClick={handleClearCache} 
                                    disabled={isClearingCache}
                                    className="w-full bg-amber-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-amber-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                >
                                    {isClearingCache ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />} Svuota Cache Ora
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest flex items-center"><Image className="h-4 w-4 mr-2"/> Branding</h4>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Meta Pixel ID (Home)</label>
                                <input 
                                    type="text" 
                                    value={localSettings.meta_pixel_id || ''} 
                                    onChange={(e) => setLocalSettings({...localSettings, meta_pixel_id: e.target.value})} 
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"
                                    placeholder="Inserisci ID Pixel"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Pixel principale per la Home Page. <span className="font-mono text-brand-600">(/)</span>
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Meta Pixel ID (Add to Cart)</label>
                                <input 
                                    type="text" 
                                    value={localSettings.add_to_cart_pixel_id || ''} 
                                    onChange={(e) => setLocalSettings({...localSettings, add_to_cart_pixel_id: e.target.value})} 
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"
                                    placeholder="Inserisci ID Pixel"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Pixel specifico per l'evento "Add to Cart".
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Meta Pixel ID (Thank You PDF)</label>
                                <input 
                                    type="text" 
                                    value={localSettings.pdf_thank_you_pixel_id || ''} 
                                    onChange={(e) => setLocalSettings({...localSettings, pdf_thank_you_pixel_id: e.target.value})} 
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"
                                    placeholder="Inserisci ID Pixel"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Pixel per la pagina di ringraziamento della guida PDF. <span className="font-mono text-brand-600">(/thank-you-pdf-gratuita)</span>
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Meta Pixel ID (Acquisto - Nuovo Utente)</label>
                                <input 
                                    type="text" 
                                    value={localSettings.purchase_new_user_pixel_id || ''} 
                                    onChange={(e) => setLocalSettings({...localSettings, purchase_new_user_pixel_id: e.target.value})} 
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"
                                    placeholder="Inserisci ID Pixel"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Pixel per nuovi utenti (prima volta). Mostra messaggio credenziali email. <span className="font-mono text-brand-600">(/payment-success?new_user=1)</span>
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Meta Pixel ID (Acquisto - Utente Esistente)</label>
                                <input 
                                    type="text" 
                                    value={localSettings.purchase_returning_user_pixel_id || ''} 
                                    onChange={(e) => setLocalSettings({...localSettings, purchase_returning_user_pixel_id: e.target.value})} 
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"
                                    placeholder="Inserisci ID Pixel"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Pixel per utenti già registrati. Mostra messaggio "I miei corsi". <span className="font-mono text-brand-600">(/payment-success?new_user=0)</span>
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">URL Favicon</label>
                                <input 
                                    type="text" 
                                    value={localSettings.favicon_url || ''} 
                                    onChange={(e) => setLocalSettings({...localSettings, favicon_url: e.target.value})} 
                                    className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"
                                    placeholder="Es: https://.../favicon.ico"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    L'icona che appare nella scheda del browser (formato .ico, .png o .svg).
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-bold mb-2 text-gray-700">URL Logo</label>
                                <input type="text" value={localSettings.logo_url || ''} onChange={(e) => setLocalSettings({...localSettings, logo_url: e.target.value})} className="w-full border-gray-300 rounded-xl py-3 px-4 focus:ring-brand-500 shadow-sm font-mono text-sm"/>
                                <div className="mt-4"><label className="block text-sm font-bold mb-2">Altezza: {localSettings.logo_height}px</label><input type="range" min="20" max="150" value={localSettings.logo_height || 20} onChange={(e) => setLocalSettings({...localSettings, logo_height: parseInt(e.target.value, 10) || 20})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"/></div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === 'support' && (
              <AdminSupportManager />
            )}

            {activeTab === 'landing_manual' && (
                <div className="space-y-8 pb-20">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center"><Palette className="mr-2 text-brand-600"/> Stile & Colori</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-bold mb-2">Colore Brand (Principale)</label>
                                <div className="flex gap-3 items-center">
                                    <input type="color" value={landingConfig.brand_color || '#2563eb'} onChange={(e) => setLandingConfig({...landingConfig, brand_color: e.target.value})} className="h-10 w-20 rounded cursor-pointer" />
                                    <input type="text" value={landingConfig.brand_color || '#2563eb'} onChange={(e) => setLandingConfig({...landingConfig, brand_color: e.target.value})} className="flex-1 border p-2 rounded text-sm font-mono" />
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-bold mb-2">Sfondo Pagina</label>
                                <div className="flex gap-3 items-center">
                                    <input type="color" value={landingConfig.bg_color || '#020617'} onChange={(e) => setLandingConfig({...landingConfig, bg_color: e.target.value})} className="h-10 w-20 rounded cursor-pointer" />
                                    <input type="text" value={landingConfig.bg_color || '#020617'} onChange={(e) => setLandingConfig({...landingConfig, bg_color: e.target.value})} className="flex-1 border p-2 rounded text-sm font-mono" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Nota: Il colore brand influenzerà bottoni, icone e accenti in tutta la home page.</p>
                    </div>

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

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center"><Video className="mr-2 text-brand-600"/> Gestione Video Home Page</h3>
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-bold mb-2">Video Hero (ID Cloudinary o URL)</label>
                                <input 
                                    type="text" 
                                    value={landingConfig.videos?.hero_video_id || ''} 
                                    onChange={(e) => setLandingConfig({...landingConfig, videos: {...(landingConfig.videos || {}), hero_video_id: e.target.value}})} 
                                    className="w-full border p-3 rounded-xl font-mono text-sm" 
                                    placeholder="Esempio: v1765326450/home_2_bbhedx" 
                                />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-bold mb-2">Video Era AI (ID Cloudinary o URL)</label>
                                <input 
                                    type="text" 
                                    value={landingConfig.videos?.ai_era_video_id || ''} 
                                    onChange={(e) => setLandingConfig({...landingConfig, videos: {...(landingConfig.videos || {}), ai_era_video_id: e.target.value}})} 
                                    className="w-full border p-3 rounded-xl font-mono text-sm" 
                                    placeholder="Esempio: v1765328025/home_page_3_tnvnqm" 
                                />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-bold mb-2">Video Come Funziona (ID Cloudinary o URL)</label>
                                <input 
                                    type="text" 
                                    value={landingConfig.videos?.how_it_works_video_id || ''} 
                                    onChange={(e) => setLandingConfig({...landingConfig, videos: {...(landingConfig.videos || {}), how_it_works_video_id: e.target.value}})} 
                                    className="w-full border p-3 rounded-xl font-mono text-sm" 
                                    placeholder="Esempio: v1765456382/come-funziona-MWA_mpdave" 
                                />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-bold mb-2">Video Target Section (ID Cloudinary o URL)</label>
                                <input 
                                    type="text" 
                                    value={landingConfig.videos?.target_section_video_id || ''} 
                                    onChange={(e) => setLandingConfig({...landingConfig, videos: {...(landingConfig.videos || {}), target_section_video_id: e.target.value}})} 
                                    className="w-full border p-3 rounded-xl font-mono text-sm" 
                                    placeholder="Esempio: v1765392297/uomo-affari-consegna-carta_f3tj6t" 
                                />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="block text-sm font-bold mb-2">Video Chi Siamo (URL Completo)</label>
                                <input 
                                    type="text" 
                                    value={landingConfig.videos?.about_video_url || landingConfig.about_section.image_url || ''} 
                                    onChange={(e) => setLandingConfig({...landingConfig, videos: {...(landingConfig.videos || {}), about_video_url: e.target.value}})} 
                                    className="w-full border p-3 rounded-xl font-mono text-sm" 
                                    placeholder="URL completo del video..." 
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 italic">Inserisci l'ID del video caricato su Cloudinary o l'URL completo (es. Supabase, Dropbox, etc.).</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                                    <Monitor className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Sezione Showcase AI</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Visibile</span>
                                <input type="checkbox" checked={landingConfig.ai_showcase_section?.is_visible !== false} onChange={(e) => setLandingConfig({...landingConfig, ai_showcase_section: {...(landingConfig.ai_showcase_section || DEFAULT_LANDING_CONFIG.ai_showcase_section), is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Titolo Sezione</label>
                                <input type="text" value={landingConfig.ai_showcase_section?.title || ''} onChange={(e) => setLandingConfig({...landingConfig, ai_showcase_section: {...(landingConfig.ai_showcase_section || DEFAULT_LANDING_CONFIG.ai_showcase_section), title: e.target.value}})} className="w-full border p-3 rounded-xl font-bold" placeholder="Titolo Sezione" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Sottotitolo</label>
                                <input type="text" value={landingConfig.ai_showcase_section?.subtitle || ''} onChange={(e) => setLandingConfig({...landingConfig, ai_showcase_section: {...(landingConfig.ai_showcase_section || DEFAULT_LANDING_CONFIG.ai_showcase_section), subtitle: e.target.value}})} className="w-full border p-3 rounded-xl" placeholder="Sottotitolo" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Testo Descrittivo</label>
                            <textarea rows={3} value={landingConfig.ai_showcase_section?.text || ''} onChange={(e) => setLandingConfig({...landingConfig, ai_showcase_section: {...(landingConfig.ai_showcase_section || DEFAULT_LANDING_CONFIG.ai_showcase_section), text: e.target.value}})} className="w-full border p-3 rounded-xl" placeholder="Testo descrittivo..."></textarea>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Siti in Vetrina (Showcase)</h4>
                                <button 
                                    onClick={() => {
                                        const currentUrls = landingConfig.ai_showcase_section?.urls || [];
                                        setLandingConfig({...landingConfig, ai_showcase_section: {...(landingConfig.ai_showcase_section || DEFAULT_LANDING_CONFIG.ai_showcase_section), urls: [...currentUrls, '']}});
                                    }}
                                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm"
                                >
                                    <Plus className="h-4 w-4" /> Aggiungi Sito
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {(landingConfig.ai_showcase_section?.urls || []).map((url, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <div className="flex-1 relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <ExternalLink className="h-4 w-4" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={url} 
                                                onChange={(e) => {
                                                    const newUrls = [...(landingConfig.ai_showcase_section?.urls || [])];
                                                    newUrls[idx] = e.target.value;
                                                    setLandingConfig({...landingConfig, ai_showcase_section: {...(landingConfig.ai_showcase_section || DEFAULT_LANDING_CONFIG.ai_showcase_section), urls: newUrls}});
                                                }} 
                                                className="w-full border pl-10 pr-3 py-2 rounded-xl text-sm" 
                                                placeholder="https://esempio.aura.build/" 
                                            />
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newUrls = (landingConfig.ai_showcase_section?.urls || []).filter((_, i) => i !== idx);
                                                setLandingConfig({...landingConfig, ai_showcase_section: {...(landingConfig.ai_showcase_section || DEFAULT_LANDING_CONFIG.ai_showcase_section), urls: newUrls}});
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center"><MessageCircle className="mr-2 text-brand-600"/> Recensioni</h3>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={landingConfig.testimonials_section.is_visible} onChange={(e) => setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                                <label className="text-sm font-bold">Visibile</label>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input type="text" value={landingConfig.testimonials_section.title} onChange={(e) => setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, title: e.target.value}})} className="w-full border p-3 rounded-xl font-bold" placeholder="Titolo Sezione" />
                                <input type="text" value={landingConfig.testimonials_section.subtitle} onChange={(e) => setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, subtitle: e.target.value}})} className="w-full border p-3 rounded-xl" placeholder="Sottotitolo" />
                            </div>
                            
                            <div className="space-y-4 pt-4">
                                <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Elenco Recensioni ({landingConfig.testimonials_section.reviews.length})</h4>
                                {landingConfig.testimonials_section.reviews.map((review, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative space-y-3">
                                        <button onClick={() => {
                                            const newReviews = [...landingConfig.testimonials_section.reviews];
                                            newReviews.splice(idx, 1);
                                            setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, reviews: newReviews}});
                                        }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></button>
                                        
                                        <div className="grid md:grid-cols-3 gap-3">
                                            <input type="text" value={review.name} onChange={(e) => handleReviewUpdate(idx, 'name', e.target.value)} className="border p-2 rounded text-sm font-bold" placeholder="Nome Cognome" />
                                            <input type="text" value={review.role} onChange={(e) => handleReviewUpdate(idx, 'role', e.target.value)} className="border p-2 rounded text-sm" placeholder="Ruolo/Professione" />
                                            <div className="flex items-center gap-2 bg-white border p-2 rounded">
                                                <input type="checkbox" checked={review.verified} onChange={(e) => {
                                                    const newReviews = [...landingConfig.testimonials_section.reviews];
                                                    newReviews[idx] = { ...newReviews[idx], verified: e.target.checked };
                                                    setLandingConfig({ ...landingConfig, testimonials_section: { ...landingConfig.testimonials_section, reviews: newReviews } });
                                                }} className="h-4 w-4 accent-green-600" />
                                                <label className="text-xs font-bold text-green-700">Verificata</label>
                                            </div>
                                        </div>
                                        <textarea rows={2} value={review.text} onChange={(e) => handleReviewUpdate(idx, 'text', e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Testo della recensione"></textarea>
                                        <input type="text" value={review.avatar || ''} onChange={(e) => handleReviewUpdate(idx, 'avatar', e.target.value)} className="w-full border p-2 rounded text-xs font-mono" placeholder="URL Avatar (opzionale)" />
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const newReviews = [...landingConfig.testimonials_section.reviews, { name: '', role: '', text: '', verified: true }];
                                    setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, reviews: newReviews}});
                                }} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <Plus className="h-4 w-4"/> Aggiungi Recensione
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {['launch', 'pdf_guide', 'landing_manual', 'general'].includes(activeTab) && (
            <div className="fixed bottom-6 right-6 z-50 flex gap-4">
                 <button onClick={handleSaveSettings} disabled={isSavingSettings} className="px-10 py-5 bg-brand-600 text-white rounded-full font-black hover:bg-brand-700 shadow-2xl shadow-brand-500/50 flex items-center text-xl transform hover:scale-110 transition-all disabled:opacity-70">
                    {isSavingSettings ? <Loader className="h-6 w-6 animate-spin mr-3"/> : <Settings className="mr-3 h-6 w-6" />} Salva Tutto
                </button>
            </div>
        )}

        </div>
      </main>
    </div>
  );
};