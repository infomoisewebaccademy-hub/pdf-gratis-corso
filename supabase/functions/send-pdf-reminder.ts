import { createClient } from 'npm:@supabase/supabase-js@2.87.1'

declare const Deno: any;

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Log di debug per verificare cosa riceve la funzione
    console.log("📥 Dati ricevuti dal frontend:", JSON.stringify(body));
    
    const { email, name } = body;
    
    // Validazione robusta
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error("ERRORE: Email non valida ricevuta:", email);
      throw new Error(`Email mancante o formato non valido. Ricevuto: '${email}'`);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')?.trim();
    if (!resendApiKey) {
        throw new Error("RESEND_API_KEY non configurata.");
    }

    // Invia email con email sanitizzata
    await sendCredentialsEmail(resendApiKey, email.trim(), name || 'Studente');

    return new Response(JSON.stringify({ success: true, message: "Email inviata." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("❌ Errore nella funzione send-pdf-reminder:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// --- FUNZIONE EMAIL CORRETTA ---
async function sendCredentialsEmail(apiKey: string, toEmail: string, name: string) {
    const emailToUse = toEmail.trim();

    console.log(`✉️ Tentativo invio promemoria a: ${emailToUse}`);
    const sender = 'Moise Web Academy <info@mwacademy.eu>'; 
    const SITE_URL = "https://www.mwacademy.eu";

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                from: sender,
                to: [emailToUse], 
                subject: 'La tua Guida PDF ti sta aspettando!',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2563eb;">Ciao ${name}, la tua guida è pronta!</h1>
                        <p>Ti scriviamo per ricordarti che la tua guida PDF gratuita su Moise Web Academy ti sta aspettando.</p>
                        <p>Abbiamo già inviato una mail con le tue credenziali di accesso al momento della tua iscrizione. Se non l'hai trovata, <strong>ti invitiamo a controllare nella cartella Spam o Promozioni</strong> della tua posta elettronica.</p>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <p style="margin: 0;">Ti ricordiamo che le tue credenziali di accesso sono quelle che hai ricevuto al momento della tua iscrizione.</p>
                        </div>
                        <p>Accedi subito per scaricare la guida e iniziare il tuo percorso:</p>
                        <a href="${SITE_URL}/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accedi alla Piattaforma</a>
                        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #888;">Ricevi questa email perché hai richiesto la nostra guida PDF gratuita.</p>
                    </div>
                `
            })
        });
        const responseData = await res.json();
        if (!res.ok) console.error("❌ ERRORE RISPOSTA RESEND:", JSON.stringify(responseData));
        else console.log("✅ EMAIL DI PROMEMORIA INVIATA! ID:", responseData.id);
    } catch (e) {
        console.error("❌ Errore Network fetch (Resend):", e);
    }
}
