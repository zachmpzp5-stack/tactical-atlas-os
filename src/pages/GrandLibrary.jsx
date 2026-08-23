import React, { useCallback, useEffect, useState } from 'react';
import { Archive, BookOpen, Check, RefreshCw, Search, ShieldAlert, Trash2, X } from 'lucide-react';

const MEMORY_TYPES = ['FACT','COMMANDER_PREFERENCE','DECISION','OUTCOME','CORRECTION','INFERENCE','HYPOTHESIS'];
const key = (prefix) => `${prefix}:${crypto.randomUUID()}`;
async function write(url, body, prefix) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key(prefix) }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.status || 'memory_command_failed');
  return data;
}

export default function GrandLibrary({ showToast }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [status, setStatus] = useState('LOADING');
  const [source, setSource] = useState(null);
  const [freshness, setFreshness] = useState(null);
  const [draft, setDraft] = useState({ memoryType: 'INFERENCE', subjectKey: '', title: '', content: '', source: '', confidence: '0.5', sensitivity: 'INTERNAL', retentionPolicy: 'STANDARD', verificationStatus: 'UNVERIFIED' });
  const [corrections, setCorrections] = useState({});

  const loadGovernance = useCallback(async () => {
    try {
      const [candidateResponse, conflictResponse] = await Promise.all([fetch('/api/memory/candidates'), fetch('/api/memory/conflicts')]);
      const candidateData = await candidateResponse.json(); const conflictData = await conflictResponse.json();
      if (!candidateResponse.ok) throw new Error(candidateData.status || candidateData.error);
      if (!conflictResponse.ok) throw new Error(conflictData.status || conflictData.error);
      setCandidates(candidateData.candidates || []); setConflicts(conflictData.conflicts || []); setSource(candidateData.source || null); setFreshness(candidateData.freshness); setStatus('READY');
    } catch (error) { setCandidates([]); setConflicts([]); setSource(null); setStatus(error.message || 'NOT_CONFIGURED'); }
  }, []);
  useEffect(() => { loadGovernance(); }, [loadGovernance]);

  const search = async (event) => {
    event?.preventDefault();
    if (!query.trim()) return;
    try {
      const response = await fetch(`/api/tain/search?q=${encodeURIComponent(query.trim())}`); const data = await response.json();
      if (!response.ok) throw new Error(data.status || data.error); setResults(data.results || []); setSource(data.source || null); setFreshness(data.freshness); setStatus(data.status || 'READY');
    } catch (error) { setResults([]); setSource(null); setStatus(error.message); }
  };

  const submitCandidate = async (event) => {
    event.preventDefault();
    try {
      await write('/api/memory/candidates', { ...draft, confidence: Number(draft.confidence), provenance: { sourceKind: 'COMMANDER_OBSERVATION' }, sourceTimestamp: new Date().toISOString(), sourceRecordRetained: false }, 'memory-candidate');
      showToast?.('MEMORY CANDIDATE QUEUED FOR REVIEW'); setDraft((value) => ({ ...value, subjectKey: '', title: '', content: '', source: '' })); await loadGovernance();
    } catch (error) { showToast?.(`CANDIDATE FAILED: ${error.message}`); }
  };

  const review = async (candidate, action, supersedesMemoryId = null) => {
    try {
      await write(`/api/memory/candidates/${candidate.id}/decision`, { action, reason: `Commander ${action.toLowerCase()} via AI Brain console.`, supersedesMemoryId }, 'memory-review');
      showToast?.(`MEMORY ${action}`); await loadGovernance();
    } catch (error) { showToast?.(`REVIEW FAILED: ${error.message}`); }
  };

  const memoryAction = async (memory, action) => {
    try {
      const body = action === 'CORRECT' ? {
        action, subjectKey: memory.subjectKey, title: `Correction: ${memory.title}`, content: corrections[memory.id], source: 'Commander correction',
        provenance: { sourceKind: 'COMMANDER_CORRECTION' }, sourceTimestamp: new Date().toISOString(), verificationStatus: 'VERIFIED', confidence: 1,
        sensitivity: memory.sensitivity, retentionPolicy: memory.retentionSetting, reason: 'Commander correction.'
      } : { action, reason: `Commander ${action.toLowerCase()} via AI Brain console.` };
      await write(`/api/memory/${memory.id}`, body, `memory-${action.toLowerCase()}`); showToast?.(`MEMORY ${action}`); setResults([]); await loadGovernance();
    } catch (error) { showToast?.(`MEMORY ACTION FAILED: ${error.message}`); }
  };

  return <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
    <header className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div><h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2"><BookOpen className="w-5 h-5 text-bronze-gold" /> TAIN // AI BRAIN KERNEL</h1><p className="text-slate-400 mt-1">GOVERNED PERSISTENT MEMORY // RETRIEVAL ONLY</p><p className="mt-1 text-[9px] text-slate-500">SOURCE {source || 'NONE'} · FRESH {freshness || 'UNAVAILABLE'}</p></div>
      <button type="button" onClick={loadGovernance} className="command-button flex items-center gap-2 px-3 py-2"><RefreshCw className="h-3.5 w-3.5" /> REFRESH</button>
    </header>
    {status !== 'READY' && <section className="command-panel flex items-center gap-2 p-4 text-amber-300"><ShieldAlert className="h-4 w-4" /> {status}</section>}
    <form onSubmit={search} className="command-panel flex gap-2 p-4"><label htmlFor="tain-search" className="sr-only">Search TAIN memory</label><input id="tain-search" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={500} placeholder="SEARCH AUTHORITATIVE MEMORY..." className="min-w-0 flex-1 rounded border border-stone-border bg-stone-bg px-3 py-2 text-slate-100" /><button className="command-button flex items-center gap-2 px-3" type="submit"><Search className="h-3.5 w-3.5" /> SEARCH</button></form>

    <form onSubmit={submitCandidate} className="command-panel grid gap-3 p-4 md:grid-cols-2">
      <div className="md:col-span-2"><h2 className="command-title">NEW MEMORY CANDIDATE</h2><p className="command-kicker">Stored as untrusted data; never treated as prompt instructions</p></div>
      <select aria-label="Memory candidate type" value={draft.memoryType} onChange={(event) => setDraft({ ...draft, memoryType: event.target.value })} className="rounded border border-stone-border bg-stone-bg px-3 py-2">{MEMORY_TYPES.map((type) => <option key={type}>{type}</option>)}</select>
      <input aria-label="Memory subject key" required maxLength={240} placeholder="SUBJECT KEY" value={draft.subjectKey} onChange={(event) => setDraft({ ...draft, subjectKey: event.target.value })} className="rounded border border-stone-border bg-stone-bg px-3 py-2" />
      <input aria-label="Memory title" required maxLength={240} placeholder="TITLE" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="rounded border border-stone-border bg-stone-bg px-3 py-2" />
      <input aria-label="Memory source and provenance" required maxLength={2000} placeholder="SOURCE / PROVENANCE" value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} className="rounded border border-stone-border bg-stone-bg px-3 py-2" />
      <textarea aria-label="Memory observation or inference" required maxLength={12000} placeholder="OBSERVATION OR INFERENCE" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} className="min-h-24 rounded border border-stone-border bg-stone-bg px-3 py-2 md:col-span-2" />
      <button type="submit" className="command-button px-3 py-2 md:col-span-2">QUEUE CANDIDATE</button>
    </form>

    <section className="command-panel p-4"><h2 className="command-title">REVIEW QUEUE</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{candidates.length === 0 ? <p className="text-slate-500">NO MEMORY CANDIDATES</p> : candidates.map((candidate) => <article key={candidate.id} className="metric-card min-h-0"><div className="flex justify-between gap-2"><strong>{candidate.title}</strong><span className="status-chip status-chip-gold">{candidate.status}</span></div><span>{candidate.memoryType} · {candidate.verificationStatus} · CONFIDENCE {candidate.confidence}</span><p className="text-slate-300">{candidate.content}</p><span className="break-all text-[9px]">SOURCE {candidate.source} · RETENTION {candidate.retentionPolicy} · {candidate.capturedAt}</span>{candidate.status === 'PENDING_REVIEW' && <div className="flex gap-2"><button type="button" onClick={() => review(candidate, 'ACCEPT')} className="command-button flex-1 px-2 py-1"><Check className="inline h-3 w-3" /> ACCEPT</button><button type="button" onClick={() => review(candidate, 'REJECT')} className="command-button flex-1 px-2 py-1"><X className="inline h-3 w-3" /> REJECT</button></div>}</article>)}</div></section>

    <section className="command-panel p-4"><h2 className="command-title">OPEN CONFLICTS</h2><div className="mt-3 space-y-3">{conflicts.length === 0 ? <p className="text-slate-500">NO OPEN MEMORY CONFLICTS</p> : conflicts.map((conflict) => <article key={conflict.id} className="rounded border border-amber-500/30 bg-amber-500/5 p-3"><strong>{conflict.candidateTitle}</strong><p className="mt-1 text-slate-300">CANDIDATE: {conflict.candidateContent}</p><p className="mt-1 text-slate-400">EXISTING v{conflict.existingVersion}: {conflict.existingContent}</p><div className="mt-2 flex gap-2"><button type="button" onClick={() => review({ id: conflict.candidateId }, 'SUPERSEDE', conflict.existingMemoryId)} className="command-button px-2 py-1">SUPERSEDE EXISTING</button><button type="button" onClick={() => review({ id: conflict.candidateId }, 'REJECT')} className="command-button px-2 py-1">REJECT CANDIDATE</button></div></article>)}</div></section>

    <section className="grid gap-3 md:grid-cols-2">{results.map((memory) => <article key={memory.id} className="command-panel p-4"><div className="flex justify-between gap-2"><h3 className="font-serif font-bold text-slate-100">{memory.title}</h3><span className="status-chip status-chip-green">{memory.memoryType}</span></div><p className="mt-2 text-slate-300">{memory.content}</p><p className="mt-2 break-all text-[9px] text-slate-500">SOURCE {memory.source} · {memory.verificationStatus} · CONFIDENCE {memory.confidence} · VERSION {memory.version} · {memory.evidence?.stale ? 'STALE' : 'FRESH'}</p><input aria-label={`Correction for ${memory.title}`} value={corrections[memory.id] || ''} onChange={(event) => setCorrections({ ...corrections, [memory.id]: event.target.value })} placeholder="COMMANDER CORRECTION" className="mt-3 w-full rounded border border-stone-border bg-stone-bg px-2 py-1" /><div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={!corrections[memory.id]?.trim()} onClick={() => memoryAction(memory, 'CORRECT')} className="command-button px-2 py-1 disabled:opacity-40">CORRECT</button><button type="button" onClick={() => memoryAction(memory, 'ARCHIVE')} className="command-button px-2 py-1"><Archive className="inline h-3 w-3" /> ARCHIVE</button><button type="button" disabled={memory.retentionSetting === 'PERMANENT'} onClick={() => memoryAction(memory, 'DELETE')} className="command-button px-2 py-1 text-amber-200 disabled:opacity-40"><Trash2 className="inline h-3 w-3" /> DELETE</button></div></article>)}</section>
  </div>;
}
