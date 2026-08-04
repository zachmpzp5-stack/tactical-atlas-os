import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  LockKeyhole,
  Network,
  Play,
  ShieldCheck,
} from 'lucide-react';
import ExpeditionMap from '../components/ExpeditionMap';
import LyraAssistantPanel from '../components/LyraAssistantPanel';
import ProductionPipeline from '../components/ProductionPipeline';
import SafeImage from '../components/SafeImage';
import TaanNetwork from '../components/TaanNetwork';
import { CASE_FILES_EXPANDED } from '../data/mockData';

const bootSteps = [
  'ATLAS KERNEL',
  'TAIM CONTEXT',
  'TAAN NETWORK',
  'GUARDIAN PROTOCOL',
  'LYRA COMMAND CORE',
];

function playBootAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const start = context.currentTime + 0.04;
  [146.8, 220, 293.7, 440, 587.3].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index < 2 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start + index * 0.11);
    gain.gain.setValueAtTime(0.0001, start + index * 0.11);
    gain.gain.exponentialRampToValueAtTime(0.035, start + index * 0.11 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.11 + 0.28);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start + index * 0.11);
    oscillator.stop(start + index * 0.11 + 0.3);
  });
  window.setTimeout(() => context.close().catch(() => {}), 1200);
}

function BootSequence() {
  const [visible, setVisible] = useState(
    () => sessionStorage.getItem('ta-boot-complete') !== 'true'
  );
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;
    const timer = window.setInterval(
      () => setActiveStep((step) => Math.min(step + 1, bootSteps.length - 1)),
      420
    );
    return () => window.clearInterval(timer);
  }, [visible]);

  if (!visible) return null;
  const enter = () => {
    playBootAudio();
    sessionStorage.setItem('ta-boot-complete', 'true');
    window.setTimeout(() => setVisible(false), 700);
  };

  return (
    <div className="boot-sequence-screen fixed inset-0 z-[120] flex items-center justify-center p-5">
      <div className="boot-sequence-frame relative w-full max-w-2xl overflow-hidden rounded-lg border border-emerald-300/35 bg-black/90 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-moving-grid opacity-30" />
        <div className="relative">
          <div className="mb-7 flex items-center justify-between gap-5">
            <div>
              <p className="command-kicker">Tactical Atlas Intelligence OS // v4.6</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-[0.16em] text-slate-50 sm:text-4xl">
                COMMAND FACILITY
              </h1>
            </div>
            <div className="boot-core">
              <div className="boot-core-center" />
            </div>
          </div>
          <div className="space-y-2">
            {bootSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center justify-between border-b border-emerald-400/10 py-2 font-mono text-[9px] tracking-[0.2em]"
              >
                <span className={index <= activeStep ? 'text-slate-200' : 'text-slate-600'}>
                  {step}
                </span>
                <span className={index <= activeStep ? 'text-emerald-300' : 'text-slate-700'}>
                  {index <= activeStep ? 'READY' : 'WAIT'}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={enter}
            className="command-button mt-7 flex w-full items-center justify-center gap-2 py-3 text-[10px]"
          >
            <Play className="h-3.5 w-3.5" /> INITIALIZE WITH AUDIO
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('ta-boot-complete', 'true');
              setVisible(false);
            }}
            className="mt-3 w-full font-mono text-[8px] tracking-widest text-slate-500 hover:text-slate-300"
          >
            ENTER WITHOUT AUDIO
          </button>
        </div>
      </div>
    </div>
  );
}

const statusItems = [
  ['DATABASE', 'CONFIG READY'],
  ['ATLAS KERNEL', 'ONLINE'],
  ['AI GATEWAY', 'SECURE'],
  ['TAAN', '9 AGENTS'],
  ['APPROVALS', '3 PENDING'],
  ['GUARDIAN', 'ACTIVE'],
];

export default function Headquarters({ onNavigate, notifications }) {
  const mission = CASE_FILES_EXPANDED[0];
  const [agentStatuses, setAgentStatuses] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/departments', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('preview'))))
      .then((data) => setAgentStatuses(data.departments || {}))
      .catch(() => setAgentStatuses({}));
    return () => controller.abort();
  }, []);

  return (
    <div className="relative min-h-screen space-y-3 overflow-hidden bg-command-room p-3 sm:p-4">
      <BootSequence />
      <div className="pointer-events-none absolute inset-0 bg-moving-grid opacity-10" />
      <div className="pointer-events-none absolute inset-0 scanline-overlay opacity-10" />

      <section className="relative z-10 command-panel px-3 py-2" aria-label="System core status">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {statusItems.map(([label, value]) => (
            <div key={label} className="border-r border-emerald-400/10 px-2 last:border-0">
              <span className="block font-mono text-[7px] tracking-[0.16em] text-slate-500">
                {label}
              </span>
              <span
                className={`mt-1 block font-mono text-[9px] ${value.includes('PENDING') ? 'text-amber-300' : 'text-emerald-300'}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="relative z-10 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <ExpeditionMap onSelectCase={(caseId) => onNavigate('/cases', caseId)} />
        </div>
        <section
          className="command-panel flex min-h-[360px] flex-col p-3 xl:col-span-4"
          aria-labelledby="mission-title"
        >
          <div className="mb-3 flex items-start justify-between border-b border-emerald-400/15 pb-2">
            <div>
              <h3 id="mission-title" className="command-title">
                MISSION THEATER
              </h3>
              <p className="command-kicker">Primary objective</p>
            </div>
            <span className="status-chip status-chip-gold">ACTIVE</span>
          </div>
          <SafeImage
            src={mission?.image}
            alt="Current Tactical Atlas mission"
            className="h-40 w-full rounded border border-amber-300/20 object-cover brightness-75 contrast-125 sepia-[0.25]"
          />
          <div className="mt-3 flex-1">
            <h4 className="font-display text-xl font-bold tracking-wider text-slate-50">
              {mission?.title || 'EL DORADO'}
            </h4>
            <p className="command-kicker">Lost civilizations // active investigation</p>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[8px] text-slate-400">
              <span>
                RESEARCH <b className="float-right text-emerald-300">92%</b>
              </span>
              <span>
                RISK <b className="float-right text-amber-300">MODERATE</b>
              </span>
              <span>
                INSPECTOR <b className="float-right text-emerald-300">READY</b>
              </span>
              <span>
                LEGION <b className="float-right text-emerald-300">CLEAR</b>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/cases', mission?.id)}
            className="command-button mt-3 flex items-center justify-center gap-2 py-2"
          >
            OPEN DOSSIER <ArrowRight className="h-3 w-3" />
          </button>
        </section>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <LyraAssistantPanel />
        </div>
        <section className="command-panel p-4 xl:col-span-8" aria-labelledby="taim-title">
          <div className="flex items-start justify-between border-b border-emerald-400/15 pb-3">
            <div>
              <h3 id="taim-title" className="command-title">
                TAIM // INTELLIGENCE MODEL
              </h3>
              <p className="command-kicker">Governed context, doctrine, provenance + permissions</p>
            </div>
            <span className="status-chip status-chip-green">CONTROLLED</span>
          </div>
          <div className="my-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              [Database, 'CONTEXT', 'Indexed'],
              [Network, 'PROVENANCE', 'Tracked'],
              [LockKeyhole, 'PERMISSIONS', 'Enforced'],
              [ShieldCheck, 'DOCTRINE', 'Locked'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="metric-card">
                <Icon className="mb-3 h-5 w-5 text-emerald-300" />
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="rounded border border-emerald-400/15 bg-black/25 p-3">
            <p className="mb-3 font-mono text-[8px] tracking-[0.18em] text-slate-500">
              GOVERNED COMMAND FLOW
            </p>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[8px] text-slate-200">
              {[
                'LYRA',
                'TAIM',
                'TAAN',
                'DEPARTMENTS',
                'INSPECTOR',
                'LEGION',
                'APPROVAL',
                'ARCHIVES',
              ].map((step, index, list) => (
                <React.Fragment key={step}>
                  <span className="flow-node">{step}</span>
                  {index < list.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-emerald-400/60" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <ProductionPipeline />
          </div>
        </section>
      </div>

      <div className="relative z-10">
        <TaanNetwork onNavigate={onNavigate} statuses={agentStatuses} />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="command-panel p-3">
          <h3 className="command-title">INTELLIGENCE FEED</h3>
          <p className="command-kicker mb-3">Live updates</p>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((item) => (
              <div key={item.id} className="feed-row">
                <Activity className="h-3 w-3 text-emerald-300" />
                <span className="truncate">{item.title}</span>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </section>
        <section className="command-panel p-3">
          <h3 className="command-title">APPROVAL QUEUE</h3>
          <p className="command-kicker mb-3">Commander authority required</p>
          {['Publish mission briefing', 'Promote visual package', 'Archive verified dossier'].map(
            (item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => onNavigate(index === 2 ? '/archives' : '/operations')}
                className="feed-row mb-2 w-full text-left"
              >
                <CheckCircle2 className="h-3 w-3 text-amber-300" />
                <span className="flex-1">{item}</span>
                <b className="text-amber-300">REVIEW</b>
              </button>
            )
          )}
        </section>
        <section className="command-panel p-3">
          <h3 className="command-title">GUARDIAN PROTOCOL</h3>
          <p className="command-kicker mb-3">Security + governance</p>
          {[
            'Founder authority enforced',
            'Human approval gates active',
            'Audit trail prepared',
            'Rollback path available',
          ].map((item) => (
            <div key={item} className="feed-row mb-2">
              <ShieldCheck className="h-3 w-3 text-emerald-300" />
              <span>{item}</span>
              <b className="ml-auto text-emerald-300">ON</b>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
