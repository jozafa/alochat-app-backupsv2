import type { FastifyInstance } from 'fastify';
import * as alochat from '../alochat.js';
import * as dbq from '../db.js';
import { startFullBackup, startRangeBackup } from '../backup.js';
import { reloadDailySchedule, runCleaningCheck } from '../scheduler.js';
import { testS3 } from '../s3.js';
import { parseTime } from '../util.js';
import { isAuthenticated } from './auth.js';
import { loadChatBackup } from './files.js';

const TEXT_SETTINGS = ['alochat_base_url', 's3_endpoint', 's3_region', 's3_bucket', 's3_access_key_id'] as const;
const SECRET_SETTINGS = ['alochat_api_key', 's3_secret_access_key'] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function apiRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req, reply) => {
    if (!isAuthenticated(req)) return reply.code(401).send({ message: 'Não autenticado' });
  });

  app.get('/api/backups', async (req) => {
    const q = req.query as { search?: string; startDate?: string; endDate?: string; page?: string };
    const page = Math.max(1, Number(q.page) || 1);
    const pageSize = 20;
    const { items, total } = dbq.listBackups({
      search: q.search || undefined,
      startDate: q.startDate || undefined,
      endDate: q.endDate || undefined,
      page,
      pageSize,
    });
    return {
      items,
      total,
      page,
      pageSize,
      totalCatalogued: dbq.countOkChats(),
      lastBackupAt: dbq.lastBackupAt(),
    };
  });

  app.post('/api/backups/full', async (req, reply) => {
    try {
      return { jobId: startFullBackup(app.log) };
    } catch (err) {
      return reply.code(409).send({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/backups/range', async (req, reply) => {
    const { startDate, endDate } = (req.body ?? {}) as { startDate?: string; endDate?: string };
    if (!startDate || !endDate || !DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
      return reply.code(400).send({ message: 'Informe startDate e endDate no formato YYYY-MM-DD' });
    }
    if (endDate < startDate) {
      return reply.code(400).send({ message: 'Data final anterior à data inicial' });
    }
    try {
      return { jobId: startRangeBackup(startDate, endDate, app.log) };
    } catch (err) {
      return reply.code(409).send({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.get('/api/jobs/current', async () => {
    return { job: dbq.getRunningJob() ?? dbq.getLastJob() ?? null };
  });

  app.get('/api/schedule', async () => {
    return { days: dbq.getSchedule() };
  });

  app.put('/api/schedule', async (req, reply) => {
    const { days } = (req.body ?? {}) as {
      days?: { dayOfWeek?: number; enabled?: boolean; time?: string }[];
    };
    if (!Array.isArray(days) || days.length === 0) {
      return reply.code(400).send({ message: 'Informe days: [{dayOfWeek, enabled, time}]' });
    }
    for (const d of days) {
      if (
        !Number.isInteger(d.dayOfWeek) ||
        d.dayOfWeek! < 0 ||
        d.dayOfWeek! > 6 ||
        typeof d.enabled !== 'boolean' ||
        typeof d.time !== 'string' ||
        !parseTime(d.time)
      ) {
        return reply
          .code(400)
          .send({ message: 'Dia inválido: dayOfWeek 0-6, enabled booleano e time HH:MM' });
      }
    }
    dbq.setSchedule(days as { dayOfWeek: number; enabled: boolean; time: string }[]);
    reloadDailySchedule();
    return { days: dbq.getSchedule() };
  });

  app.get('/api/cleaning', async () => {
    const raw = dbq.getConfig('next_cleaning');
    return { cleaning: raw ? JSON.parse(raw) : null };
  });

  // Restaura os backups selecionados via importChatFromJson (sequencial).
  // A instância SEMPRE ignora o ID original e gera um novo ID sequencial.
  // Erro 507 (espaço insuficiente) aborta os restantes — todos falhariam igual.
  app.post('/api/restore', async (req, reply) => {
    const { ids } = (req.body ?? {}) as { ids?: unknown };
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((n) => Number.isInteger(n))) {
      return reply.code(400).send({ message: 'Informe ids: lista de IDs inteiros' });
    }
    const results: { id: number; ok: boolean; chatId?: number; message: string }[] = [];
    let aborted = false;
    for (const id of ids as number[]) {
      if (aborted) {
        results.push({ id, ok: false, message: 'Não tentado (espaço insuficiente na instância)' });
        continue;
      }
      try {
        const backup = await loadChatBackup(id);
        if (!backup) {
          results.push({ id, ok: false, message: 'Backup não encontrado no catálogo' });
          continue;
        }
        const r = await alochat.importChatFromJson(backup as unknown as alochat.ChatBackup);
        const warnings = r.warnings?.length ? ` (${r.warnings.length} aviso(s))` : '';
        results.push({
          id,
          ok: true,
          chatId: r.chatId,
          message: `Restaurado como novo atendimento #${r.chatId}${warnings}`,
        });
      } catch (err) {
        if (err instanceof alochat.AlochatError && err.status === 507) {
          const b = err.body as { neededMB?: number; availableMB?: number } | undefined;
          const detail =
            b?.neededMB != null && b?.availableMB != null
              ? `: necessário ${b.neededMB} MB, disponível ${b.availableMB} MB`
              : '';
          results.push({ id, ok: false, message: `Espaço insuficiente na instância${detail}` });
          aborted = true;
        } else {
          results.push({ id, ok: false, message: err instanceof Error ? err.message : String(err) });
        }
      }
    }
    return { results, aborted };
  });

  // Consulta a limpeza agendada agora (também dispara o backup preventivo se houver).
  app.post('/api/cleaning/check', async () => {
    await runCleaningCheck();
    const raw = dbq.getConfig('next_cleaning');
    return { cleaning: raw ? JSON.parse(raw) : null };
  });

  app.get('/api/settings', async () => {
    const out: Record<string, string | boolean> = {};
    for (const k of TEXT_SETTINGS) out[k] = dbq.getConfig(k);
    for (const k of SECRET_SETTINGS) out[`${k}_set`] = dbq.getConfig(k) !== '';
    return out;
  });

  // Segredos vazios/ausentes no PUT mantêm o valor atual (a UI exibe apenas a máscara).
  app.put('/api/settings', async (req) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    for (const k of TEXT_SETTINGS) {
      if (typeof body[k] === 'string') dbq.setConfig(k, (body[k] as string).trim());
    }
    for (const k of SECRET_SETTINGS) {
      if (typeof body[k] === 'string' && (body[k] as string).trim() !== '') {
        dbq.setConfig(k, (body[k] as string).trim());
      }
    }
    return { ok: true };
  });

  app.post('/api/settings/test-alochat', async () => {
    try {
      const info = await alochat.getChatsMinIdAndDate();
      return { ok: true, message: `Conectado. Menor ID de chat: ${info.minId}` };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  });

  app.post('/api/settings/test-s3', async () => {
    try {
      const { endpoint, bucket } = await testS3();
      return { ok: true, message: `Bucket "${bucket}" acessível em ${endpoint}` };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  });
}
