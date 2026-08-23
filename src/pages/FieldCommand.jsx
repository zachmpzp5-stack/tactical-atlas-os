import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useNetworkStatus from '../hooks/useNetworkStatus';
import { networkStatusLabel } from '../lib/network-status';
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Compass,
  Database,
  Home,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';

const ACTIVE_STATES = new Set(['ACTIVE', 'BLOCKED', 'APPROVED', 'REVIEW']);

function idempotencyKey(prefix) {
  return `${prefix}:${crypto.randomUUID()}`;
}

async function readJson(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: { status: 'DISCONNECTED' } };
  }
}

async function decideProposal(proposalId, decision) {
  const response = await fetch(`/api/proposals/${proposalId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey('field-command-decision'),
    },
    body: JSON.stringify({
      decision,
      reason: `Commander ${decision.toLowerCase()} from Field Command.`,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.status || 'DECISION_FAILED');
  return data;
}

function statusTone(status) {
  return ['READY', 'ACTIVE', 'APPROVED', 'CONFIGURED_UNVERIFIED'].includes(status)
    ? 'status-chip-green'
    : 'status-chip-gold';
}

export default function FieldCommand({ showToast }) {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [health, setHealth] = useState(null);
  const [missionStatus, setMissionStatus] = useState('LOADING');
  const [approvalStatus, setApprovalStatus] = useState('LOADING');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [missionResult, proposalResult, healthResult] = await Promise.all([
      readJson('/api/missions'),
      readJson('/api/proposals?status=PENDING'),
      readJson('/api/health'),
    ]);

    setMissions(missionResult.ok ? missionResult.data.missions || [] : []);
    setMissionStatus(
      missionResult.ok
        ? missionResult.data.status || 'READY'
        : missionResult.data.status || missionResult.data.error || 'DISCONNECTED'
    );
    setProposals(proposalResult.ok ? proposalResult.data.proposals || [] : []);
    setApprovalStatus(
      proposalResult.ok
        ? proposalResult.data.status || 'READY'
        : proposalResult.data.status || proposalResult.data.error || 'DISCONNECTED'
    );
    setHealth(healthResult.ok ? healthResult.data : null);
    setLastRefresh(new Date().toISOString());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const network = useNetworkStatus(() => {
    showToast?.('NETWORK RESTORED // REFRESHING COMMAND DATA');
    void load();
  });
  const online = network.connected;

  const activeMissions = useMemo(
    () => missions.filter((mission) => ACTIVE_STATES.has(mission.state)).slice(0, 4),
    [missions]
  );
  const cloud = health?.cloud?.services || {};
  const databaseStatus = health?.components?.MISSIONS?.status || missionStatus;
  const lyraStatus = health?.components?.LYRA?.status || 'UNAVAILABLE';
  const commanderStatus = health?.components?.COMMANDER_AUTH?.status || 'UNAVAILABLE';

  const decide = async (proposal, decision) => {
    if (!online) {
      showToast?.('OFFLINE // DECISIONS REQUIRE A VERIFIED CONNECTION');
      return;
    }

    try {
      await decideProposal(proposal.id, decision);
      showToast?.(`PROPOSAL ${decision}`);
      await load();
    } catch (error) {
      showToast?.(`DECISION FAILED: ${error.message}`);
    }
  };

  return (
    <div className="field-command-shell min-h-full px-3 pb-28 pt-3 font-mono text-xs sm:px-5 sm:pt-5 lg:pb-8">
      <header className="field-command-hero">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="command-kicker">TACTICAL ATLAS // PERSONAL COMMAND</p>
            <h1 className="mt-1 flex items-center gap-2 font-serif text-xl font-black tracking-[0.08em] text-slate-100">
              <Smartphone className="h-5 w-5 text-emerald-300" /> FIELD COMMAND
            </h1>
            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-slate-500">
              SINGLE COMMANDER // READ, REVIEW, DECIDE
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            aria-label="Refresh Field Command"
            className="field-command-touch command-button flex h-11 w-11 items-center justify-center"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`status-chip ${online ? 'status-chip-green' : 'status-chip-gold'} flex items-center gap-1`}
          >
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {networkStatusLabel(network)}
          </span>
          <span className={`status-chip ${statusTone(commanderStatus)}`}>
            COMMANDER {commanderStatus}
          </span>
          <span className="status-chip status-chip-gold">{proposals.length} ACTIONS WAITING</span>
        </div>
        <p className="mt-3 text-[8px] tracking-[0.12em] text-slate-600">
          LAST SYNC {lastRefresh || 'PENDING'}
        </p>
      </header>

      <section className="mt-3 grid grid-cols-3 gap-2" aria-label="Field Command readiness">
        <article className="field-command-stat">
          <Compass className="h-4 w-4 text-emerald-300" />
          <strong>{activeMissions.length}</strong>
          <span>MISSIONS</span>
        </article>
        <article className="field-command-stat">
          <CheckCircle2 className="h-4 w-4 text-amber-300" />
          <strong>{proposals.length}</strong>
          <span>APPROVALS</span>
        </article>
        <article className="field-command-stat">
          <Bot className="h-4 w-4 text-emerald-300" />
          <strong>{lyraStatus}</strong>
          <span>LYRA</span>
        </article>
      </section>

      <section className="command-panel mt-3 p-3" aria-labelledby="field-missions-title">
        <div className="flex items-center justify-between gap-3 border-b border-stone-border pb-2">
          <div>
            <h2 id="field-missions-title" className="command-title">
              ACTIVE MISSION PICTURE
            </h2>
            <p className="command-kicker">PMO // {missionStatus}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/operations')}
            className="command-button px-3 py-2"
          >
            ALL MISSIONS
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {activeMissions.length === 0 ? (
            <div className="rounded border border-amber-500/20 bg-amber-500/5 p-4 text-amber-200">
              <AlertTriangle className="mb-2 h-4 w-4" />
              <strong className="block">NO CLOUD MISSIONS AVAILABLE</strong>
              <span className="mt-1 block text-[9px] text-slate-500">{missionStatus}</span>
            </div>
          ) : (
            activeMissions.map((mission) => (
              <button
                key={mission.id}
                type="button"
                onClick={() => navigate(`/operations?mission=${mission.id}`)}
                className="field-command-row w-full text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`status-chip ${statusTone(mission.state)}`}>
                      {mission.state}
                    </span>
                    <strong className="truncate font-serif text-sm text-slate-100">
                      {mission.title}
                    </strong>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[9px] leading-4 text-slate-400">
                    {mission.summary || 'NO SUMMARY'}
                  </p>
                  <p className="mt-2 text-[8px] text-slate-600">
                    {mission.objectiveCount} OBJECTIVES // {mission.evidenceCount} EVIDENCE
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 flex-none text-emerald-300" />
              </button>
            ))
          )}
        </div>
      </section>

      <section className="command-panel mt-3 p-3" aria-labelledby="field-approvals-title">
        <div className="border-b border-stone-border pb-2">
          <h2 id="field-approvals-title" className="command-title">
            COMMANDER ACTION QUEUE
          </h2>
          <p className="command-kicker">HUMAN DECISION REQUIRED // {approvalStatus}</p>
        </div>
        <div className="mt-3 space-y-2">
          {proposals.length === 0 ? (
            <p className="p-3 text-slate-500">NO PENDING PROPOSALS</p>
          ) : (
            proposals.slice(0, 3).map((proposal) => (
              <article
                key={proposal.id}
                className="rounded border border-amber-400/20 bg-amber-400/5 p-3"
              >
                <strong className="font-serif text-sm text-slate-100">{proposal.title}</strong>
                <p className="mt-1 text-[9px] leading-4 text-slate-400">{proposal.description}</p>
                <p className="mt-2 text-[8px] text-slate-600">PROPOSED BY {proposal.proposedBy}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => decide(proposal, 'APPROVED')}
                    disabled={!online || refreshing}
                    title={online ? 'Approve proposal' : 'Reconnect to approve'}
                    className="field-command-touch command-button flex items-center justify-center gap-2 px-3 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCircle2 className="h-4 w-4" /> APPROVE
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(proposal, 'REJECTED')}
                    disabled={!online || refreshing}
                    title={online ? 'Reject proposal' : 'Reconnect to reject'}
                    className="field-command-touch command-button flex items-center justify-center gap-2 px-3 text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <XCircle className="h-4 w-4" /> REJECT
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/headquarters')}
          className="command-panel p-4 text-left"
        >
          <Bot className="h-5 w-5 text-emerald-300" />
          <h2 className="command-title mt-3">OPEN LYRA BRIEFING</h2>
          <p className="mt-2 text-[9px] leading-4 text-slate-500">
            Ask for mission readiness using governed, source-backed context.
          </p>
        </button>
        <button
          type="button"
          onClick={() => navigate('/status')}
          className="command-panel p-4 text-left"
        >
          <Activity className="h-5 w-5 text-amber-300" />
          <h2 className="command-title mt-3">SYSTEM READINESS</h2>
          <p className="mt-2 text-[9px] leading-4 text-slate-500">
            Review cloud services, security controls, and integration health.
          </p>
        </button>
      </section>

      <section className="command-panel mt-3 p-3" aria-labelledby="field-cloud-title">
        <h2 id="field-cloud-title" className="command-title">
          PRIVATE CLOUD READINESS
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="feed-row">
            <Database className="h-3.5 w-3.5" />
            <span>MISSION DATA</span>
            <b className="ml-auto text-amber-300">{databaseStatus}</b>
          </div>
          <div className="feed-row">
            <Cloud className="h-3.5 w-3.5" />
            <span>NEON</span>
            <b className="ml-auto text-amber-300">{cloud.DATABASE?.status || 'NOT_CONFIGURED'}</b>
          </div>
          <div className="feed-row">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>UPSTASH</span>
            <b className="ml-auto text-amber-300">
              {cloud.RATE_LIMITER?.status || 'NOT_CONFIGURED'}
            </b>
          </div>
          <div className="feed-row">
            <Radio className="h-3.5 w-3.5" />
            <span>EXECUTION</span>
            <b className="ml-auto text-emerald-300">{health?.executionMode || 'READ_ONLY'}</b>
          </div>
        </div>
      </section>

      <nav className="field-command-dock lg:hidden" aria-label="Field Command quick navigation">
        <button type="button" onClick={() => navigate('/headquarters')}>
          <Home className="h-5 w-5" />
          <span>HQ</span>
        </button>
        <button type="button" onClick={() => navigate('/operations')}>
          <Compass className="h-5 w-5" />
          <span>MISSIONS</span>
        </button>
        <button type="button" onClick={() => navigate('/headquarters')}>
          <Bot className="h-5 w-5" />
          <span>LYRA</span>
        </button>
        <button type="button" onClick={() => navigate('/status')}>
          <Activity className="h-5 w-5" />
          <span>STATUS</span>
        </button>
      </nav>
    </div>
  );
}
