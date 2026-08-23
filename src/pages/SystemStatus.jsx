import React, { useEffect, useState } from 'react';
import { Activity, Server, ShieldCheck } from 'lucide-react';

export default function SystemStatus() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal }).then((response) => response.ok ? response.json() : Promise.reject()).then(setHealth).catch(() => setError(true));
    return () => controller.abort();
  }, []);
  const components = health?.components || {};
  const integrations = health?.integrations || {};
  const cloudServices = health?.cloud?.services || {};
  return (
    <div className="space-y-4">
      <section className="command-panel p-4">
        <h3 className="command-title">CLOUD INFRASTRUCTURE // {health?.cloud?.provider || 'UNVERIFIED'}</h3>
        <p className="command-kicker">SOURCE SERVER_ENVIRONMENT // FRESH {health?.timestamp || 'UNAVAILABLE'}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(cloudServices).map(([name, detail]) => <div key={name} className="feed-row"><span>{name}</span><b className="ml-auto text-amber-300">{detail.status}</b></div>)}</div>
      </section>
      <section className="command-panel p-4">
        <h2 className="command-title flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-300" /> SYSTEM STATUS</h2>
        <p className="command-kicker">Verified configuration state // execution {health?.executionMode || 'READ_ONLY'}</p>
      </section>
      {error && <section className="command-panel p-4 text-amber-300">HEALTH API DISCONNECTED</section>}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(components).map(([name, detail]) => <article key={name} className="command-panel p-3"><Server className="mb-2 h-4 w-4 text-emerald-300" /><h3 className="command-title">{name.replaceAll('_', ' ')}</h3><span className="status-chip status-chip-gold">{detail.status}</span><p className="mt-2 text-[9px] text-slate-500">SOURCE {detail.source || detail.persistence || 'SERVER_RUNTIME'} · {detail.executionMode || detail.learningMode || 'STATUS_ONLY'}</p></article>)}
      </section>
      <section className="command-panel p-4">
        <h3 className="command-title flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> PLATFORM INTEGRATIONS</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(integrations).map(([name, detail]) => <div key={name} className="feed-row"><span>{name}</span><b className="ml-auto text-amber-300">{detail.status}</b></div>)}</div>
      </section>
    </div>
  );
}
