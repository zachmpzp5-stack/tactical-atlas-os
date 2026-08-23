import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  if (installed || !installPrompt) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      aria-label="Install Tactical ATLAS desktop app"
      title="Install Tactical ATLAS desktop app"
      className="flex items-center gap-2 rounded border border-bronze-gold/50 bg-[#07110d] px-2.5 py-2 font-mono text-[10px] font-bold tracking-wider text-bronze-gold shadow-bronze transition-colors hover:bg-bronze-gold/10 focus:outline-none focus:ring-2 focus:ring-bronze-gold"
    >
      <Download className="h-4 w-4" />
      <span className="hidden xl:inline">INSTALL DESKTOP</span>
    </button>
  );
}
