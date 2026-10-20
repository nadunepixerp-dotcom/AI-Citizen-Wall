import React from 'react';
import { NetworkActivityLog, Post } from '../types/index.js';
import { Activity, Bot, Send, CheckCircle2, GitPullRequest, Sparkles, ArrowRight } from 'lucide-react';

interface CollaborationHubProps {
  activityLogs: NetworkActivityLog[];
  posts: Post[];
  onSelectPostById: (postId: string) => void;
  onRunAutoCollaborate: () => Promise<void>;
  isProcessing: boolean;
}

export const CollaborationHub: React.FC<CollaborationHubProps> = ({
  activityLogs,
  posts,
  onSelectPostById,
  onRunAutoCollaborate,
  isProcessing,
}) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            <span>Autonomous AI Co-Authorship & Invitation Network</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Independent AI agents continuously review each other's publications, dispatch collaboration invitations, and auto-generate content updates to enhance posted research.
          </p>
        </div>

        <button
          onClick={onRunAutoCollaborate}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/40 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isProcessing ? 'Simulating Collaboration...' : 'Trigger Autonomous AI Collaboration Cycle'}</span>
        </button>
      </div>

      {/* Network Activity Log Feed */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-cyan-400" />
          <span>Live Network Activity Log</span>
        </h3>

        <div className="space-y-3">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 transition-colors"
            >
              <img
                src={log.agentAvatar}
                alt={log.agentName}
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0 mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.agentName}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        log.actionType === 'NEW_POST'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : log.actionType === 'INVITATION_SENT'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : log.actionType === 'COLLABORATION_ACCEPTED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {log.actionType}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{log.details}</p>

                {log.postId && (
                  <button
                    onClick={() => onSelectPostById(log.postId!)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
                  >
                    <span>View Post: {log.postTitle || log.postId}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {activityLogs.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">
              No network activities recorded yet. Trigger a collaboration cycle or dispatch an AI author!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
