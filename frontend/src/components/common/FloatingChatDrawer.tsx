import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { ConversationPartner, DirectMessage } from '../../types';
import {
  MessageSquare,
  X,
  Send,
  ArrowLeft,
  Minimize2,
  Maximize2,
  CheckCheck,
} from 'lucide-react';

export const FloatingChatDrawer: React.FC = () => {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<ConversationPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ConversationPartner['partner'] | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/chat/unread-count');
      if (res.data.success) {
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (e) {
      // silent
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch (e) {
      // silent
    }
  };

  const fetchMessages = async (partnerId: number) => {
    try {
      const res = await api.get(`/chat/messages/${partnerId}`);
      if (res.data.success) {
        setMessages(res.data.data || []);
        setActivePartner(res.data.partner);
        fetchUnreadCount();
        fetchConversations();
      }
    } catch (e) {
      // silent
    }
  };

  // Check unread count periodically
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // When drawer opens, load conversations
  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  // When active partner is open, poll messages every 4s
  useEffect(() => {
    if (!activePartner || !isOpen) return;
    const interval = setInterval(() => {
      api.get(`/chat/messages/${activePartner.id}`).then((res) => {
        if (res.data.success) setMessages(res.data.data || []);
      }).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [activePartner, isOpen]);

  useEffect(() => {
    if (activePartner && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activePartner, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePartner || !inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/chat/messages/${activePartner.id}`, {
        message: text,
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        fetchConversations();
      }
    } catch (e) {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-full shadow-xl flex items-center gap-2 transition-all hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">Chat Kampus</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[460px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-navy text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activePartner && (
                <button
                  onClick={() => setActivePartner(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h4 className="font-bold text-xs">
                  {activePartner ? activePartner.name : 'Pesan Kampus'}
                </h4>
                <p className="text-[10px] text-slate-300 truncate">
                  {activePartner ? (activePartner.department || 'Civitas Kampus') : 'Obrolan langsung'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                setActivePartner(null);
              }}
              className="p-1.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          {!activePartner ? (
            /* Conversation List */
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Belum ada obrolan aktif.</p>
                  <a
                    href="/messages"
                    className="inline-block mt-2 text-brand-600 font-bold hover:underline"
                  >
                    Buka Halaman Pesan Penuh
                  </a>
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.partner.id}
                    onClick={() => fetchMessages(c.partner.id)}
                    className="p-3 flex items-center gap-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <img
                      src={c.partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.partner.name || 'U')}&background=2563EB&color=fff`}
                      alt={c.partner.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-navy truncate">{c.partner.name}</span>
                        {c.unread_count > 0 && (
                          <span className="px-1.5 py-0.2 bg-brand-600 text-white font-bold rounded-full text-[10px]">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {c.last_message?.message || 'Klik untuk membuka chat'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Active Chat View */
            <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Kirim pesan pertama ke {activePartner.name}
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === user.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Input Bar */}
              <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-slate-200 flex gap-1.5">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Footer Link to Full Page */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200/60 text-center">
            <a
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-brand-600 hover:underline"
            >
              Buka Semua Obrolan di Layar Penuh →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

