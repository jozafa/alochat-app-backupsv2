// Agendador (node-cron, America/Fortaleza):
// - rotina diária configurável por dia da semana/horário (tabela schedule)
// - verificação diária de limpeza agendada (getNextCleaningInfo) com backup preventivo

import cron, { type ScheduledTask } from 'node-cron';
import type { FastifyBaseLogger } from 'fastify';
import * as alochat from './alochat.js';
import * as dbq from './db.js';
import { startCleaningBackup, startDailyBackup } from './backup.js';
import { cronExpressionsFromSchedule } from './util.js';

const TIMEZONE = 'America/Fortaleza';
const CLEANING_CHECK_CRON = '0 1 * * *'; // 01:00 todo dia

let log: FastifyBaseLogger;
let dailyTasks: ScheduledTask[] = [];

/** (Re)cria as tarefas cron a partir da tabela schedule. Chamar após alterar o agendamento. */
export function reloadDailySchedule(): void {
  for (const task of dailyTasks) task.stop();
  dailyTasks = [];
  const exprs = cronExpressionsFromSchedule(dbq.getSchedule());
  for (const expr of exprs) {
    dailyTasks.push(cron.schedule(expr, () => runDailyRoutine(), { timezone: TIMEZONE }));
  }
  log?.info({ exprs }, 'agendamento diário recarregado');
}

function runDailyRoutine(): void {
  try {
    const jobId = startDailyBackup(log);
    log.info({ jobId }, 'rotina diária iniciada');
  } catch (err) {
    log.warn({ err: err instanceof Error ? err.message : String(err) }, 'rotina diária não iniciada');
  }
}

/**
 * Consulta getNextCleaningInfo, guarda o resultado para o alerta da UI e,
 * havendo limpeza agendada, garante o backup do intervalo firstId..lastId.
 */
export async function runCleaningCheck(): Promise<void> {
  if (!dbq.getConfig('alochat_base_url')) {
    log.warn('verificação de limpeza pulada: AlôChat não configurado');
    return;
  }
  try {
    const info = await alochat.getNextCleaningInfo();
    dbq.setConfig('next_cleaning', JSON.stringify({ ...info, checkedAt: new Date().toISOString() }));
    if (info.scheduled && Number.isInteger(info.firstId) && Number.isInteger(info.lastId)) {
      try {
        const jobId = startCleaningBackup(info.firstId!, info.lastId!, log);
        log.info({ jobId, firstId: info.firstId, lastId: info.lastId }, 'backup preventivo de limpeza iniciado');
      } catch (err) {
        // Já há job em andamento; a próxima verificação diária re-tenta.
        log.warn({ err: err instanceof Error ? err.message : String(err) }, 'backup preventivo não iniciado');
      }
    }
  } catch (err) {
    log.error({ err: err instanceof Error ? err.message : String(err) }, 'falha ao consultar limpeza agendada');
  }
}

export function startScheduler(logger: FastifyBaseLogger): void {
  log = logger;
  reloadDailySchedule();
  cron.schedule(CLEANING_CHECK_CRON, () => void runCleaningCheck(), { timezone: TIMEZONE });
  void runCleaningCheck(); // popula o alerta da UI já na inicialização
}
