import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuthSession } from '@/components/ProtectedRoute';
import { toast } from 'sonner';

export default function Auth() {
  const { session, loading } = useAuthSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center bg-background text-text-secondary">Chargement…</div>;
  if (session) return <Navigate to="/" replace />;

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/', { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Compte créé. Vérifie tes emails pour confirmer.');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error('Échec Google : ' + (result.error instanceof Error ? result.error.message : String(result.error)));
      setBusy(false);
      return;
    }
    if (result.redirected) return; // browser will navigate
    navigate('/', { replace: true });
  };

  return (
    <div
      className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center px-5 font-poppins"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-violet text-white text-2xl mb-3">🛒</div>
          <h1 className="text-2xl font-bold text-foreground">Familist</h1>
          <p className="text-sm text-text-secondary mt-1">Ta liste de courses, partout, toujours à jour.</p>
        </div>

        <div className="bg-surface border border-border-soft rounded-2xl p-5">
          <div className="flex bg-[#F0F0F0] rounded-xl p-1 mb-4">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-[13px] font-semibold rounded-lg cursor-pointer border-0 transition-all ${
                  tab === t ? 'bg-surface text-foreground shadow-sm' : 'bg-transparent text-text-secondary'
                }`}
              >
                {t === 'signin' ? 'Se connecter' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-2.5">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-background border border-border-soft rounded-lg px-3.5 py-3 text-sm outline-none focus:border-accent-violet font-poppins"
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-background border border-border-soft rounded-lg px-3.5 py-3 text-sm outline-none focus:border-accent-violet font-poppins"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-accent-violet text-white border-0 rounded-lg py-3 text-[14px] font-semibold cursor-pointer font-poppins disabled:opacity-60"
            >
              {busy ? '…' : tab === 'signin' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <div className="flex items-center gap-2 my-4 text-[10px] text-text-tertiary uppercase tracking-wider">
            <div className="flex-1 h-px bg-border-soft" />
            ou
            <div className="flex-1 h-px bg-border-soft" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full bg-surface border border-border-soft rounded-lg py-3 text-[14px] font-semibold cursor-pointer font-poppins flex items-center justify-center gap-2 hover-hover:hover:bg-[#FAFAF8] disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.32z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.93 6.93 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continuer avec Google
          </button>
        </div>
      </div>
    </div>
  );
}
