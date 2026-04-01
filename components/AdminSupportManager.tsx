import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { SupportTicket, SupportMessage, UserProfile } from '../types';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Send, 
  Search, 
  Filter, 
  Loader2, 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const AdminSupportManager: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`admin_ticket_${selectedTicket.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'support_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        }, (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as SupportMessage];
          });
        })
        .subscribe();

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
      // Fetch tickets with user info
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const formattedTickets = data.map((t: any) => {
        // Handle both object and array response for joined profiles
        const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
        return {
          ...t,
          user_name: profile?.full_name,
          user_email: profile?.email
        };
      });

      setTickets(formattedTickets);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const messageText = newMessage;
    setNewMessage('');
    setSending(true);
    
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

      // Aggiornamento ottimistico locale
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
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async (ticket: SupportTicket) => {
    const newStatus = ticket.status === 'open' ? 'closed' : 'open';
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticket.id);

      if (error) throw error;
      
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating ticket status:', err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = 
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-[700px]">
      {/* Sidebar List */}
      <div className={`w-full lg:w-96 border-r border-gray-100 flex flex-col ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Cerca ticket, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'open', 'closed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tutti' : f === 'open' ? 'Aperti' : 'Chiusi'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Nessun ticket trovato
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-brand-50/50 border-l-4 border-brand-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {ticket.status === 'open' ? 'Aperto' : 'Chiuso'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(ticket.updated_at), 'dd MMM HH:mm', { locale: it })}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{ticket.subject}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span className="truncate">{ticket.user_name || ticket.user_email}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h2 className="font-bold text-gray-900">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedTicket.user_email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(selectedTicket.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(selectedTicket)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedTicket.status === 'open' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedTicket.status === 'open' ? (
                  <><CheckCircle2 className="h-4 w-4" /> Chiudi Ticket</>
                ) : (
                  <><RefreshCw className="h-4 w-4" /> Riapri Ticket</>
                )}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => {
                const isAdmin = msg.sender_id !== selectedTicket.user_id;
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      isAdmin 
                        ? 'bg-brand-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <div className={`text-[10px] mt-2 ${isAdmin ? 'text-brand-100' : 'text-gray-400'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedTicket.status === 'open' ? (
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Rispondi allo studente..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">Ticket chiuso. Riaprilo per inviare nuovi messaggi.</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gestione Supporto</h2>
            <p className="text-gray-500 max-w-sm">
              Seleziona un ticket dalla lista per visualizzare la conversazione e rispondere allo studente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);
