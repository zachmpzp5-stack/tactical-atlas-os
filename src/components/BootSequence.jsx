import { useEffect, useState } from "react";

const sequence = [
  "INITIALIZING TACTICAL ATLAS OS v4.6",
  "LOADING ATLAS KERNEL...",
  "CONNECTING INTELLIGENCE NETWORK...",
  "VERIFYING LYRA CORE...",
  "CHECKING CLEARANCE LEVEL...",
  "SYSTEM ONLINE",
];

export default function BootSequence({ children }) {
  const [started, setStarted] = useState(false);
  const [booting, setBooting] = useState(true);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!started) return;

    let index = 0;

    const timer = setInterval(() => {
      setText(sequence[index]);
      index += 1;

      if (index === sequence.length) {
        clearInterval(timer);

        setTimeout(() => {
          setBooting(false);
        }, 1200);
      }
    }, 700);

    return () => clearInterval(timer);
  }, [started]);

  const startSystem = () => {
    const audio = new Audio("/audio/boot-sequence.mp3");
    audio.volume = 0.35;
    audio.play().catch((error) => {
      console.error("Boot audio failed:", error);
    });

    setStarted(true);
  };

  if (!started) {
    return (
      <div className="boot-screen">
        <button className="boot-start-button" onClick={startSystem}>
          INITIALIZE SYSTEM
        </button>
      </div>
    );
  }

  if (!booting) return children;

  return (
    <div className="boot-screen">
      <div className="boot-logo">TACTICAL ATLAS</div>

      <div className="boot-text">{text}</div>

      <div className="boot-bar">
        <div className="boot-progress"></div>
      </div>
    </div>
  );
}
