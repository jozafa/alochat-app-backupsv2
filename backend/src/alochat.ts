// Client HTTP da API AlôChat (tag Backup da spec docs/alochat_openapi.md).
// Todos os endpoints são POST com apiKey no body.

import { getConfig } from './db.js';

export class AlochatError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = 'AlochatError';
  }
}

async function callRaw(endpoint: string, body: Record<string, unknown>): Promise<string> {
  const baseUrl = getConfig('alochat_base_url');
  if (!baseUrl) throw new Error('ALOCHAT_BASE_URL não configurada');
  const res = await fetch(new URL(endpoint, baseUrl), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ apiKey: getConfig('alochat_api_key'), ...body }),
  });
  const text = await res.text();
  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      // corpo não-JSON: mantém só o status
    }
    const message =
      (parsed as { message?: string } | undefined)?.message ?? `AlôChat HTTP ${res.status} em ${endpoint}`;
    throw new AlochatError(res.status, message, parsed);
  }
  return text;
}

async function call<T>(endpoint: string, body: Record<string, unknown> = {}): Promise<T> {
  return JSON.parse(await callRaw(endpoint, body)) as T;
}

export interface MinIdAndDate {
  minId: number;
  minIdDate: string;
  minIdEndDate: string | null;
  oldestDate: string;
  oldestDateChatId: number;
  oldestDateBeginTime: string;
  oldestDateEndTime: string | null;
}

export interface CleaningInfo {
  scheduled: boolean;
  date?: string;
  cutDate?: string;
  firstId?: number;
  lastId?: number;
}

export interface ChatBackup {
  version: number;
  metadata?: { exportedAt?: string; systemVersion?: number; chatId?: number };
  chat: {
    id: number;
    clientName?: string;
    clientNumber?: string;
    beginTime: string;
    endTime?: string | null;
    [k: string]: unknown;
  };
}

export interface ImportResult {
  success: boolean;
  chatId: number;
  originalChatId: number;
  messagesImported: number;
  totalMessages: number;
  remoteSupportSessionsImported: number;
  totalRemoteSupportSessions: number;
  warnings: string[];
  dbSizeIncrement: number;
}

export function getChatsMinIdAndDate(): Promise<MinIdAndDate> {
  return call('/int/getChatsMinIdAndDate');
}

export function getChatsByDateRange(startDate: string, endDate: string): Promise<number[]> {
  return call('/int/getChatsByDateRange', { startDate, endDate });
}

export function getAllChatsClosedYesterday(): Promise<number[]> {
  return call('/int/getAllChatsClosedYesterday');
}

export function getNextCleaningInfo(): Promise<CleaningInfo> {
  return call('/int/getNextCleaningInfo');
}

/**
 * Exporta o chat como JSON puro (zip=false) com arquivos em base64 (includeFiles=true).
 * Se os arquivos excederem 50 MB (erro 413 da spec), refaz sem arquivos (includeFiles=false).
 * Retorna o texto original (para gzipar byte a byte) e o objeto parseado (para metadados).
 */
export async function backupChatAsJson(
  id: number
): Promise<{ text: string; parsed: ChatBackup; filesIncluded: boolean }> {
  try {
    const text = await callRaw('/int/backupChatAsJson', { id, zip: false, includeFiles: true });
    return { text, parsed: JSON.parse(text) as ChatBackup, filesIncluded: true };
  } catch (err) {
    if (err instanceof AlochatError && err.status === 413) {
      const text = await callRaw('/int/backupChatAsJson', { id, zip: false, includeFiles: false });
      return { text, parsed: JSON.parse(text) as ChatBackup, filesIncluded: false };
    }
    throw err;
  }
}

/** Importa um backup. O ID original é SEMPRE ignorado pela instância (novo ID sequencial). */
export function importChatFromJson(backup: ChatBackup): Promise<ImportResult> {
  return call('/int/importChatFromJson', backup as unknown as Record<string, unknown>);
}
