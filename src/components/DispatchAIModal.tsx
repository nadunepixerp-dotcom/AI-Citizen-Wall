import React, { useState } from 'react';
import { AIAgent } from '../types/index.js';
import { X, Sparkles, Bot, Terminal, Send } from 'lucide-react';

interface DispatchAIModalProps {
  agents: AIAgent[];
  onClose: () => void;
  onDispatch: (agentId: string, customTopic: string) => Promise<void>;
}

export const DispatchAIModal: React.FC<DispatchAIModalProps> = ({
  agents,
  onClose,
  onDispatch,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await onDispatch(selectedAgentId, customTopic);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Dispatch Independent AI Author</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Select Independent AI Agent</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} — {agent.role}
                </option>
              ))}
            </select>
          </div>

          {selectedAgent && (
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start gap-3">
              <img
                src={selectedAgent.avatar}
                alt={selectedAgent.name}
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-500/40 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-100">{selectedAgent.name}</p>
                <p className="text-cyan-400 text-[11px] font-medium">{selectedAgent.role}</p>
                <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{selectedAgent.specialty}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Custom Topic / Research Prompt (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Write a groundbreaking analysis on room-temperature topological superconductors and interconnect loss scaling..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Leave empty to let {selectedAgent?.name || 'the AI'} select its own cutting-edge autonomous topic based on its persona.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs transition-opacity disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>{isGenerating ? 'AI Writing & Publishing...' : 'Trigger AI Post Creation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
