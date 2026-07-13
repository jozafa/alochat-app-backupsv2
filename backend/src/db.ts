import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR ?? './data';
mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'app.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY,
  client_name TEXT,
  client_number TEXT,
  begin_time TEXT,
  end_time TEXT,
  s3_key TEXT,
  size_bytes INTEGER,
  files_included INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  error_message TEXT,
  backed_up_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_chats_begin_time ON chats (begin_time);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  total INTEGER NOT NULL DEFAULT 0,
  done INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  detail TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS schedule (
  day_of_week INTEGER PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  time TEXT NOT NULL DEFAULT '02:00'
);

CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

// Garante as 7 linhas do agendamento semanal (desabilitadas por padrão).
{
  const seed = db.prepare(`INSERT OR IGNORE INTO schedule (day_of_week, enabled, time) VALUES (?, 0, '02:00')`);
  for (let d = 0; d < 7; d++) seed.run(d);
}

// ---- config (env vars servem de default inicial) ----

const ENV_DEFAULTS: Record<string, string | undefined> = {
  alochat_base_url: process.env.ALOCHAT_BASE_URL,
  alochat_api_key: process.env.ALOCHAT_API_KEY,
  s3_endpoint: process.env.S3_ENDPOINT,
  s3_region: process.env.S3_REGION,
  s3_bucket: process.env.S3_BUCKET,
  s3_access_key_id: process.env.S3_ACCESS_KEY_ID,
  s3_secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
};

const getConfigStmt = db.prepare('SELECT value FROM config WHERE key = ?');

export function getConfig(key: string): string {
  const row = getConfigStmt.get(key) as { value: string } | undefined;
  return row?.value ?? ENV_DEFAULTS[key] ?? '';
}

export function setConfig(key: string, value: string): void {
  db.prepare(
    'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value);
}

// ---- catálogo de chats ----

export interface ChatRow {
  id: number;
  client_name: string | null;
  client_number: string | null;
  begin_time: string | null;
  end_time: string | null;
  s3_key: string | null;
  size_bytes: number | null;
  files_included: number;
  status: string;
  error_message: string | null;
  backed_up_at: string | null;
}

export function upsertChatOk(c: {
  id: number;
  clientName: string | null;
  clientNumber: string | null;
  beginTime: string | null;
  endTime: string | null;
  s3Key: string;
  sizeBytes: number;
  filesIncluded: boolean;
}): void {
  db.prepare(
    `INSERT OR REPLACE INTO chats
       (id, client_name, client_number, begin_time, end_time, s3_key, size_bytes, files_included, status, error_message, backed_up_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ok', NULL, ?)`
  ).run(
    c.id,
    c.clientName,
    c.clientNumber,
    c.beginTime,
    c.endTime,
    c.s3Key,
    c.sizeBytes,
    c.filesIncluded ? 1 : 0,
    new Date().toISOString()
  );
}

export function markChatError(id: number, message: string): void {
  db.prepare(
    `INSERT INTO chats (id, status, error_message, backed_up_at) VALUES (?, 'error', ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = 'error', error_message = excluded.error_message`
  ).run(id, message, new Date().toISOString());
}

export function okChatIds(): Set<number> {
  const rows = db.prepare(`SELECT id FROM chats WHERE status = 'ok'`).all() as { id: number }[];
  return new Set(rows.map((r) => r.id));
}

export function getChat(id: number): ChatRow | undefined {
  return db.prepare('SELECT * FROM chats WHERE id = ?').get(id) as ChatRow | undefined;
}

export function listBackups(p: {
  search?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}): { items: ChatRow[]; total: number } {
  const where: string[] = [];
  const args: unknown[] = [];
  if (p.search) {
    where.push('(CAST(id AS TEXT) LIKE ? OR client_name LIKE ? OR client_number LIKE ?)');
    const s = `%${p.search}%`;
    args.push(s, s, s);
  }
  if (p.startDate) {
    where.push('date(begin_time) >= date(?)');
    args.push(p.startDate);
  }
  if (p.endDate) {
    where.push('date(begin_time) <= date(?)');
    args.push(p.endDate);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (
    db.prepare(`SELECT COUNT(*) AS n FROM chats ${whereSql}`).get(...args) as { n: number }
  ).n;
  const items = db
    .prepare(`SELECT * FROM chats ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...args, p.pageSize, (p.page - 1) * p.pageSize) as ChatRow[];
  return { items, total };
}

export function countOkChats(): number {
  return (db.prepare(`SELECT COUNT(*) AS n FROM chats WHERE status = 'ok'`).get() as { n: number }).n;
}

export function lastBackupAt(): string | null {
  const row = db
    .prepare(`SELECT MAX(backed_up_at) AS t FROM chats WHERE status = 'ok'`)
    .get() as { t: string | null };
  return row.t;
}

// ---- agendamento semanal ----

export interface ScheduleRow {
  day_of_week: number;
  enabled: number;
  time: string;
}

export function getSchedule(): ScheduleRow[] {
  return db.prepare('SELECT * FROM schedule ORDER BY day_of_week').all() as ScheduleRow[];
}

export const setSchedule = db.transaction(
  (rows: { dayOfWeek: number; enabled: boolean; time: string }[]) => {
    const stmt = db.prepare('UPDATE schedule SET enabled = ?, time = ? WHERE day_of_week = ?');
    for (const r of rows) stmt.run(r.enabled ? 1 : 0, r.time, r.dayOfWeek);
  }
);

// ---- jobs ----

export interface JobRow {
  id: number;
  type: string;
  status: string;
  total: number;
  done: number;
  errors: number;
  detail: string | null;
  started_at: string;
  finished_at: string | null;
}

export function createJob(type: string, detail?: string): number {
  const res = db
    .prepare(`INSERT INTO jobs (type, status, detail, started_at) VALUES (?, 'running', ?, ?)`)
    .run(type, detail ?? null, new Date().toISOString());
  return Number(res.lastInsertRowid);
}

export function updateJobProgress(id: number, p: { total?: number; done?: number; errors?: number }): void {
  db.prepare(
    `UPDATE jobs SET total = COALESCE(?, total), done = COALESCE(?, done), errors = COALESCE(?, errors) WHERE id = ?`
  ).run(p.total ?? null, p.done ?? null, p.errors ?? null, id);
}

export function finishJob(id: number, status: 'done' | 'error', detail?: string): void {
  db.prepare(`UPDATE jobs SET status = ?, detail = COALESCE(?, detail), finished_at = ? WHERE id = ?`).run(
    status,
    detail ?? null,
    new Date().toISOString(),
    id
  );
}

export function getRunningJob(): JobRow | undefined {
  return db
    .prepare(`SELECT * FROM jobs WHERE status = 'running' ORDER BY id DESC LIMIT 1`)
    .get() as JobRow | undefined;
}

export function getLastJob(): JobRow | undefined {
  return db.prepare(`SELECT * FROM jobs ORDER BY id DESC LIMIT 1`).get() as JobRow | undefined;
}

/** Jobs que ficaram 'running' após um reinício do container viram 'error' (o backup é retomável re-executando). */
export function markStaleJobs(): void {
  db.prepare(
    `UPDATE jobs SET status = 'error', detail = 'Interrompido por reinício do servidor', finished_at = ? WHERE status = 'running'`
  ).run(new Date().toISOString());
}
