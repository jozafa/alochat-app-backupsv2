import { useState, type FormEvent } from 'react';
import { api } from './api';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100 flex items-center justify-center p-4">
      {/* brilhos decorativos */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 left-2/3 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <form
          onSubmit={submit}
          className="rounded-3xl bg-white shadow-2xl shadow-blue-200/60 ring-1 ring-gray-100 p-9"
        >
          <img src="/alochat_logo.png" alt="AlôChat" className="h-11 mx-auto mb-3" />
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-600 mb-8">
            Gerenciador de Backup
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha de acesso</label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
          />
          {error && <p className="text-sm text-red-600 mt-2.5">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 active:scale-[0.99] transition disabled:opacity-50"
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-6">
            Acesso restrito · backups protegidos em nuvem
          </p>
        </form>
      </div>
    </div>
  );
}
