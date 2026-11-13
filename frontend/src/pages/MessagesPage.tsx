import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { ConversationPartner, DirectMessage, User } from '../types';
import { Modal } from '../components/ui/Modal';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  UserCheck,
  UserPlus,
  CheckCheck,
  Clock,
  Sparkles,
  ArrowLeft,
  Users,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  BellOff,
  ShieldAlert,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState<ConversationPartner[]>([]);
  const [activePartner, setActivePartner] = useState<ConversationPartner['partner'] | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Attachment state
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState<'image' | 'document'>('image');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // In-chat search
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');

  // Search in conversation list
  const [searchQuery, setSearchQuery] = useState('');

  // New Chat Modal state
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Follow state for active partner
  const [partnerFollowing, setPartnerFollowing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (partnerId: number) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/messages/${partnerId}`);
      if (res.data.success) {
        setMessages(res.data.data || []);
        setActivePartner(res.data.partner);
        // Refresh conversations to update unread badge
        fetchConversations();
        // Check follow status
        checkFollowStatus(partnerId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const checkFollowStatus = async (targetId: number) => {
    try {
      const res = await api.get(`/users/${targetId}/follow-status`);
      if (res.data.success) {
        setPartnerFollowing(res.data.data.is_following);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFollow = async () => {
    if (!activePartner) return;
    try {
      const res = await api.post(`/users/${activePartner.id}/follow`);
      if (res.data.success) {
        setPartnerFollowing(res.data.is_following);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();

    // Check if partner was passed via route state e.g. navigate('/messages', { state: { partnerId: 123 } })
    const statePartnerId = (location.state as any)?.partnerId;
    if (statePartnerId) {
      fetchMessages(statePartnerId);
    }
  }, [location.state]);

  // Polling for incoming messages every 4 seconds when in active conversation
  useEffect(() => {
    if (!activePartner) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/chat/messages/${activePartner.id}`);
        if (res.data.success) {
          setMessages(res.data.data || []);
        }
      } catch (e) {
        // silent fail on polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activePartner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUploadAttachment = async (file: File) => {
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.url) {
        setAttachmentUrl(res.data.url);
        setAttachmentName(file.name);
        setAttachmentType(file.type.startsWith('image/') ? 'image' : 'document');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah lampiran.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePartner || (!inputText.trim() && !attachmentUrl) || sending) return;

    const textToSend = inputText.trim();
    const curAttachmentUrl = attachmentUrl;
    const curAttachmentName = attachmentName;
    const curAttachmentType = attachmentType;

    setInputText('');
    setAttachmentUrl('');
    setAttachmentName('');
    setSending(true);

    try {
      const res = await api.post(`/chat/messages/${activePartner.id}`, {
        message: textToSend || (curAttachmentType === 'image' ? '[Foto Lampiran]' : '[Berkas Lampiran]'),
        attachment_url: curAttachmentUrl || null,
        attachment_name: curAttachmentName || null,
        attachment_type: curAttachmentType || null,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        fetchConversations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const handleMutePartner = async () => {
    if (!activePartner) return;
    try {
      const res = await api.post(`/users/${activePartner.id}/mute`);
      if (res.data.success) {
        alert(res.data.message || 'Pengguna berhasil dibisukan.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membisukan obrolan.');
    }
  };

  const handleBlockPartner = async () => {
    if (!activePartner) return;
    if (!window.confirm(`Yakin ingin memblokir ${activePartner.name}? Pengguna ini tidak akan dapat mengirim pesan lagi kepada Anda.`)) return;
    try {
      const res = await api.post(`/users/${activePartner.id}/block`);
      if (res.data.success) {
        alert('Pengguna telah diblokir.');
        setActivePartner(null);
        fetchConversations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memblokir pengguna.');
    }
  };

  const handleOpenNewChatModal = async () => {
    setNewChatModalOpen(true);
    setLoadingUsers(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        const userList: User[] = res.data.data.data || res.data.data || [];
        const isCurrentSuperAdmin = user?.email === 'superadmin@campusconnect.id' || (user as any)?.roleAssignments?.some((ra: any) => ra.role?.slug === 'super_admin');

        const filtered = userList.filter((u: any) => {
          if (u.id === user?.id) return false;
          // Protect Super Admin accounts from direct chat lists for regular users
          if (!isCurrentSuperAdmin) {
            const isTargetAdmin = u.email === 'superadmin@campusconnect.id' ||
              u.role_assignments?.some((ra: any) => ra.role?.slug === 'super_admin') ||
              u.roleAssignments?.some((ra: any) => ra.role?.slug === 'super_admin');
            if (isTargetAdmin) return false;
          }
          return true;
        });

        setAvailableUsers(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUserForChat = (selectedUser: User) => {
    setNewChatModalOpen(false);
    setActivePartner({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      avatar: selectedUser.avatar,
      department: selectedUser.student_profile?.department?.name || 'Civitas Kampus',
    });
    fetchMessages(selectedUser.id);
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredConversations = conversations.filter((c) =>
    c.partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto font-sans h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white rounded-3xl border border-borderMuted shadow-xs flex-1 flex overflow-hidden">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${
            activePartner ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-navy text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                Pesan Kampus (DM)
              </h2>
              <span className="text-[11px] text-slate-400">Obrolan langsung civitas kampus</span>
            </div>

            <button
              onClick={handleOpenNewChatModal}
              className="p-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
              title="Mulai Chat Baru"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Chat Baru</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-6 text-center text-slate-400 text-xs">Memuat daftar pesan...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-3">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Belum ada riwayat pesan.</p>
                <button
                  onClick={handleOpenNewChatModal}
                  className="px-3.5 py-1.5 bg-brand-600 text-white rounded-xl font-bold text-xs"
                >
                  Mulai Obrolan Pertama
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activePartner?.id === conv.partner.id;

                return (
                  <div
                    key={conv.partner.id}
                    onClick={() => fetchMessages(conv.partner.id)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.partner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner.name || 'U')}&background=2563EB&color=fff`}
                        alt={conv.partner.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-extrabold text-navy text-xs truncate">
                          {conv.partner.name}
                        </span>
                        {conv.last_message && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {formatMessageTime(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.last_message?.message || 'Percakapan baru dimulai'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="px-1.5 py-0.5 bg-brand-600 text-white font-bold rounded-full text-[10px] shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Feed */}
        <div className={`flex-1 flex flex-col bg-slate-50/40 ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
          {!activePartner ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-navy text-base">Pusat Pesan Langsung CampusConnect</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Pilih percakapan di sebelah kiri atau klik tombol "Chat Baru" untuk mulai berinteraksi dengan mahasiswa dan dosen secara privat.
              </p>
              <button
                onClick={handleOpenNewChatModal}
                className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Obrolan Baru</span>
              </button>
            </div>
          ) : (
            <>
              {/* Partner Chat Header */}
              <div className="p-3.5 bg-white border-b border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActivePartner(null)}
                      className="md:hidden p-1 text-slate-400 hover:text-navy"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <Link
                      to={`/profile/${activePartner.id}`}
                      className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
                      title="Buka profil pengguna"
                    >
                      <img
                        src={activePartner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner.name || 'U')}&background=2563EB&color=fff`}
                        alt={activePartner.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-brand-400 transition-all"
                      />

                      <div>
                        <h3 className="font-bold text-navy text-xs sm:text-sm group-hover:text-brand-600 transition-colors">{activePartner.name}</h3>
                        <p className="text-[11px] text-slate-400">{activePartner.department || 'Civitas Kampus'}</p>
                      </div>
                    </Link>
                  </div>

                  {/* Actions: Search, Mute, Block, Follow */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setInChatSearchOpen(!inChatSearchOpen)}
                      className={`p-1.5 rounded-xl transition-colors ${inChatSearchOpen ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                      title="Cari kata kunci dalam percakapan ini"
                    >
                      <Search className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleMutePartner}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Bisukan notifikasi obrolan ini"
                    >
                      <BellOff className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleBlockPartner}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Blokir pengguna ini"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleToggleFollow}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                        partnerFollowing
                          ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
                      }`}
                    >
                      {partnerFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Mengikuti</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* In-Chat Search Bar */}
                {inChatSearchOpen && (
                  <div className="relative pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari pesan dalam obrolan..."
                      value={inChatSearchQuery}
                      onChange={(e) => setInChatSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                      autoFocus
                    />
                    {inChatSearchQuery && (
                      <button
                        onClick={() => setInChatSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="text-center py-8 text-slate-400 text-xs">Memuat obrolan...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                    <p>Belum ada pesan dengan {activePartner.name}.</p>
                    <p className="text-[11px] text-slate-400">Kirim pesan pertama untuk memulai obrolan!</p>
                  </div>
                ) : (
                  (inChatSearchQuery
                    ? messages.filter((m) =>
                        m.message.toLowerCase().includes(inChatSearchQuery.toLowerCase()) ||
                        m.attachment_name?.toLowerCase().includes(inChatSearchQuery.toLowerCase())
                      )
                    : messages
                  ).map((m) => {
                    const isMe = m.sender_id === user?.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message}</p>

                          {/* Image Attachment */}
                          {m.attachment_url && (m.attachment_type === 'image' || m.attachment_url.match(/\.(jpg|jpeg|png|webp|gif)/i)) && (
                            <img
                              src={m.attachment_url}
                              alt="Attachment preview"
                              onClick={() => window.open(m.attachment_url, '_blank')}
                              className="mt-2 rounded-xl max-h-56 object-cover cursor-pointer hover:opacity-95 transition-opacity border border-white/20"
                            />
                          )}

                          {/* Document Attachment */}
                          {m.attachment_url && m.attachment_type === 'document' && !m.attachment_url.match(/\.(jpg|jpeg|png|webp|gif)/i) && (
                            <a
                              href={m.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-2 p-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-colors ${
                                isMe ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              }`}
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="truncate">{m.attachment_name || 'Lampiran Berkas'}</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono px-1">
                          <span>{formatMessageTime(m.created_at)}</span>
                          {isMe && (
                            <CheckCheck
                              className={`w-3.5 h-3.5 ${m.is_read ? 'text-brand-600' : 'text-slate-300'}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                {/* Attached Preview Chip */}
                {attachmentUrl && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {attachmentType === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-brand-600 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 truncate">{attachmentName || attachmentUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentUrl('');
                        setAttachmentName('');
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <label
                    className={`p-2.5 rounded-2xl border border-slate-200 text-slate-500 hover:text-brand-600 hover:bg-slate-50 cursor-pointer transition-colors ${
                      uploadingAttachment ? 'animate-pulse opacity-50' : ''
                    }`}
                    title="Unggah foto atau dokumen"
                  >
                    <Paperclip className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadAttachment(e.target.files[0])}
                    />
                  </label>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Ketik pesan untuk ${activePartner.name}... (Tekan Enter)`}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                  />

                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !attachmentUrl) || sending}
                    className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-2xl transition-colors shadow-xs"
                    title="Kirim Pesan"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal: Start New Chat with Campus Member */}
      <Modal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        title="Mulai Percakapan Baru"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Cari mahasiswa atau dosen untuk memulai obrolan langsung secara privat.
          </p>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
            {loadingUsers ? (
              <div className="text-center py-4 text-slate-400">Memuat civitas kampus...</div>
            ) : filteredAvailableUsers.length === 0 ? (
              <div className="text-center py-4 text-slate-400">Tidak ada pengguna yang cocok.</div>
            ) : (
              filteredAvailableUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUserForChat(u)}
                  className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=2563EB&color=fff`}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-navy">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>

                  <button className="px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg font-bold text-xs">
                    Kirim Pesan
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

