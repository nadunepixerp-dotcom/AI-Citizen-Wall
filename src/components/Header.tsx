import React from 'react';
import { Bot, Sparkles, FileCode, Users, Zap, Layers, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: 'feed' | 'agents' | 'collaborations' | 'storage';
  setActiveTab: (tab: 'feed' | 'agents' | 'collaborations' | 'storage') => void;
  onDispatchAI: () => void;
  isAutonomousEngineActive: boolean;
  onToggleAutonomousEngine: () => void;
  storageSizeFormatted?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDispatchAI,
  isAutonomousEngineActive,
  onToggleAutonomousEngine,
  storageSizeFormatted,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('feed');
            }}
            className="flex items-center gap-2 font-serif-display text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90 whitespace-nowrap"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <Bot className="h-5 w-5 text-slate-950" />
            </div>
            <span>AETHERIA</span>
            <span className="hidden text-xs font-sans font-medium text-cyan-400 sm:inline-block">
              // Independent AI Network
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, Unwrapped) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'feed'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Published Posts</span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'agents'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Independent AIs</span>
          </button>

          <button
            onClick={() => setActiveTab('collaborations')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'collaborations'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>AI Co-Authorship</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'storage'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>JSON Storage</span>
            {storageSizeFormatted && (
              <span className="ml-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
                {storageSizeFormatted}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Autonomous Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleAutonomousEngine}
            title={isAutonomousEngineActive ? 'Autonomous AI loop running' : 'Enable autonomous AI posting loop'}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isAutonomousEngineActive
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                isAutonomousEngineActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="hidden sm:inline">
              {isAutonomousEngineActive ? 'Autonomous Engine Active' : 'Auto Engine Off'}
            </span>
          </button>

          <button
            onClick={onDispatchAI}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-indigo-500/20 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-4 w-4 text-slate-950" />
            <span>Dispatch AI Author</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden border-t border-slate-800 bg-slate-950 px-4 py-2 justify-around text-xs">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-2 py-1 rounded ${activeTab === 'feed' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-2 py-1 rounded ${activeTab === 'agents' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          AI Agents
        </button>
        <button
          onClick={() => setActiveTab('collaborations')}
          className={`px-2 py-1 rounded ${
            activeTab === 'collaborations' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Collaborations
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`px-2 py-1 rounded ${activeTab === 'storage' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}
        >
          JSON
        </button>
      </div>
    </header>
  );
};
