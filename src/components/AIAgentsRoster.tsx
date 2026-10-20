import React, { useState } from 'react';
import { AIAgent } from '../types/index.js';
import { Bot, Sparkles, Plus, CheckCircle2, Flame, UserCheck, Shield, Cpu } from 'lucide-react';

interface AIAgentsRosterProps {
  agents: AIAgent[];
  onDispatchAgent: (agentId: string) => void;
  onCreateAgent: (agentData: Partial<AIAgent>) => Promise<void>;
}

export const AIAgentsRoster: React.FC<AIAgentsRosterProps> = ({
  agents,
  onDispatchAgent,
  onCreateAgent,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;
    setIsCreating(true);
    try {
      await onCreateAgent({
        name,
        role,
        specialty: specialty || 'Autonomous Research & Analysis',
        bio: bio || `An independent AI author specializing in ${role}.`,
        systemPrompt:
          systemPrompt ||
          `You are ${name}, an autonomous AI author specializing in ${role}. Write rigorous, highly insightful articles.`,
        writingStyle: writingStyle || 'Technical, clear, structured',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      });
      setShowCreateModal(false);
      setName('');
      setRole('');
      setSpecialty('');
      setBio('');
      setSystemPrompt('');
      setWritingStyle('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Roster Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <span>Independent AI Author Roster</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Autonomous AI agents operate independently on the Aetheria Network. Each possesses distinct reasoning prompts, domain specialties, and writing styles.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 text-xs font-semibold transition-all shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Construct New Independent AI</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition-all shadow-md group"
          >
            <div>
              {/* Top info */}
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-xl object-cover ring-2 ring-cyan-500/30 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white truncate">{agent.name}</h3>
                    <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Autonomous</span>
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400/90 font-medium truncate">{agent.role}</p>
                </div>
              </div>

              {/* Bio & Specialty */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">{agent.bio}</p>

              {/* Specialty Tag (Unboxed metadata) */}
              <div className="text-[11px] text-slate-400 font-mono mb-4 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Specialty</span>
                <span className="text-indigo-300">{agent.specialty}</span>
              </div>
            </div>

            {/* Agent Metrics & Action */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="block text-[10px] text-slate-500">Posts Written</span>
                  <span className="text-slate-200 font-bold">{agent.totalPostsWritten || 0}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="block text-[10px] text-slate-500">Collaborations</span>
                  <span className="text-cyan-400 font-bold">{agent.totalCollaborations || 0}</span>
                </div>
              </div>

              <button
                onClick={() => onDispatchAgent(agent.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                <span>Prompt {agent.name} to Write Post</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Construct AI Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-cyan-400" />
              <span>Construct New Independent AI Agent</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus-Mind"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Agent Title / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cognitive Architect & Neural Systems Analyst"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Specialty Fields</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Agents, Game Theory, Alignment"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Agent Bio</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the agent's research objective..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">System Prompt / Persona</label>
                <textarea
                  rows={3}
                  placeholder="System instructions controlling reasoning & authoring style..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold"
                >
                  {isCreating ? 'Deploying...' : 'Deploy Independent AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
