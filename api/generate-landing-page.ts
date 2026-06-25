import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, price, discounted_price, level, features, additional_benefits, lessons_content } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Il titolo del corso è richiesto" });
  }

  try {
    const ai = getGeminiClient();
    
    const lessonsList = lessons_content && Array.isArray(lessons_content)
      ? lessons_content.map((l: any, i: number) => `Lezione ${i+1}: ${l.title} - ${l.description || ''}`).join('\n')
      : 'Nessuna lezione ancora inserita';

    const prompt = `Sei un esperto copywriter di landing page ad altissima conversione e Growth Marketer per Moise Web Academy (MWA).
Devi creare una landing page e un funnel psicologico persuasivo in lingua ITALIANA per vendere il corso intitolato: "${title}".

Dettagli del corso:
- Titolo: "${title}"
- Descrizione breve: "${description || ''}"
- Livello: "${level || 'Principiante'}"
- Prezzo: ${price || 0} €
- Prezzo Scontato: ${discounted_price || 0} €
- Caratteristiche principali incluse: ${features && Array.isArray(features) ? features.join(', ') : ''}
- Benefici aggiuntivi: ${additional_benefits && Array.isArray(additional_benefits) ? additional_benefits.join(', ') : ''}

Programma delle lezioni:
${lessonsList}

Genera il contenuto strutturato in formato JSON per la landing page. Il contenuto deve essere estremamente accattivante, orientato a risolvere i problemi degli studenti (es. disoccupazione, mancanza di competenze digitali, voglia di scalare il business, ecc.) e mostrare perché questo corso è la soluzione definitiva nell'era dell'Intelligenza Artificiale.

Istruzioni per i campi:
1. "hero": Crea un titolo ipnotico, un sottotitolo persuasivo che mostri il beneficio immediato, ed elenca 4 punti elenco ad alto impatto. Un valore di value_proposition che descriva il superamento delle resistenze.
2. "problem_solution": Spiega accuratamente il problema principale dello studente tipo per questa materia e come questo corso lo risolve. Fornisce un blocco "Prima vs Dopo" (es. Prima: confuso, frustrato; Dopo: autonomo, qualificato).
3. "benefits": Crea 4 benefici chiave con titoli brevi, spiegazioni accattivanti e icone Lucide appropriate (usa solo tra: "Sparkles", "Zap", "Target", "TrendingUp", "Award", "Shield", "Laptop", "Code", "Brain", "Users").
4. "syllabus_intro": Un'introduzione accattivante al programma delle lezioni del corso.
5. "testimonials": Genera 3 testimonianze realistiche di studenti italiani fittizi ma credibili che hanno acquistato questo corso specifico, con nome, ruolo/professione, testo entusiasta e dettagliato sui risultati professionali o personali ottenuti, e una valutazione a 5 stelle.
6. "host_bio": Bio personalizzata di Moise Wisner, fondatore di Moise Web Academy e docente del corso, descrivendo autorevolezza, passione e guida pratica.
7. "faq": Genera 5 domande frequenti (con relative risposte persuasive) su questo specifico corso (es. "Ho bisogno di competenze pregresse?", "Cosa posso fare dopo questo corso?", ecc.).

Restituisci esclusivamente l'oggetto JSON strutturato richiesto, senza markdown o commenti aggiuntivi.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: 'OBJECT',
          properties: {
            hero: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                subheadline: { type: 'STRING' },
                bullet_points: { type: 'ARRAY', items: { type: 'STRING' } },
                value_proposition: { type: 'STRING' }
              },
              required: ["title", "subheadline", "bullet_points", "value_proposition"]
            },
            problem_solution: {
              type: 'OBJECT',
              properties: {
                problem_title: { type: 'STRING' },
                problem_desc: { type: 'STRING' },
                solution_title: { type: 'STRING' },
                solution_desc: { type: 'STRING' },
                before_vs_after: {
                  type: 'OBJECT',
                  properties: {
                    before_title: { type: 'STRING' },
                    before_items: { type: 'ARRAY', items: { type: 'STRING' } },
                    after_title: { type: 'STRING' },
                    after_items: { type: 'ARRAY', items: { type: 'STRING' } }
                  },
                  required: ["before_title", "before_items", "after_title", "after_items"]
                }
              },
              required: ["problem_title", "problem_desc", "solution_title", "solution_desc", "before_vs_after"]
            },
            benefits: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                subtitle: { type: 'STRING' },
                items: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      desc: { type: 'STRING' },
                      icon: { type: 'STRING' }
                    },
                    required: ["title", "desc", "icon"]
                  }
                }
              },
              required: ["title", "subtitle", "items"]
            },
            syllabus_intro: { type: 'STRING' },
            testimonials: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  role: { type: 'STRING' },
                  text: { type: 'STRING' },
                  rating: { type: 'INTEGER' }
                },
                required: ["name", "role", "text", "rating"]
              }
            },
            host_bio: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                role: { type: 'STRING' },
                headline: { type: 'STRING' },
                bio_paragraphs: { type: 'ARRAY', items: { type: 'STRING' } }
              },
              required: ["name", "role", "headline", "bio_paragraphs"]
            },
            faq: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  question: { type: 'STRING' },
                  answer: { type: 'STRING' }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: ["hero", "problem_solution", "benefits", "syllabus_intro", "testimonials", "host_bio", "faq"]
        }
      }
    });

    const resultText = response.text || "{}";
    const landingPageData = JSON.parse(resultText);

    return res.status(200).json({ success: true, landingPageData });
  } catch (err: any) {
    console.error("Errore generazione IA landing page:", err);
    return res.status(500).json({ error: err.message || "Errore nella generazione con IA" });
  }
}
