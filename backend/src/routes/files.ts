// Visualizador de atendimento: baixa o chat-{id}.json.gz do B2, descomprime e serve
// o JSON e os anexos (base64 → binário com content-type), com cache TTL em DATA_DIR/cache.

import { mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import type { FastifyInstance } from 'fastify';
import { DATA_DIR, getChat } from '../db.js';
import { getObjectBuffer } from '../s3.js';
import { isAuthenticated } from './auth.js';

const CACHE_DIR = path.join(DATA_DIR, 'cache');
mkdirSync(CACHE_DIR, { recursive: true });
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

interface BackupFile {
  fileId?: number;
  mimeType?: string;
  fileName?: string;
  data?: string;
}

function sweepCache(): void {
  for (const name of readdirSync(CACHE_DIR)) {
    const file = path.join(CACHE_DIR, name);
    try {
      if (Date.now() - statSync(file).mtimeMs > CACHE_TTL_MS) unlinkSync(file);
    } catch {
      // arquivo removido em paralelo
    }
  }
}

export async function loadChatBackup(id: number): Promise<Record<string, unknown> | null> {
  const row = getChat(id);
  if (!row || row.status !== 'ok' || !row.s3_key) return null;
  const cacheFile = path.join(CACHE_DIR, `chat-${id}.json`);
  try {
    if (Date.now() - statSync(cacheFile).mtimeMs < CACHE_TTL_MS) {
      return JSON.parse(readFileSync(cacheFile, 'utf8'));
    }
  } catch {
    // sem cache válido
  }
  const gz = await getObjectBuffer(row.s3_key);
  const json = gunzipSync(gz).toString('utf8');
  writeFileSync(cacheFile, json);
  sweepCache();
  return JSON.parse(json);
}

function* allFiles(backup: Record<string, unknown>): Generator<BackupFile> {
  const chat = backup.chat as Record<string, unknown> | undefined;
  if (!chat) return;
  if (chat.profilePicture) yield chat.profilePicture as BackupFile;
  for (const msg of (chat.messages as { file?: BackupFile }[] | undefined) ?? []) {
    if (msg.file) yield msg.file;
  }
  for (const session of (chat.remoteSupportSessions as { files?: BackupFile[] }[] | undefined) ?? []) {
    for (const f of session.files ?? []) yield f;
  }
}

export async function filesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req, reply) => {
    if (!isAuthenticated(req)) return reply.code(401).send({ message: 'Não autenticado' });
  });

  // Retorna o backup SEM os base64 (dataIncluded indica se o anexo existe no artefato);
  // os binários são servidos por /api/chats/:id/files/:fileId.
  app.get('/api/chats/:id', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ message: 'ID inválido' });
    const backup = await loadChatBackup(id);
    if (!backup) return reply.code(404).send({ message: 'Backup não encontrado no catálogo' });
    for (const f of allFiles(backup)) {
      (f as Record<string, unknown>).dataIncluded = typeof f.data === 'string';
      delete f.data;
    }
    return backup;
  });

  // Baixa o artefato de backup exatamente como está no B2 (chat-{id}.json.gz).
  app.get('/api/chats/:id/download', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ message: 'ID inválido' });
    const row = getChat(id);
    if (!row || row.status !== 'ok' || !row.s3_key) {
      return reply.code(404).send({ message: 'Backup não encontrado no catálogo' });
    }
    const gz = await getObjectBuffer(row.s3_key);
    reply.header('content-type', 'application/gzip');
    reply.header('content-disposition', `attachment; filename="chat-${id}.json.gz"`);
    return reply.send(gz);
  });

  app.get('/api/chats/:id/files/:fileId', async (req, reply) => {
    const { id: rawId, fileId: rawFileId } = req.params as { id: string; fileId: string };
    const id = Number(rawId);
    const fileId = Number(rawFileId);
    if (!Number.isInteger(id) || !Number.isInteger(fileId)) {
      return reply.code(400).send({ message: 'ID inválido' });
    }
    const backup = await loadChatBackup(id);
    if (!backup) return reply.code(404).send({ message: 'Backup não encontrado no catálogo' });
    for (const f of allFiles(backup)) {
      if (Number(f.fileId) !== fileId) continue;
      if (!f.data) {
        return reply.code(404).send({ message: 'Anexo não incluído no backup (chat excedeu 50 MB)' });
      }
      const m = /^data:([^;,]+);base64,(.+)$/s.exec(f.data);
      if (!m) return reply.code(500).send({ message: 'Anexo em formato inesperado' });
      reply.header('content-type', f.mimeType ?? m[1]);
      reply.header('cache-control', 'private, max-age=3600');
      if (f.fileName) {
        reply.header(
          'content-disposition',
          `inline; filename="${encodeURIComponent(f.fileName).replace(/['()]/g, '')}"`
        );
      }
      return reply.send(Buffer.from(m[2], 'base64'));
    }
    return reply.code(404).send({ message: 'Anexo não encontrado neste atendimento' });
  });
}
