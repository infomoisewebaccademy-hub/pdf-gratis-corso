import { createClient } from 'npm:@supabase/supabase-js@2.87.1'

declare const Deno: any;

console.log("Create Free User Function Loaded v1");

// ==============================================================================
// 🔗 CONFIGURAZIONE
// Modifica queste variabili con i dati del tuo progetto.
// ==============================================================================
const SITE_URL = "https://www.mwacademy.eu"; 
const FREE_GUIDE_COURSE_ID = "course_pdf_guide_free"; // IMPORTANTE: Crea un corso con questo ID nel tuo pannello admin.
// ==============================================================================

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
    const lead = body.record || body; // Accetta dati sia da trigger che da chiamata diretta
    
    if (!lead || !lead.email) {
      throw new Error("Dati del lead mancanti o non validi.");
    }

    const { email: leadEmail, full_name: leadName } = lead;
    console.log(`🚀 Elaborazione nuovo lead per guida PDF: ${leadEmail}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY')?.trim();

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Variabili Supabase mancanti lato server.");
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Controlla se l'utente esiste già (METODO RPC - IL PIÙ AFFIDABILE)
    const { data: existingUser, error: rpcError } = await supabaseAdmin
      .rpc('get_user_id_by_email', { email_text: leadEmail })
      .single();

    if (rpcError && rpcError.code !== 'PGRST116') {
      // PGRST116 è l'errore per 'nessuna riga trovata', che per noi non è un errore.
      throw rpcError;
    }

    let userId = existingUser?.id;
    let passwordGenerated = null;

    if (existingUser) {
      console.log(`ℹ️ Utente già esistente (ID: ${existingUser.id}). Salto creazione.`);
    } else {
      console.log(`📧 Creazione NUOVO account per: ${leadEmail}`);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      passwordGenerated = `Mwa${randomNum}!`;
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: leadEmail,
          password: passwordGenerated,
          email_confirm: true,
          user_metadata: { full_name: leadName || 'Nuovo Studente' }
      });

      if (createError) throw createError;
      
      userId = newUser.user.id;
      console.log(`✅ Nuovo utente creato (ID: ${userId})`);
    }

    if (!userId) {
        throw new Error("Impossibile ottenere l'ID utente.");
    }

    // 2. Controlla se il corso è già stato assegnato
    const { data: existingPurchase, error: checkError } = await supabaseAdmin
        .from('purchases')
        .select('user_id')
        .eq('user_id', userId)
        .eq('course_id', FREE_GUIDE_COURSE_ID)
        .maybeSingle();

    if (checkError) {
        console.error("❌ Errore durante il controllo dell'acquisto esistente:", checkError);
    }

    // 3. Assegna il "corso" gratuito solo se non è già presente
    if (!existingPurchase) {
        const { error: purchaseError } = await supabaseAdmin
            .from('purchases')
            .insert({ user_id: userId, course_id: FREE_GUIDE_COURSE_ID });

        if (purchaseError) {
            console.error("❌ Errore assegnazione corso gratuito:", purchaseError);
        } else {
            console.log(`🎁 Corso gratuito assegnato a ${leadEmail}.`);
        }
    } else {
        console.log(`ℹ️ Corso gratuito già posseduto da ${leadEmail}. Salto assegnazione.`);
    }

    // 3. Invia email con credenziali (solo se l'utente è nuovo)
    if (passwordGenerated && resendApiKey) {
        await sendCredentialsEmail(resendApiKey, leadEmail, passwordGenerated, leadName || 'Nuovo Studente');
    } else if (!passwordGenerated) {
        console.log("🔕 Mail credenziali non inviata: l'utente esisteva già.");
    } else {
        console.warn("⚠️ RESEND_API_KEY non trovato. Impossibile inviare email.");
    }

    return new Response(JSON.stringify({ success: true, message: "Lead processato." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("❌ Errore nella funzione create-free-user:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// --- FUNZIONE EMAIL ---
async function sendCredentialsEmail(apiKey: string, toEmail: string, password: string, name: string) {
    console.log(`✉️ Tentativo invio email di benvenuto a: ${toEmail}`);
    const sender = 'Moise Web Academy <info@mwacademy.eu>'; 

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
                        <p>Abbiamo creato un account per te sulla nostra piattaforma. Ecco le tue credenziali provvisorie per accedere:</p>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${toEmail}</p>
                            <p style="margin: 5px 0; font-size: 18px;"><strong>Password:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #ddd;">${password}</code></p>
                        </div>
                        <p>Accedi subito per scaricare la guida e iniziare a creare:</p>
                        <a href="${SITE_URL}/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accedi e Scarica la Guida</a>
                        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #888;">Ti consigliamo di cambiare la password dopo il primo accesso.</p>
                    </div>
                `
            })
        });
        const responseData = await res.json();
        if (!res.ok) console.error("❌ ERRORE RISPOSTA RESEND:", JSON.stringify(responseData));
        else console.log("✅ EMAIL DI BENVENUTO INVIATA! ID:", responseData.id);
    } catch (e) {
        console.error("❌ Errore Network fetch (Resend):", e);
    }
}
