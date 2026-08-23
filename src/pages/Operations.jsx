import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Compass, FileSearch, Plus, RefreshCw, ShieldAlert, X } from 'lucide-react';

const STATE_ORDER = ['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'BLOCKED', 'COMPLETE', 'ARCHIVED'];
const TRANSITIONS = {
  DRAFT: ['REVIEW', 'ARCHIVED'],
  REVIEW: ['DRAFT', 'APPROVED', 'ARCHIVED'],
  APPROVED: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['BLOCKED', 'COMPLETE', 'ARCHIVED'],
  BLOCKED: ['ACTIVE', 'COMPLETE', 'ARCHIVED'],
  COMPLETE: ['ARCHIVED'],
  ARCHIVED: [],
};

function idempotencyKey(prefix) {
  return `${prefix}:${crypto.randomUUID()}`;
}

async function writeJson(url, body, prefix) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey(prefix) },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.status || 'command_failed');
  return data;
}

export default function Operations({ showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [missions, setMissions] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [status, setStatus] = useState('LOADING');
  const [source, setSource] = useState(null);
  const [freshness, setFreshness] = useState(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedMission, setSelectedMission] = useState(null);
  const [dossierMissionId, setDossierMissionId] = useState(null);
  const [dossierStatus, setDossierStatus] = useState('IDLE');
  const [objectiveTitle, setObjectiveTitle] = useState('');
  const [evidence, setEvidence] = useState({
    title: '',
    excerpt: '',
    sourceTitle: '',
    locator: '',
  });

  const load = useCallback(async () => {
    setStatus('LOADING');
    try {
      const [missionResponse, proposalResponse] = await Promise.all([
        fetch('/api/missions'),
        fetch('/api/proposals?status=PENDING'),
      ]);
      const missionData = await missionResponse.json();
      const proposalData = await proposalResponse.json();
      if (!missionResponse.ok)
        throw new Error(missionData.status || missionData.error || 'MISSION_API_UNAVAILABLE');
      if (!proposalResponse.ok)
        throw new Error(proposalData.status || proposalData.error || 'APPROVAL_API_UNAVAILABLE');
      setMissions(missionData.missions || []);
      setProposals(proposalData.proposals || []);
      setSource(missionData.source);
      setFreshness(missionData.freshness);
      setStatus('READY');
    } catch (error) {
      setMissions([]);
      setProposals([]);
      setStatus(error.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDossier = useCallback(async (missionId) => {
    setDossierMissionId(missionId);
    setDossierStatus('LOADING');
    try {
      const response = await fetch(`/api/missions/${missionId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.status || 'MISSION_DETAIL_UNAVAILABLE');
      setSelectedMission(data.mission);
      setDossierStatus('READY');
    } catch (error) {
      setDossierStatus(error.message);
    }
  }, []);

  const closeDossier = useCallback(() => {
    setDossierMissionId(null);
    setSelectedMission(null);
    setDossierStatus('IDLE');
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('mission');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  useEffect(() => {
    const requestedMission = searchParams.get('mission');
    if (requestedMission && requestedMission !== dossierMissionId) openDossier(requestedMission);
  }, [dossierMissionId, openDossier, searchParams]);

  useEffect(() => {
    if (!dossierMissionId) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeDossier();
    };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeDossier, dossierMissionId]);

  const createMission = async (event) => {
    event.preventDefault();
    try {
      await writeJson(
        '/api/missions',
        { title, summary, reason: 'Commander created mission from Mission Control.' },
        'mission-create'
      );
      setTitle('');
      setSummary('');
      showToast?.('MISSION CREATED IN DRAFT');
      await load();
    } catch (error) {
      showToast?.(`MISSION CREATE FAILED: ${error.message}`);
    }
  };

  const transition = async (mission, nextState) => {
    try {
      await writeJson(
        `/api/missions/${mission.id}/transition`,
        { nextState, reason: `Commander moved mission from ${mission.state} to ${nextState}.` },
        'mission-transition'
      );
      showToast?.(`MISSION MOVED TO ${nextState}`);
      await load();
    } catch (error) {
      showToast?.(`TRANSITION FAILED: ${error.message}`);
    }
  };

  const addObjective = async (event) => {
    event.preventDefault();
    try {
      await writeJson(
        `/api/missions/${selectedMission.id}/objectives`,
        {
          title: objectiveTitle,
          position: selectedMission.objectives.length,
        },
        'mission-objective'
      );
      setObjectiveTitle('');
      showToast?.('OBJECTIVE ADDED TO MISSION');
      await Promise.all([load(), openDossier(selectedMission.id)]);
    } catch (error) {
      showToast?.(`OBJECTIVE FAILED: ${error.message}`);
    }
  };

  const addEvidence = async (event) => {
    event.preventDefault();
    try {
      await writeJson(
        `/api/missions/${selectedMission.id}/evidence`,
        {
          ...evidence,
          sourceType: 'COMMANDER_SOURCE',
          sourceTimestamp: new Date().toISOString(),
          verificationStatus: 'UNVERIFIED',
          classification: 'INTERNAL',
          confidence: 0.5,
        },
        'mission-evidence'
      );
      setEvidence({ title: '', excerpt: '', sourceTitle: '', locator: '' });
      showToast?.('SOURCE-BACKED EVIDENCE ADDED');
      await Promise.all([load(), openDossier(selectedMission.id)]);
    } catch (error) {
      showToast?.(`EVIDENCE FAILED: ${error.message}`);
    }
  };

  const decide = async (proposal, decision) => {
    try {
      await writeJson(
        `/api/proposals/${proposal.id}/decision`,
        { decision, reason: `Commander ${decision.toLowerCase()} from Mission Control.` },
        'proposal-decision'
      );
      showToast?.(`PROPOSAL ${decision}`);
      await load();
    } catch (error) {
      showToast?.(`DECISION FAILED: ${error.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 text-bronze-gold" /> OPERATIONS // MISSION CONTROL
          </h1>
          <p className="text-slate-400 mt-1">
            PERSISTENT MISSION STATE MACHINE // COMMANDER-GOVERNED
          </p>
          <p className="mt-1 text-[9px] text-slate-500">
            SOURCE {source || 'NONE'} · FRESH {freshness || 'UNAVAILABLE'}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="command-button flex items-center gap-2 px-3 py-2"
        >
          <RefreshCw className="h-3.5 w-3.5" /> REFRESH
        </button>
      </div>

      <form
        onSubmit={createMission}
        className="command-panel grid gap-3 p-4 md:grid-cols-[1fr_2fr_auto]"
      >
        <label className="space-y-1">
          <span className="command-kicker">MISSION TITLE</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            required
            className="w-full rounded border border-stone-border bg-stone-bg px-3 py-2 text-slate-100"
          />
        </label>
        <label className="space-y-1">
          <span className="command-kicker">SUMMARY</span>
          <input
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            maxLength={4000}
            className="w-full rounded border border-stone-border bg-stone-bg px-3 py-2 text-slate-100"
          />
        </label>
        <button type="submit" className="command-button self-end flex items-center gap-2 px-3 py-2">
          <Plus className="h-3.5 w-3.5" /> CREATE DRAFT
        </button>
      </form>

      {status !== 'READY' && status !== 'LOADING' && (
        <section className="command-panel flex items-center gap-2 p-4 text-amber-300">
          <ShieldAlert className="h-4 w-4" /> {status}
        </section>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {STATE_ORDER.map((state) => {
          const stateMissions = missions.filter((mission) => mission.state === state);
          return (
            <section key={state} className="command-panel min-w-0 p-3">
              <div className="mb-3 flex items-center justify-between border-b border-stone-border pb-2">
                <strong>{state}</strong>
                <span className="status-chip status-chip-gold">{stateMissions.length}</span>
              </div>
              <div className="space-y-2">
                {stateMissions.length === 0 ? (
                  <p className="py-4 text-center text-slate-500">NO STORED MISSIONS</p>
                ) : (
                  stateMissions.map((mission) => (
                    <article
                      key={mission.id}
                      className="rounded border border-stone-border bg-stone-bg p-3"
                    >
                      <h3 className="font-serif text-sm font-bold text-slate-100">
                        {mission.title}
                      </h3>
                      <p className="mt-1 text-slate-400">{mission.summary || 'NO SUMMARY'}</p>
                      <p className="mt-2 text-[9px] text-slate-500">
                        {mission.objectiveCount} OBJECTIVES // {mission.evidenceCount} EVIDENCE //{' '}
                        {mission.updatedAt}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => openDossier(mission.id)}
                          className="command-button flex items-center gap-1 px-2 py-1 text-[8px]"
                        >
                          <FileSearch className="h-3 w-3" /> DOSSIER
                        </button>
                        {TRANSITIONS[state].map((next) => (
                          <button
                            type="button"
                            key={next}
                            onClick={() => transition(mission, next)}
                            className="command-button px-2 py-1 text-[8px]"
                          >
                            TO {next}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="command-panel p-4">
        <h2 className="command-title flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" /> COMMANDER APPROVAL QUEUE
        </h2>
        <p className="command-kicker">
          LYRA proposals remain non-executing until Commander decision
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {proposals.length === 0 ? (
            <p className="text-slate-500">NO PENDING PROPOSALS</p>
          ) : (
            proposals.map((proposal) => (
              <article key={proposal.id} className="metric-card min-h-0">
                <strong>{proposal.title}</strong>
                <span>{proposal.description}</span>
                <span className="text-[9px]">
                  PROPOSED BY {proposal.proposedBy} · {proposal.createdAt}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => decide(proposal, 'APPROVED')}
                    className="command-button flex-1 px-2 py-1"
                  >
                    APPROVE
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(proposal, 'REJECTED')}
                    className="command-button flex-1 px-2 py-1 text-amber-200"
                  >
                    REJECT
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {dossierMissionId && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDossier();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-dossier-title"
            className="h-full w-full max-w-2xl overflow-y-auto border-l border-emerald-400/25 bg-stone-bg p-4 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-stone-border pb-4">
              <div>
                <p className="command-kicker">PMO // MISSION DOSSIER</p>
                <h2
                  id="mission-dossier-title"
                  className="font-serif text-lg font-bold text-slate-100"
                >
                  {selectedMission?.title || 'LOADING MISSION'}
                </h2>
                {selectedMission && (
                  <p className="mt-1 text-slate-400">{selectedMission.summary || 'NO SUMMARY'}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeDossier}
                aria-label="Close mission dossier"
                className="command-button p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dossierStatus !== 'READY' ? (
              <p className="text-amber-300">{dossierStatus}</p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="metric-card min-h-0">
                    <strong>{selectedMission.state}</strong>
                    <span>MISSION STATE</span>
                  </div>
                  <div className="metric-card min-h-0">
                    <strong>{selectedMission.objectives.length}</strong>
                    <span>OBJECTIVES</span>
                  </div>
                  <div className="metric-card min-h-0">
                    <strong>{selectedMission.evidence.length}</strong>
                    <span>EVIDENCE</span>
                  </div>
                </div>

                <section className="command-panel p-4">
                  <h3 className="command-title">OBJECTIVES</h3>
                  <div className="mt-3 space-y-2">
                    {selectedMission.objectives.length === 0 ? (
                      <p className="text-slate-500">NO OBJECTIVES RECORDED</p>
                    ) : (
                      selectedMission.objectives.map((objective, index) => (
                        <div
                          key={objective.id}
                          className="rounded border border-stone-border bg-stone-panel p-3"
                        >
                          <span className="mr-2 text-emerald-300">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {objective.title}
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={addObjective} className="mt-3 flex gap-2">
                    <input
                      required
                      maxLength={240}
                      value={objectiveTitle}
                      onChange={(event) => setObjectiveTitle(event.target.value)}
                      aria-label="New mission objective"
                      placeholder="ADD OBJECTIVE..."
                      className="min-w-0 flex-1 rounded border border-stone-border bg-stone-bg px-3 py-2"
                    />
                    <button
                      className="command-button px-3"
                      type="submit"
                      aria-label="Add mission objective"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </section>

                <section className="command-panel p-4">
                  <h3 className="command-title">EVIDENCE REGISTER</h3>
                  <div className="mt-3 space-y-2">
                    {selectedMission.evidence.length === 0 ? (
                      <p className="text-slate-500">NO EVIDENCE RECORDED</p>
                    ) : (
                      selectedMission.evidence.map((item) => (
                        <article
                          key={item.id}
                          className="rounded border border-stone-border bg-stone-panel p-3"
                        >
                          <div className="flex justify-between gap-2">
                            <strong className="text-slate-100">{item.title}</strong>
                            <span className="status-chip status-chip-gold">
                              {item.sourceVerificationStatus}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-400">{item.excerpt || 'NO EXCERPT'}</p>
                          <p className="mt-2 break-all text-[9px] text-slate-500">
                            {item.sourceTitle}
                            {' // '}
                            {item.locator}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                  <form onSubmit={addEvidence} className="mt-4 grid gap-2 sm:grid-cols-2">
                    <input
                      required
                      maxLength={240}
                      value={evidence.title}
                      onChange={(event) => setEvidence({ ...evidence, title: event.target.value })}
                      aria-label="Evidence title"
                      placeholder="EVIDENCE TITLE"
                      className="rounded border border-stone-border bg-stone-bg px-3 py-2"
                    />
                    <input
                      required
                      maxLength={240}
                      value={evidence.sourceTitle}
                      onChange={(event) =>
                        setEvidence({ ...evidence, sourceTitle: event.target.value })
                      }
                      aria-label="Evidence source title"
                      placeholder="SOURCE TITLE"
                      className="rounded border border-stone-border bg-stone-bg px-3 py-2"
                    />
                    <input
                      required
                      maxLength={2000}
                      value={evidence.locator}
                      onChange={(event) =>
                        setEvidence({ ...evidence, locator: event.target.value })
                      }
                      aria-label="Evidence source locator"
                      placeholder="URL / FILE / RECORD LOCATOR"
                      className="rounded border border-stone-border bg-stone-bg px-3 py-2 sm:col-span-2"
                    />
                    <textarea
                      required
                      maxLength={4000}
                      value={evidence.excerpt}
                      onChange={(event) =>
                        setEvidence({ ...evidence, excerpt: event.target.value })
                      }
                      aria-label="Evidence excerpt"
                      placeholder="SOURCE-BACKED EXCERPT OR OBSERVATION"
                      className="min-h-20 rounded border border-stone-border bg-stone-bg px-3 py-2 sm:col-span-2"
                    />
                    <button type="submit" className="command-button px-3 py-2 sm:col-span-2">
                      ADD UNVERIFIED EVIDENCE
                    </button>
                  </form>
                </section>

                <section className="command-panel p-4">
                  <h3 className="command-title">STATE HISTORY</h3>
                  <div className="mt-3 space-y-2">
                    {selectedMission.events.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-4 border-b border-stone-border pb-2"
                      >
                        <span>
                          {item.previousState || 'ORIGIN'} → {item.nextState}
                        </span>
                        <span className="text-right text-[9px] text-slate-500">
                          {item.actor}
                          <br />
                          {item.createdAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
