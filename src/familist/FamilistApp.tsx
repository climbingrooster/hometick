import { useState } from 'react';
import { ModeNormal } from './ModeNormal';
import { ModeCourses } from './ModeCourses';

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-[390px] h-[836px] rounded-[44px] overflow-hidden border-[8px] border-[#2A2A3E] flex flex-col bg-background relative"
      style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.32)' }}
    >
      {/* iOS status bar */}
      <div className="h-11 bg-surface flex items-center justify-between px-6 text-xs font-semibold text-foreground shrink-0">
        <span>9:41</span>
        <div className="flex gap-1.5 items-center text-[11px] text-text-secondary">
          <span>●●●</span>
          <span>WiFi</span>
          <span className="text-sm">▮</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden relative">{children}</div>
    </div>
  );
}

export function FamilistApp() {
  const [mode, setMode] = useState<'normal' | 'courses'>('normal');
  const toggle = () => setMode((m) => (m === 'normal' ? 'courses' : 'normal'));
  // Simple mobile detection by viewport
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

  return (
    <PhoneFrame>
      {mode === 'normal' ? (
        <ModeNormal mobile={mobile} onSwitch={toggle} />
      ) : (
        <ModeCourses mobile={mobile} onSwitch={toggle} />
      )}
    </PhoneFrame>
  );
}
