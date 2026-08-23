import { useEffect, useState } from 'react';

const sequence = [
  'INITIALIZING TACTICAL ATLAS OS v4.6',
  'LOADING ATLAS KERNEL...',
  'CONNECTING INTELLIGENCE NETWORK...',
  'VERIFYING LYRA CORE...',
  'CHECKING CLEARANCE LEVEL...',
  'SYSTEM ONLINE',
];

export default function BootSequence({ children }) {
  const [started, setStarted] = useState(false);
  const [booting, setBooting] = useState(true);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!started) return;

    let index = 0;
    let completionTimer;

    const timer = window.setInterval(() => {
      setText(sequence[index]);
      index += 1;

      if (index === sequence.length) {
        window.clearInterval(timer);

        completionTimer = window.setTimeout(() => {
          setBooting(false);
        }, 1200);
      }
    }, 700);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(completionTimer);
    };
  }, [started]);

  const startSystem = () => {
    const audio = new Audio('/audio/boot-sequence.mp3');
    audio.volume = 0.35;
    audio.play().catch((error) => {
      console.error('Boot audio failed:', error);
    });

    setStarted(true);
  };

  if (!started) {
    return (
      <div className="boot-screen">
        <main className="boot-identity" aria-labelledby="boot-title">
          <img
            className="boot-brand-art"
            src="/assets/tactical-atlas-brand.png"
            alt=""
            aria-hidden="true"
          />
          <h1 id="boot-title" className="sr-only">
            Tactical ATLAS
          </h1>
          <button type="button" className="boot-start-button" onClick={startSystem}>
            INITIALIZE SYSTEM
          </button>
          <span className="boot-version">FIELD COMMAND // PERSONAL BUILD v4.6</span>
        </main>
      </div>
    );
  }

  if (!booting) return children;

  return (
    <div className="boot-screen">
      <main className="boot-sequence-frame" aria-live="polite">
        <img
          className="boot-brand-art boot-brand-art-active"
          src="/assets/tactical-atlas-brand.png"
          alt="Tactical ATLAS flat-earth emblem"
        />
        <div className="boot-status-line">{text}</div>
        <div className="boot-progress-track" aria-hidden="true">
          <div className="boot-progress-fill" />
        </div>
      </main>
    </div>
  );
}
