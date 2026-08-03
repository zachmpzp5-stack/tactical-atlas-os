import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, Clock } from 'lucide-react';
import { SYSTEM_STATUS } from '../data/mockData';

export default function Header({ onToggleMobileMenu, onOpenNotifications, unreadCount }) {
  const [clockText, setClockText] = useState({ time: '00:00:00 UTC', date: '01 JAN 2026' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const months = [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
      ];
      const month = months[now.getUTCMonth()];
      const year = now.getUTCFullYear();

      setClockText({
        time: `${hours}:${mins}:${secs} UTC`,
        date: `${day} ${month} ${year}`,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#07110d]/95 backdrop-blur-md border-b border-tactical-green/35 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open Mobile Menu"
          className="p-2 rounded bg-[#07110d] border border-bronze-gold/50 text-slate-300 hover:text-white lg:hidden focus:outline-none focus:ring-2 focus:ring-bronze-gold shadow-bronze"
        >
          <Menu className="w-5 h-5 text-bronze-gold" />
        </button>

        <div>
          <span className="font-mono text-[9px] text-slate-400 tracking-widest block uppercase">
            WELCOME BACK,
          </span>
          <h2 className="font-serif font-bold text-xs sm:text-sm text-slate-100 tracking-wider uppercase leading-none text-glow-bronze">
            {SYSTEM_STATUS.userName}
          </h2>
          <span className="font-mono text-[9px] text-bronze-gold tracking-widest hidden sm:block uppercase mt-0.5">
            {SYSTEM_STATUS.role}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#07110d] border border-tactical-green/30 rounded font-mono text-xs shadow-[inset_0_0_0_1px_rgba(16,185,129,0.08)]">
          <Clock className="w-3.5 h-3.5 text-bronze-gold flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-bronze-gold font-bold leading-none">{clockText.time}</span>
            <span className="text-slate-500 text-[9px] leading-tight mt-0.5">{clockText.date}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="SEARCH INTEL, CASES..."
            aria-label="Search Intel and Cases"
            className="w-48 lg:w-64 pl-8 pr-3 py-1.5 bg-[#07110d] border border-tactical-green/30 rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bronze-gold focus:ring-1 focus:ring-bronze-gold"
          />
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open Notifications Drawer"
          className="relative p-2 rounded bg-[#07110d] border border-tactical-green/30 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-bronze-gold shadow-tactical"
        >
          <Bell className="w-4 h-4 text-bronze-gold" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-tactical-green text-stone-bg text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 bg-stone-bg border border-bronze-gold/40 rounded font-mono text-xs">
          <span className="w-5 h-5 rounded bg-bronze-gold/20 text-bronze-gold flex items-center justify-center font-bold text-[10px]">
            TA
          </span>
          <span className="text-bronze-gold text-[10px] font-bold hidden sm:inline">
            CLEARANCE: {SYSTEM_STATUS.clearance}
          </span>
        </div>
      </div>
    </header>
  );
}
