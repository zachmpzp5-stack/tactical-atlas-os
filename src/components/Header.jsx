import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SYSTEM_STATUS } from '../data/mockData';
import InstallAppButton from './InstallAppButton';

export default function Header({ onToggleMobileMenu, onOpenNotifications, unreadCount }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const [clockText, setClockText] = useState({ time: '00:00:00 UTC', date: '01 JAN 2026' });
  const [operator, setOperator] = useState(() => ({
    name: localStorage.getItem('ta_operator_name') || SYSTEM_STATUS.userName,
    clearance: localStorage.getItem('ta_clearance') || SYSTEM_STATUS.clearance,
  }));

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

  const submitSearch = () => {
    const query = (searchInputRef.current?.value || searchQuery).trim();
    if (!query) return;
    navigate(`/cases?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const syncOperator = () =>
      setOperator({
        name: localStorage.getItem('ta_operator_name') || SYSTEM_STATUS.userName,
        clearance: localStorage.getItem('ta_clearance') || SYSTEM_STATUS.clearance,
      });
    window.addEventListener('ta:clearance-change', syncOperator);
    return () => window.removeEventListener('ta:clearance-change', syncOperator);
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
            {operator.name}
          </h2>
          <span className="font-mono text-[9px] text-bronze-gold tracking-widest hidden sm:block uppercase mt-0.5">
            {operator.clearance === 'OMEGA' ? SYSTEM_STATUS.role : 'AUTHORIZED OPERATOR'}
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
        <form
          className="relative hidden md:block"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch();
          }}
        >
          <Link
            to={
              searchQuery.trim()
                ? `/cases?search=${encodeURIComponent(searchQuery.trim())}`
                : '/cases'
            }
            aria-label="Search cases"
            className="absolute left-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:text-bronze-gold focus:outline-none focus:ring-1 focus:ring-bronze-gold"
          >
            <Search className="h-3.5 w-3.5" />
          </Link>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="SEARCH INTEL, CASES..."
            aria-label="Search Intel and Cases"
            className="w-48 lg:w-64 pl-8 pr-3 py-1.5 bg-[#07110d] border border-tactical-green/30 rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bronze-gold focus:ring-1 focus:ring-bronze-gold"
          />
        </form>

        <InstallAppButton />

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
          <img
            src="/assets/tactical-atlas-icon.png"
            alt=""
            aria-hidden="true"
            className="h-5 w-5 rounded border border-bronze-gold/40 object-cover"
          />
          <span className="text-bronze-gold text-[10px] font-bold hidden sm:inline">
            CLEARANCE: {operator.clearance}
          </span>
        </div>
      </div>
    </header>
  );
}
