export class Unauthorized extends Error {}

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
  });
  if (res.status === 401) throw new Unauthorized('Não autenticado');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as { message?: string } | null)?.message ?? `Erro ${res.status}`);
  return data as T;
}

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

export interface BackupsResponse {
  items: ChatRow[];
  total: number;
  page: number;
  pageSize: number;
  totalCatalogued: number;
  lastBackupAt: string | null;
}

export interface Job {
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

export interface ScheduleDay {
  day_of_week: number;
  enabled: number;
  time: string;
}

export interface Cleaning {
  scheduled: boolean;
  date?: string;
  cutDate?: string;
  firstId?: number;
  lastId?: number;
  checkedAt?: string;
}

export interface Stats {
  totalOk: number;
  totalErrors: number;
  totalSizeBytes: number;
  lastBackupAt: string | null;
  byMonth: { month: string; count: number; sizeBytes: number }[];
  jobs: Job[];
}

export interface RestoreResult {
  id: number;
  ok: boolean;
  chatId?: number;
  message: string;
}

export interface Settings {
  alochat_base_url: string;
  s3_endpoint: string;
  s3_region: string;
  s3_bucket: string;
  s3_access_key_id: string;
  alochat_api_key_set: boolean;
  s3_secret_access_key_set: boolean;
}
