import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { DiscussionPost, DiscussionCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  MessagesSquare,
  Plus,
  Search,
  MessageCircle,
  Eye,
  Pin,
  Send,
  Flag,
  User,
} from 'lucide-react';

export const DiscussionsPage: React.FC = () => {
  const { user, activeAssignment } = useAuth();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [categories, setCategories] = useState<DiscussionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // View post modal
  const [activePost, setActivePost] = useState<DiscussionPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  // New Topic Modal
  const [newTopicModal, setNewTopicModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [savingTopic, setSavingTopic] = useState(false);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/discussions', {
        params: {
          university_id: activeAssignment?.university_id,
          category_id: selectedCategory || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setPosts(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/discussion-categories').then((res) => {
      if (res.data.success) setCategories(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory, activeAssignment]);

  const openPostDetail = async (id: number) => {
    try {
      const res = await api.get(`/discussions/${id}`);
      if (res.data.success) {
        setActivePost(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTopic(true);
    try {
      const res = await api.post('/discussions', {
        university_id: activeAssignment?.university_id || 1,
        category_id: parseInt(categoryId),
        title,
        content,
      });

      if (res.data.success) {
        setNewTopicModal(false);
        setTitle('');
        setContent('');
        fetchDiscussions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTopic(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !newComment.trim()) return;
    setCommenting(true);

    try {
      const res = await api.post(`/discussions/${activePost.id}/comments`, {
        content: newComment,
      });

      if (res.data.success) {
        setNewComment('');
        openPostDetail(activePost.id);
        fetchDiscussions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommenting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <MessagesSquare className="w-6 h-6 text-brand-600" />
            Campus Discussion Space
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exchange scholarly ideas, project collaboration requests, tips, and constructive peer conversations
          </p>
        </div>

        <button
          onClick={() => setNewTopicModal(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Start New Topic
        </button>
      </div>

      {/* Categories & Search */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === '' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Channels
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === c.id.toString()
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDiscussions()}
            placeholder="Search discussions..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Discussion List */}
      <div className="bg-white rounded-2xl border border-borderMuted shadow-xs divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading discussion threads...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <MessagesSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No topics in this channel</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first student or lecturer to post a question or topic.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => openPostDetail(post.id)}
              className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}`}
                  alt={post.author?.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {post.is_pinned && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: `${post.category?.color || '#2563EB'}15`, color: post.category?.color || '#2563EB' }}
                    >
                      {post.category?.name || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      By <strong>{post.author?.name}</strong> • {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-navy">{post.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{post.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 self-end sm:self-center font-medium">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  {post.comments_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {post.views_count || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Detail Modal */}
      <Modal
        isOpen={!!activePost}
        onClose={() => setActivePost(null)}
        title={activePost?.title || 'Discussion Topic'}
        maxWidth="2xl"
      >
        {activePost && (
          <div className="space-y-6 text-xs">
            {/* Author info */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <img
                src={activePost.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activePost.author?.name || 'U')}`}
                alt={activePost.author?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">{activePost.author?.name}</div>
                <div className="text-slate-400 text-[11px]">
                  Posted on {new Date(activePost.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {activePost.content}
            </div>

            {/* Comments List */}
            <div>
              <h4 className="font-bold text-navy uppercase tracking-wider mb-3">
                Responses ({activePost.comments?.length || 0})
              </h4>

              <div className="space-y-3">
                {(!activePost.comments || activePost.comments.length === 0) ? (
                  <div className="text-center py-4 text-slate-400">No responses yet. Share your thoughts below!</div>
                ) : (
                  activePost.comments.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{c.author?.name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
              <input
                type="text"
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a constructive response..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
              <button
                type="submit"
                disabled={commenting}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Reply
              </button>
            </form>
          </div>
        )}
      </Modal>

      {/* Start Topic Modal */}
      <Modal
        isOpen={newTopicModal}
        onClose={() => setNewTopicModal(false)}
        title="Start New Discussion Topic"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Channel / Category</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            >
              <option value="">Select Channel...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Topic Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best practices for microservice design in final year thesis"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Discussion Body</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share context, questions, code examples, or insights..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={savingTopic}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {savingTopic ? 'Posting...' : 'Start Discussion'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

