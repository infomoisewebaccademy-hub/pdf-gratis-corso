
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { Send, Users, ShieldCheck, Loader2, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

interface CommunityChatProps {
  user: UserProfile;
  unreadChatCount?: number;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ user, unreadChatCount = 0 }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 1. Caricamento messaggi iniziali
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) console.error("Errore fetch chat:", error);
      else setMessages(data || []);
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    fetchMessages();

    // 2. Sottoscrizione Realtime
    const channel = supabase
      .channel('public:community_messages')
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_messages' 
      }, payload => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
          setTimeout(scrollToBottom, 50);
      })
      .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'community_messages'
      }, () => {
          // Se vengono eliminati messaggi (es. reset), ricarichiamo la lista
          fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert([{
          user_id: user.id,
          user_name: user.full_name || 'Studente MWA',
          text: textToSend
        }]);

      if (error) throw error;
    } catch (err: any) {
      alert("Errore invio: " + err.message);
      setNewMessage(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
      if (!user.is_admin) return;
      if (!confirm("⚠️ SEI SICURO? Questa azione cancellerà DEFINITIVAMENTE tutti i messaggi della community. Non è possibile annullare.")) return;

      setIsClearing(true);
      try {
          // Eliminiamo tutti i messaggi (usando una condizione sempre vera come id non nullo)
          const { error } = await supabase
              .from('community_messages')
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000'); // Elimina tutto

          if (error) throw error;
          setMessages([]);
          alert("Chat ripulita con successo.");
      } catch (err: any) {
          alert("Errore durante il reset: " + err.message);
      } finally {
          setIsClearing(false);
      }
  };

  return (
    <div className="pt-20 min-h-screen bg-white flex">
      <Sidebar activeItem="community" onNavigate={(path) => navigate(path)} unreadCount={unreadChatCount} />

      <main className="flex-1 flex flex-col bg-gray-50/50 h-[calc(100vh-80px)]">
        
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <div className="bg-brand-500/10 p-2.5 rounded-xl text-brand-600">
                    <Users className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Community Chat</h1>
                    <p className="text-xs text-green-500 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Area Studenti Real-time
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {user.is_admin && (
                    <button 
                        onClick={handleClearChat}
                        disabled={isClearing}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                        title="Resetta tutta la chat"
                    >
                        {isClearing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Reset Chat
                    </button>
                )}
                <div className="hidden md:flex items-center gap-2 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                    <ShieldCheck className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-bold text-brand-700 uppercase tracking-tighter">Supporto Moderato</span>
                </div>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
                    <p className="font-bold">Caricamento messaggi...</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <Sparkles className="h-12 w-12 opacity-20" />
                    <p className="font-bold text-center">La chat è stata ripulita.<br/>Inizia una nuova conversazione!</p>
                </div>
            ) : (
                messages.map((msg) => {
                    const isMe = msg.user_id === user.id;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {isMe ? 'Tu' : msg.user_name}
                                </span>
                                <span className="text-[9px] text-gray-300">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                                isMe 
                                ? 'bg-brand-600 text-white rounded-tr-none' 
                                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrivi un messaggio alla community..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-gray-700 font-medium"
                    disabled={isSending || isClearing}
                />
                <button 
                    type="submit"
                    disabled={!newMessage.trim() || isSending || isClearing}
                    className="bg-brand-600 text-white p-4 rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:hover:bg-brand-600"
                >
                    {isSending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">
                Comportati con rispetto verso gli altri studenti.
            </p>
        </div>

      </main>
    </div>
  );
};
