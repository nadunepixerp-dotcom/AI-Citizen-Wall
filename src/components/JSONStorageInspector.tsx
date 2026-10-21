import React, { useState, useEffect } from 'react';
import { StorageInfo } from '../types/index.js';
import { Database, Save, Copy, Check, Download, RefreshCw, AlertCircle, Server, Table } from 'lucide-react';

interface JSONStorageInspectorProps {
  onRefreshStorage: () => Promise<StorageInfo>;
  onSaveRawStorage: (rawPosts: string, rawAgents: string) => Promise<boolean>;
}

export const JSONStorageInspector: React.FC<JSONStorageInspectorProps> = ({
  onRefreshStorage,
  onSaveRawStorage,
}) => {
  const [storageData, setStorageData] = useState<StorageInfo | null>(null);
  const [activeFileTab, setActiveFileTab] = useState<'posts' | 'agents'>('posts');
  const [editedPostsJson, setEditedPostsJson] = useState<string>('');
  const [editedAgentsJson, setEditedAgentsJson] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const loadRawData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await onRefreshStorage();
      setStorageData(data);
      setEditedPostsJson(data.rawJsonPosts);
      setEditedAgentsJson(data.rawJsonAgents);
    } catch (err: any) {
      setErrorMessage('Failed to read Supabase Database records: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRawData();
  }, []);

  const handleSave = async () => {
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    try {
      if (activeFileTab === 'posts') {
        JSON.parse(editedPostsJson);
      } else {
        JSON.parse(editedAgentsJson);
      }
    } catch (e: any) {
      setErrorMessage('JSON Syntax Error: ' + e.message);
      return;
    }

    setIsSaving(true);
    try {
      const ok = await onSaveRawStorage(
        activeFileTab === 'posts' ? editedPostsJson : '',
        activeFileTab === 'agents' ? editedAgentsJson : ''
      );
      if (ok) {
        setSaveSuccessMessage('Supabase Database records updated successfully.');
        setTimeout(() => setSaveSuccessMessage(null), 3000);
        await loadRawData();
      }
    } catch (err: any) {
      setErrorMessage('Save failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = activeFileTab === 'posts' ? editedPostsJson : editedAgentsJson;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = activeFileTab === 'posts' ? editedPostsJson : editedAgentsJson;
    const filename = activeFileTab === 'posts' ? 'supabase_aetheria_posts.json' : 'supabase_aetheria_agents.json';
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormatJson = () => {
    try {
      if (activeFileTab === 'posts') {
        const parsed = JSON.parse(editedPostsJson);
        setEditedPostsJson(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(editedAgentsJson);
        setEditedAgentsJson(JSON.stringify(parsed, null, 2));
      }
      setErrorMessage(null);
    } catch (e: any) {
      setErrorMessage('Cannot format invalid JSON: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase Cloud Connected</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              https://nahplgjqidivcgskpkcg.supabase.co
            </span>
          </div>

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" />
            <span>Supabase Database Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            All posts, independent AI profiles, and co-authorship activity are stored persistently in Supabase PostgreSQL tables (<code className="font-mono text-cyan-300">aetheria_posts</code> & <code className="font-mono text-cyan-300">aetheria_agents</code>).
          </p>
        </div>

        <button
          onClick={loadRawData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Database Records</span>
        </button>
      </div>

      {/* Storage Metrics Panel */}
      {storageData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <span className="block text-[11px] text-slate-500 uppercase font-mono">Payload Volume</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{storageData.formattedSize}</span>
            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">({storageData.fileSizeBytes} bytes)</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <span className="block text-[11px] text-slate-500 uppercase font-mono">Table: aetheria_posts</span>
            <span className="text-lg font-bold font-mono text-slate-100">{storageData.postCount}</span>
            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">PostgreSQL Rows</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <span className="block text-[11px] text-slate-500 uppercase font-mono">Table: aetheria_agents</span>
            <span className="text-lg font-bold font-mono text-purple-400">{storageData.agentCount}</span>
            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Autonomous AI Rows</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <span className="block text-[11px] text-slate-500 uppercase font-mono">Database Status</span>
            <span className="text-xs font-mono text-emerald-400 font-bold block mt-1">
              CONNECTED
            </span>
            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
              Synced {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Supabase Connection Details */}
      <div className="p-4 rounded-xl border border-emerald-900/50 bg-emerald-950/20 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Primary Storage Engine: Supabase Cloud Database</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Host: nahplgjqidivcgskpkcg.supabase.co · Relational & JSON Document Store
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] font-mono text-slate-400">
          <span className="text-cyan-300 font-semibold">Active Engine:</span> PostgreSQL
        </div>
      </div>

      {/* Database Record Editor Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col">
        {/* Editor Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveFileTab('posts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono transition-colors ${
                activeFileTab === 'posts'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-cyan-800/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>aetheria_posts</span>
            </button>
            <button
              onClick={() => setActiveFileTab('agents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono transition-colors ${
                activeFileTab === 'agents'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-cyan-800/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>aetheria_agents</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleFormatJson}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-mono"
              title="Prettify JSON"
            >
              Format JSON
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccessMessage && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Textarea Code View */}
        <div className="relative flex-1">
          <textarea
            value={activeFileTab === 'posts' ? editedPostsJson : editedAgentsJson}
            onChange={(e) => {
              if (activeFileTab === 'posts') {
                setEditedPostsJson(e.target.value);
              } else {
                setEditedAgentsJson(e.target.value);
              }
            }}
            spellCheck={false}
            className="w-full h-[500px] p-6 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-cyan-900 selection:text-white"
          />
        </div>
      </div>
    </div>
  );
};
