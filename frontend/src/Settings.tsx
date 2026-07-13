import { useEffect, useState } from 'react';
import { api, type BackupsResponse, type Cleaning, type ScheduleDay, type Settings as SettingsData } from './api';
import { fmtDate } from './format';

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // segunda primeiro, como na versão desktop

interface Feedback {
  ok: boolean;
  message: string;
}

export default function Settings({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    alochat_base_url: '',
    alochat_api_key: '',
    s3_endpoint: '',
    s3_region: '',
    s3_bucket: '',
    s3_access_key_id: '',
    s3_secret_access_key: '',
  });
  const [secretsSet, setSecretsSet] = useState({ alochat: false, s3: false });
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [cleaning, setCleaning] = useState<Cleaning | null>(null);
  const [pendingFull, setPendingFull] = useState(false);
  const [saveMsg, setSaveMsg] = useState<Feedback | null>(null);
  const [testAlochat, setTestAlochat] = useState<Feedback | null>(null);
  const [testS3, setTestS3] = useState<Feedback | null>(null);
  const [scheduleMsg, setScheduleMsg] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<SettingsData>('/api/settings').then((s) => {
      setForm((f) => ({
        ...f,
        alochat_base_url: s.alochat_base_url,
        s3_endpoint: s.s3_endpoint,
        s3_region: s.s3_region,
        s3_bucket: s.s3_bucket,
        s3_access_key_id: s.s3_access_key_id,
      }));
      setSecretsSet({ alochat: s.alochat_api_key_set, s3: s.s3_secret_access_key_set });
    });
    api<{ days: ScheduleDay[] }>('/api/schedule').then((r) => setDays(r.days));
    api<{ cleaning: Cleaning | null }>('/api/cleaning').then((r) => setCleaning(r.cleaning));
    api<BackupsResponse>('/api/backups?page=1').then((r) => setPendingFull(r.totalCatalogued === 0));
  }, []);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  }

  async function save(): Promise<boolean> {
    setBusy(true);
    setSaveMsg(null);
    try {
      await api('/api/settings', { method: 'PUT', body: JSON.stringify(form) });
      if (form.alochat_api_key) setSecretsSet((s) => ({ ...s, alochat: true }));
      if (form.s3_secret_access_key) setSecretsSet((s) => ({ ...s, s3: true }));
      setForm((f) => ({ ...f, alochat_api_key: '', s3_secret_access_key: '' }));
      setSaveMsg({ ok: true, message: 'Configurações salvas.' });
      return true;
    } catch (err) {
      setSaveMsg({ ok: false, message: err instanceof Error ? err.message : 'Erro ao salvar' });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function testConnection(kind: 'alochat' | 's3') {
    const setResult = kind === 'alochat' ? setTestAlochat : setTestS3;
    setResult(null);
    if (!(await save())) return;
    setBusy(true);
    try {
      const r = await api<Feedback>(`/api/settings/test-${kind === 'alochat' ? 'alochat' : 's3'}`, {
        method: 'POST',
      });
      setResult(r);
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Erro no teste' });
    } finally {
      setBusy(false);
    }
  }

  async function saveSchedule() {
    setScheduleMsg(null);
    try {
      const payload = days.map((d) => ({
        dayOfWeek: d.day_of_week,
        enabled: !!d.enabled,
        time: d.time,
      }));
      const r = await api<{ days: ScheduleDay[] }>('/api/schedule', {
        method: 'PUT',
        body: JSON.stringify({ days: payload }),
      });
      setDays(r.days);
      setScheduleMsg({ ok: true, message: 'Agendamento salvo.' });
    } catch (err) {
      setScheduleMsg({ ok: false, message: err instanceof Error ? err.message : 'Erro ao salvar' });
    }
  }

  function updateDay(dow: number, patch: Partial<ScheduleDay>) {
    setDays((ds) => ds.map((d) => (d.day_of_week === dow ? { ...d, ...patch } : d)));
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4">
        ← Voltar ao Dashboard
      </button>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Configurações</h1>

      {pendingFull && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 mb-6">
          <p className="font-semibold text-amber-700 text-sm">⚠️ Backup Completo Pendente</p>
          <p className="text-sm text-amber-800">
            O backup completo ainda não foi realizado. Acesse o Dashboard para iniciá-lo.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link da Instância:</label>
            <input
              value={form.alochat_base_url}
              onChange={set('alochat_base_url')}
              placeholder="https://instancia.alochat.com.br"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key Global:</label>
            <input
              type="password"
              value={form.alochat_api_key}
              onChange={set('alochat_api_key')}
              placeholder={secretsSet.alochat ? '•••••••••••••••••••• (configurada)' : ''}
              className={inputCls}
            />
          </div>
          <hr className="border-gray-100" />
          <p className="text-sm font-semibold text-gray-700">Armazenamento (Backblaze B2)</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint S3:</label>
            <input
              value={form.s3_endpoint}
              onChange={set('s3_endpoint')}
              placeholder="https://s3.us-west-004.backblazeb2.com"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Região:</label>
              <input value={form.s3_region} onChange={set('s3_region')} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bucket:</label>
              <input value={form.s3_bucket} onChange={set('s3_bucket')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key ID:</label>
            <input value={form.s3_access_key_id} onChange={set('s3_access_key_id')} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Key:</label>
            <input
              type="password"
              value={form.s3_secret_access_key}
              onChange={set('s3_secret_access_key')}
              placeholder={secretsSet.s3 ? '•••••••••••••••••••• (configurada)' : ''}
              className={inputCls}
            />
          </div>
        </div>

        {saveMsg && (
          <p className={`text-sm mt-4 ${saveMsg.ok ? 'text-green-700' : 'text-red-600'}`}>{saveMsg.message}</p>
        )}
        {testAlochat && (
          <p className={`text-sm mt-2 ${testAlochat.ok ? 'text-green-700' : 'text-red-600'}`}>
            AlôChat: {testAlochat.message}
          </p>
        )}
        {testS3 && (
          <p className={`text-sm mt-2 ${testS3.ok ? 'text-green-700' : 'text-red-600'}`}>
            B2: {testS3.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={() => void save()}
            disabled={busy}
            className="flex-1 rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            Salvar
          </button>
          <button
            onClick={() => void testConnection('alochat')}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Testar AlôChat
          </button>
          <button
            onClick={() => void testConnection('s3')}
            disabled={busy}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Testar B2
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">Agendamento de Backup:</p>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-2.5 text-left w-20">Ativar</th>
                <th className="px-4 py-2.5 text-left">Dia</th>
                <th className="px-4 py-2.5 text-left w-32">Horário</th>
              </tr>
            </thead>
            <tbody>
              {DAY_ORDER.map((dow) => {
                const d = days.find((x) => x.day_of_week === dow);
                if (!d) return null;
                return (
                  <tr key={dow} className="border-t border-gray-100">
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={!!d.enabled}
                        onChange={(e) => updateDay(dow, { enabled: e.target.checked ? 1 : 0 })}
                      />
                    </td>
                    <td className="px-4 py-2.5">{DAY_NAMES[dow]}</td>
                    <td className="px-4 py-2.5">
                      <input
                        type="time"
                        value={d.time}
                        onChange={(e) => updateDay(dow, { time: e.target.value })}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {scheduleMsg && (
          <p className={`text-sm mt-3 ${scheduleMsg.ok ? 'text-green-700' : 'text-red-600'}`}>
            {scheduleMsg.message}
          </p>
        )}
        <button
          onClick={() => void saveSchedule()}
          className="mt-4 w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700"
        >
          Salvar
        </button>

        {cleaning?.scheduled && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mt-4">
            <p className="text-sm font-semibold text-gray-700">⏳ Limpeza de Armazenamento Agendada</p>
            <p className="text-sm text-gray-600">
              Há uma limpeza agendada para {fmtDate(cleaning.date)} envolvendo os chats do ID{' '}
              {cleaning.firstId} até {cleaning.lastId}. O backup desses chats será feito automaticamente
              antes da limpeza.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
