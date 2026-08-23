import React, { useCallback, useEffect, useState } from 'react';
import { Link2, RefreshCw, Save, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';

export default function Settings({ showToast }) {
  const [narrator, setNarrator] = useState(
    () => localStorage.getItem('ta_narrator') || 'Charlie - Deep, Confident'
  );
  const [runtime, setRuntime] = useState(
    () => localStorage.getItem('ta_runtime') || '60 Seconds (9:16)'
  );
  const [clearance, setClearance] = useState(() => localStorage.getItem('ta_clearance') || 'OMEGA');
  const [integrations, setIntegrations] = useState({});
  const [storageBackend, setStorageBackend] = useState('UNKNOWN');
  const [integrationError, setIntegrationError] = useState(false);
  const [integrationSource, setIntegrationSource] = useState(null);
  const [integrationFreshness, setIntegrationFreshness] = useState(null);
  const [syncRuns, setSyncRuns] = useState([]);
  const [syncState, setSyncState] = useState('NOT_CONFIGURED');

  const loadIntegrations = useCallback(() => {
    setIntegrationError(false);
    fetch('/api/accounts/status')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('offline'))))
      .then((data) => {
        setIntegrations(data.providers || {});
        setStorageBackend(data.storage || 'UNKNOWN');
        setIntegrationSource(data.source || null);
        setIntegrationFreshness(data.freshness || null);
      })
      .catch(() => setIntegrationError(true));
    fetch('/api/integrations/sync-history?provider=youtube')
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!ok) { setSyncRuns([]); setSyncState(data.status || 'NOT_CONFIGURED'); return; }
        setSyncRuns(data.runs || []); setSyncState(data.status || 'READY');
      })
      .catch(() => { setSyncRuns([]); setSyncState('UNAVAILABLE'); });
  }, []);

  useEffect(() => {
    loadIntegrations();
    const result = new URLSearchParams(window.location.search).get('result');
    if (result) showToast?.(`ACCOUNT LINK RESULT: ${result.toUpperCase()}`);
  }, [loadIntegrations, showToast]);

  const connectAccount = (provider) => {
    window.location.assign(`/api/accounts/start?provider=${encodeURIComponent(provider)}`);
  };

  const disconnectAccount = async (provider) => {
    try {
      const response = await fetch('/api/accounts/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `account-disconnect:${crypto.randomUUID()}` },
        body: JSON.stringify({ provider })
      });
      if (!response.ok) throw new Error('disconnect_failed');
      showToast?.(`${provider.toUpperCase()} DISCONNECTED`);
      loadIntegrations();
    } catch {
      showToast?.(`${provider.toUpperCase()} DISCONNECT FAILED`);
    }
  };

  const syncYouTube = async () => {
    setSyncState('RUNNING');
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `youtube-sync:${crypto.randomUUID()}` },
        body: JSON.stringify({ provider: 'youtube' })
      });
      const data = await response.json();
      if (!response.ok || !['SUCCEEDED','DISCONNECTED','REAUTHORIZATION_REQUIRED','NOT_CONFIGURED'].includes(data.status)) throw new Error(data.error || data.status || 'sync_failed');
      setSyncState(data.status); showToast?.(`YOUTUBE SYNC: ${data.status}`); loadIntegrations();
    } catch (error) { setSyncState('ERROR'); showToast?.(`YOUTUBE SYNC FAILED: ${error.message}`); }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('ta_narrator', narrator);
      localStorage.setItem('ta_runtime', runtime);
      localStorage.setItem('ta_clearance', clearance);
      window.dispatchEvent(new CustomEvent('ta:clearance-change', { detail: clearance }));
      if (showToast) showToast('SETTINGS SAVED TO LOCALSTORAGE');
    } catch (err) {
      if (showToast) showToast('ERROR SAVING TO LOCALSTORAGE');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-bronze-gold" />
            SYSTEM SETTINGS // CONFIGURATION
          </h1>
          <p className="text-slate-400 mt-1">OPERATOR PREFERENCES AND LOCALSTORAGE PERSISTENCE</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light font-bold rounded flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" /> SAVE SETTINGS
        </button>
      </div>

      <div className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-4 max-w-xl">
        <div className="space-y-1">
          <label htmlFor="clearance-select" className="text-slate-300 font-bold block">
            OPERATOR CLEARANCE VIEW
          </label>
          <select
            id="clearance-select"
            value={clearance}
            onChange={(e) => setClearance(e.target.value)}
            className="w-full p-2 bg-stone-bg border border-stone-border rounded text-slate-200 focus:outline-none focus:border-bronze-gold"
          >
            <option value="OMEGA">OMEGA — GENERAL HIIIT</option>
            <option value="OPERATOR">STANDARD OPERATOR</option>
          </select>
          <p className="text-[9px] text-slate-500">
            OMEGA unlocks General HIIIT's private LYRA presentation. Other operators receive the
            uniformed command view.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="narrator-select" className="text-slate-300 font-bold block">
            DEFAULT NARRATOR VOICE
          </label>
          <select
            id="narrator-select"
            value={narrator}
            onChange={(e) => setNarrator(e.target.value)}
            className="w-full p-2 bg-stone-bg border border-stone-border rounded text-slate-200 focus:outline-none focus:border-bronze-gold"
          >
            <option>Charlie - Deep, Confident</option>
            <option>Alpha - Authoritative Command</option>
            <option>Bravo - Archival Documentarian</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="runtime-select" className="text-slate-300 font-bold block">
            TARGET RUNTIME FORMAT
          </label>
          <select
            id="runtime-select"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
            className="w-full p-2 bg-stone-bg border border-stone-border rounded text-slate-200 focus:outline-none focus:border-bronze-gold"
          >
            <option>60 Seconds (9:16 Vertical)</option>
            <option>10 Minutes (16:9 Full Horizontal)</option>
            <option>30 Seconds (1:1 Square)</option>
          </select>
        </div>
      </div>

      <section className="command-panel p-4">
        <div className="relative z-[2] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="command-title flex items-center gap-2">
              <Link2 className="h-4 w-4 text-emerald-300" /> ACCOUNT CONNECTIONS
            </h2>
            <p className="command-kicker">Commander session required // storage {storageBackend}</p>
            <p className="mt-1 text-[9px] text-slate-500">SOURCE {integrationSource || 'NONE'} · FRESH {integrationFreshness || 'UNAVAILABLE'}</p>
          </div>
          <button type="button" onClick={loadIntegrations} className="command-button flex items-center gap-2 px-3 py-2">
            <RefreshCw className="h-3.5 w-3.5" /> REFRESH
          </button>
        </div>

        {integrationError ? (
          <div className="relative z-[2] mt-4 flex items-center gap-2 text-amber-300">
            <ShieldAlert className="h-4 w-4" /> ACCOUNT STATUS API DISCONNECTED
          </div>
        ) : (
          <div className="relative z-[2] mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(integrations).map(([id, account]) => (
              <article key={id} className="metric-card min-h-0 gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="m-0 block">{account.label || id}</strong>
                    <span>{account.category || 'Integration'}</span>
                  </div>
                  <span className={account.connectable ? 'status-chip status-chip-green' : 'status-chip status-chip-gold'}>
                    {account.status}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={!account.connectable}
                    onClick={() => connectAccount(id)}
                    className="command-button flex-1 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {account.status === 'LINKED' ? 'REAUTHORIZE' : 'CONNECT'}
                  </button>
                  {account.disconnectable && (
                    <button type="button" onClick={() => disconnectAccount(id)} className="command-button px-3 py-2 text-amber-200">
                      DISCONNECT
                    </button>
                  )}
                </div>
                {account.portalApproval && <span className="text-[9px] text-amber-300">PROVIDER PORTAL APPROVAL MAY BE REQUIRED</span>}
                {id === 'youtube' && <button type="button" disabled={!account.disconnectable || syncState === 'RUNNING'} onClick={syncYouTube} className="command-button px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40">SYNC READ-ONLY DATA</button>}
              </article>
            ))}
          </div>
        )}
        <p className="relative z-[2] mt-4 text-[9px] leading-4 text-slate-500">
          Browser storage and the clearance selector do not grant access. The server accepts linking actions only from a valid signed HttpOnly Commander session.
        </p>
        <div className="relative z-[2] mt-4 border-t border-stone-border pt-3">
          <h3 className="command-title">YOUTUBE SYNC HISTORY // {syncState}</h3>
          <div className="mt-2 space-y-2">{syncRuns.length === 0 ? <p className="text-slate-500">NO STORED SYNC RUNS</p> : syncRuns.slice(0, 5).map((run) => <div key={run.id} className="feed-row"><span>{run.status} · {run.currentStep}</span><span className="ml-auto text-slate-500">ATTEMPT {run.attemptCount} · {run.updatedAt}</span></div>)}</div>
        </div>
      </section>
    </div>
  );
}
