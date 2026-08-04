import React, { useEffect } from 'react';
import { X, Bell, CheckCheck } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose, notifications, onMarkAllRead }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification panel overlay"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-default border-none w-full h-full"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Intelligence Feed Notifications"
        className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-stone-panel border-l border-stone-border z-50 shadow-2xl p-4 flex flex-col font-mono text-xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-border mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-bronze-gold" />
            <h3 className="font-serif font-bold text-sm text-slate-100 uppercase">
              INTELLIGENCE FEED
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Notification Panel"
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded border transition-colors ${
                item.read
                  ? 'bg-stone-bg/50 border-stone-border/40 opacity-70'
                  : 'bg-stone-bg border-stone-border hover:border-bronze-gold/40'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-panel border border-stone-border text-bronze-gold font-bold">
                  {item.type}
                </span>
                <span className="text-[9px] text-slate-500">{item.time}</span>
              </div>
              <p className="text-slate-200 leading-snug">{item.title}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-border mt-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="w-full py-2 bg-stone-bg hover:bg-stone-card border border-stone-border text-slate-300 rounded font-bold uppercase flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-3.5 h-3.5 text-tactical-green" />
            MARK ALL AS READ
          </button>
        </div>
      </div>
    </>
  );
}
