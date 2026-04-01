import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { UserProfile, SupportTicket, SupportMessage } from '../types';
import { supabase } from '../services/supabase';
import { isPaidStudent } from '../services/authUtils';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Send, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface SupportPageProps {
  user: UserProfile;
  unreadChatCount?: number;
}

export const SupportPage: React.FC<SupportPageProps> = ({ user, unreadChatCount = 0 }) => {
  const navigate = useNavigate();
  const isPaid = isPaidStudent(user);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPaid) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [isPaid]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      
      // Subscribe to new messages for this ticket
      const channel = supabase
        .channel(`ticket_${selectedTicket.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'support_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        }, (payload) => {
          console.log('New message received via Realtime:', payload);
          const newMessage = payload.new as SupportMessage;
          setMessages(prev => {
            // Evita duplicati se il messaggio è già stato aggiunto localmente
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        })
        .subscribe((status) => {
          console.log(`Realtime subscription status for ticket ${selectedTicket.id}:`, status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    setSending(true);
    try {
      // 1. Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          subject: newTicketSubject,
          status: 'open'
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // 2. Create the first message
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticket.id,
          sender_id: user.id,
          message: newTicketMessage
        }]);

      if (messageError) throw messageError;

      // 3. Notify Admin via Email
      try {
        const emailPayload = {
          ticketId: ticket.id,
          userEmail: user.email,
          userName: user.full_name || user.email,
          subject: newTicketSubject,
          message: newTicketMessage
        };
        
        console.log('Sending admin notification email...', emailPayload);
        
        const response = await fetch('/api/notify-admin-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error notifying admin:', errorData);
        } else {
          console.log('Admin notified successfully');
        }
      } catch (emailErr) {
        console.error('Failed to notify admin via email:', emailErr);
      }

      // Reset form and refresh
      setNewTicketSubject('');
      setNewTicketMessage('');
      setShowNewTicketForm(false);
      fetchTickets();
      setSelectedTicket(ticket);
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Errore durante la creazione del ticket. Riprova.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    const messageText = newMessage;
    setNewMessage('');
    
    try {
      const { data: insertedMessage, error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          message: messageText
        }])
        .select()
        .single();

      if (error) throw error;

      // Aggiornamento ottimistico locale per feedback istantaneo
      if (insertedMessage) {
        setMessages(prev => {
          if (prev.find(m => m.id === insertedMessage.id)) return prev;
          return [...prev, insertedMessage as SupportMessage];
        });
      }

      // Update ticket updated_at
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedTicket.id);

    } catch (err) {
      console.error('Error sending message:', err);
      alert('Errore durante l\'invio del messaggio.');
    }
  };

  if (!isPaid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <Sidebar activeItem="support" onNavigate={navigate} user={user} unreadCount={unreadChatCount} />
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Supporto Riservato</h1>
            <p className="text-gray-600 mb-8">
              L'assistenza diretta è riservata esclusivamente agli studenti che hanno acquistato almeno un percorso formativo.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all"
            >
              Scopri i Percorsi
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar activeItem="support" onNavigate={navigate} user={user} unreadCount={unreadChatCount} />
      
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {selectedTicket && (
              <button 
                onClick={() => setSelectedTicket(null)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Supporto Assistenza</h1>
              <p className="text-sm text-gray-500">Siamo qui per aiutarti</p>
            </div>
          </div>
          {!selectedTicket && !showNewTicketForm && (
            <button 
              onClick={() => setShowNewTicketForm(true)}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 transition-all text-sm"
            >
              <Plus className="h-4 w-4" />
              Nuovo Ticket
            </button>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Ticket List */}
          <div className={`w-full lg:w-80 border-r border-gray-200 bg-white overflow-y-auto ${selectedTicket ? 'hidden lg:block' : 'block'}`}>
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Nessun ticket aperto</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowNewTicketForm(false);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-brand-50/50 border-l-4 border-brand-600' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {ticket.status === 'open' ? 'Aperto' : 'Chiuso'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(ticket.updated_at), 'dd MMM', { locale: it })}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500 mt-1">Clicca per visualizzare</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Content */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden">
            {showNewTicketForm ? (
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <button 
                    onClick={() => setShowNewTicketForm(false)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Torna alla lista
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Apri un nuovo ticket</h2>
                  <form onSubmit={handleCreateTicket} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Oggetto</label>
                      <input 
                        type="text"
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value)}
                        placeholder="Es: Problema con l'accesso al corso"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Messaggio</label>
                      <textarea 
                        value={newTicketMessage}
                        onChange={(e) => setNewTicketMessage(e.target.value)}
                        placeholder="Descrivi il tuo problema in dettaglio..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={sending}
                      className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      Invia Ticket
                    </button>
                  </form>
                </div>
              </div>
            ) : selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{selectedTicket.subject}</h2>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Ticket #{selectedTicket.id.slice(0, 8)}</span>
                        <span className="text-gray-300">•</span>
                        <span className={selectedTicket.status === 'open' ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {selectedTicket.status === 'open' ? 'In attesa di risposta' : 'Risolto'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                  {messages.map((msg) => {
                    const isUser = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                          isUser 
                            ? 'bg-brand-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          {!isUser && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Supporto Admin</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <div className={`text-[10px] mt-2 ${isUser ? 'text-brand-100' : 'text-gray-400'}`}>
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {selectedTicket.status === 'open' ? (
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Scrivi un messaggio..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      />
                      <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-500 italic">Questo ticket è stato chiuso.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                  <HelpCircle className="h-10 w-10 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Benvenuto nel Supporto</h2>
                <p className="text-gray-500 max-w-sm mb-8">
                  Seleziona un ticket dalla lista o creane uno nuovo per ricevere assistenza dal nostro team.
                </p>
                <button 
                  onClick={() => setShowNewTicketForm(true)}
                  className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                >
                  Apri il tuo primo ticket
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const HelpCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);
