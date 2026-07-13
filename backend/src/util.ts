// Funções puras (testadas em test/util.test.ts): chaves S3, datas, parser de agendamento
// e cálculo de intervalo de limpeza.

const fortalezaDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Fortaleza',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Chave do artefato no B2: backups/{YYYY}/{MM}/chat-{id}.json.gz (ano/mês do início do atendimento em America/Fortaleza). */
export function chatKey(id: number, beginTime: string): string {
  const d = new Date(beginTime);
  if (Number.isNaN(d.getTime())) throw new Error(`Data inválida para chave S3: ${beginTime}`);
  const [year, month] = fortalezaDate.format(d).split('-');
  return `backups/${year}/${month}/chat-${id}.json.gz`;
}

/** Data (YYYY-MM-DD) em America/Fortaleza. */
export function dateInFortaleza(d: Date = new Date()): string {
  return fortalezaDate.format(d);
}

/** Valida 'HH:MM' (00:00–23:59). */
export function parseTime(time: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export interface ScheduleDay {
  day_of_week: number; // 0=domingo … 6=sábado (mesma convenção do cron)
  enabled: number;
  time: string; // 'HH:MM'
}

/**
 * Converte a tabela de agendamento em expressões cron, agrupando dias com o mesmo horário.
 * Dias desabilitados ou com horário inválido são ignorados.
 */
export function cronExpressionsFromSchedule(rows: ScheduleDay[]): string[] {
  const byTime = new Map<string, number[]>();
  for (const r of rows) {
    if (!r.enabled || r.day_of_week < 0 || r.day_of_week > 6) continue;
    const t = parseTime(r.time);
    if (!t) continue;
    const key = `${t.minute} ${t.hour}`;
    const days = byTime.get(key) ?? [];
    days.push(r.day_of_week);
    byTime.set(key, days);
  }
  return [...byTime.entries()].map(
    ([minuteHour, days]) => `${minuteHour} * * ${[...new Set(days)].sort((a, b) => a - b).join(',')}`
  );
}

/** Intervalo inclusivo firstId..lastId da limpeza (getNextCleaningInfo). Intervalo inválido → []. */
export function cleaningIdRange(firstId: number, lastId: number): number[] {
  if (!Number.isInteger(firstId) || !Number.isInteger(lastId) || firstId < 1 || lastId < firstId) return [];
  const ids: number[] = [];
  for (let id = firstId; id <= lastId; id++) ids.push(id);
  return ids;
}
