import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Abilita CORS
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

  const { email, name } = req.body;

  if (!resend) {
    console.error("RESEND_API_KEY non configurata su Vercel.");
    return res.status(500).json({ error: 'Resend not configured' });
  }

  const appUrl = process.env.APP_URL || "https://www.mwacademy.eu";

  try {
    // 1. Find user by email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, notification_count')
      .eq('email', email)
      .single();

    let notificationCount = 0;
    if (!userError && user) {
        notificationCount = user.notification_count || 0;
        // 2. Increment notification_count
        await supabase
          .from('profiles')
          .update({ notification_count: notificationCount + 1 })
          .eq('id', user.id);
        notificationCount++;
    }

    const isReminder = notificationCount > 1;

    const { data, error } = await resend.emails.send({
      from: "Moise Web Academy <supporto@mwacademy.eu>",
      to: [email],
      subject: isReminder 
        ? `Promemoria: La tua guida PDF ti sta aspettando!`
        : `Benvenuto in Moise Web Academy - Ecco le tue credenziali`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 15px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Ciao ${name || 'Studente'}!</h1>
            <p style="color: #4b5563; font-size: 18px;">${isReminder ? 'Ti ricordiamo che la tua guida PDF ti sta aspettando!' : 'Benvenuto nella nostra piattaforma.'}</p>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            ${isReminder 
                ? 'Abbiamo notato che non hai ancora effettuato l\'accesso alla piattaforma. Non perdere l\'occasione di accedere alla tua guida PDF gratuita.'
                : 'Abbiamo notato che non hai ancora effettuato il tuo primo accesso dopo aver richiesto la nostra guida PDF gratuita.'}
            Ecco il link per accedere alla piattaforma e iniziare il tuo percorso:
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${appUrl}/login" 
               style="display: inline-block; background: #2563eb; color: white; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Accedi alla Piattaforma
            </a>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            Se non ricordi la tua password, puoi cliccare su "Password dimenticata" nella pagina di login.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Ricevi questa email perché ti sei iscritto su Moise Web Academy.<br/>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data, notificationCount });
  } catch (err) {
    console.error("Errore invio email:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
