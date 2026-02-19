
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Gestione errori globale per catturare problemi di avvio (es. import falliti)
window.addEventListener('error', (event) => {
    const rootElement = document.getElementById('root');
    if (rootElement && !rootElement.hasChildNodes()) {
        rootElement.innerHTML = `
            <div style="padding: 20px; color: #333; font-family: sans-serif;">
                <h1>Errore di Caricamento</h1>
                <p>Si è verificato un errore critico prima dell'avvio di React.</p>
                <pre style="background: #f1f1f1; padding: 10px; border-radius: 5px; overflow: auto;">${event.message}</pre>
            </div>
        `;
    }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("CRITICAL APP ERROR:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #333;">
      <h1>Si è verificato un errore durante il rendering.</h1>
      <p>Controlla la console del browser (F12) per i dettagli.</p>
      <pre style="background: #eee; padding: 10px; border-radius: 5px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
