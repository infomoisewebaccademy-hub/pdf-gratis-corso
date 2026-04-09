import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Course, UserProfile, LandingPageConfig } from '../types';
import { CheckCircle, ArrowRight, ShieldCheck, Zap, Database, Layout, Target, Cpu, Layers, Users, Lock, Quote, Star, Award, Smartphone, MessageCircle, CheckCircle2, X, PlayCircle, BookOpen, MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, CreditCard, Check, XCircle, Banknote, Rocket, TrendingUp, UserCheck, AlertTriangle, ChevronDown, ChevronUp, HelpCircle, Clock, Video, Image, Upload, Sparkles, Monitor, Loader2, ExternalLink, MoveHorizontal, Laptop, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';

interface HomeProps {
  courses: Course[];
  onCourseSelect: (courseId: string) => void;
  user?: UserProfile | null;
  // Riceviamo l'intera configurazione
  landingConfig?: LandingPageConfig;
}

// ... (DEFAULT_CONFIG, IconMap, FAQ_ITEMS restano invariati) ...
const DEFAULT_CONFIG: LandingPageConfig = {
  announcement_bar: {
    text: '🎉 Offerta lancio: Tutti i percorsi al 50% di sconto per i primi 100 iscritti!',
    is_visible: false,
    is_sticky: false,
    type: 'static',
    bg_color: '#fbbf24', // Amber 400
    text_color: '#1e3a8a' // Blue 900
  },
  brand_color: '#2563eb',
  bg_color: '#020617',
  hero: {
    title: "Crea Siti Web Professionali o Piattaforme con l'AI in Poche Ore",
    subtitle: 'Senza Scrivere Una Riga di Codice.',
    cta_primary: 'Scopri i percorsi disponibili',
    cta_secondary: '', // Rimosso default
    image_url: '', 
    benefits: [
        "Accesso a vita ai contenuti",
        "Assistenza dedicata",
        "Nessuna esperienza richiesta",
        "Accesso alla community",
        "Supporto PERSONALE diretto su whatsapp",
        "Soddisfatto o rimborsato in 30 giorni"
    ],
    show_badges: true
  },
  ai_era_section: {
      title: 'La Nuova Era del Web',
      subtitle: "Benvenuto Nell'Era dell'Intelligenza Artificiale",
      text: "Fino a ieri, creare un sito web significava: imparare a programmare per anni, spendere migliaia di euro per agenzie, o accontentarsi di template limitati.\nOggi tutto è cambiato.\nL'intelligenza artificiale ha reso la creazione web accessibile a chiunque. In poche ore puoi ottenere risultati che prima richiedevano settimane di lavoro e competenze avanzate.\nIl risultato?\nImprenditori che diventano autonomi e risparmiano migliaia di euro\nPersone comuni che si creano un'entrata extra da €1.000-5.000 al mese\nIdee che diventano realtà senza barriere tecniche\nE tu? Sei pronto a far parte di questa rivoluzione?",
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
      { 
          icon: 'Cpu', 
          title: 'AI & Sviluppo Low-Code', 
          desc: 'Google AI Studio (Zero Costi)\nDatabase Supabase\nDeploy su Vercel\nGestione Domini & DNS' 
      },
      { 
          icon: 'Layout', 
          title: 'Landing Page & Siti Web', 
          desc: 'Elementor (versione base)\nStruttura & Copy\nTemplate pronti all\'uso\nOttimizzazione Mobile' 
      },
      { 
          icon: 'Zap', 
          title: 'Automazioni a Costo Zero', 
          desc: 'Notifiche intelligenti\nEmail automatiche\nWebhook Make/N8N\nAPI Integration' 
      },
      { 
          icon: 'Target', 
          title: 'Pubblicità & Ads', 
          desc: 'Meta Ads (FB/IG)\nTikTok Ads\nStrategie E-commerce\nLead Generation' 
      }
    ]
  },
  how_it_works_section: {
      title: 'Come Funziona Moise Web Academy',
      subtitle: 'Tre semplici passi per diventare un Web Creator professionista',
      is_visible: true,
      steps: [
          {
              title: 'Impara',
              desc: "Segui i video passo-passo. Daniel ti guida dalla A alla Z, senza dare nulla per scontato. Ogni concetto è spiegato in modo semplice, chiaro e pratico. Anche se oggi non sai cosa sia l'HTML.",
              icon: 'BookOpen'
          },
          {
              title: 'Crea',
              desc: "Applichi subito quello che impari. In poche ore avrai il tuo primo sito web professionale online, con dominio personalizzato e hosting gratuito. Zero costi nascosti, zero sorprese.",
              icon: 'Rocket'
          },
          {
              title: 'Monetizza (Scelta Tua)',
              desc: "Offri i tuoi servizi ad aziende locali (1 sito = €1.000-5.000) oppure lancia i tuoi progetti digitali. Nel 2025 ogni business ha bisogno di presenza online, e tu sai esattamente come dargliela.",
              icon: 'Banknote'
          }
      ]
  },
  ai_showcase_section: {
      title: 'Cosa Può Creare l’Intelligenza Artificiale per Te',
      subtitle: 'Potenza Creativa Senza Limiti',
      text: "L'AI non è solo uno strumento di scrittura. Oggi, con le competenze che ti insegniamo, puoi generare interfacce complete, backend scalabili e design mozzafiato in tempo reale.\n\nDal semplice sito vetrina a piattaforme complesse con login e database, passando per e-commerce e landing page ad alta conversione. Tutto questo ottimizzato tecnicamente e pronto per il mercato, senza scrivere codice manualmente e senza spendere mesi di sviluppo.",
      is_visible: true,
      urls: []
  },
  comparison_section: {
    title: 'La Tua Vita Prima e Dopo Moise Web Academy',
    subtitle: 'Non è solo un percorso. È un cambio di prospettiva sulla tua autonomia e sulle tue possibilità.',
    is_visible: true,
    before_title: 'PRIMA (Senza il percorso)',
    after_title: 'DOPO (Con il percorso)',
    before_items: [
        'Dipendi da sviluppatori costosi per ogni singola modifica',
        'Spendi 2.000-10.000€ per un sito base (e altre centinaia per ogni aggiornamento)',
        'Aspetti settimane o mesi per vedere il tuo progetto online',
        'Le tue idee restano solo idee perché "costa troppo realizzarle"',
        'Perdi opportunità di business e clienti per mancanza di presenza online',
        'Lavori con orari fissi, stipendio fisso, dipendenza da un datore di lavoro',
        'Guardi altri che guadagnano online e pensi "vorrei saperlo fare anch\'io"'
    ],
    after_items: [
        'Sei completamente autonomo, modifichi e crei quando e come vuoi',
        'Crei siti professionali in poche ore con costi quasi zero',
        'Pubblichi online in giornata, senza aspettare nessuno',
        'Trasformi ogni idea in un progetto reale: siti, e-commerce, piattaforme',
        'Offri servizi da €1.000-5.000 per progetto e ti crei un\'entrata extra (o principale)',
        'Lavori da dove vuoi, quando vuoi, con orari flessibili',
        'Hai una competenza ad alto valore che ti rende indipendente e ricercato'
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
      logo_margin_top: 0,
      logo_margin_bottom: 0,
      logo_margin_left: 0,
      logo_margin_right: 0
  },
  videos: {
    hero_video_id: 'v1765326450/home_2_bbhedx',
    ai_era_video_id: 'v1765328025/home_page_3_tnvnqm',
    how_it_works_video_id: 'v1765456382/come-funziona-MWA_mpdave',
    target_section_video_id: 'v1765392297/uomo-affari-consegna-carta_f3tj6t',
    about_video_url: 'https://res.cloudinary.com/dhj0ztos6/video/upload/v1765452611/Home_page_rnk0zw.webm'
  }
};

const IconMap: Record<string, React.ElementType> = {
  Cpu, Layout, Zap, Target, ShieldCheck, Database, Layers, Users, Lock, Star, Award, Smartphone, 
  BookOpen, Rocket, Banknote, TrendingUp
};

const FAQ_ITEMS = [
    {
        q: "Devo avere competenze tecniche o di programmazione?",
        a: "Assolutamente NO. Il percorso è pensato per chi parte da zero assoluto. Se sai usare WhatsApp, Google e guardare un video su YouTube, sei già pronto. Non serve sapere nulla di codice, HTML, CSS o programmazione."
    },
    {
        q: "Quanto tempo serve per completare il percorso?",
        a: "Il percorso base si completa in 3-5 ore. Il premium in 8-10 ore totali. Ma puoi andare completamente al tuo ritmo: hai accesso illimitato a vita, quindi puoi seguirlo in una settimana o in due mesi. Tu decidi."
    },
    {
        q: "Quanto tempo ci vuole per creare un sito dopo il percorso?",
        a: "Dopo aver seguito il percorso base, puoi creare un sito professionale in 3-5 ore. Con la pratica e l'esperienza, scendi a 1-2 ore per sito. I nostri studenti più veloci creano landing page in 30-45 minuti."
    },
    {
        q: "Quali strumenti servono? Ci sono costi aggiuntivi?",
        a: "Ti serve solo un computer (Windows, Mac o Linux) e una connessione internet. Gli strumenti AI che usiamo (AI Studio Gemini) sono gratuiti o hanno piani free molto generosi. L'unico costo ricorrente è il dominio personalizzato (circa €10-15 all'anno), che è completamente opzionale."
    },
    {
        q: "L'hosting è davvero gratuito?",
        a: "Sì! Ti insegniamo a usare soluzioni di hosting gratuite professionali con performance eccellenti. Zero costi mensili, zero sorprese. Ovviamente se in futuro vorrai passare a hosting premium potrai farlo, ma non è necessario per iniziare."
    },
    {
        q: "Posso davvero guadagnare creando siti per clienti?",
        a: "Assolutamente sì. Un sito vetrina base si vende da €800 a €3.000. Un e-commerce completo da €2.000 a €10.000. Un gestionale personalizzato anche oltre. La domanda è altissima (ogni attività ha bisogno di presenza online) e chi sa creare siti professionali velocemente è molto ricercato."
    },
    {
        q: "Come trovo i clienti?",
        a: "Nel percorso Premium ti diamo script pronti per contattare attività locali (ristoranti, hotel, professionisti, negozi, palestre). Puoi iniziare anche da conoscenti e passaparola. Molti nostri studenti trovano i primi clienti semplicemente guardandosi intorno nella propria città: quante attività hanno siti vecchi o inesistenti?"
    },
    {
        q: "Per quanto tempo ho accesso al percorso?",
        a: "Per sempre. Accesso illimitato a vita. Anche se tra 5 anni vuoi rivedere una lezione, sarà ancora lì. E riceverai GRATIS tutti gli aggiornamenti futuri quando aggiungiamo nuovi contenuti o funzionalità."
    },
    {
        q: "C'è supporto se ho problemi o domande?",
        a: "Sì! Offriamo assistenza dedicata via chat con risposta garantita entro 8 ore lavorative. Nel percorso Premium hai anche assistenza PRIORITARIA (rispondiamo entro 2 ore) e sessioni 1-a-1 con Daniel per analizzare i tuoi progetti."
    },
    {
        q: "Cosa succede se l'AI cambia o viene aggiornata?",
        a: "Aggiorniamo costantemente il percorso con le ultime novità e strumenti AI. Quando escono nuove funzionalità o miglioramenti, aggiungiamo lezioni gratuite. Il tuo accesso include TUTTI gli aggiornamenti futuri senza costi extra."
    },
    {
        q: "Il percorso va bene anche per creare il sito della MIA attività?",
        a: "Assolutamente sì! Anzi, è uno dei casi d'uso principali. Risparmi migliaia di euro (che avresti dato a un'agenzia) e resti autonomo per sempre. Ogni volta che vuoi modificare qualcosa, lo fai tu in pochi minuti. Zero dipendenze."
    },
    {
        q: "E se non ho tempo ora? Posso iniziare dopo?",
        a: "Certamente! Una volta iscritto hai accesso a vita. Puoi iniziare domani, tra una settimana o tra un mese. Il percorso sarà sempre lì ad aspettarti. Ma ricorda: i bonus per i primi 50 iscritti scadono, quindi iscriviti ora per non perderli."
    },
    {
        q: "Il percorso è registrato o sono lezioni live?",
        a: "Tutto registrato e sempre disponibile. Massima flessibilità: segui quando vuoi, metti in pausa, rivedi le parti che ti servono 10 volte se necessario. Nessun vincolo di orario o giorno."
    },
    {
        q: "Funziona anche per creare app mobile?",
        a: "Il percorso si concentra su siti web professionali (che comunque sono responsive e funzionano perfettamente su mobile). Per app native iOS/Android servirebbero competenze diverse. Ma i siti web moderni sono così potenti che spesso sostituiscono benissimo le app."
    },
    {
        q: "Che differenza c'è tra Base e Premium?",
        a: "Base (€50): Perfetto per siti vetrina, landing page, siti aziendali. Ideale se vuoi iniziare o creare il tuo sito personale/aziendale. Premium (€100): Include TUTTO del Base + e-commerce, CRM, gestionali, area membri, automazioni avanzate. Per chi vuole offrire servizi premium e guadagnare di più."
    },
    {
        q: "Posso passare da Base a Premium dopo?",
        a: "Sì, puoi fare upgrade in qualsiasi momento pagando la differenza. Ma i bonus esclusivi (sessioni 1-a-1, template, script) sono solo per chi si iscrive ora nei primi 50 posti."
    },
    {
        q: "Il percorso è adatto anche a persone over 50?",
        a: "Assolutamente sì! Abbiamo studenti di tutte le età. L'unico requisito è saper usare un computer base. Se riesci a guardare video su YouTube e scrivere su WhatsApp, sei già pronto. Daniel spiega tutto passo-passo, senza dare nulla per scontato."
    }
];

// --- OTTIMIZZAZIONE VIDEO GLOBALE ---
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dhj0ztos6/video/upload";

interface VideoSource {
    src: string;
    type: string;
}

interface VideoData {
    sources: VideoSource[];
    poster: string;
}

const VideoPlayer = ({ 
    sources, 
    poster, 
    className, 
    autoPlay = true, 
    loop = true, 
    muted = true, 
    playsInline = true,
    preload = "metadata" as const
}: { 
    sources: VideoSource[], 
    poster?: string, 
    className?: string,
    autoPlay?: boolean,
    loop?: boolean,
    muted?: boolean,
    playsInline?: boolean,
    preload?: "auto" | "metadata" | "none"
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || hasError) return;

        if (isInView) {
            if (autoPlay) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.warn("Autoplay failed:", error);
                    });
                }
            }
        } else {
            if (!video.paused) {
                video.pause();
            }
        }
    }, [isInView, autoPlay, hasError]);

    const handleVideoError = () => {
        setHasError(true);
        console.error("Video error:", sources);
    };

    if (hasError && poster) {
        return <img src={poster} className={className} alt="Video fallback" />;
    }

    return (
        <video
            ref={videoRef}
            poster={poster}
            loop={loop}
            muted={muted}
            playsInline={playsInline}
            // @ts-ignore
            webkit-playsinline={playsInline ? "true" : "false"}
            preload={preload}
            className={className}
            onError={handleVideoError}
            crossOrigin="anonymous"
        >
            {sources.map((source, idx) => (
                <source key={idx} src={source.src} type={source.type} />
            ))}
            Il tuo browser non supporta il tag video.
        </video>
    );
};

const createOptimizedVideo = (videoId: string): VideoData => {
    if (!videoId) return { sources: [], poster: '' };
    
    // Se è già un URL completo, lo restituiamo così com'è
    if (videoId.startsWith('http')) {
        // Rilevamento tipo più robusto per URL con parametri
        const urlWithoutParams = videoId.split('?')[0];
        const type = urlWithoutParams.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
        return {
            sources: [{ src: videoId, type }],
            // Usiamo un'immagine di placeholder neutra se non abbiamo un poster
            poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop'
        };
    }

    // Ottimizzazione aggressiva e responsiva per TUTTI i video Cloudinary.
    const optimizationParams = 'w_auto,dpr_auto,c_limit,q_auto:good';
    const baseUrl = `${CLOUDINARY_BASE_URL}/${optimizationParams}/${videoId}`;
    
    return {
        sources: [
            { src: `${baseUrl}.webm`, type: 'video/webm' },
            { src: `${baseUrl}.mp4`, type: 'video/mp4' }
        ],
        poster: `${CLOUDINARY_BASE_URL}/w_auto,dpr_auto,c_limit,f_jpg,q_auto:low/${videoId}.jpg`
    };
};

// ------------------------------------

export const Home: React.FC<HomeProps> = ({ courses, onCourseSelect, user, landingConfig }) => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showFounderStory, setShowFounderStory] = useState(false);
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Helper per rilevare se l'allegato è un video (più robusto)
  const isVideo = (url?: string) => {
      if (!url) return false;
      const lowerUrl = url.toLowerCase();
      return lowerUrl.includes('youtube') || 
             lowerUrl.includes('youtu.be') || 
             lowerUrl.includes('vimeo') || 
             lowerUrl.includes('.mp4') || 
             lowerUrl.includes('.webm') || 
             lowerUrl.includes('.mov');
  };

  // Merge config with defaults
  const config = useMemo(() => {
    // Funzione helper per sostituire corso con percorso ricorsivamente
    const replaceCorso = (obj: any): any => {
        if (typeof obj === 'string') {
            // Sostituzione case-insensitive ma preservando il caso se possibile (semplice)
            return obj
                .replace(/corso/g, 'percorso')
                .replace(/Corso/g, 'Percorso')
                .replace(/corsi/g, 'percorsi')
                .replace(/Corsi/g, 'Percorsi');
        }
        if (Array.isArray(obj)) {
            return obj.map(replaceCorso);
        }
        if (obj !== null && typeof obj === 'object') {
            const newObj: any = {};
            for (const key in obj) {
                newObj[key] = replaceCorso(obj[key]);
            }
            return newObj;
        }
        return obj;
    };

    if (!landingConfig) return replaceCorso(DEFAULT_CONFIG);
    
    let featuresToUse = landingConfig.features_section;
    if (!featuresToUse || !featuresToUse.cards || featuresToUse.cards.length < 4) {
        featuresToUse = DEFAULT_CONFIG.features_section;
    }

    let aboutToUse = landingConfig.about_section;
    if (!aboutToUse || !aboutToUse.mission_points || aboutToUse.mission_points.length === 0) {
        aboutToUse = { ...aboutToUse, mission_points: DEFAULT_CONFIG.about_section.mission_points };
    }

    if (aboutToUse && aboutToUse.image_url && !isVideo(aboutToUse.image_url) && isVideo(DEFAULT_CONFIG.about_section.image_url)) {
         aboutToUse = { ...aboutToUse, image_url: DEFAULT_CONFIG.about_section.image_url };
    }

    if (aboutToUse && !aboutToUse.quote_author_image_size) {
        aboutToUse.quote_author_image_size = 48; 
    }

    const merged = {
        ...DEFAULT_CONFIG,
        ...landingConfig,
        announcement_bar: { ...DEFAULT_CONFIG.announcement_bar, ...(landingConfig.announcement_bar || {}) },
        hero: { 
            ...DEFAULT_CONFIG.hero, 
            ...(landingConfig.hero || {}),
            benefits: landingConfig.hero?.benefits || DEFAULT_CONFIG.hero.benefits 
        },
        ai_era_section: {
            ...DEFAULT_CONFIG.ai_era_section,
            ...(landingConfig.ai_era_section || {})
        },
        about_section: { ...DEFAULT_CONFIG.about_section, ...aboutToUse },
        features_section: { ...DEFAULT_CONFIG.features_section, ...featuresToUse },
        how_it_works_section: {
            ...DEFAULT_CONFIG.how_it_works_section,
            ...(landingConfig.how_it_works_section || {})
        },
        ai_showcase_section: {
            ...DEFAULT_CONFIG.ai_showcase_section,
            ...(landingConfig.ai_showcase_section || {})
        },
        comparison_section: {
            ...DEFAULT_CONFIG.comparison_section,
            ...(landingConfig.comparison_section || {}),
            before_items: landingConfig.comparison_section?.before_items || DEFAULT_CONFIG.comparison_section?.before_items,
            after_items: landingConfig.comparison_section?.after_items || DEFAULT_CONFIG.comparison_section?.after_items,
        },
        testimonials_section: { 
            ...DEFAULT_CONFIG.testimonials_section, 
            ...(landingConfig.testimonials_section || {}),
            is_visible: landingConfig.testimonials_section?.is_visible ?? DEFAULT_CONFIG.testimonials_section.is_visible,
            reviews: (landingConfig.testimonials_section?.reviews && landingConfig.testimonials_section.reviews.length >= 10) 
                ? landingConfig.testimonials_section.reviews 
                : DEFAULT_CONFIG.testimonials_section.reviews
        },
        usp_section: { ...DEFAULT_CONFIG.usp_section, ...(landingConfig.usp_section || {}) },
        cta_section: { ...DEFAULT_CONFIG.cta_section, ...(landingConfig.cta_section || {}) },
        footer: { 
            ...DEFAULT_CONFIG.footer, 
            ...(landingConfig.footer || {}),
            social_links: {
                ...DEFAULT_CONFIG.footer.social_links,
                ...(landingConfig.footer?.social_links || {})
            }
        },
        videos: {
            ...DEFAULT_CONFIG.videos,
            ...(landingConfig.videos || {})
        }
    };

    // Forziamo i nuovi punti USP se quelli nel DB sembrano vecchi o non contengono le parole chiave richieste
    const hasNewUSP = merged.usp_section.items && 
                     merged.usp_section.items.some(item => item.title.includes("QUALITÀ") || item.title.includes("ASSISTENZA"));
    
    if (!merged.usp_section.items || merged.usp_section.items.length < 4 || !hasNewUSP) {
        merged.usp_section = DEFAULT_CONFIG.usp_section;
    }

    // Rimuoviamo i 5 lavori di esempio se presenti (basandoci sul pattern aura.build)
    if (merged.ai_showcase_section?.urls && merged.ai_showcase_section.urls.length > 0) {
        const hasExamples = merged.ai_showcase_section.urls.some(url => url.includes('aura.build'));
        if (hasExamples) {
            merged.ai_showcase_section.urls = [];
        }
    }

    if (merged.hero.title && merged.hero.title.includes("Costruiamo piattaforme")) {
        merged.hero.title = "Crea Siti Web Professionali o Piattaforme con l'AI in Poche Ore";
        merged.hero.subtitle = "Senza Scrivere Una Riga di Codice.";
    }

    // Applichiamo la sostituzione globale corso -> percorso su tutto l'oggetto finale
    return replaceCorso(merged);
  }, [landingConfig]);

  // Applichiamo la sostituzione globale anche ai corsi e alle FAQ
  const processedCourses = useMemo(() => {
      // Funzione helper per sostituire corso con percorso ricorsivamente (definita qui per semplicità o riutilizzabile)
      const replaceCorso = (obj: any): any => {
          if (typeof obj === 'string') {
              return obj
                  .replace(/corso/g, 'percorso')
                  .replace(/Corso/g, 'Percorso')
                  .replace(/corsi/g, 'percorsi')
                  .replace(/Corsi/g, 'Percorsi');
          }
          if (Array.isArray(obj)) return obj.map(replaceCorso);
          if (obj !== null && typeof obj === 'object') {
              const newObj: any = {};
              for (const key in obj) newObj[key] = replaceCorso(obj[key]);
              return newObj;
          }
          return obj;
      };
      return replaceCorso(courses.filter(c => !c.is_hidden));
  }, [courses]);

  const processedFaqs = useMemo(() => {
      const replaceCorso = (obj: any): any => {
          if (typeof obj === 'string') {
              return obj
                  .replace(/corso/g, 'percorso')
                  .replace(/Corso/g, 'Percorso')
                  .replace(/corsi/g, 'percorsi')
                  .replace(/Corsi/g, 'Percorsi');
          }
          if (Array.isArray(obj)) return obj.map(replaceCorso);
          if (obj !== null && typeof obj === 'object') {
              const newObj: any = {};
              for (const key in obj) newObj[key] = replaceCorso(obj[key]);
              return newObj;
          }
          return obj;
      };
      return replaceCorso(FAQ_ITEMS);
  }, []);

  const heroVideo = useMemo(() => createOptimizedVideo(config.videos?.hero_video_id || 'v1765326450/home_2_bbhedx'), [config.videos?.hero_video_id]);
  const aiEraVideo = useMemo(() => createOptimizedVideo(config.videos?.ai_era_video_id || 'v1765328025/home_page_3_tnvnqm'), [config.videos?.ai_era_video_id]);
  const howItWorksVideo = useMemo(() => createOptimizedVideo(config.videos?.how_it_works_video_id || 'v1765456382/come-funziona-MWA_mpdave'), [config.videos?.how_it_works_video_id]);
  const targetSectionVideo = useMemo(() => createOptimizedVideo(config.videos?.target_section_video_id || ''), [config.videos?.target_section_video_id]);

  const aboutVideo = useMemo(() => {
    const videoUrl = config.videos?.about_video_url || config.about_section.image_url;
    if(!videoUrl.includes('cloudinary')) {
        const type = videoUrl.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
        return { sources: [{ src: videoUrl, type }], poster: '' };
    }
    const parts = videoUrl.split('/upload/');
    if(parts.length < 2) {
        const type = videoUrl.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
        return { sources: [{ src: videoUrl, type }], poster: '' };
    }
    const videoId = parts[1].replace(/\.\w+$/, '');
    return createOptimizedVideo(videoId);
  }, [config.videos?.about_video_url, config.about_section.image_url]);


  const handleNavigateToCourses = () => {
    navigate('/courses');
  };

  const submitReview = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Grazie! La tua recensione è stata inviata ed è in fase di approvazione.");
      setIsReviewModalOpen(false);
      setReviewForm({ name: '', text: '', rating: 5 });
  };

  const isSticky = config.announcement_bar.is_visible && config.announcement_bar.is_sticky;
  const heroPaddingClass = (config.announcement_bar.is_visible && !isSticky) 
    ? 'pt-32 lg:pt-40' 
    : 'pt-36 lg:pt-48';

  const titleParts = config.about_section.title.split("Moise Web Academy");
  const preTitle = titleParts[0] || "Perché nasce ";
  const brandTitle = "Moise Web Academy";

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased text-slate-100 bg-slate-950 selection:bg-brand-500/30">
      
      {/* Background Glows Globali */}
      <div className="fixed top-0 w-full h-screen -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      {/* ANNOUNCEMENT BAR */}
      {config.announcement_bar.is_visible && (
        <div 
            className={`w-full z-40 overflow-hidden backdrop-blur-md border-b border-white/5 ${isSticky ? 'fixed top-20 shadow-md' : 'relative mt-20'}`}
            style={{ backgroundColor: 'rgba(23, 37, 84, 0.8)', color: config.announcement_bar.text_color }} 
        >
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marquee 20s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className={`py-3 px-4 font-medium text-center text-sm md:text-base text-brand-200 ${config.announcement_bar.type === 'marquee' ? 'whitespace-nowrap overflow-hidden' : ''}`}>
                {config.announcement_bar.type === 'marquee' ? (
                     <div className="animate-marquee w-full">
                         <span className="mx-8">{config.announcement_bar.text}</span>
                         <span className="mx-8">{config.announcement_bar.text}</span>
                         <span className="mx-8">{config.announcement_bar.text}</span>
                     </div>
                ) : (
                    <p>{config.announcement_bar.text}</p>
                )}
            </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden">
          {/* Hero Video Background - OTTIMIZZATO per tutti i dispositivi */}
          <div className="absolute inset-0 z-0">
             <VideoPlayer 
                sources={heroVideo.sources}
                poster={heroVideo.poster}
                className="w-full h-full object-cover opacity-20"
                preload="metadata"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950"></div>
          </div>

          <section className={`relative z-10 pb-12 lg:pb-24 ${heroPaddingClass}`}>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center">
                {config.hero.show_badges && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-brand-400 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="h-3 w-3" />
                        <span className="flex h-1.5 w-1.5 bg-brand-400 rounded-full animate-pulse mx-1"></span>
                        L'Accademia #1 per Creatori No-Code & AI
                    </div>
                )}
                
                <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-8 animate-in fade-in zoom-in-95 duration-700 delay-100">
                  {config.hero.title}
                  <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                    {config.hero.subtitle}
                  </span>
                </h1>

                {config.hero.text && (
                    <p className="mt-8 max-w-2xl mx-auto text-xl md:text-2xl text-slate-400 leading-relaxed mb-12 whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        {config.hero.text}
                    </p>
                )}

                <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                  <button 
                    onClick={handleNavigateToCourses}
                    className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-lg font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-2xl transition-all shadow-[0_0_50px_-10px_rgba(37,99,235,0.6)] group transform hover:-translate-y-1"
                  >
                    {config.hero.cta_primary} <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="mt-10 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <div className="flex -space-x-3 items-center">
                      {[1,2,3,4].map(i => (
                          <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-slate-950 ring-1 ring-white/10" alt="Student" />
                      ))}
                      <div className="pl-6 text-sm text-slate-400 font-medium">
                          <span className="text-white font-bold">+2,400</span> studenti iscritti
                      </div>
                  </div>
                </div>

                {config.hero.show_badges && (
                    <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-slate-400 border-t border-white/5 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-500" /> Zero fuffa</div>
                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-500" /> Acquisto Singolo</div>
                        <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand-500" /> Accesso a Vita</div>
                    </div>
                )}
              </div>
            </div>
          </section>
      </div>

      {/* --- AI ERA SECTION (Video Integration) --- */}
      {config.ai_era_section?.is_visible !== false && (
          <section className="relative z-10 py-16 md:py-24">
             <div className="max-w-7xl mx-auto px-6">
                  {/* Container Glassmorphic */}
                  <div className="bg-white/5 backdrop-blur-xl ring-1 ring-white/10 rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-30 pointer-events-none"></div>
                      
                      <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                          {/* Left Content */}
                          <div className="flex flex-col items-center md:items-start">
                              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-brand-300 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-6">
                                  <Sparkles className="h-3 w-3" />
                                  {config.ai_era_section?.subtitle}
                              </div>
                              <h2 className="text-3xl md:text-5xl font-semibold text-white mb-8 tracking-tight leading-tight text-center md:text-left">
                                  {config.ai_era_section?.title}
                              </h2>
                              <div className="text-lg text-slate-300 leading-relaxed space-y-6">
                                  {config.ai_era_section?.text.split('\n').map((line, i) => {
                                      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                                          return (
                                              <div key={i} className="flex items-start gap-3 ml-2 my-2">
                                                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 shadow-[0_0_10px_#60a5fa]"></div>
                                                  <span className="text-slate-200 font-medium">{line.replace(/^[-•]\s*/, '')}</span>
                                              </div>
                                          );
                                      }
                                      if (line.trim().endsWith('?')) {
                                          return <p key={i} className="text-white font-bold text-xl mt-4 border-l-4 border-brand-500 pl-4">{line}</p>;
                                      }
                                      if (line.trim() === '') return <br key={i} />;
                                      return <p key={i}>{line}</p>;
                                  })}
                              </div>
                          </div>

                          {/* Right Video Visual - OTTIMIZZATO */}
                          <div className="relative rounded-3xl overflow-hidden lg:h-[750px] md:h-[600px] h-[450px] w-full shadow-2xl ring-1 ring-white/10 group">
                               <VideoPlayer 
                                  sources={aiEraVideo.sources}
                                  poster={aiEraVideo.poster}
                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                  preload="metadata"
                               />
                               {/* Gradient Overlay on Video */}
                               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                               <div className="absolute bottom-6 left-6 right-6">
                                   <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                       <div className="flex items-center gap-3 mb-2">
                                           <div className="h-2 w-2 rounded-full bg-brand-400 animate-pulse"></div>
                                           <span className="text-xs text-brand-400 font-mono uppercase">IL TUO SUCCESSO</span>
                                       </div>
                                       <p className="text-sm text-slate-200">
                                           Diventa un professionista ricercato.
                                       </p>
                                   </div>
                               </div>
                          </div>
                      </div>
                  </div>
             </div>
          </section>
      )}

      {/* SECTION 2 - Features Grid MOVED HERE */}
      {config.features_section.is_visible && (
          <section className="py-16 md:py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-brand-300 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-6">
                        <Cpu className="h-3 w-3" />
                        Skills
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-6 tracking-tight text-center">{config.features_section.title}</h2>
                    <p className="text-xl text-slate-400">{config.features_section.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {config.features_section.cards.map((card, idx) => {
                        const IconComponent = IconMap[card.icon] || Star;
                        const featuresList = card.desc.split('\n').filter(s => s.trim() !== '');

                        return (
                            <div key={idx} className="group hover:ring-brand-500/30 transition-all duration-300 bg-white/5 ring-1 ring-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
                                {/* Gradient Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br from-brand-500/20 to-brand-500/5 ring-1 ring-brand-500/20 relative z-10 group-hover:scale-110 transition-transform">
                                    <IconComponent className="h-7 w-7 text-brand-400" />
                                </div>
                                
                                <h3 className="text-xl font-semibold text-white mb-6 relative z-10">{card.title}</h3>
                                
                                <div className="space-y-3 mt-auto relative z-10">
                                    {featuresList.map((item, i) => (
                                        <div key={i} className="flex items-start">
                                            <div className="mt-1.5 mr-3 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                                            <span className="text-slate-400 text-sm leading-relaxed">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Courses Preview Section */}
                <div id="percorsi-preview" className="mt-32 md:mt-48 relative w-full">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-brand-300 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-6">
                            <Book className="h-3 w-3" />
                            Percorsi
                        </div>
                        <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-6 tracking-tight text-center">I Nostri Percorsi</h2>
                        <p className="text-xl text-slate-400">Scegli il percorso che più si adatta alle tue esigenze e inizia a trasformare la tua carriera con l'Intelligenza Artificiale.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {processedCourses.slice(0,3).map(course => {
                             const displayPrice = course.price;
                             const fakeOriginalPrice = Math.round(course.price * 1.4);
                             const discountPercent = Math.round(((fakeOriginalPrice - displayPrice) / fakeOriginalPrice) * 100);
                             
                             return (
                                <div key={course.id} className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col">
                                    {/* Image Section */}
                                    <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => onCourseSelect(course.id)}>
                                        <img 
                                            src={course.image} 
                                            alt={course.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>
                                        
                                        {/* Badges */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                            <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
                                                {course.level}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Content Section */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-bold text-white mb-3 cursor-pointer hover:text-brand-400 transition-colors line-clamp-2" onClick={() => onCourseSelect(course.id)}>
                                            {course.title}
                                        </h3>
                                        
                                        <div className="relative mb-6 flex-grow">
                                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                                                {course.description}
                                            </p>
                                        </div>

                                        {/* Features */}
                                        {course.show_features !== false && (
                                            <div className="space-y-3 mb-8">
                                                {course.features.slice(0, 3).map((feat, idx) => (
                                                    <div key={idx} className="flex items-start gap-3">
                                                        <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-slate-300 line-clamp-2">{feat}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Price & Actions */}
                                        <div className="mt-auto pt-6 border-t border-slate-800">
                                            <div className="flex items-end justify-between mb-6">
                                                <div>
                                                    <span className="text-sm text-slate-500 block mb-1">Prezzo</span>
                                                    <span className="text-4xl font-black text-white tracking-tight">€{course.price}</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => onCourseSelect(course.id)}
                                                className="w-full py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                                            >
                                                Scopri di più <ArrowRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>
            </div>
          </section>
      )}

      {/* SECTION 1 - About / Mission MOVED AFTER */}
      {config.about_section.is_visible && (
        <section className="py-16 md:py-24 bg-slate-900/50 border-t border-white/5 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    
                    {/* LEFT COLUMN: Image & Quote */}
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden h-[500px] w-full shadow-2xl ring-1 ring-white/10 group">
                            {/* VIDEO/IMAGE CHECK & OTTIMIZZAZIONE */}
                            {isVideo(config.about_section.image_url) ? (
                                <VideoPlayer 
                                    sources={aboutVideo.sources}
                                    poster={aboutVideo.poster}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                    preload="metadata"
                                />
                             ) : (
                                <img 
                                    src={config.about_section.image_url} 
                                    alt="About Us" 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                />
                             )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        </div>
                        
                        {/* Floating Quote Card with EXPANDABLE STORY */}
                        <div className={`absolute -bottom-[84px] -right-6 w-[90%] md:w-[400px] bg-slate-900/95 backdrop-blur-xl p-6 md:p-8 rounded-2xl ring-1 ring-white/10 shadow-2xl transition-all duration-500 ease-in-out ${showFounderStory ? 'z-50' : 'z-20'}`}>
                            {/* Quote visible only when collapsed or always? Let's hide it when expanded to save space on small screens */}
                            {!showFounderStory && (
                                <>
                                    <Quote className="h-8 w-8 text-brand-400 mb-4 opacity-50" />
                                    <p className="font-medium text-white text-lg italic mb-6 leading-relaxed">
                                        {config.about_section.quote}
                                    </p>
                                </>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-brand-500/20 flex items-center justify-center ring-1 ring-brand-500/30 overflow-hidden shrink-0">
                                    {config.about_section.quote_author_image ? (
                                        <img src={config.about_section.quote_author_image} alt="Author" className="w-full h-full object-cover"/>
                                    ) : (
                                        <span className="text-brand-400 font-bold text-xs">DM</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-wider">{config.about_section.quote_author}</p>
                                    <p className="text-xs text-slate-400">Founder, MWA</p>
                                    <button 
                                        onClick={() => setShowFounderStory(!showFounderStory)}
                                        className="text-brand-400 text-xs font-bold mt-1 flex items-center hover:text-brand-300 transition-colors"
                                    >
                                        Chi Sono <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showFounderStory ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Story Content */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFounderStory ? 'max-h-[400px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                                <div className="text-slate-300 text-sm leading-relaxed space-y-4 pr-2 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-brand-600 scrollbar-track-slate-800">
                                      <p className="font-bold text-white text-base">
                                          Ciao, sono Daniel Moise.
                                      </p>
                                      <p>
                                          Da diversi anni aiuto persone e aziende a portare i loro progetti online. Ho creato decine di siti web per clienti in tutta Italia, dall'e-commerce per un brand di moda al gestionale personalizzato per un'autofficina.
                                      </p>
                                      <p>
                                          Quando ho scoperto il potenziale dell'intelligenza artificiale per la creazione di siti web, ho capito subito che era una rivoluzione totale.
                                      </p>
                                      <p className="font-medium text-white border-l-2 border-brand-500 pl-3">
                                          Quello che prima mi richiedeva giorni o settimane di lavoro, ora lo faccio in poche ore. E soprattutto: senza scrivere codice.
                                      </p>
                                      <p>
                                          Ma c'era un problema: tutte le risorse erano in inglese, frammentate o troppo tecniche per chi partiva da zero.
                                      </p>
                                      <p>
                                          Così ho deciso di creare <strong className="text-brand-400">Moise Web Academy</strong>: il primo percorso in italiano completo, passo-passo, che insegna a chiunque a creare siti web professionali usando l'intelligenza artificiale.
                                      </p>
                                      <div className="pt-4 border-t border-white/10 mt-2">
                                          <p className="italic text-xs text-slate-500">La mia missione? Renderti autonomo e darti una competenza che vale oro.</p>
                                      </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Text */}
                    <div className="pt-8 flex flex-col items-center md:items-start">
                        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-300 bg-white/5 ring-1 ring-white/10 rounded-full mb-6">
                            <div className="h-1.5 w-1.5 rounded-full bg-brand-500"></div>
                            {config.about_section.subtitle}
                        </div>
                        
                        <h2 className="text-3xl md:text-5xl font-semibold text-white mb-8 tracking-tight leading-tight text-center md:text-left">
                            {config.about_section.title}
                        </h2>
                        
                        <div className="space-y-6 mb-8 text-slate-300 text-lg leading-relaxed">
                           {/* Rendering personalizzato per migliore leggibilità */}
                           {config.about_section.text.split("\n\n").map((paragraph, index) => {
                               if (index === 0) {
                                   return <p key={index} className="text-xl text-brand-100 font-medium leading-relaxed">{paragraph}</p>;
                               }
                               if (paragraph.includes("fastidio")) {
                                   return <p key={index} className="border-l-2 border-slate-700 pl-4 italic text-slate-400 mt-6">{paragraph}</p>;
                               }
                               return <p key={index}>{paragraph}</p>;
                           })}
                        </div>

                        {config.about_section.mission_points && config.about_section.mission_points.length > 0 && (
                            <div className="bg-red-500/5 ring-1 ring-red-500/10 rounded-2xl p-6 mb-8">
                                <ul className="space-y-4">
                                    {config.about_section.mission_points.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                                                <X className="w-3.5 h-3.5 text-red-400" />
                                            </div>
                                            <span className="text-slate-300">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="flex gap-4 items-start pl-4 border-l-2 border-brand-500">
                            <div>
                                <h4 className="text-xl font-semibold text-white mb-2">Noi facciamo l’opposto.</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    Con un metodo pratico e guidato, ti mostriamo come usare <strong className="text-white">Google AppSheet</strong> e gli strumenti migliori per dare vita alle tue idee, anche se parti da zero.
                                    <br/><br/>
                                    <span className="text-brand-300 font-medium">La nostra missione è offrirti competenze concrete, immediate e accessibili a tutti.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      )}

      {/* --- HOW IT WORKS --- */}
      {config.how_it_works_section?.is_visible !== false && (
          <section className="py-16 md:py-24 bg-slate-900/50 border-t border-white/5 relative">
              <div className="max-w-7xl mx-auto px-6">
                  <div className="grid lg:grid-cols-12 gap-16 items-center">
                      <div className="lg:col-span-5 flex flex-col items-center md:items-start">
                          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-brand-300 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-8">
                              <Layout className="h-3 w-3" />
                              Process
                          </div>
                          <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-6 tracking-tight leading-tight text-center md:text-left">
                              {config.how_it_works_section?.title}
                          </h2>
                          <p className="text-xl text-slate-400 leading-relaxed mb-12">
                              {config.how_it_works_section?.subtitle}
                          </p>

                          <div className="space-y-8">
                              {(config.how_it_works_section?.steps || []).map((step, idx) => {
                                  const IconComponent = IconMap[step.icon] || BookOpen;
                                  return (
                                      <div key={idx} className="flex items-start gap-6 group">
                                          <div className="relative flex-shrink-0">
                                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 ring-1 ring-brand-500/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                  <span className="text-brand-400 font-bold text-lg">{idx + 1}</span>
                                              </div>
                                              {idx < 2 && <div className="absolute left-1/2 -translate-x-0.5 top-12 w-px h-16 bg-gradient-to-b from-brand-500/30 to-transparent"></div>}
                                          </div>
                                          <div className="pt-1">
                                              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                                  {step.title}
                                                  <IconComponent className="h-4 w-4 text-slate-500" />
                                              </h3>
                                              <p className="text-slate-400 leading-relaxed text-sm">
                                                  {step.desc}
                                              </p>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Right Video area - OTTIMIZZATO */}
                      <div className="lg:col-span-7">
                          <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                               <VideoPlayer 
                                  sources={howItWorksVideo.sources}
                                  poster={howItWorksVideo.poster}
                                  className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                                  preload="metadata"
                               />
                               {/* Gradient Overlay on Video */}
                               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                               <div className="absolute bottom-2 left-3 right-3">
                                   <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                       <div className="flex items-center gap-3 mb-2">
                                           <div className="h-2 w-2 rounded-full bg-brand-400 animate-pulse"></div>
                                           <span className="text-xs text-brand-400 font-mono uppercase">IL TUO SUCCESSO</span>
                                       </div>
                                       <p className="text-sm text-slate-200">
                                           Diventa un professionista ricercato.
                                       </p>
                                   </div>
                               </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      )}

      {/* --- AI SHOWCASE (Simplified - No Slider) --- */}
      {config.ai_showcase_section?.is_visible !== false && (
          <section className="pt-16 md:pt-24 pb-8 md:pb-12 bg-slate-950 border-t border-white/5 relative overflow-hidden">
              <div className={`max-w-7xl mx-auto px-6 ${config.ai_showcase_section?.urls?.length > 0 ? 'mb-12 md:mb-16' : ''}`}>
                  <div className="grid lg:grid-cols-12 gap-16 items-center">
                      <div className="lg:col-span-5 flex flex-col items-center md:items-start">
                          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-brand-300 bg-brand-500/10 ring-1 ring-brand-500/20 rounded-full mb-8">
                              <Monitor className="h-3 w-3" />
                              Showcase
                          </div>
                          <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-6 tracking-tight leading-tight text-center md:text-left">
                              {config.ai_showcase_section?.title}
                          </h2>
                          <p className="text-xl text-slate-400 leading-relaxed mb-8 whitespace-pre-wrap">
                              {config.ai_showcase_section?.text}
                          </p>
                          <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-6 mb-8">
                              <p className="text-brand-300 font-medium flex items-center gap-2">
                                  <Sparkles className="h-5 w-5" />
                                  Bonus Esclusivo
                              </p>
                              <p className="text-slate-400 text-sm mt-2">
                                  Nella guida PDF questi siti/piattaforme sono già compresi così e si potranno modificare a piacere per poi pubblicarli online.
                              </p>
                          </div>
                      </div>
                      
                      {/* Description Panel */}
                      <div className="lg:col-span-7">
                          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                  <Sparkles className="h-5 w-5 text-brand-400" />
                                  Potenziale Illimitato
                              </h3>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {[
                                      "Creazione siti web professionali", "Landing page personalizzate", 
                                      "Piattaforme complesse & Portali", "E-commerce & Membership",
                                      "Automazioni & Ottimizzazioni", "Design Responsivi Moderni"
                                  ].map((item, idx) => (
                                      <li key={idx} className="flex items-center text-slate-300 text-sm">
                                          <div className="h-1.5 w-1.5 rounded-full bg-brand-500 mr-3 shadow-[0_0_5px_#3b82f6]"></div>
                                          {item}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  </div>

                  {/* Website Showcase Grid */}
                  {config.ai_showcase_section?.urls?.length > 0 && (
                      <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {(config.ai_showcase_section?.urls || []).map((url, idx) => (
                              <div key={idx} className="group relative bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-brand-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/20">
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
                                  <div className="h-[400px] overflow-hidden relative">
                                      <iframe 
                                          src={url} 
                                          className="w-full h-full border-none pointer-events-auto"
                                          title={`Showcase ${idx}`}
                                          loading="lazy"
                                      />
                                      {/* Overlay to hint scrollability if needed, but user wants them to scroll */}
                                  </div>
                                  <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/5 flex justify-between items-center">
                                      <span className="text-xs font-medium text-slate-400">Template AI #{idx + 1}</span>
                                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors">
                                          <ExternalLink className="h-4 w-4" />
                                      </a>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </section>
      )}

      {/* --- TARGET SECTION (Video Integration: Uomo Affari) --- */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
              
              <div className="text-center mb-12 md:mb-16 relative z-10">
                  <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tight text-center">Moise Web Academy È Perfetto Per Te Se...</h2>
              </div>

              <div className="grid lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Grid */}
                  <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                          { title: 'Sei un imprenditore', desc: 'Vuoi il tuo sito professionale senza spendere migliaia di euro.' },
                          { title: 'Cerchi un lavoro extra', desc: 'Offri servizi di creazione siti web e guadagna €1.000-5.000 per progetto.' },
                          { title: 'Sei un freelancer', desc: 'Aggiungi una competenza ad alto valore al tuo portfolio.' },
                          { title: 'Vuoi lanciare un progetto', desc: 'Realizza la tua idea (e-commerce, piattaforma) in autonomia.' },
                          { title: 'Parti da zero', desc: 'Non serve esperienza. Partiamo dalle basi assolute.' },
                          { title: 'Vuoi libertà', desc: 'Lavora da dove vuoi, quando vuoi, senza capi.' }
                      ].map((item, idx) => (
                          <div key={idx} className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-default">
                              <CheckCircle className="h-8 w-8 text-green-400 mb-4" />
                              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                          </div>
                      ))}
                  </div>

                  {/* Right Video Visual - OTTIMIZZATO */}
                  <div className="lg:col-span-5 h-full min-h-[500px] relative rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                        <VideoPlayer 
                            sources={targetSectionVideo.sources}
                            poster={targetSectionVideo.poster}
                            className="absolute inset-0 w-full h-full object-cover"
                            preload="metadata"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                        
                        <div className="absolute bottom-2 left-3 right-3">
                            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-brand-400 animate-pulse"></div>
                                    <span className="text-xs text-brand-400 font-mono uppercase">IL TUO SUCCESSO</span>
                                </div>
                                <p className="text-sm text-slate-200">
                                    Diventa un professionista ricercato.
                                </p>
                            </div>
                        </div>
                  </div>
              </div>

              <div className="mt-16 text-center">
                  <button 
                      onClick={handleNavigateToCourses}
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-900 bg-white hover:bg-slate-200 rounded-xl transition-all shadow-lg hover:shadow-white/10 group"
                  >
                      Questo Sono Io - Voglio Iniziare <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
      </section>

      {/* --- FILTER SECTION (Per chi NON è) --- */}
      <section className="py-16 md:py-24 bg-slate-900 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto px-6 relative z-10">
              <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4 tracking-tight text-center">
                      Questo Percorso NON È Per Te Se...
                  </h2>
                  <div className="w-24 h-1 bg-red-500/50 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-4">
                  {[
                      { title: 'Cerchi la bacchetta magica', desc: 'L\'AI è potentissima, ma devi imparare a usarla. Se cerchi “soldi facili” senza impegno, questo percorso non fa per te.' },
                      { title: 'Vuoi che qualcuno faccia tutto al posto tuo', desc: 'Ti insegniamo a creare, non creiamo noi per te. Ti diamo la canna da pesca, non il pesce.' },
                      { title: 'Pensi che l\'AI faccia tutto da sola', desc: 'L’intelligenza artificiale va guidata con i prompt giusti. È come una Ferrari: se non sai guidare, non serve a nulla.' },
                      { title: 'Vuoi diventare un programmatore "classico"', desc: 'Se il tuo sogno è scrivere migliaia di righe di codice, questo non è il percorso giusto. Noi usiamo il Low-Code/No-Code.' },
                      { title: 'Non sei disposto a investire su te stesso', desc: 'Se non sei pronto a investire per acquisire una competenza che può farti guadagnare migliaia di euro, non sei pronto.' }
                  ].map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                          <div className="shrink-0 pt-1">
                              <XCircle className="h-6 w-6 text-red-400" />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                              <p className="text-slate-400 text-sm leading-relaxed text-sm">
                                  {item.desc}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="mt-12 p-6 bg-brand-500/10 border border-brand-500/20 rounded-xl text-center">
                  <p className="text-lg text-brand-200 font-medium">
                      Se invece ti riconosci nella sezione “Per Chi È”, allora sei nel posto giusto. Benvenuto! 👊
                  </p>
              </div>
          </div>
      </section>

      {/* --- COMPARISON SECTION --- */}
      {config.comparison_section?.is_visible !== false && (
         <section className="py-16 md:py-24 bg-slate-950 border-t border-white/5">
             <div className="max-w-7xl mx-auto px-6">
                 <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
                     <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tight text-center">{config.comparison_section?.title || "La Tua Vita Prima e Dopo"}</h2>
                     <p className="text-xl text-slate-400">{config.comparison_section?.subtitle}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* BEFORE COLUMN */}
                     <div className="bg-red-950/20 rounded-3xl p-8 md:p-10 border border-red-500/10 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
                         <h3 className="text-2xl font-bold text-red-400 mb-8 flex items-center">
                             <XCircle className="h-6 w-6 mr-3" />
                             {config.comparison_section?.before_title}
                         </h3>
                         <ul className="space-y-6">
                             {(config.comparison_section?.before_items || []).map((item, idx) => (
                                 <li key={idx} className="flex items-start gap-4 text-slate-400">
                                     <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                     <span className="leading-snug">{item}</span>
                                 </li>
                             ))}
                         </ul>
                     </div>

                     {/* AFTER COLUMN */}
                     <div className="bg-brand-900/20 rounded-3xl p-8 md:p-10 border border-brand-500/20 relative overflow-hidden transform md:-translate-y-4 shadow-2xl shadow-brand-900/20">
                         <div className="absolute top-0 left-0 w-full h-1 bg-brand-500"></div>
                         <h3 className="text-2xl font-bold text-brand-400 mb-8 flex items-center">
                             <CheckCircle2 className="h-6 w-6 mr-3" />
                             {config.comparison_section?.after_title}
                         </h3>
                         <ul className="space-y-6">
                             {(config.comparison_section?.after_items || []).map((item, idx) => (
                                 <li key={idx} className="flex items-start gap-4 text-white font-medium">
                                     <Check className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                                     <span className="leading-snug">{item}</span>
                                 </li>
                             ))}
                         </ul>
                     </div>
                 </div>
             </div>
         </section>
      )}

      {/* SECTION 3 - Testimonials */}
      {config.testimonials_section.is_visible && (
        <section className="py-24 bg-slate-900/50 border-t border-white/5">
             <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-300 bg-white/5 ring-1 ring-white/10 rounded-full mb-6">
                        <MessageCircle className="h-3 w-3" />
                        {config.testimonials_section.subtitle}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tight text-center">
                        {config.testimonials_section.title}
                    </h2>
                    
                    <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-2.5 rounded-full font-medium text-sm transition-all"
                    >
                        <MessageCircle className="h-4 w-4" /> Lascia la tua recensione
                    </button>
                </div>
                
                <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:gap-8 pb-8 md:pb-0 scrollbar-hide">
                    {config.testimonials_section.reviews.map((review, idx) => (
                         <div key={idx} className="min-w-[85vw] md:min-w-0 snap-center bg-white/5 p-8 rounded-3xl ring-1 ring-white/10 hover:bg-white/10 transition-all flex flex-col h-full">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 ring-1 ring-white/20 flex-shrink-0">
                                    {review.avatar ? (
                                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-lg">{review.name.charAt(0)}</div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{review.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-sm text-slate-400">{review.role}</p>
                                      {review.verified && (
                                          <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full ring-1 ring-green-500/20">
                                              <ShieldCheck className="h-3 w-3" />
                                              <span>Verificata</span>
                                          </div>
                                      )}
                                    </div>
                                </div>
                             </div>
                             
                             <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-4 h-4 text-brand-400 fill-current" />
                                ))}
                             </div>

                             <p className="text-slate-300 text-base leading-relaxed mb-4 flex-grow">
                                "{review.text}"
                             </p>

                             {review.attachmentUrl && (
                                <div className="mt-4 rounded-xl overflow-hidden ring-1 ring-white/10 w-full bg-black/20">
                                    {isVideo(review.attachmentUrl) ? (
                                        review.attachmentUrl.includes('youtube') || review.attachmentUrl.includes('youtu.be') ? (
                                            <div className="aspect-video">
                                                <iframe 
                                                    src={review.attachmentUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                                                    className="w-full h-full" 
                                                    allowFullScreen 
                                                    title="Video Review"
                                                ></iframe>
                                            </div>
                                        ) : (
                                            <VideoPlayer 
                                                sources={[{ src: review.attachmentUrl, type: review.attachmentUrl.split('?')[0].toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4' }]} 
                                                className="w-full max-h-48 object-cover"
                                                preload="metadata"
                                            />
                                         )
                                    ) : (
                                        <img src={review.attachmentUrl} alt="Review attachment" className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                             )}
                         </div>
                    ))}
                </div>
             </div>
        </section>
      )}

      {/* --- REVIEW MODAL (Dark Theme) --- */}
      {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-white/10 overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">Scrivi una Recensione</h3>
                      <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-white">
                          <X className="h-6 w-6" />
                      </button>
                  </div>
                  <form onSubmit={submitReview} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Il tuo Nome</label>
                          <input 
                              type="text" 
                              required
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                              placeholder="Mario Rossi"
                              value={reviewForm.name}
                              onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Valutazione</label>
                          <div className="flex gap-2">
                              {[1,2,3,4,5].map(star => (
                                  <button 
                                    key={star} 
                                    type="button"
                                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                                    className="focus:outline-none"
                                  >
                                      <Star className={`h-8 w-8 ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-slate-700'}`} />
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">La tua esperienza</label>
                          <textarea 
                              required
                              rows={4}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-brand-500 outline-none resize-none"
                              placeholder="Raccontaci cosa ti è piaciuto del percorso..."
                              value={reviewForm.text}
                              onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                          ></textarea>
                      </div>
                      
                      <div className="bg-brand-900/30 p-4 rounded-xl border border-brand-500/20 text-sm text-brand-200 flex gap-3">
                          <Upload className="h-5 w-5 flex-shrink-0" />
                          <p>Per allegare foto o video, inviali al nostro supporto WhatsApp dopo aver inviato la recensione testuale.</p>
                      </div>

                      <button type="submit" className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20">
                          Invia Recensione
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* SECTION 4 - USP */}
      {config.usp_section.is_visible && (
          <section className="py-16 md:py-24 bg-slate-950 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-semibold text-white mb-10 md:mb-12 text-center tracking-tight">{config.usp_section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {config.usp_section.items.map((item, idx) => (
                        <div key={idx} className="flex gap-6 p-6 rounded-2xl bg-white/5 ring-1 ring-white/5 hover:bg-white/10 transition-colors">
                            <div className="shrink-0">
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center ring-1 ring-green-500/30">
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </section>
      )}

      {/* --- SECTION FAQ --- */}
      <section className="py-16 md:py-24 bg-slate-900/50 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-4 tracking-tight text-center">
                      Domande Frequenti
                  </h2>
                  <p className="text-xl text-slate-400">
                      Tutte le risposte che cerchi prima di iniziare
                  </p>
              </div>

              <div className="space-y-4">
                  {processedFaqs.map((item, idx) => (
                      <div 
                          key={idx} 
                          className="bg-white/5 ring-1 ring-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10"
                      >
                          <button 
                              onClick={() => toggleFaq(idx)}
                              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                          >
                              <div className="flex items-start gap-4">
                                  <span className="text-2xl flex-shrink-0 select-none opacity-80">❓</span>
                                  <span className={`text-lg font-bold ${openFaqIndex === idx ? 'text-brand-400' : 'text-slate-200'}`}>
                                      {item.q}
                                  </span>
                              </div>
                              {openFaqIndex === idx ? (
                                  <ChevronUp className="h-5 w-5 text-brand-400 flex-shrink-0 ml-4" />
                              ) : (
                                  <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0 ml-4" />
                              )}
                          </button>
                          
                          {openFaqIndex === idx && (
                              <div className="px-6 pb-6 pl-16">
                                  <div className="text-slate-300 text-lg leading-relaxed border-l-2 border-brand-500/30 pl-4">
                                      {item.a}
                                  </div>
                              </div>
                          )}
                      </div>
                  ))}
              </div>

              <div className="mt-16 text-center">
                  <button 
                      onClick={handleNavigateToCourses}
                      className="bg-white text-slate-900 px-10 py-5 rounded-xl font-bold text-xl hover:bg-slate-200 transition-all shadow-lg hover:shadow-white/20 inline-flex items-center group transform hover:scale-105"
                  >
                      Ho Capito, Voglio Iniziare Ora →
                  </button>
              </div>
          </div>
      </section>

      {/* SECTION 7 - CTA FINALE */}
      {config.cta_section.is_visible && (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-600/20 backdrop-blur-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]"></div>
            
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight text-center">
                    {config.cta_section.title}
                </h2>
                <p className="text-xl md:text-2xl text-brand-100 mb-10 font-medium">
                    {config.cta_section.subtitle}
                </p>
                <div className="flex justify-center">
                    <button 
                        onClick={handleNavigateToCourses}
                        className="bg-white text-brand-900 px-10 py-5 rounded-xl font-bold text-xl hover:bg-brand-50 transition-all shadow-xl shadow-brand-500/20"
                    >
                        {config.cta_section.button_text}
                    </button>
                </div>
            </div>
        </section>
      )}

      {/* FOOTER */}
      {config.footer.is_visible && (
        <Footer config={config.footer} />
      )}
    </div>
  );
};
