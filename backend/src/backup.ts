// Orquestração dos backups (completo / por período / diário / limpeza).
// Concorrência máx. 3 chats em paralelo; 3 tentativas com backoff por chat (AGENTS.md).

import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import type { FastifyBaseLogger } from 'fastify';
import * as alochat from './alochat.js';
import * as dbq from './db.js';
import { chatKey, cleaningIdRange, dateInFortaleza } from './util.js';
import { putObject } from './s3.js';

const gzipAsync = promisify(gzip);
const CONCURRENCY = 3;
const ATTEMPTS = 3;
const BACKOFF_MS = [1000, 3000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type JobType = 'full' | 'range' | 'daily' | 'cleaning';

/** Inicia um job em background. Lança erro se já houver job em andamento. */
export function startBackupJob(
  type: JobType,
  detail: string | undefined,
  getIds: () => Promise<number[]>,
  log: FastifyBaseLogger
): number {
  if (dbq.getRunningJob()) throw new Error('Já existe um backup em andamento');
  const jobId = dbq.createJob(type, detail);
  void runJob(jobId, getIds, log);
  return jobId;
}

export function startFullBackup(log: FastifyBaseLogger): number {
  return startBackupJob(
    'full',
    'Backup completo',
    async () => {
      const info = await alochat.getChatsMinIdAndDate();
      const start = String(info.oldestDate ?? info.minIdDate).slice(0, 10);
      return alochat.getChatsByDateRange(start, dateInFortaleza());
    },
    log
  );
}

export function startRangeBackup(startDate: string, endDate: string, log: FastifyBaseLogger): number {
  return startBackupJob(
    'range',
    `Período ${startDate} a ${endDate}`,
    () => alochat.getChatsByDateRange(startDate, endDate),
    log
  );
}

/** Rotina diária agendada: backupeia os chats encerrados ontem. */
export function startDailyBackup(log: FastifyBaseLogger): number {
  return startBackupJob(
    'daily',
    'Rotina diária (encerrados ontem)',
    () => alochat.getAllChatsClosedYesterday(),
    log
  );
}

/** Backup preventivo antes da limpeza agendada: garante o intervalo firstId..lastId. */
export function startCleaningBackup(firstId: number, lastId: number, log: FastifyBaseLogger): number {
  return startBackupJob(
    'cleaning',
    `Backup preventivo de limpeza (IDs ${firstId} a ${lastId})`,
    async () => cleaningIdRange(firstId, lastId),
    log
  );
}

async function runJob(jobId: number, getIds: () => Promise<number[]>, log: FastifyBaseLogger): Promise<void> {
  try {
    const all = await getIds();
    const alreadyOk = dbq.okChatIds();
    const queue = [...new Set(all)].filter((id) => !alreadyOk.has(id));
    dbq.updateJobProgress(jobId, { total: queue.length });
    log.info({ jobId, total: queue.length, skipped: all.length - queue.length }, 'backup iniciado');

    let done = 0;
    let errors = 0;
    const worker = async () => {
      for (;;) {
        const id = queue.shift();
        if (id === undefined) return;
        try {
          await backupOneChat(id);
          done++;
        } catch (err) {
          errors++;
          const message = err instanceof Error ? err.message : String(err);
          dbq.markChatError(id, message);
          log.error({ jobId, chatId: id, err: message }, 'falha no backup do chat');
        }
        dbq.updateJobProgress(jobId, { done, errors });
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    dbq.finishJob(jobId, 'done');
    log.info({ jobId, done, errors }, 'backup concluído');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    dbq.finishJob(jobId, 'error', message);
    log.error({ jobId, err: message }, 'backup abortado');
  }
}

/** Exporta um chat, gzipa e envia ao B2, registrando no catálogo. Retry com backoff; 4xx não é re-tentado. */
export async function backupOneChat(id: number): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(BACKOFF_MS[attempt - 1]);
    try {
      const { text, parsed, filesIncluded } = await alochat.backupChatAsJson(id);
      const beginTime = parsed.chat?.beginTime ?? new Date().toISOString();
      const key = chatKey(id, beginTime);
      const gz = await gzipAsync(text);
      await putObject(key, gz, 'application/gzip');
      dbq.upsertChatOk({
        id,
        clientName: parsed.chat?.clientName ?? null,
        clientNumber: parsed.chat?.clientNumber ?? null,
        beginTime: parsed.chat?.beginTime ?? null,
        endTime: parsed.chat?.endTime ?? null,
        s3Key: key,
        sizeBytes: gz.length,
        filesIncluded,
      });
      return;
    } catch (err) {
      if (err instanceof alochat.AlochatError && err.status < 500) throw err;
      lastErr = err;
    }
  }
  throw lastErr;
}
