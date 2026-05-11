import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModeNormal } from './ModeNormal';
import { ModeCourses } from './ModeCourses';
import { CategoryManager } from './CategoryManager';
import { useHometick } from './hooks/useHometick';

type Mode = 'normal' | 'action' | 'categories';

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
  const [mode, setMode] = useState<Mode>('normal');
  const hometick = useHometick(userId);
  const handleSignOut = async () => { await supabase.auth.signOut(); };

  useEffect(() => {
    if (window.location.hash === '#action') setMode('action');
  }, []);
  useEffect(() => {
    if (mode === 'action') window.location.hash = 'action';
    else if (mode === 'normal') window.location.hash = '';
    // categories: no hash change
  }, [mode]);

  const handleFinishAction = async () => {
    await hometick.tapAllChecked();
    setMode('normal');
  };

  return (
    <Shell>
      {mode === 'normal' && (
        <ModeNormal
          f={hometick}
          onSwitchToAction={() => setMode('action')}
          onOpenCategories={() => setMode('categories')}
          onSignOut={handleSignOut}
        />
      )}
      {mode === 'action' && (
        <ModeCourses
          f={hometick}
          onFinish={handleFinishAction}
        />
      )}
      {mode === 'categories' && (
        <CategoryManager
          registry={hometick.registry}
          onRename={hometick.renameCategory}
          onRecolor={hometick.recolorCategory}
          onReorder={hometick.reorderCategories}
          onClose={() => setMode('normal')}
        />
      )}
    </Shell>
  );
}
