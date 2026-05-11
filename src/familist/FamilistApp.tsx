import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModeNormal } from './ModeNormal';
import { ModeCourses } from './ModeCourses';

/**
 * On desktop wide screens, the app sits inside a phone-shaped frame.
 * On real phones / narrow viewports, it fills the entire screen with safe areas.
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile / narrow: full-screen */}
      <div className="md:hidden min-h-[100dvh] w-full bg-background flex flex-col">
        {children}
      </div>

      {/* Desktop preview: phone frame */}
      <div className="hidden md:flex min-h-screen w-full bg-[#1C1C2E] items-center justify-center p-8">
        <div
          className="w-[390px] h-[836px] rounded-[44px] overflow-hidden border-[8px] border-[#2A2A3E] flex flex-col bg-background relative"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.32)' }}
        >
          <div className="h-9 bg-surface flex items-center justify-between px-6 text-xs font-semibold text-foreground shrink-0 border-b border-border-soft">
            <span>9:41</span>
            <span className="text-[11px] text-text-secondary">Familist</span>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden relative">{children}</div>
        </div>
      </div>
    </>
  );
}

export function FamilistApp({ userId }: { userId: string }) {
  const [mode, setMode] = useState<'normal' | 'courses'>('normal');
  const toggle = () => setMode((m) => (m === 'normal' ? 'courses' : 'normal'));

  // Make sure both shells receive the same content (only one is visible at a time)
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Hydrate mode from URL hash to persist between renders
  useEffect(() => {
    if (window.location.hash === '#courses') setMode('courses');
  }, []);
  useEffect(() => {
    window.location.hash = mode === 'courses' ? 'courses' : '';
  }, [mode]);

  return (
    <Shell>
      {mode === 'normal' ? (
        <ModeNormal userId={userId} onSwitch={toggle} onSignOut={handleSignOut} />
      ) : (
        <ModeCourses userId={userId} onSwitch={toggle} />
      )}
    </Shell>
  );
}
