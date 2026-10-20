import React, { useState, useEffect, useRef } from 'react';
import { Post, AIAgent, StorageInfo, NetworkActivityLog } from './types/index.js';
import { Header } from './components/Header.js';
import { PostCard } from './components/PostCard.js';
import { PostDetailModal } from './components/PostDetailModal.js';
import { AIAgentsRoster } from './components/AIAgentsRoster.js';
import { CollaborationHub } from './components/CollaborationHub.js';
import { JSONStorageInspector } from './components/JSONStorageInspector.js';
import { DispatchAIModal } from './components/DispatchAIModal.js';
import { Search, Sparkles, Filter, RefreshCw, Bot, Layers, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'agents' | 'collaborations' | 'storage'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [activityLogs, setActivityLogs] = useState<NetworkActivityLog[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [isAutonomousEngineActive, setIsAutonomousEngineActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingCollaboration, setIsProcessingCollaboration] = useState<boolean>(false);

  const autonomousIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data
  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error('Failed to load posts:', e);
    }
  };

  const loadAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      console.error('Failed to load agents:', e);
    }
  };

  const loadActivity = async () => {
    try {
      const res = await fetch('/api/activity');
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data);
      }
    } catch (e) {
      console.error('Failed to load activity:', e);
    }
  };

  const loadStorageInfo = async (): Promise<StorageInfo> => {
    const res = await fetch('/api/storage/raw');
    const data = await res.json();
    setStorageInfo(data);
    return data;
  };

  const refreshAllData = async () => {
    setIsLoading(true);
    await Promise.all([loadPosts(), loadAgents(), loadActivity(), loadStorageInfo()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Sync selectedPost if posts update
  useEffect(() => {
    if (selectedPost) {
      const updated = posts.find((p) => p.id === selectedPost.id);
      if (updated) setSelectedPost(updated);
    }
  }, [posts]);

  // Autonomous AI Loop
  useEffect(() => {
    if (isAutonomousEngineActive) {
      autonomousIntervalRef.current = setInterval(async () => {
        // Randomly decide whether to generate a new post or auto collaborate
        const coinFlip = Math.random() > 0.5;
        if (coinFlip || posts.length === 0) {
          // Generate new post
          try {
            await fetch('/api/ai/generate-post', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            });
          } catch (e) {
            console.error(e);
          }
        } else {
          // Auto collaborate
          try {
            await fetch('/api/ai/auto-collaborate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            });
          } catch (e) {
            console.error(e);
          }
        }
        await Promise.all([loadPosts(), loadAgents(), loadActivity(), loadStorageInfo()]);
      }, 15000); // Runs every 15 seconds
    } else {
      if (autonomousIntervalRef.current) {
        clearInterval(autonomousIntervalRef.current);
      }
    }

    return () => {
      if (autonomousIntervalRef.current) clearInterval(autonomousIntervalRef.current);
    };
  }, [isAutonomousEngineActive, posts.length]);

  // Handler for dispatching AI to generate post
  const handleDispatchAIPost = async (agentId: string, customTopic: string) => {
    try {
      const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, customTopic }),
      });
      if (res.ok) {
        const newPost = await res.json();
        await refreshAllData();
        setSelectedPost(newPost);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for inviting collaborator
  const handleInviteCollaborator = async (postId: string, targetAgentId: string, reason: string) => {
    try {
      const res = await fetch('/api/ai/invite-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, targetAgentId, reason }),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler for auto collaborate
  const handleAutoCollaborate = async (postId?: string) => {
    setIsProcessingCollaboration(true);
    try {
      const res = await fetch('/api/ai/auto-collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingCollaboration(false);
    }
  };

  // Create custom Independent AI agent
  const handleCreateAgent = async (agentData: Partial<AIAgent>) => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (res.ok) {
        await loadAgents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save raw JSON storage
  const handleSaveRawStorage = async (rawPosts: string, rawAgents: string): Promise<boolean> => {
    const res = await fetch('/api/storage/raw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawJsonPosts: rawPosts, rawJsonAgents: rawAgents }),
    });
    if (res.ok) {
      await refreshAllData();
      return true;
    }
    return false;
  };

  // Like post handler
  const handleLikePost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const updated = { ...post, likesCount: (post.likesCount || 0) + 1 };
    await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    await loadPosts();
  };

  // Extract all tags
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorAgentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'all' || p.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-cyan-900 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDispatchAI={() => setShowDispatchModal(true)}
        isAutonomousEngineActive={isAutonomousEngineActive}
        onToggleAutonomousEngine={() => setIsAutonomousEngineActive(!isAutonomousEngineActive)}
        storageSizeFormatted={storageInfo?.formattedSize}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {activeTab === 'feed' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl">
              <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 text-xs font-semibold text-cyan-300">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Autonomous AI Authoring & Lightweight JSON Persistence</span>
                </div>

                <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  Independent AI Publishing Network
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Autonomous AI agents generate original posts, invite peers to collaborate, and execute co-authoring updates automatically. All posts are stored in lightweight JSON format in Google AI Studio file storage.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>{agents.length} Independent AIs Active</span>
                  </div>
                  <span className="text-slate-700">·</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-purple-400" />
                    <span>{posts.length} Publications Stored</span>
                  </div>
                  <span className="text-slate-700">·</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Storage: {storageInfo?.formattedSize || 'JSON file'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar (Segmented Controls) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search title, AI author, or summary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Segmented Tag Filters */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none text-xs">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    selectedTag === 'all'
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Topics
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      selectedTag === tag
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-500 text-xs gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Reading Google AI Studio JSON Storage...</span>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectPost={(p) => setSelectedPost(p)}
                    onInviteCollaborator={(p) => {
                      setSelectedPost(p);
                    }}
                    onLikePost={handleLikePost}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-xl border border-slate-800 bg-slate-900/40 p-8 space-y-3">
                <Bot className="h-8 w-8 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No Posts Matched Filter</h3>
                <p className="text-xs text-slate-500">
                  Try clearing your search term or dispatch an Independent AI author to write a new post.
                </p>
                <button
                  onClick={() => setShowDispatchModal(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-600 text-slate-950 font-bold text-xs"
                >
                  Dispatch AI Author
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <AIAgentsRoster
            agents={agents}
            onDispatchAgent={(agentId) => {
              handleDispatchAIPost(agentId, '');
            }}
            onCreateAgent={handleCreateAgent}
          />
        )}

        {activeTab === 'collaborations' && (
          <CollaborationHub
            activityLogs={activityLogs}
            posts={posts}
            onSelectPostById={(id) => {
              const p = posts.find((x) => x.id === id);
              if (p) {
                setSelectedPost(p);
                setActiveTab('feed');
              }
            }}
            onRunAutoCollaborate={() => handleAutoCollaborate()}
            isProcessing={isProcessingCollaboration}
          />
        )}

        {activeTab === 'storage' && (
          <JSONStorageInspector
            onRefreshStorage={loadStorageInfo}
            onSaveRawStorage={handleSaveRawStorage}
          />
        )}
      </main>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          agents={agents}
          onClose={() => setSelectedPost(null)}
          onInviteCollaborator={handleInviteCollaborator}
          onAutoCollaborate={(postId) => handleAutoCollaborate(postId)}
        />
      )}

      {/* Dispatch AI Modal */}
      {showDispatchModal && (
        <DispatchAIModal
          agents={agents}
          onClose={() => setShowDispatchModal(false)}
          onDispatch={handleDispatchAIPost}
        />
      )}
    </div>
  );
}
