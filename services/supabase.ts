
import { createClient } from '@supabase/supabase-js';

// ============================================================================================
// CONFIGURAZIONE AUTOMATICA DA VARIABILI D'AMBIENTE (.env)
// Il sistema ora legge automaticamente le chiavi dal file .env
// ============================================================================================

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://zplcjlyqmcayprettmqd.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbGNqbHlxbWNheXByZXR0bXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzA0MzgsImV4cCI6MjA4MDI0NjQzOH0.OfK1kbwc-3OBrvIIVFnnTeNCgSinVGAJiIy8jfvxjSA';


// ============================================================================================
// NON TOCCARE NULLA SOTTO QUESTA LINEA
// ============================================================================================

// Controllo errori
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 ERRORE CRITICO: Variabili Supabase non trovate.");
  console.error("Assicurati di aver creato un file '.env' con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
}

// Inizializza il client
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
);

/**
 * Chiama la Edge Function 'create-checkout' usando fetch diretto.
 * Accetta un array di courseIds per supportare il carrello multiplo.
 * userId e email sono OPZIONALI per supportare il Guest Checkout.
 */
export const createCheckoutSession = async (courseIds: string[], userId?: string, email?: string) => {
    try {
        if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
            throw new Error("URL Supabase non configurato correttamente. Controlla il tuo file .env");
        }

        // Costruiamo manualmente l'URL della funzione
        const functionUrl = `${supabaseUrl}/functions/v1/create-checkout`;
        console.log(`🚀 Avvio pagamento per ${courseIds.length} corsi. Chiamata a: ${functionUrl}`);
        
        // FIX: Usiamo undefined invece di null. 
        // Se undefined, JSON.stringify rimuove la chiave, evitando di inviare valori nulli/vuoti al backend che confondono Stripe.
        const bodyPayload = {
            course_ids: courseIds, 
            user_id: userId ? userId : undefined, 
            email: email ? email : undefined
        };
        
        // Usiamo fetch nativo invece di supabase.functions.invoke
        const response = await fetch(functionUrl, {
            method: 'POST',
            mode: 'cors', // Assicuriamoci che CORS sia attivo
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload)
        });

        // Gestione errori HTTP (es. 404, 500)
        if (!response.ok) {
            let errorText = "Errore sconosciuto";
            try {
                 const errorJson = await response.json();
                 errorText = errorJson.error || JSON.stringify(errorJson);
            } catch (e) {
                 errorText = await response.text();
            }
            
            console.error(`❌ Errore Server (${response.status}):`, errorText);
            throw new Error(`Errore Pagamento (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (!data || !data.url) {
            throw new Error("Il server non ha restituito l'URL di pagamento Stripe.");
        }

        console.log("✅ Sessione Stripe creata:", data.url);
        return data; 
    } catch (err: any) {
        console.error('❌ Errore creazione checkout (Frontend):', err);
        // Rilanciamo l'errore per mostrarlo all'utente
        throw err;
    }
};
