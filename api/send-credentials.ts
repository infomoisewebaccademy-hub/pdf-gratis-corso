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
    if (userError) {
        console.error("Supabase user query error:", userError);
    } else if (user) {
        notificationCount = user.notification_count || 0;
        // 2. Increment notification_count
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ notification_count: notificationCount + 1 })
          .eq('id', user.id);
        
        if (updateError) {
            console.error("Supabase update error:", updateError);
        } else {
            notificationCount++;
        }
    }

    const isReminder = notificationCount > 1;

    const { data, error } = await resend.emails.send({
      from: "Moise Web Academy <info@mwacademy.eu>",
      to: [email],
      subject: 'La tua Guida Gratuita MWA è pronta!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Benvenuto in MWA!</h1>
            <p>Ciao ${name || 'Studente'}, grazie per il tuo interesse. La tua guida PDF gratuita ti aspetta!</p>
            <p>Abbiamo creato un account per te sulla nostra piattaforma. Ecco le tue credenziali per accedere:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0; font-size: 18px;"><strong>Password:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #ddd;">(Usa la password che hai impostato o clicca su "Password dimenticata")</code></p>
            </div>
            <p>Accedi subito per scaricare la guida e iniziare a creare:</p>
            <a href="${appUrl}/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accedi e Scarica la Guida</a>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888;">Ti consigliamo di cambiare la password dopo il primo accesso.</p>
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
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
}
