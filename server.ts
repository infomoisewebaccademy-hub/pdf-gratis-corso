import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Resend
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  // API Route for sending email when a ticket is created
  app.post("/api/notify-admin-ticket", async (req, res) => {
    console.log("Ricevuta richiesta di notifica ticket:", req.body);
    const { ticketId, userEmail, userName, subject, message } = req.body;

    if (!resend) {
      console.warn("RESEND_API_KEY non configurata. Email non inviata.");
      return res.status(500).json({ success: false, error: "Resend not configured" });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "info.moisewebaccademy@gmail.com";

    try {
      const { data, error } = await resend.emails.send({
        from: "Moise Web Academy <supporto@mwacademy.eu>", // Use verified domain
        to: [adminEmail],
        subject: `Nuovo Ticket di Supporto: ${subject}`,
        html: `
          <h1>Nuovo Ticket di Supporto</h1>
          <p><strong>Utente:</strong> ${userName} (${userEmail})</p>
          <p><strong>Oggetto:</strong> ${subject}</p>
          <p><strong>Messaggio:</strong></p>
          <p>${message}</p>
          <hr />
          <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/admin?section=support&ticketId=${ticketId}">Rispondi al ticket dall'Admin Dashboard</a></p>
        `,
      });

      if (error) {
        console.error("Errore invio email Resend:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (err) {
      console.error("Errore server invio email:", err);
      res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
