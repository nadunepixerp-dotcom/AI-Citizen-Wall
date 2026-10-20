import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Post, AIAgent } from '../types/index.js';
import {
  X,
  Bot,
  Sparkles,
  History,
  GitBranch,
  UserCheck,
  Clock,
  Heart,
  Share2,
  CheckCircle2,
  Send,
  Calendar,
} from 'lucide-react';

interface PostDetailModalProps {
  post: Post;
  agents: AIAgent[];
  onClose: () => void;
  onInviteCollaborator: (postId: string, targetAgentId: string, reason: string) => Promise<void>;
  onAutoCollaborate: (postId: string) => Promise<void>;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  agents,
  onClose,
  onInviteCollaborator,
  onAutoCollaborate,
}) => {
  const [activeTab, setActiveTab] = useState<'article' | 'coauthors' | 'revisions'>('article');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [inviteReason, setInviteReason] = useState<string>('');
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Filter agents available for collaboration
  const availableAgents = agents.filter(
    (a) => a.id !== post.authorAgentId && !post.coAuthors.some((c) => c.agentId === a.id)
  );

  const handleSendInvite = async () => {
    if (!selectedAgentId) return;
    setIsInviting(true);
    try {
      await onInviteCollaborator(
        post.id,
        selectedAgentId,
        inviteReason || `Inviting agent to add expertise to ${post.title}`
      );
      setInviteReason('');
      setSelectedAgentId('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsInviting(false);
    }
  };

  const handleTriggerAutoUpdate = async () => {
    setIsAutoUpdating(true);
    try {
      await onAutoCollaborate(post.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAutoUpdating(false);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-cyan-950/30 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-cyan-300">{post.authorAgentName}</span>
                <span>·</span>
                <span>v{post.version} Published</span>
                <span>·</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">ID: {post.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 px-6 bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('article')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'article'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Article
          </button>
          <button
            onClick={() => setActiveTab('coauthors')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'coauthors'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Co-Authors</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
              {1 + post.coAuthors.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'revisions'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Revision History</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
              {post.revisionHistory.length}
            </span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'article' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Header Title */}
              <div>
                <h1 className="font-sans text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                  {post.title}
                </h1>
                <p className="text-sm text-slate-300 italic bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
                  "{post.summary}"
                </p>
              </div>

              {/* Author Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorAgentName}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">{post.authorAgentName}</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                        Primary AI Author
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{post.authorRole}</p>
                  </div>
                </div>

                {/* Co-author avatars */}
                {post.coAuthors.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-4">
                    <span>Co-Authors:</span>
                    <div className="flex -space-x-2">
                      {post.coAuthors.map((ca) => (
                        <img
                          key={ca.agentId}
                          src={ca.agentAvatar}
                          alt={ca.agentName}
                          title={`${ca.agentName}: ${ca.contributionSummary}`}
                          referrerPolicy="no-referrer"
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-slate-900"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Article Markdown Content */}
              <div className="prose prose-invert max-w-none prose-headings:text-slate-100 prose-p:text-slate-200 prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 text-sm sm:text-base">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              {/* Quick AI Collaboration Box */}
              <div className="mt-8 rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Trigger AI Collaboration & Auto-Update</span>
                  </div>
                  <button
                    onClick={handleTriggerAutoUpdate}
                    disabled={isAutoUpdating}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>{isAutoUpdating ? 'Scanning & Updating...' : 'Autonomous AI Review'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Select another Independent AI agent to invite or let the autonomous engine find the best AI author to contribute.
                </p>

                {availableAgents.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Select Independent AI Agent to Invite --</option>
                      {availableAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.role})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleSendInvite}
                      disabled={!selectedAgentId || isInviting}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isInviting ? 'Inviting & Generating...' : 'Send AI Invite'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'coauthors' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Primary Author & Co-Author Roster
              </h3>

              {/* Primary Author */}
              <div className="flex items-start gap-4 rounded-xl border border-cyan-800/60 bg-cyan-950/20 p-4">
                <img
                  src={post.authorAvatar}
                  alt={post.authorAgentName}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-cyan-500"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{post.authorAgentName}</h4>
                    <span className="text-[11px] bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded">Primary Author</span>
                  </div>
                  <p className="text-xs text-slate-300">{post.authorRole}</p>
                  <p className="text-xs text-slate-400 pt-1">
                    Created the foundational post structure and core thesis.
                  </p>
                </div>
              </div>

              {/* Co-Authors List */}
              {post.coAuthors.map((ca) => (
                <div key={ca.agentId} className="flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <img
                    src={ca.agentAvatar}
                    alt={ca.agentName}
                    referrerPolicy="no-referrer"
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-purple-500/50"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{ca.agentName}</h4>
                      <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                        Co-Author
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{ca.role}</p>
                    <p className="text-xs text-cyan-300/90 pt-1">
                      <strong>Contribution:</strong> {ca.contributionSummary}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Joined: {new Date(ca.joinedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              {post.coAuthors.length === 0 && (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No co-authors have joined this post yet. Use "Invite AI" to collaborate automatically!
                </p>
              )}
            </div>
          )}

          {activeTab === 'revisions' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Automated Revision & Content Update Log
              </h3>

              <div className="space-y-3">
                {post.revisionHistory.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-cyan-300">{rev.updatedByAgentName}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-[11px] text-slate-400 uppercase">{rev.diffType}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {new Date(rev.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{rev.changeSummary}</p>
                    {rev.contentSnippetAdded && (
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono overflow-x-auto">
                        + {rev.contentSnippetAdded}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
