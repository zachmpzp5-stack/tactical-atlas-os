import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  BookOpen,
  Archive,
  Image,
  Globe,
  Shield,
  BarChart2,
  Cpu,
  Settings,
  Activity,
  X,
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, onClose }) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const navItems = [
    { name: 'HEADQUARTERS', path: '/', icon: LayoutDashboard },
    { name: 'OPERATIONS', path: '/operations', icon: Compass },
    { name: 'GRAND LIBRARY', path: '/library', icon: BookOpen },
    { name: 'ATLAS ARCHIVES', path: '/archives', icon: Archive },
    { name: 'MEDIA VAULT', path: '/vault', icon: Image },
    { name: 'RESEARCH NETWORK', path: '/research', icon: Globe },
    { name: 'CASE FILES', path: '/cases', icon: Shield },
    { name: 'AI PRODUCTION', path: '/ai-studio', icon: Cpu },
    { name: 'ANALYTICS', path: '/analytics', icon: BarChart2 },
    { name: 'SYSTEM STATUS', path: '/status', icon: Activity },
    { name: 'SETTINGS', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation overlay"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden cursor-default border-none w-full h-full"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#07110d]/95 backdrop-blur-md border-r border-tactical-green/40 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-4 border-b border-stone-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-bronze-gold flex items-center justify-center bg-[#07110d] shadow-bronze">
                <Compass
                  className="w-5 h-5 text-bronze-gold animate-spin"
                  style={{ animationDuration: '24s' }}
                />
              </div>
              <div>
                <h1 className="font-serif font-black text-xs tracking-wider text-slate-100 uppercase leading-none text-glow-green">
                  TACTICAL ATLAS
                </h1>
                <span className="font-mono text-[8px] text-bronze-gold tracking-widest block mt-0.5 uppercase">
                  INTELLIGENCE OS v3.0
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Sidebar"
              className="p-1 text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded transition-all group tracking-wider uppercase ${
                      isActive
                        ? 'bg-tactical-dim/80 text-tactical-glow border-l-2 border-tactical-green shadow-tactical font-bold'
                        : 'text-slate-400 hover:bg-stone-card/60 hover:text-slate-200 hover:border hover:border-bronze-gold/35'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-bronze-gold transition-colors" />
                  <span className="truncate text-[11px]">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-tactical-green/20 bg-[#07110d]/80">
          <p className="font-serif text-[9px] text-bronze-gold/90 italic leading-tight">
            "THE TRUTH IS OUT THERE. WE FIND IT. WE SHARE IT. WE REMEMBER."
          </p>
          <span className="font-mono text-[8px] text-slate-500 block mt-1 font-bold">
            — GENERAL HIIIT
          </span>
        </div>
      </aside>
    </>
  );
}
