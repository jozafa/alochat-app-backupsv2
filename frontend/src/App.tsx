import { useEffect, useState } from 'react';
import { api, Unauthorized } from './api';
import Login from './Login';
import Dashboard from './Dashboard';
import Settings from './Settings';
import ChatViewer from './ChatViewer';

export type View = { name: 'dashboard' } | { name: 'settings' } | { name: 'chat'; id: number };

export default function App() {
  const [authed, setAuthed] = useState<'loading' | 'no' | 'yes'>('loading');
  const [view, setView] = useState<View>({ name: 'dashboard' });

  useEffect(() => {
    api('/api/cleaning')
      .then(() => setAuthed('yes'))
      .catch((err) => setAuthed(err instanceof Unauthorized ? 'no' : 'yes'));
  }, []);

  async function logout() {
    await api('/api/logout', { method: 'POST' }).catch(() => undefined);
    setView({ name: 'dashboard' });
    setAuthed('no');
  }

  if (authed === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando…</div>;
  }
  if (authed === 'no') {
    return <Login onSuccess={() => setAuthed('yes')} />;
  }
  return (
    <div className="min-h-screen bg-gray-100">
      {view.name === 'dashboard' && <Dashboard setView={setView} onLogout={logout} />}
      {view.name === 'settings' && <Settings onBack={() => setView({ name: 'dashboard' })} />}
      {view.name === 'chat' && (
        <ChatViewer id={view.id} onBack={() => setView({ name: 'dashboard' })} />
      )}
    </div>
  );
}
