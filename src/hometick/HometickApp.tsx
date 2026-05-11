import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModeNormal } from './ModeNormal';
import { ModeCourses } from './ModeCourses';
import { useHometick } from './hooks/useHometick';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="md:hidden min-h-[100dvh] w-full bg-background flex flex-col">{children}</div>
      <div className="hidden md:flex min-h-screen w-full bg-[#1C1C2E] items-center justify-center p-8">
        <div
          className="w-[390px] h-[836px] rounded-[44px] overflow-hidden border-[8px] border-[#2A2A3E] flex flex-col bg-background relative"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.32)' }}
        >
          <div className="h-9 bg-surface flex items-center justify-between px-6 text-xs font-semibold text-foreground shrink-0 border-b border-border-soft">
            <span>9:41</span>
            <span className="text-[11px] text-text-secondary">Hometick</span>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden relative">{children}</div>
        </div>
      </div>
    </>
  );
}

export function HometickApp({ userId }: { userId: string }) {
  const [mode, setMode] = useState<'normal' | 'courses'>('normal');
  const hometick = useHometick(userId);
  const toggle = () => setMode((m) => (m === 'normal' ? 'courses' : 'normal'));
  const handleSignOut = async () => { await supabase.auth.signOut(); };

  useEffect(() => {
    if (window.location.hash === '#courses') setMode('courses');
  }, []);
  useEffect(() => {
    window.location.hash = mode === 'courses' ? 'courses' : '';
  }, [mode]);

  return (
    <Shell>
      {mode === 'normal' ? (
        <ModeNormal f={hometick} onSwitch={toggle} onSignOut={handleSignOut} />
      ) : (
        <ModeCourses f={hometick} onSwitch={toggle} />
      )}
    </Shell>
  );
}
