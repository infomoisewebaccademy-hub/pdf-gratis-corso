import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Loader, AlertCircle, User, Mail, ArrowRight, Cpu, Layers, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PdfGuideLanding: React.FC = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !fullName) {
            setError("Compila tutti i campi richiesti.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: functionError } = await supabase.functions.invoke('create-free-user', {
                body: { email, full_name: fullName },
            });
            if (functionError) throw functionError;
            if (data.userExists) {
                alert("Email già registrata. Controlla la tua casella di posta.");
            }
            navigate('/thank-you-pdf-gratuita');
        } catch (error: any) {
            setError(error.message || "Errore imprevisto. Riprova.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderForm = () => (
        <div className="bg-black/80 backdrop-blur-sm border border-white/10 p-8 rounded-2xl w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white text-center mb-2">Accedi al Manuale Operativo</h3>
            <p className="text-gray-400 text-center mb-6 text-sm">Ricevi il PDF via email.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input type="text" placeholder="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-lg py-3 pr-4 pl-12 text-white focus:ring-white/50 focus:border-white/50 transition" />
                </div>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-lg py-3 pr-4 pl-12 text-white focus:ring-white/50 focus:border-white/50 transition" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full text-md font-bold py-3 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center group bg-white hover:bg-gray-200 text-black">
                    {isLoading ? <Loader className="animate-spin h-6 w-6" /> : <>Richiedi Accesso <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></>}
                </button>
            </form>
            {error && <p className="text-red-400 text-xs mt-3 text-center flex items-center justify-center"><AlertCircle className="h-4 w-4 mr-2"/> {error}</p>}
        </div>
    );

    return (
        <div className="bg-black text-white font-sans">
            <div className="min-h-screen flex flex-col justify-center items-center p-4 text-center">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">Il web non si scrive. Si genera.</h1>
            </div>

            <div className="max-w-4xl mx-auto p-8 space-y-28">
                <section className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Il paradigma è cambiato.</h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">Il codice è stato il linguaggio di costruzione per trent'anni. Ora è diventato il risultato. L'intelligenza artificiale non è una scorciatoia. È un nuovo livello di astrazione. Chi prima impara a dialogare con essa, costruisce il futuro.</p>
                </section>

                <section>
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Google AI Studio. Controllo, non comandi.</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="border border-white/10 p-6 rounded-xl">
                            <Cpu className="h-8 w-8 mb-4 text-gray-400" />
                            <h3 className="font-bold text-xl mb-2">Potenza Computazionale</h3>
                            <p className="text-gray-400">Genera interfacce complesse in secondi, non settimane. Itera alla velocità del pensiero.</p>
                        </div>
                        <div className="border border-white/10 p-6 rounded-xl">
                            <Layers className="h-8 w-8 mb-4 text-gray-400" />
                            <h3 className="font-bold text-xl mb-2">Precisione Sistematica</h3>
                            <p className="text-gray-400">Crea componenti web puliti, coerenti e funzionali. L'AI gestisce la sintassi, tu dirigi la strategia.</p>
                        </div>
                        <div className="border border-white/10 p-6 rounded-xl">
                            <Code className="h-8 w-8 mb-4 text-gray-400" />
                            <h3 className="font-bold text-xl mb-2">Controllo del Codice</h3>
                            <p className="text-gray-400">L'output è codice standard, modificabile e comprensibile. Nessuna piattaforma chiusa, nessuna dipendenza.</p>
                        </div>
                    </div>
                </section>

                <section id="form-section" className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">La Guida è il punto di ingresso.</h2>
                        <p className="text-lg text-gray-400 mb-6">Questo manuale operativo è un PDF che condensa il processo per passare da un'idea a un'interfaccia web funzionante. Non è teoria. È un protocollo. Lo rendiamo gratuito perché chi capisce questo oggi, domani costruirà progetti più importanti.</p>
                    </div>
                    {renderForm()}
                </section>

                <section>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Risultati Visibili.</h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto text-center mb-12">Non si tratta di creare siti vetrina. Si tratta di costruire interfacce pulite, essenziali e intelligenti per progetti reali.</p>
                </section>

                <section className="grid md:grid-cols-2 gap-8">
                    <div className="border border-white/10 rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Questo manuale è per te se:</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>- Pensi in termini di sistemi, non di pagine.</li>
                            <li>- Vuoi controllare la tecnologia, non subirla.</li>
                            <li>- Capisci che la velocità di esecuzione è un vantaggio strategico.</li>
                        </ul>
                    </div>
                    <div className="border border-white/20 bg-white/5 rounded-xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Non è per te se:</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>- Cerchi un trucco per evitare di pensare.</li>
                            <li>- Credi che l'AI sostituisca la visione.</li>
                            <li>- Preferisci la comodità alla competenza.</li>
                        </ul>
                    </div>
                </section>

                <section className="text-center border border-white/10 rounded-2xl p-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Dopo la guida.</h2>
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto">Il manuale fornisce le basi operative. Il passo successivo è ingegnerizzare una presenza online solida: dominio, sicurezza, performance. Una progressione naturale per chi costruisce in modo serio.</p>
                </section>

                <section className="text-center py-20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Inizia ora.</h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">Accedi al manuale. È una scelta, non un'offerta.</p>
                    <a href="#form-section" className="inline-block text-md font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out group bg-white hover:bg-gray-200 text-black">
                        Richiedi Accesso
                    </a>
                </section>
            </div>
            <footer className="max-w-4xl mx-auto p-8 text-center text-xs text-gray-500">
                <p className="mb-2">Marketers di Strada S.R.L. | P.IVA 1234567890 | Via Prova 1, 10100 Torino (TO)</p>
                <p><a href="/privacy-policy" className="hover:text-white">Privacy Policy</a> | <a href="/cookie-policy" className="hover:text-white">Cookie Policy</a></p>
                <p className="mt-4">Questo sito non fa parte del sito Facebook o Facebook Inc. Inoltre, questo sito NON è approvato da Facebook in alcun modo. FACEBOOK è un marchio registrato di FACEBOOK, Inc.</p>
            </footer>
        </div>
    );
};
