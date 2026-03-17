import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Plus, 
  RefreshCw, 
  Send, 
  History,
  AlertCircle,
  CheckCircle2,
  Globe,
  Lock,
  User
} from 'lucide-react';

interface GitStatus {
  isRepo: boolean;
  status?: {
    not_added: string[];
    conflicted: string[];
    created: string[];
    deleted: string[];
    modified: string[];
    renamed: string[];
    staged: string[];
    ahead: number;
    behind: number;
    current: string;
    tracking: string;
  };
  log?: {
    all: any[];
  };
  remotes?: any[];
}

export const GitPanel: React.FC = () => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/git/status');
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInit = async () => {
    setLoading(true);
    try {
      await fetch('/api/git/init', { method: 'POST' });
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (file?: string) => {
    setLoading(true);
    try {
      await fetch('/api/git/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: file || '.' })
      });
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage) return;
    setLoading(true);
    try {
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage })
      });
      if (!res.ok) throw new Error(await res.text());
      setCommitMessage('');
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, token })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/git/pull', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRemote = async () => {
    if (!remoteUrl) return;
    setLoading(true);
    try {
      await fetch('/api/git/remote/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'origin', url: remoteUrl })
      });
      setRemoteUrl('');
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!status) return <div className="p-4 text-zinc-500">Loading Git status...</div>;

  if (!status.isRepo) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <GitBranch className="w-12 h-12 text-zinc-700 mb-4" />
        <h3 className="text-lg font-medium text-zinc-200 mb-2">No Git Repository</h3>
        <p className="text-sm text-zinc-500 mb-6">Initialize a repository to start tracking changes.</p>
        <button
          onClick={handleInit}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Initialize Repository
        </button>
      </div>
    );
  }

  const changedFiles = [
    ...(status.status?.not_added || []).map(f => ({ path: f, status: 'untracked' })),
    ...(status.status?.modified || []).map(f => ({ path: f, status: 'modified' })),
    ...(status.status?.deleted || []).map(f => ({ path: f, status: 'deleted' })),
    ...(status.status?.created || []).map(f => ({ path: f, status: 'created' })),
  ];

  const stagedFiles = status.status?.staged || [];

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-zinc-200">{status.status?.current || 'main'}</span>
        </div>
        <button 
          onClick={fetchStatus} 
          disabled={loading}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Changes Section */}
        <section>
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between">
            Changes
            <button 
              onClick={() => handleAdd()}
              className="text-emerald-500 hover:text-emerald-400 lowercase text-[10px]"
            >
              Stage All
            </button>
          </h4>
          <div className="space-y-1">
            {changedFiles.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">No changes detected</p>
            ) : (
              changedFiles.map((file, i) => (
                <div key={i} className="group flex items-center justify-between py-1 px-2 hover:bg-zinc-800/50 rounded transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      file.status === 'untracked' ? 'bg-zinc-500' :
                      file.status === 'modified' ? 'bg-amber-500' :
                      file.status === 'deleted' ? 'bg-red-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-xs text-zinc-400 truncate">{file.path}</span>
                  </div>
                  <button 
                    onClick={() => handleAdd(file.path)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-700 rounded text-zinc-400"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Staged Section */}
        <section>
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Staged Changes</h4>
          <div className="space-y-1">
            {stagedFiles.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Nothing staged</p>
            ) : (
              stagedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 py-1 px-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-zinc-400 truncate">{file}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Commit Section */}
        <section className="pt-4 border-t border-zinc-800">
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 resize-none mb-2"
          />
          <button
            onClick={handleCommit}
            disabled={loading || !commitMessage || stagedFiles.length === 0}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <GitCommit className="w-3.5 h-3.5" />
            Commit
          </button>
        </section>

        {/* Remote Section */}
        <section className="pt-4 border-t border-zinc-800 space-y-4">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Remote</h4>
          
          {status.remotes && status.remotes.length === 0 ? (
            <div className="space-y-2">
              <div className="relative">
                <Globe className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="text"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  placeholder="Remote URL (https://...)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-8 pr-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <button
                onClick={handleAddRemote}
                disabled={loading || !remoteUrl}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
              >
                Add Remote
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Git Username"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-8 pr-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Personal Access Token"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-8 pr-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePull}
                  disabled={loading}
                  className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  Pull
                </button>
                <button
                  onClick={handlePush}
                  disabled={loading}
                  className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Push
                </button>
              </div>
            </div>
          )}
        </section>

        {/* History Section */}
        <section className="pt-4 border-t border-zinc-800">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Recent History
          </h4>
          <div className="space-y-3">
            {status.log?.all.map((commit, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-500/70">{commit.hash.substring(0, 7)}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(commit.date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1">{commit.message}</p>
                <span className="text-[10px] text-zinc-500 italic">by {commit.author_name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
