import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type BackupsResponse, type Cleaning, type Job, type RestoreResult, type Stats } from './api';
import { fmtBytes, fmtDate, fmtDateTime, fmtDuration, fmtMonth } from './format';
import type { View } from './App';

const JOB_LABELS: Record<string, string> = {
  full: 'Backup completo',
  range: 'Backup por período',
  daily: 'Rotina diária',
  cleaning: 'Backup preventivo de limpeza',
};

const JOB_STATUS: Record<string, { label: string; cls: string }> = {
  running: { label: 'Executando', cls: 'bg-blue-100 text-blue-700' },
  done: { label: 'Concluído', cls: 'bg-green-100 text-green-700' },
  error: { label: 'Erro', cls: 'bg-red-100 text-red-700' },
};

export default function Dashboard({
  setView,
  onLogout,
}: {
  setView: (v: View) => void;
  onLogout: () => void;
}) {
  const [data, setData] = useState<BackupsResponse | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cleaning, setCleaning] = useState<Cleaning | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<{
    ids: number[];
    phase: 'confirm' | 'running' | 'done';
    results: RestoreResult[];
  } | null>(null);
  const prevJobStatus = useRef<string | null>(null);

  const loadBackups = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (appliedSearch) params.set('search', appliedSearch);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    try {
      setData(await api<BackupsResponse>(`/api/backups?${params}`));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar backups');
    }
  }, [page, appliedSearch, startDate, endDate]);

  useEffect(() => {
    void loadBackups();
  }, [loadBackups]);

  const loadStats = useCallback(() => {
    api<Stats>('/api/stats')
      .then(setStats)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadStats();
    api<{ cleaning: Cleaning | null }>('/api/cleaning')
      .then((r) => setCleaning(r.cleaning))
      .catch(() => undefined);
  }, [loadStats]);

  // Polling do job: a cada 2,5s enquanto houver job rodando; recarrega a lista ao terminar.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    async function poll() {
      try {
        const { job: j } = await api<{ job: Job | null }>('/api/jobs/current');
        if (cancelled) return;
        setJob(j);
        if (prevJobStatus.current === 'running' && j?.status !== 'running') {
          void loadBackups();
          loadStats();
        }
        prevJobStatus.current = j?.status ?? null;
        timer = setTimeout(poll, j?.status === 'running' ? 2500 : 10000);
      } catch {
        timer = setTimeout(poll, 10000);
      }
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loadBackups, loadStats]);

  async function startJob(path: string, body?: unknown) {
    try {
      await api(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
      const { job: j } = await api<{ job: Job | null }>('/api/jobs/current');
      setJob(j);
      prevJobStatus.current = j?.status ?? null;
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar backup');
    }
  }

  function runFull() {
    if (
      window.confirm(
        'Iniciar o backup completo de todos os atendimentos da instância? Este processo pode demorar.'
      )
    ) {
      void startJob('/api/backups/full');
    }
  }

  function runRange() {
    if (!startDate || !endDate) {
      setError('Preencha Data Inicial e Data Final para o backup por período.');
      return;
    }
    void startJob('/api/backups/range', { startDate, endDate });
  }

  function openRestore(ids: number[]) {
    if (ids.length === 0) return;
    setModal({ ids: [...ids].sort((a, b) => a - b), phase: 'confirm', results: [] });
  }

  async function confirmRestore() {
    if (!modal) return;
    setModal({ ...modal, phase: 'running' });
    try {
      const r = await api<{ results: RestoreResult[]; aborted: boolean }>('/api/restore', {
        method: 'POST',
        body: JSON.stringify({ ids: modal.ids }),
      });
      setModal({ ids: modal.ids, phase: 'done', results: r.results });
      setSelected(new Set());
    } catch (err) {
      setModal({
        ids: modal.ids,
        phase: 'done',
        results: [
          { id: 0, ok: false, message: err instanceof Error ? err.message : 'Erro ao restaurar' },
        ],
      });
    }
  }

  function toggleSelected(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 20)));
  const running = job?.status === 'running';
  const allOnPageSelected = items.length > 0 && items.every((c) => selected.has(c.id));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gerenciador de Backup</h1>
        <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-700">
          Sair
        </button>
      </div>

      {/* Alerta de backup completo */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 mb-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-64">
          <p className="font-semibold text-amber-700 mb-1">⚠️ Atenção!</p>
          <p className="text-sm text-amber-800">
            Realize o backup completo de todos os atendimentos.
            <br />
            Este backup irá buscar todos os registros de atendimentos da instância, é um backup mais
            demorado. Os atendimentos já salvos são pulados automaticamente.
          </p>
        </div>
        <button
          onClick={runFull}
          disabled={running}
          className="rounded-lg bg-amber-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
        >
          ⬇ Backup Completo
        </button>
      </div>

      {/* Alerta de limpeza agendada */}
      {cleaning?.scheduled && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 mb-4">
          <p className="font-semibold text-amber-700 mb-1">⚠️ Limpeza de Armazenamento Agendada</p>
          <p className="text-sm text-amber-800">
            Há uma limpeza agendada para {fmtDate(cleaning.date)}: os chats do ID {cleaning.firstId} até{' '}
            {cleaning.lastId} serão excluídos da instância. O backup desses chats é feito automaticamente
            antes da limpeza.
          </p>
        </div>
      )}

      {/* Progresso do job */}
      {job && (running || job.status === 'error') && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">
              {JOB_LABELS[job.type] ?? job.type}
              {running ? ' em andamento…' : ' — falhou'}
            </p>
            <p className="text-sm text-gray-500">
              {job.done}/{job.total}
              {job.errors > 0 && <span className="text-red-600"> · {job.errors} erro(s)</span>}
            </p>
          </div>
          {running ? (
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${job.total ? Math.round(((job.done + job.errors) / job.total) * 100) : 0}%` }}
              />
            </div>
          ) : (
            <p className="text-sm text-red-600">{job.detail}</p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-4 mb-4">{error}</div>
      )}

      {/* Visão gerencial */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              ['TOTAL DE BACKUPS', stats.totalOk.toLocaleString('pt-BR')],
              ['TAMANHO TOTAL', fmtBytes(stats.totalSizeBytes)],
              ['COM ERRO', stats.totalErrors.toLocaleString('pt-BR')],
              ['ÚLTIMO BACKUP', stats.lastBackupAt ? fmtDateTime(stats.lastBackupAt) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-blue-900 tracking-wide mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">Últimos jobs</p>
              {stats.jobs.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum job executado ainda.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="py-1.5 pr-2">Tipo</th>
                      <th className="py-1.5 pr-2">Status</th>
                      <th className="py-1.5 pr-2">Feitos</th>
                      <th className="py-1.5 pr-2">Início</th>
                      <th className="py-1.5">Duração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.jobs.map((j) => (
                      <tr key={j.id} className="border-t border-gray-100" title={j.detail ?? undefined}>
                        <td className="py-1.5 pr-2">{JOB_LABELS[j.type] ?? j.type}</td>
                        <td className="py-1.5 pr-2">
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              JOB_STATUS[j.status]?.cls ?? 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {JOB_STATUS[j.status]?.label ?? j.status}
                          </span>
                        </td>
                        <td className="py-1.5 pr-2">
                          {j.done}/{j.total}
                          {j.errors > 0 && <span className="text-red-600"> · {j.errors} erro(s)</span>}
                        </td>
                        <td className="py-1.5 pr-2">{fmtDateTime(j.started_at)}</td>
                        <td className="py-1.5">{fmtDuration(j.started_at, j.finished_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">Backups por mês (início do atendimento)</p>
              {stats.byMonth.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum backup catalogado ainda.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="py-1.5 pr-2">Mês</th>
                      <th className="py-1.5 pr-2">Atendimentos</th>
                      <th className="py-1.5">Tamanho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byMonth.map((m) => (
                      <tr key={m.month} className="border-t border-gray-100">
                        <td className="py-1.5 pr-2 font-medium">{fmtMonth(m.month)}</td>
                        <td className="py-1.5 pr-2">{m.count.toLocaleString('pt-BR')}</td>
                        <td className="py-1.5">{fmtBytes(m.sizeBytes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {/* Filtros */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-56">
            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar Chat</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setAppliedSearch(search.trim());
                }
              }}
              placeholder="Buscar por ID, nome ou número…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(1);
                setStartDate(e.target.value);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(1);
                setEndDate(e.target.value);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => {
              setPage(1);
              setAppliedSearch(search.trim());
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Buscar
          </button>
          <button
            onClick={() => setView({ name: 'settings' })}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
          >
            Configurações
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-blue-700">{data?.total ?? 0} chat(s) carregado(s)</p>
          <div className="flex gap-2">
            <button
              onClick={runRange}
              disabled={running}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              🗓 Backup por Período
            </button>
            <button
              onClick={() => openRestore([...selected])}
              disabled={selected.size === 0 || running}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              ⬆ Restaurar Selecionados{selected.size > 0 ? ` (${selected.size})` : ''}
            </button>
          </div>
        </div>

        {/* Cards de resumo da listagem */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ['RESULTADOS ENCONTRADOS', (data?.total ?? 0).toLocaleString('pt-BR')],
            ['PÁGINA ATUAL', `${data?.page ?? 1}/${totalPages}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-blue-900 tracking-wide mb-1">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-3 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (allOnPageSelected) items.forEach((c) => next.delete(c.id));
                        else items.forEach((c) => next.add(c.id));
                        return next;
                      })
                    }
                  />
                </th>
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">Cliente</th>
                <th className="px-3 py-2.5">Número</th>
                <th className="px-3 py-2.5">Início</th>
                <th className="px-3 py-2.5">Fim</th>
                <th className="px-3 py-2.5">Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                    Nenhum backup catalogado ainda.
                  </td>
                </tr>
              )}
              {items.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelected(c.id)}
                      disabled={c.status !== 'ok'}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">{c.id}</td>
                  <td className="px-3 py-2">{c.client_name ?? ''}</td>
                  <td className="px-3 py-2">{c.client_number ?? ''}</td>
                  <td className="px-3 py-2">{fmtDate(c.begin_time)}</td>
                  <td className="px-3 py-2">{fmtDate(c.end_time)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {c.status === 'ok' ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setView({ name: 'chat', id: c.id })}
                          className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Ver
                        </button>
                        <a
                          href={`/api/chats/${c.id}/download`}
                          title="Baixar o arquivo de backup (chat-{id}.json.gz)"
                          className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Baixar
                        </a>
                        <button
                          onClick={() => openRestore([c.id])}
                          disabled={running}
                          className="rounded border border-blue-300 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                        >
                          Restaurar
                        </button>
                      </div>
                    ) : (
                      <span
                        title={c.error_message ?? undefined}
                        className="rounded bg-red-100 text-red-700 px-2 py-1 text-xs font-medium"
                      >
                        Erro
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Último backup: {data?.lastBackupAt ? fmtDateTime(data.lastBackupAt) : '—'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="text-xs text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>

      {/* Modal de restauração */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            {modal.phase === 'confirm' && (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Restaurar {modal.ids.length} atendimento(s)
                </h2>
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 mb-4">
                  <p className="font-semibold mb-1">⚠️ Atenção</p>
                  <p>
                    Cada atendimento restaurado recebe um <strong>novo ID sequencial</strong> na
                    instância — o ID original é sempre ignorado — e passa a ser tratado como o mais
                    recente pela limpeza automática. A instância também precisa ter espaço disponível.
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-5 break-words">
                  IDs: {modal.ids.slice(0, 15).join(', ')}
                  {modal.ids.length > 15 ? ` e mais ${modal.ids.length - 15}…` : ''}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setModal(null)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => void confirmRestore()}
                    className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
                  >
                    Restaurar agora
                  </button>
                </div>
              </>
            )}

            {modal.phase === 'running' && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm font-medium text-gray-700">
                  Restaurando {modal.ids.length} atendimento(s)…
                </p>
                <p className="text-xs text-gray-400 mt-1">Não feche esta janela.</p>
              </div>
            )}

            {modal.phase === 'done' && (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Restauração concluída: {modal.results.filter((r) => r.ok).length} de{' '}
                  {modal.results.length}
                </h2>
                <ul className="space-y-1.5 max-h-64 overflow-y-auto mb-5">
                  {modal.results.map((r, i) => (
                    <li key={i} className={`text-sm ${r.ok ? 'text-green-700' : 'text-red-600'}`}>
                      {r.ok ? '✓' : '✗'} {r.id ? `Atendimento ${r.id}: ` : ''}
                      {r.message}
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end">
                  <button
                    onClick={() => setModal(null)}
                    className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
