// Generatore predefinito ed estensibile di Landing Page e Funnel per Moise Web Academy (MWA)
// Fornisce testi persuasivi ad altissima conversione scritti in italiano perfetto
// per ciascuno dei percorsi formativi dell'Academy.

export interface LandingPageData {
  hero: {
    title: string;
    subheadline: string;
    bullet_points: string[];
    value_proposition: string;
  };
  problem_solution: {
    problem_title: string;
    problem_desc: string;
    solution_title: string;
    solution_desc: string;
    before_vs_after: {
      before_title: string;
      before_items: string[];
      after_title: string;
      after_items: string[];
    };
  };
  benefits: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      desc: string;
      icon: string;
    }>;
  };
  testimonials: Array<{
    name: string;
    role: string;
    text: string;
  }>;
  host_bio: {
    name: string;
    headline: string;
    bio_paragraphs: string[];
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export function generateDefaultLandingPage(title: string, price: number, discountedPrice?: number): LandingPageData {
  const normalizedTitle = title.toLowerCase();
  const finalPriceVal = discountedPrice && discountedPrice > 0 ? discountedPrice : price;

  // --- 1. APPSHEET / LOW-CODE / DATABASE APPS ---
  if (normalizedTitle.includes('appsheet') || normalizedTitle.includes('low-code') || normalizedTitle.includes('gestione') || normalizedTitle.includes('database')) {
    return {
      hero: {
        title: "Sviluppa App Aziendali Su Misura Con Google AppSheet Senza Saper Programmare",
        subheadline: "Automatizza i processi aziendali, elimina i fogli Excel disordinati e crea sistemi di gestione pronti all'uso per te o per i tuoi clienti in meno di 2 settimane.",
        bullet_points: [
          "Collega i tuoi dati (Google Sheets, Excel, Cloud SQL) e convertili in app native in poche ore",
          "Nessun canone mensile esorbitante di sviluppo: usa strumenti gratuiti e scalabili",
          "Workflow automatizzati con notifiche push, invio email PDF e firme grafiche sul tablet",
          "Assistenza personale diretta e costante da parte del docente Daniel Moise"
        ],
        value_proposition: "Porta l'efficienza digitale a costo zero nel tuo business"
      },
      problem_solution: {
        problem_title: "Il caos organizzativo blocca la crescita della tua attività?",
        problem_desc: "Ogni giorno ti scontri con fogli Excel che si corrompono, comunicazioni che vanno perse su WhatsApp, dipendenti che non sanno quali compiti svolgere e ore buttate a fare report manuali. Vorresti un sistema centralizzato ma le software house ti chiedono oltre €10.000 e mesi di attesa per sviluppare un'app personalizzata.",
        solution_title: "La Rivoluzione Low-Code di Google AppSheet",
        solution_desc: "In questo percorso d'élite scoprirai come diventare l'architetto del tuo business. Imparerai a progettare, costruire e pubblicare applicazioni mobili e desktop perfette, studiate specificamente sulle necessità aziendali, senza scrivere una singola riga di codice tradizionale.",
        before_vs_after: {
          before_title: "PRIMA (Senza Gestione Digitale)",
          before_items: [
            "Fogli Excel persi o compilati in modo errato",
            "Migliaia di euro spesi in software commerciali rigidi",
            "Dipendenza totale da programmatori esterni lenti",
            "Perdite di tempo in attività ripetitive e faticose"
          ],
          after_title: "DOPO (Con il Metodo AppSheet)",
          after_items: [
            "Tutti i dati aziendali centralizzati in tempo reale in un'unica app",
            "Applicazione creata da te a costo zero di licenza e sviluppo",
            "Autonomia totale nel modificare o ampliare l'app quando vuoi",
            "Processi automatizzati che lavorano in background risparmiandoti ore"
          ]
        }
      },
      benefits: {
        title: "Perché scegliere questo percorso",
        subtitle: "Il programma più concreto e orientato ai risultati aziendali in Italia",
        items: [
          {
            title: "Pratico al 100%",
            desc: "Nessuna teoria noiosa. Costruiremo un gestionale aziendale completo e funzionante passo-dopo-passo.",
            icon: "Laptop"
          },
          {
            title: "Database Relazionali",
            desc: "Impara a connettere tabelle, definire relazioni uno-a-molti e strutturare i dati come un vero ingegnere del software.",
            icon: "Brain"
          },
          {
            title: "Automazioni SMS/Email",
            desc: "Imposta notifiche automatiche che si attivano alle scadenze, inviando report PDF generati sul momento.",
            icon: "Zap"
          },
          {
            title: "Pronto per il Lavoro",
            desc: "Completa il corso e vendi gestionali su misura ad aziende del tuo territorio a partire da €1.500 l'uno.",
            icon: "Target"
          }
        ]
      },
      testimonials: [
        {
          name: "Marco Rossi",
          role: "Responsabile Operations presso LogisticaNord",
          text: "Avevamo una gestione magazzino disastrosa basata su fogli volanti. Con questo percorso ho sviluppato un'app interna in 10 giorni. Abbiamo azzerato gli errori di spedizione e l'azienda ha risparmiato €8.000 di licenze software tradizionali nel primo mese!"
        },
        {
          name: "Valentina Bianchi",
          role: "Consulente Organizzativa & Freelance",
          text: "Daniel Moise è un docente eccezionale. Il supporto fornito su WhatsApp è impagabile: risponde subito a ogni dubbio tecnico. Ora offro lo sviluppo di app no-code come servizio premium ai miei clienti aziendali, raddoppiando le mie entrate giornaliere."
        },
        {
          name: "Giuseppe Russo",
          role: "Imprenditore Termoidraulica Russo",
          text: "Non avevo competenze informatiche specifiche. Grazie alle guide passo-passo della Moise Web Academy ho creato l'app per i miei tecnici sul campo: ora registrano i rapporti d'intervento direttamente dal cellulare con firma digitale!"
        }
      ],
      host_bio: {
        name: "Daniel Moise",
        headline: "Fondatore Moise Web Academy & Esperto Sistemi di Automazione Aziendale",
        bio_paragraphs: [
          "Daniel Moise è un imprenditore digitale e consulente di automazione organizzativa. Negli ultimi anni ha aiutato oltre 200 aziende ad abbattere le inefficienze interne digitalizzando flussi complessi mediante soluzioni Low-code e No-code.",
          "Ha ideato Moise Web Academy con l'obiettivo di abbassare le barriere d'ingresso alla tecnologia: chiunque, con la giusta guida e dedizione, può imparare a governare gli strumenti di automazione e creare valore straordinario sul mercato energetico ed economico di oggi."
        ]
      },
      faq: [
        {
          question: "Non so programmare, posso farcela?",
          answer: "Assolutamente sì. Google AppSheet nasce proprio per permettere a chi non è un programmatore di creare applicazioni. Tutto il corso è basato su configurazioni visuali e logica pratica, senza scrivere codice."
        },
        {
          question: "Quali sono i costi dei tool utilizzati?",
          answer: "La stragrande maggioranza delle funzionalità di AppSheet è utilizzabile in modalità gratuita fino a 10 utenti del tuo team. Ti spiegheremo come tenere i costi di infrastruttura a zero o a cifre estremamente ridotte."
        },
        {
          question: "Cosa posso fare in caso di difficoltà o bug?",
          answer: "Questo è il punto forte dell'Academy. Avrai accesso a un supporto premium diretto su WhatsApp con il docente. Potrai fare domande specifiche sulla tua app e risolveremo insieme ogni intoppo logico o di configurazione."
        },
        {
          question: "Dopo l'acquisto avrò accesso per sempre?",
          answer: "Sì, l'accesso a tutte le video-lezioni, gli aggiornamenti del corso e la community privata è a vita. Non ci sono canoni di rinnovo."
        },
        {
          question: "È prevista una garanzia Soddisfatto o Rimborsato?",
          answer: "Sì, offriamo una garanzia totale di 30 giorni. Se per qualunque motivo ritieni che il percorso non faccia al caso tuo, ti basta scriverci per ricevere un rimborso completo all'istante, senza domande faticose."
        }
      ]
    };
  }

  // --- 2. INTELLIGENZA ARTIFICIALE / SVILUPPO WEB CON AI / PIATTAFORME AI ---
  if (normalizedTitle.includes('ai') || normalizedTitle.includes('artificiale') || normalizedTitle.includes('piattaform') || normalizedTitle.includes('crea')) {
    return {
      hero: {
        title: "Domina l'Intelligenza Artificiale per Sviluppare Piattaforme e Siti Web in Poche Ore",
        subheadline: "Sfrutta i modelli di linguaggio moderni e gli strumenti Low-Code per generare codici sicuri, creare interfacce mozzafiato e raddoppiare la tua produttività, anche se parti da zero.",
        bullet_points: [
          "Impara a promptare come un vero ingegnere del software per generare applicazioni complete",
          "Integra API di intelligenza artificiale nei tuoi progetti per renderli autonomi e interattivi",
          "Pubblica i tuoi progetti su hosting professionali gratuiti con domini personalizzati",
          "Acquisisci la competenza più richiesta del 2025 prima di tutti i tuoi concorrenti"
        ],
        value_proposition: "Cavalca l'era dell'AI e diventa un programmatore aumentato"
      },
      problem_solution: {
        problem_title: "La programmazione tradizionale richiede anni di studio frustrante?",
        problem_desc: "Vorresti lanciare un'applicazione web o creare siti professionali per il mercato, ma ti scontri con la complessità dei linguaggi di programmazione (HTML, CSS, JavaScript, React, Server). Passi settimane a cercare di capire le basi per poi mollare scoraggiato per i continui errori nel codice.",
        solution_title: "Sviluppo Aumentato dall'Intelligenza Artificiale",
        solution_desc: "L'AI ha azzerato la curva di apprendimento. In questo corso ti sveleremo il metodo collaudato della Moise Web Academy per collaborare con l'AI. Imparerai a far scrivere il codice agli assistenti intelligenti, a verificarlo per la massima sicurezza, a compilarlo e a metterlo online in poche ore, senza dover memorizzare nessuna sintassi complessa.",
        before_vs_after: {
          before_title: "PRIMA (Sviluppatore Tradizionale)",
          before_items: [
            "Anni passati a studiare costantemente bug e framework",
            "Migliaia di euro spesi in corsi teorici accademici",
            "Settimane intere per completare un singolo sito web rudimentale",
            "Frustrazione davanti a righe infinite di errori inspiegabili"
          ],
          after_title: "DOPO (Creatore Web con AI)",
          after_items: [
            "Interfacce professionali create in pochi secondi d'intuizione",
            "Uso sapiente dei prompt per ottenere codici perfetti e stabili",
            "Siti web autoprodotti in giornata con design ultra-moderni",
            "Capacità di automatizzare e scalare i tuoi progetti in tempo record"
          ]
        }
      },
      benefits: {
        title: "Un programma rivoluzionario passo-passo",
        subtitle: "L'unico corso pratico che ti insegna a fare sinergia reale con l'AI",
        items: [
          {
            title: "Progetti Reali",
            desc: "Niente esempi accademici. Costruiremo siti vetrina, applicazioni dinamiche e dashboard interattive pronte per il mercato.",
            icon: "Code"
          },
          {
            title: "Prompt Engineering",
            desc: "Scopri le formule esatte per comunicare con l'AI senza fraintendimenti, ottenendo codice pulito, ottimizzato e funzionante.",
            icon: "Brain"
          },
          {
            title: "Deploy a Costo Zero",
            desc: "Metti online i tuoi progetti con domini personalizzati usando server gratuiti a prestazioni elevatissime.",
            icon: "Shield"
          },
          {
            title: "Certificato & Supporto",
            desc: "Ottieni l'attestato di partecipazione spendibile nel mondo del lavoro e approfitta del supporto personale diretto su WhatsApp.",
            icon: "Award"
          }
        ]
      },
      testimonials: [
        {
          name: "Andrea G.",
          role: "Sviluppatore Junior Autodidatta",
          text: "Ero bloccato a studiare nozioni teoriche da mesi. Grazie a Daniel ho capito come usare l'AI per velocizzare la scrittura ed eliminare i bug. Ho finalizzato la mia prima web app con database integrato e l'ho presentata a un colloquio di lavoro. Assunto subito!"
        },
        {
          name: "Samantha L.",
          role: "Web Designer & Content Creator",
          text: "Il corso mi ha aperto gli occhi. Prima disegnavo solo su Figma e dovevo delegare la programmazione. Ora, usando l'AI, creo e metto online siti web fantastici per i miei clienti. I miei margini di guadagno sono triplicati!"
        },
        {
          name: "Fabio M.",
          role: "Imprenditore E-commerce",
          text: "Volevo integrare delle funzioni intelligenti di raccomandazione prodotti nel mio portale. Grazie a questo corso ho configurato le API di Gemini sul mio server a costo quasi nullo, senza dover assumere programmatori esterni costosi."
        }
      ],
      host_bio: {
        name: "Daniel Moise",
        headline: "Fondatore Moise Web Academy & Full-Stack AI Engineer",
        bio_paragraphs: [
          "Daniel Moise progetta e sviluppa interfacce e sistemi avanzati integrando intelligenza artificiale. Ha guidato la transizione tecnologica di decine di startup, insegnando ai team come incrementare la velocità di sviluppo fino al 400%.",
          "Con la Moise Web Academy ha strutturato una didattica focalizzata interamente sulla pratica, ideata per darti le chiavi per essere indipendente sul mercato digitale e creare valore immediato."
        ]
      },
      faq: [
        {
          question: "Devo conoscere già dei linguaggi di programmazione?",
          answer: "No. Il corso parte da zero absoluto. Ti insegneremo come far generare all'AI l'intera struttura dei file e come compilarli in modo visuale e semplice, guidandoti in ogni singolo clic."
        },
        {
          question: "Quali strumenti AI utilizzeremo?",
          answer: "Lavoreremo con gli strumenti di ultima generazione ad alte prestazioni, come Google AI Studio, cursor editor e altri tool. Ti mostreremo come accedere a questi potenti modelli a costo zero."
        },
        {
          question: "Come ricevo supporto se mi blocco?",
          answer: "Non sarai mai solo. Oltre alla community degli studenti, il corso include l'assistenza diretta con Daniel Moise via WhatsApp per controllare il tuo codice se riscontri anomalie o bug insoliti."
        },
        {
          question: "Quanto tempo ci vuole per finire il percorso?",
          answer: "Il corso è strutturato in moduli agili di breve durata. Studiando circa 30-40 minuti al giorno, sarai in grado di pubblicare il tuo primo progetto web avanzato completo entro 10 giorni."
        },
        {
          question: "Cosa succede se il corso non risponde alle mie aspettative?",
          answer: "Moise Web Academy offre una garanzia di 30 giorni: se non sei soddisfatto al 100%, ti rimborsiamo l'intera cifra versata immediatamente senza fare domande. La tua crescita è la nostra assoluta priorità."
        }
      ]
    };
  }

  // --- 3. LANDING PAGE / WORDPRESS / ELEMENTOR / SITI WEB ---
  if (normalizedTitle.includes('landing') || normalizedTitle.includes('wordpress') || normalizedTitle.includes('siti') || normalizedTitle.includes('elementor') || normalizedTitle.includes('e-commerce') || normalizedTitle.includes('ecommerce')) {
    return {
      hero: {
        title: "Crea Landing Page e Siti Web Ad Altissima Conversione Con WordPress ed Elementor",
        subheadline: "Disegna layout mozzafiato, scrivi testi magnetici e trasforma i visitatori casuali in clienti paganti senza dover toccare il codice, usando strategie professionali collaudate.",
        bullet_points: [
          "Struttura pagine di vendita strutturate per catturare lead e vendere servizi",
          "Copywriting persuasivo integrato: impara a scrivere ciò che costringe a cliccare e comprare",
          "Ottimizzazione totale per dispositivi mobili, velocità di caricamento fulminea e SEO",
          "Licenze e template gratuiti preimpostati inclusi pronti per essere importati in un clic"
        ],
        value_proposition: "Moltiplica i tuoi clienti grazie a landing page professionali"
      },
      problem_solution: {
        problem_title: "I tuoi visitatori arrivano sul sito ma non acquistano e se ne vanno?",
        problem_desc: "Avere un sito web esteticamente carino non serve a nulla se non converte. Molti professionisti creano siti pieni di testo caotico, difficili da navigare da mobile o che si caricano in 10 secondi. Il risultato? Zero contatti ricevuti, centinaia di euro buttati in pubblicità e un forte senso di impotenza.",
        solution_title: "Il Metodo Funnel Moise Web Academy",
        solution_desc: "Una landing page efficace è una macchina di persuasione che guida l'utente a compiere un'azione precisa (iscriversi, acquistare, telefonare). In questo corso ti guideremo passo-dopo-passo nella progettazione strategica ed estetica di landing page impeccabili utilizzando WordPress ed Elementor. Ti sveleremo i trucchi di copy, design e configurazione tecnica che usiamo ogni giorno per i nostri progetti.",
        before_vs_after: {
          before_title: "PRIMA (Sito Web Tradizionale)",
          before_items: [
            "Testi generici e poco incisivi che non attraggono nessuno",
            "Tempi di attesa elevati che fanno fuggire i navigatori",
            "Layout disordinato e non ottimizzato per gli smartphone",
            "Nessun invito all'azione chiaro: il cliente non sa cosa fare"
          ],
          after_title: "DOPO (Landing Page Persuasiva)",
          after_items: [
            "Titoli calamita e messaggi che colpiscono dritto alle necessità",
            "Pagine fulminee ottimizzate per convertire oltre il 15% del traffico",
            "Responsive design perfetto studiato sui comportamenti mobile",
            "Funnel lineare ed inviti all'azione chiari che incrementano i profitti"
          ]
        }
      },
      benefits: {
        title: "Le tue vendite e contatti sotto steroidi",
        subtitle: "Impara a costruire pagine web che portano riscontri reali",
        items: [
          {
            title: "Elementor Facile",
            desc: "Padroneggia il page builder trascinando elementi visivi in tempo reale. Creerai design mozzafiato all'istante.",
            icon: "Laptop"
          },
          {
            title: "Copywriting Magnetico",
            desc: "Scopri come strutturare titoli, benefici, testimonianze e pulsanti usando trigger psicologici persuasivi.",
            icon: "Users"
          },
          {
            title: "Velocità & SEO",
            desc: "Ottimizza immagini, cache e server per caricare i tuoi siti in meno di un secondo, migliorando il posizionamento.",
            icon: "Zap"
          },
          {
            title: "Template Importabili",
            desc: "Ottieni i nostri layout personali ad alta conversione. Importali con un clic e sostituisci semplicemente i testi.",
            icon: "Target"
          }
        ]
      },
      testimonials: [
        {
          name: "Daniela F.",
          role: "Titolare Centro Estetico Serenity",
          text: "Avevamo un sito web classico inutile. Daniel ha ridisegnato la nostra landing page per le prenotazioni inserendo un funnel preciso e offerte imperdibili. Nel primo fine settimana abbiamo ricevuto ben 42 contatti profilati di nuove clienti!"
        },
        {
          name: "Luca S.",
          role: "Consulente Finanziario Freelance",
          text: "Creare landing page ad alta conversione era il mio tallone d'Achille. Questo corso mi ha dato uno schema logico da seguire. Ho realizzato da solo la mia pagina di lead generation e ora acquisisco 5-10 lead qualificati al giorno stabilizzandomi."
        },
        {
          name: "Matteo V.",
          role: "E-commerce Manager",
          text: "Sbalorditivo. Ho applicato i suggerimenti di ottimizzazione mobile ed usabilità di Elementor consigliati da Daniel sul mio store. Il tasso di carrelli abbandonati è diminuito drasticamente e le vendite sono salite del 24%."
        }
      ],
      host_bio: {
        name: "Daniel Moise",
        headline: "Direttore Creativo & Esperto di Conversion Rate Optimization (CRO)",
        bio_paragraphs: [
          "Daniel Moise progetta siti e landing page commerciali ad alta conversione per multinazionali, PMI e liberi professionisti. Ha testato e analizzato decine di milioni di visite per comprendere i reali comportamenti psicologici degli utenti online.",
          "Porta nell'Academy tutta la sua esperienza di agenzia di prima mano, con schemi operativi immediati progettati per far spiccare il volo a qualunque business o progetto digitale senza perdersi in tecnicismi inutili."
        ]
      },
      faq: [
        {
          question: "Devo acquistare Elementor Pro per fare il corso?",
          answer: "No. Durante il corso useremo prevalentemente la versione gratuita di Elementor unita a potenti add-on a costo zero. Ti insegneremo come ottenere layout incredibili senza dover spendere cifre annue per le licenze."
        },
        {
          question: "Il corso include hosting e dominio?",
          answer: "Ti mostreremo passo-passo come acquistare un servizio di hosting professionale ultra-veloce a meno di €3 al mese e come configurare il tuo dominio personalizzato .it o .com in totale autonomia."
        },
        {
          question: "Posso applicare queste competenze per trovare clienti?",
          answer: "Assolutamente sì. La creazione di landing page è uno dei servizi digitali più redditizi e richiesti sul mercato. Potrai facilmente vendere una landing page di vendita strutturata a liberi professionisti o aziende locali a partendo da €600/€1.200."
        },
        {
          question: "Ricevo un attestato alla fine?",
          answer: "Sì, superati i moduli d'esame pratico riceverai l'attestato ufficiale della Moise Web Academy firmato, perfetto da allegare al tuo portfolio e presentare ai tuoi potenziali clienti."
        },
        {
          question: "Cosa succede se cambio idea dopo l'acquisto?",
          answer: "Nessun rischio. La tua iscrizione è coperta da una garanzia di rimborso al 100% per 30 giorni. Se il corso non soddisfa le tue aspettative, ti restituiamo ogni centesimo immediatamente."
        }
      ]
    };
  }

  // --- 4. ADS / SOCIAL MEDIA MARKETING / PUBBLICITA ---
  if (normalizedTitle.includes('ads') || normalizedTitle.includes('marketing') || normalizedTitle.includes('facebook') || normalizedTitle.includes('pubblicit') || normalizedTitle.includes('traffico')) {
    return {
      hero: {
        title: "Domina Meta & TikTok Ads: Trasforma Ogni Singolo Euro Speso In Profitto Reale",
        subheadline: "Impara la strategia pubblicitaria definitiva per creare campagne ipnotiche, colpire il target perfetto e riempire la tua attività di contatti e vendite senza buttare soldi inutilmente.",
        bullet_points: [
          "Configura correttamente il Pixel di tracciamento e l'API di Conversione (senza errori informatici)",
          "Scrivi annunci persuasivi ed organizza angoli creativi ad alta conversione per FB, IG e TikTok",
          "Scala le tue campagne con budget crescenti mantenendo stabile ed elevato il ritorno economico (ROAS)",
          "Affiancamento continuo su WhatsApp per la verifica delle tue attuali inserzioni attive"
        ],
        value_proposition: "Porta clienti caldi e profilati nella tua attività commerciale"
      },
      problem_solution: {
        problem_title: "Sei stanco di donare soldi a Mark Zuckerberg senza vedere vendite reali?",
        problem_desc: "Avventurarsi nel pannello di gestione inserzioni senza una strategia solida è un suicidio finanziario. Premi il tasto 'Metti in evidenza il post' e vedi solo cuoricini e visualizzazioni ma nessun contatto o vendita reale in banca. Configuri i pubblici a caso, i tracciamenti non funzionano a causa di iOS 14+ e sogni di avere un flusso costante di clienti caldi interessati a comprare da te.",
        solution_title: "Il Sistema Scientifico di Acquisizione Clienti",
        solution_desc: "Il traffico a pagamento non è scommessa, è pura matematica. In questo corso ti insegneremo a trattare le Ads scientificamente. Imparerai come organizzare la struttura di account solida, trovare angoli d'attacco psicologici irresistibili per le creatività dei tuoi video/foto, leggere le metriche determinanti per ottimizzare ed eliminare ciò che non produce ROI.",
        before_vs_after: {
          before_title: "PRIMA (Ads Amatoriali)",
          before_items: [
            "Inserzioni create basandosi su sole sensazioni estetiche personali",
            "Tracciamento parziale o non funzionante: non sai da dove arrivano i clienti",
            "Budget sprecati in test infiniti senza risultati rilevanti in fatturato",
            "Senso di smarrimento e frustrazione davanti a un pannello ingestibile"
          ],
          after_title: "DOPO (Ads Professionali)",
          after_items: [
            "Creazione di inserzioni strutturate su bisogni emersi dal mercato",
            "Tracciamento impeccabile con server-side pixel e API precise",
            "Campagne stabili che generano vendite e contatti ad un costo controllato",
            "Piena padronanza delle metriche fondamentali per scalare costantemente"
          ]
        }
      },
      benefits: {
        title: "Trasforma il traffico in clienti paganti",
        subtitle: "La guida strategica e tecnica per smettere di sperare ed iniziare a vendere",
        items: [
          {
            title: "Tracciamento Sicuro",
            desc: "Configura il Pixel e le Conversioni Server-Side superando i vincoli di riservatezza, monitorando ogni singola vendita.",
            icon: "Shield"
          },
          {
            title: "Strategia Creativa",
            desc: "Scopri come filmare e montare video TikTok e Reel inserendo trigger psicologici e hook che bloccano lo scroll delle immagini.",
            icon: "Users"
          },
          {
            title: "Lettura dei Dati",
            desc: "Padroneggia CTR, CPM, CPA e ROAS. Saprai in 5 minuti se una campagna va spenta o se è pronta per essere scalata.",
            icon: "TrendingUp"
          },
          {
            title: "Supporto Live Inserzioni",
            desc: "Condividi le tue schermate ed inserzioni attive con Daniel su WhatsApp per ricevere revisioni e ottimizzazioni mirate.",
            icon: "Zap"
          }
        ]
      },
      testimonials: [
        {
          name: "Enrico T.",
          role: "Co-fondatore Brand Gioielli Shiny",
          text: "Eravamo convinti che le Ads non funzionassero per noi. Con l'aiuto di Daniel abbiamo corretto la struttura del pixel e cambiato gli angoli delle nostre inserzioni creative su Instagram. In soli 15 giorni siamo passati da un ROAS di 1.2 a oltre 4.8!"
        },
        {
          name: "Marta R.",
          role: "Libera Professionista & Coach",
          text: "Il miglior corso sulle Ads in assoluto. Finalmente non si parla solo di tecnicismi ma di psicologia d'acquisto e posizionamento. Ho lanciato una semplice campagna di Lead Generation ottenendo 58 iscritti qualificati spendendo meno di €4 a contatto."
        },
        {
          name: "Stefano P.",
          role: "Titolare E-commerce FitFood",
          text: "Avevo l'account pubblicitario costantemente bloccato per policy violate a mia insaputa. Grazie alle lezioni sulla conformità aziendale di Daniel ho sbloccato la situazione e scalato le mie vendite mensili in tutta sicurezza."
        }
      ],
      host_bio: {
        name: "Daniel Moise",
        headline: "Performance Marketer & Media Buyer d'Elite",
        bio_paragraphs: [
          "Daniel Moise gestisce budget pubblicitari significativi su Facebook, Instagram, Google e TikTok, traducendoli in entrate e lead costanti. Ha sviluppato un framework operativo incentrato sull'ottimizzazione del ROAS eliminando ogni tipo di budget superfluo.",
          "Ti insegnerà a non arrenderti e a padroneggiare gli algoritmi per far crescere la tua attività ed ottenere l'indipendenza finanziaria che hai sempre desiderato."
        ]
      },
      faq: [
        {
          question: "Qual è il budget minimo di spesa giornaliero necessario?",
          answer: "Puoi iniziare tranquillamente a testare con soli €5 al giorno. Il corso ti insegnerà come massimizzare ed ottimizzare anche piccoli budget prima di scalare con investimenti più importanti."
        },
        {
          question: "Questo corso è adatto a chi parte totalmente da zero?",
          answer: "Sì. Ti mostreremo, partendo dalla creazione e verifica del Business Manager, come muoverti all'interno del pannello inserzioni in totale sicurezza per evitare costosi errori operativi."
        },
        {
          question: "Verranno trattate anche le nuove leggi sulla privacy e tracciamento?",
          answer: "Assolutamente sì. Il corso include una sezione avanzata e dettagliatissima su come implementare la tracciabilità delle conversioni tramite server con Supabase ed altri sistemi, aggirando i blocchi di iOS 14+."
        },
        {
          question: "Avrò accesso ad aggiornamenti futuri delle piattaforme ads?",
          answer: "Sì, gli algoritmi cambiano e anche noi aggiorniamo continuamente le lezioni per garantirti di avere sempre sottomano le migliori tecniche pubblicitarie aggiornate all'anno in corso."
        },
        {
          question: "La garanzia copre l'acquisto di questo corso specifico?",
          answer: "Certo. Offriamo la nostra consueta garanzia Soddisfatto o Rimborsato di 30 giorni. Se il corso non risponde al 100% alle tue necessità, ti rimborsiamo completamente."
        }
      ]
    };
  }

  // --- 5. AUTOMAZIONI / MAKE / WEBHOOK / N8N ---
  if (normalizedTitle.includes('automazion') || normalizedTitle.includes('make') || normalizedTitle.includes('webhook') || normalizedTitle.includes('n8n') || normalizedTitle.includes('api')) {
    return {
      hero: {
        title: "Automatizza il Tuo Lavoro al 100% con Make ed elimina i Compiti Ripetitivi",
        subheadline: "Impara a collegare centinaia di applicazioni, far comunicare i tuoi software, sincronizzare database ed inviare notifiche intelligenti a costo zero lasciando che i bot lavorino per te 24/7.",
        bullet_points: [
          "Collega Gmail, Excel, WhatsApp, CRM e Stripe realizzando flussi di lavoro automatici",
          "Dì addio alle attività manuali che ti tolgono tempo prezioso e ti causano stress",
          "Usa i Webhook e le API per integrare soluzioni intelligenti e flessibili",
          "Assistenza dedicata diretta passo-dopo-passo con il docente Daniel Moise"
        ],
        value_proposition: "Moltiplica le tue ore libere grazie alle automazioni intelligenti"
      },
      problem_solution: {
        problem_title: "Passi ore a fare copia-incolla manuale di dati tra vari software?",
        problem_desc: "La tua giornata lavorativa è ingolfata da compiti noiosi: trascrivere i clienti da Stripe al foglio Excel, mandare la fattura, aggiungere l'utente all'autorizzazione del corso, inviare email di benvenuto personalizzate. Oltre a farti perdere ore preziose del tuo tempo libero, questi passaggi aumentano drasticamente la possibilità di dimenticare qualcosa ed incorrere in costosi ritardi operativi.",
        solution_title: "L'Efficienza Illimitata dei Flussi di Lavoro nel Cloud",
        solution_desc: "Con gli strumenti di automazione cloud come Make ed n8n, puoi delegare tutto questo a dei robot instancabili. In questo percorso d'élite scoprirai come costruire flussi logici complessi con filtri, ramificazioni, formattazioni di testo ed integrazione database. Tutto questo visualmente, senza dover scrivere una singola istruzione di codice JavaScript.",
        before_vs_after: {
          before_title: "PRIMA (Lavoro Manuale e Stress)",
          before_items: [
            "Ore perse a inserire record duplicati e copiare email",
            "Errore umano costante nelle trascrizioni e scadenze dimenticate",
            "Silos di dati in cui i tuoi software non si parlano tra loro",
            "Fatica mentale e impossibilità di concentrarsi sulla crescita reale"
          ],
          after_title: "DOPO (Lavoro Robotizzato ed Efficace)",
          after_items: [
            "Tutti i software aziendali sincronizzati istantaneamente in tempo reale",
            "Zero errori di immissione dati e scadenze gestite al millesimo di secondo",
            "Workflow costanti che notificano subito i team rilevanti sui canali giusti",
            "Totale libertà mentale per occuparti delle decisioni di marketing strategico"
          ]
        }
      },
      benefits: {
        title: "Un percorso per massimizzare la tua produttività",
        subtitle: "Diventa un ingegnere dei processi aziendali molto ricercato sul mercato",
        items: [
          {
            title: "Logica dei Flussi",
            desc: "Impara a ragionare per funzioni logiche: Router, Filtri, Aggregatori di dati e Iteratori per elaborare liste di elementi.",
            icon: "Brain"
          },
          {
            title: "Webhooks & API",
            desc: "Padroneggia l'ascolto di eventi esterni in tempo reale: rispondi all'istante a pagamenti o compilazione form.",
            icon: "Zap"
          },
          {
            title: "Gestione Errori",
            desc: "Configura direttive di salvataggio e ripristino per assicurarti che il tuo flusso d'automazione non si blocchi mai in produzione.",
            icon: "Shield"
          },
          {
            title: "Esempi Pratici Pronti",
            desc: "Scarica e importa nel tuo account i nostri scenari operativi preconfigurati e personalizzali in un attimo.",
            icon: "Laptop"
          }
        ]
      },
      testimonials: [
        {
          name: "Roberto D.",
          role: "Amministratore Delegato RentCar Srl",
          text: "Avevamo una risorsa dedicata interamente alla trascrizione manuale dei contratti e delle fatture. Con questo corso abbiamo automatizzato l'intero processo tramite Make. Ora la risorsa si occupa di relazioni commerciali e le automazioni lavorano impeccabilmente senza errori!"
        },
        {
          name: "Elena G.",
          role: "Freelance e Copywriter",
          text: "Sbalorditivo. Ho automatizzato la generazione dei preventivi e l'invio delle mail di onboarding ai nuovi iscritti della mia lista. Risparmio almeno 10 ore a settimana che prima dedicavo alla pura segreteria, dedicandole ora alla scrittura creativa!"
        },
        {
          name: "Paolo Z.",
          role: "Sviluppatore No-Code",
          text: "Daniel Moise spiega le automazioni con una chiarezza disarmante. I concetti su array e webhook, complessi sui libri, diventano un gioco da ragazzi. Offro questi servizi ai miei clienti aziendali a tariffe ad alto valore."
        }
      ],
      host_bio: {
        name: "Daniel Moise",
        headline: "Esperto Certificato d'Integrazione Sistemi & Automazioni",
        bio_paragraphs: [
          "Daniel Moise progetta e ottimizza i flussi logici operativi di aziende ad alto fatturato, connettendo canali di vendita ad infrastrutture CRM complesse. È specializzato nel ridurre i costi aziendali automatizzando i passaggi d'ufficio e i processi gestionali.",
          "Ha strutturato questo percorso per darti strumenti operativi immediati, mostrandoti come diventare libero dal lavoro manuale noioso prima di subito."
        ]
      },
      faq: [
        {
          question: "Questo corso richiede di saper scrivere codice?",
          answer: "No. Make, Zapier ed n8n si controllano graficamente trascinando moduli e linee di connessione. Qualora servisse formattare formule complesse, ti mostreremo dettagliatamente come usare i costruttori predefiniti visivi."
        },
        {
          question: "Gli strumenti di automazione prevedono piani gratuiti?",
          answer: "Sì, Make offre un piano gratuito generoso con 1.000 operazioni al mese, ideale per testare i tuoi scenari. Ti mostreremo inoltre valide alternative open-source installabili gratuitamente."
        },
        {
          question: "Posso connettere software che non hanno moduli nativi in Make?",
          answer: "Assolutamente sì. Nel corso tratteremo esaustivamente l'argomento API e richieste HTTP generiche, consentendoti di agganciare e controllare qualsiasi servizio digitale moderno sul mercato."
        },
        {
          question: "Daniel risponde se ho un blocco logico nell'automazione?",
          answer: "Certamente. Potrai condividere schermate dei tuoi scenari e dei log d'errore via WhatsApp direttamente con Daniel Moise, che ti aiuterà a individuare prontamente l'errore o il filtro configurato male."
        },
        {
          question: "È protetto dall'opzione di rimborso totale?",
          answer: "Sì, tutti i corsi Moise Web Academy sono coperti da garanzia incondizionata Soddisfatto o Rimborsato di 30 giorni. La tua tranquillità è prioritaria per noi."
        }
      ]
    };
  }

  // --- 6. PARACADUTE GENERALE PER CORSI NUOVI O NON RICONOSCIUTI ---
  return {
    hero: {
      title: `Padroneggia ${title} Con un Metodo Pratico Focalizzato sui Risultati Reali`,
      subheadline: `Sviluppa competenze verticali ad alto valore, accelera i tuoi progetti personali ed elimina ogni barriera tecnica grazie ad una didattica d'élite guidata passo-dopo-passo.`,
      bullet_points: [
        "Metodologia pratica al 100% focalizzata sulla soluzione di reali problemi di mercato",
        "Esempi concreti, template pronti all'uso e risorse preconfigurate da scaricare subito",
        "Superamento delle incertezze iniziali con percorsi strutturati e sequenziali dal docente",
        "Supporto premium diretto e costante su WhatsApp con il docente Daniel Moise"
      ],
      value_proposition: "Acquisisci un superpotere digitale da valorizzare sul mercato"
    },
    problem_solution: {
      problem_title: "Sei bloccato da contenuti troppo teorici che non portano a risultati?",
      problem_desc: "Spesso i corsi online offrono concetti astratti ed esempi banali che non aiutano a risolvere i tuoi compiti reali. Ti ritrovi confuso tra mille nozioni, privo di una visione d'insieme e costretto a dipendere da agenzie esterne costose e lente per ogni singola necessità.",
      solution_title: `La Soluzione Pratica della Moise Web Academy: ${title}`,
      solution_desc: "Questo è il percorso definitivo per superare questi ostacoli. Ti daremo un quadro strategico d'insieme unito ad esercitazioni pratiche su progetti reali. Imparerai come operare con precisione ed efficacia, ottenendo la massima resa ed un ritorno economico imbattibile fin dalle prime settimane.",
      before_vs_after: {
        before_title: "PRIMA (Confusione ed Incertezza)",
        before_items: [
          "Miliardi di video YouTube disordinati che ti creano solo dubbi",
          "Mancanza di una sequenza logica nello studio e nella pratica",
          "Errori tecnici quotidiani e compiti che richiedono ore faticose",
          "Dipendenza passiva da fornitori esterni lenti e dai costi elevati"
        ],
        after_title: `DOPO (Metodo ${title} Pronto)`,
        after_items: [
          "Pianificazione chiara ed esecuzione impeccabile dei tuoi progetti",
          "Competenze solide e certificate per operare in autonomia",
          "Soluzioni immediate messe in atto nel giro di qualche ora",
          "Valore straordinario da proporre ai tuoi clienti elevando i margini"
        ]
      }
    },
    benefits: {
      title: "Cosa ti aspetta all'interno del percorso",
      subtitle: "Un sistema didattico studiato su casi di successo reali",
      items: [
        {
          title: "Approccio Concreto",
          desc: "Nessuna lezione accademica noiosa. Applichi subito ciò che vedi a schermo, passo dopo passo.",
          icon: "Laptop"
          },
          {
            title: "Ottimizzazione Risorse",
            desc: "Ti insegniamo come sviluppare i tuoi progetti riducendo a zero le inefficienze o abbonamenti a tool costosi.",
            icon: "Shield"
          },
          {
            title: "Tracciamento Risultati",
            desc: "Ottieni prove costanti dei tuoi progressi e mantieni alta la concentrazione grazie ad obiettivi chiari.",
            icon: "Target"
          },
          {
            title: "Assistenza Personale",
            desc: "Accedi al contatto WhatsApp diretto di Daniel Moise per chiarire qualsiasi perplessità tecnica.",
            icon: "Zap"
          }
        ]
      },
      testimonials: [
        {
          name: "Alessio B.",
          role: "Sviluppatore Web & Libero Professionista",
          text: "Un approccio brillante e super focalizzato sugli esiti commerciali e di business. La disponibilità del docente è impareggiabile: risponde anche di sera a blocchi tecnici risolvendo dubbi. Consigliatissimo!"
        },
        {
          name: "Chiara V.",
          role: "Marketing Manager presso NextGen",
          text: "Ero scettica sui corsi digitali per le mie precedenti delusioni, ma Daniel Moise è di un altro livello. Va dritto al punto senza fronzoli teorici, mostrandoti casi pratici su progetti veri. Esperienza favolosa."
        },
        {
          name: "Filippo M.",
          role: "Nuovo Imprenditore Digitale",
          text: "Grazie a questo corso ho completato in soli 5 giorni un progetto che la mia agenzia web precedente trascinava da oltre un mese. Ho riottenuto pieno controllo del mio portale e delle mie finanze sociali."
        }
      ],
      host_bio: {
        name: "Daniel Moise",
        headline: "Insegnante Principale & Imprenditore Tecnologico",
        bio_paragraphs: [
          "Daniel Moise trasforma le idee digitali in applicazioni stabili e performanti per il mercato italiano ed europeo. È fondatore di agenzie tecnologiche ad elevata efficienza orientate alla massima ottimizzazione del ROI.",
          "Dedica il suo tempo e la sua passione all'insegnamento per formare una classe di Web Creator indipendenti ed emancipati professionalmente, in grado di cavalcare da vincitori l'innovazione tecnologica contemporanea."
        ]
      },
      faq: [
        {
          question: "Ci sono requisiti di ammissione o conoscenze necessarie?",
          answer: "No. Il corso è strutturato per accompagnarti dalle basi fino al livello di autonomia più avanzato. Ti basta un computer, una connessione internet stabile e tanta costanza per applicare i passaggi."
        },
        {
          question: "Per quanto tempo potrò vedere i contenuti?",
          answer: "L'accesso a tutto il materiale didattico, inclusi file omaggio scaricabili, esercitazioni, certificato ufficiale di completamento e futuri aggionamenti gratuiti è garantito per sempre senza limiti."
        },
        {
          question: "Come viene erogato il supporto diretto?",
          answer: "Potrai metterti in contatto direttamente con Daniel Moise tramite WhatsApp per esporre i tuoi dubbi di configurazione o blocchi di logica, ricevendo feedback costruttivi ed immediati."
        },
        {
          question: "L'attestato rilasciato è riconosciuto dalle aziende?",
          answer: "Sì, l'attestato certifica l'acquisizione di abilità pratiche reali e verticali molto ricercate dal mercato. Dimostrare di aver sviluppato i progetti pratici proposti ha un impatto formidabile nei colloqui lavorativi."
        },
        {
          question: "È inclusa la formula Soddisfatto o Rimborsato?",
          answer: "Certamente. Vogliamo solo studenti felici ed entusiasti: hai a disposizione 30 giorni di prova dall'acquisto per cambiare idea e richiedere l'intero importo speso che ti verrà restituito rapidamente."
        }
      ]
    };
}
