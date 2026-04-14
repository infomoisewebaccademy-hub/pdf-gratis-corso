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
    const { email, name } = body;
    
    if (!email) {
      throw new Error("Email mancante.");
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')?.trim();
    if (!resendApiKey) {
        throw new Error("RESEND_API_KEY non configurata.");
    }

    // Invia email (usando un template simile a quello di registrazione)
    await sendCredentialsEmail(resendApiKey, email, name || 'Studente');

    return new Response(JSON.stringify({ success: true, message: "Email rinviata." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("❌ Errore nella funzione resend-credentials:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// --- FUNZIONE EMAIL ---
async function sendCredentialsEmail(apiKey: string, toEmail: string, name: string) {
    console.log(`✉️ Tentativo rinvio email a: ${toEmail}`);
    const sender = 'Moise Web Academy <info@mwacademy.eu>'; 
    const SITE_URL = "https://www.mwacademy.eu";

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                from: sender,
                to: [toEmail], 
                subject: 'La tua Guida Gratuita MWA è pronta!',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2563eb;">Benvenuto in MWA!</h1>
                        <p>Ciao ${name}, grazie per il tuo interesse. La tua guida PDF gratuita ti aspetta!</p>
                        <p>Abbiamo creato un account per te sulla nostra piattaforma. Ecco le tue credenziali per accedere:</p>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${toEmail}</p>
                            <p style="margin: 5px 0; font-size: 18px;"><strong>Password:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #ddd;">(Usa la password che hai impostato o clicca su "Password dimenticata")</code></p>
                        </div>
                        <p>Accedi subito per scaricare la guida e iniziare a creare:</p>
                        <a href="${SITE_URL}/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accedi e Scarica Guida PDF</a>
                        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #888;">Ti consigliamo di cambiare la password dopo il primo accesso.</p>
                    </div>
                `
            })
        });
        const responseData = await res.json();
        if (!res.ok) console.error("❌ ERRORE RISPOSTA RESEND:", JSON.stringify(responseData));
        else console.log("✅ EMAIL RINVIATA! ID:", responseData.id);
    } catch (e) {
        console.error("❌ Errore Network fetch (Resend):", e);
    }
}
