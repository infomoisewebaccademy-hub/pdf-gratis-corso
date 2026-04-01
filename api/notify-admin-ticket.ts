import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

  const { ticketId, userEmail, userName, subject, message } = req.body;

  if (!resend) {
    console.error("RESEND_API_KEY non configurata su Vercel.");
    return res.status(500).json({ error: 'Resend not configured' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "info.moisewebaccademy@gmail.com";
  const appUrl = process.env.APP_URL || "https://www.mwacademy.eu";

  try {
    const { data, error } = await resend.emails.send({
      from: "Moise Web Academy <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `Nuovo Ticket di Supporto: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h1 style="color: #2563eb; font-size: 24px;">Nuovo Ticket di Supporto</h1>
          <p>Hai ricevuto una nuova richiesta di assistenza.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Utente:</strong> ${userName} (${userEmail})</p>
            <p><strong>Oggetto:</strong> ${subject}</p>
            <p><strong>Messaggio:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <a href="${appUrl}/admin?section=support&ticketId=${ticketId}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Rispondi al ticket
          </a>
        </div>
      `,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Errore invio email:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
