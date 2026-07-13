// Visualizador de atendimento: baixa o chat-{id}.json.gz do B2, descomprime e serve
// o JSON e os anexos (base64 → binário com content-type), com cache TTL em DATA_DIR/cache.

import { mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import type { FastifyInstance } from 'fastify';
import yazl from 'yazl';
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

/** Extrai buffer e media type de um data URL (o media type pode ter parâmetros, ex. "audio/ogg; codecs=opus"). */
function parseDataUrl(data: string): { mime: string; buf: Buffer } | null {
  const m = /^data:(.*?);base64,(.+)$/s.exec(data);
  return m ? { mime: m[1], buf: Buffer.from(m[2], 'base64') } : null;
}

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/ogg': '.ogg',
  'audio/mpeg': '.mp3',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'application/pdf': '.pdf',
};

function extFor(mime: string | undefined): string {
  if (!mime) return '.bin';
  const base = mime.split(';')[0].trim();
  return MIME_EXT[base] ?? `.${base.split('/')[1] || 'bin'}`;
}

const txtDateTime = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Fortaleza',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const DIR_LABEL: Record<string, string> = {
  in: 'Cliente',
  out: 'Atendente',
  info: 'Informação',
  system: 'Sistema',
  alert: 'Alerta',
};

function fmtTxtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : txtDateTime.format(d);
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

  // Gera um ZIP amigável a partir do backup: conversa em TXT + anexos extraídos.
  app.get('/api/chats/:id/download', async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    if (!Number.isInteger(id)) return reply.code(400).send({ message: 'ID inválido' });
    const backup = await loadChatBackup(id);
    if (!backup) return reply.code(404).send({ message: 'Backup não encontrado no catálogo' });

    const chat = backup.chat as {
      clientName?: string;
      clientNumber?: string;
      queueTypeName?: string;
      protocol?: string;
      beginTime?: string;
      endTime?: string | null;
      messages?: { direction?: string; timestamp?: string; text?: string; file?: BackupFile | null }[];
      remoteSupportSessions?: { files?: BackupFile[] }[];
    };

    const zip = new yazl.ZipFile();
    const usedNames = new Set<string>();
    const addFile = (f: BackupFile, dir: string): string | null => {
      if (!f.data) return null;
      const parsed = parseDataUrl(f.data);
      if (!parsed) return null;
      let name = (f.fileName ?? `file-${f.fileId}`).replace(/[\\/:*?"<>|]/g, '_');
      if (!/\.[A-Za-z0-9]{1,5}$/.test(name)) name += extFor(f.mimeType ?? parsed.mime);
      if (usedNames.has(`${dir}/${name}`)) name = `${f.fileId}-${name}`;
      usedNames.add(`${dir}/${name}`);
      zip.addBuffer(parsed.buf, `${dir}/${name}`);
      return `${dir}/${name}`;
    };

    const lines: string[] = [
      `Atendimento #${id} - ${chat.clientName || '(sem nome)'} (${chat.clientNumber ?? ''})` +
        (chat.queueTypeName ? ` - ${chat.queueTypeName}` : ''),
      `Início: ${fmtTxtDate(chat.beginTime)}  -  Fim: ${fmtTxtDate(chat.endTime)}`,
      ...(chat.protocol ? [`Protocolo: ${chat.protocol}`] : []),
      '',
    ];
    for (const m of chat.messages ?? []) {
      let line = `[${fmtTxtDate(m.timestamp)}] [${DIR_LABEL[m.direction ?? ''] ?? m.direction}] ${m.text ?? ''}`.trimEnd();
      if (m.file) {
        const entry = addFile(m.file, 'arquivos');
        line += entry
          ? ` (anexo: ${entry})`
          : ` (anexo file-${m.file.fileId} não incluído no backup)`;
      }
      lines.push(line);
    }
    for (const session of chat.remoteSupportSessions ?? []) {
      for (const f of session.files ?? []) addFile(f, 'suporte_remoto');
    }
    zip.addBuffer(Buffer.from(lines.join('\r\n'), 'utf8'), `chat-${id}.txt`);
    zip.end();

    reply.header('content-type', 'application/zip');
    reply.header('content-disposition', `attachment; filename="atendimento-${id}.zip"`);
    return reply.send(zip.outputStream);
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
      const parsed = parseDataUrl(f.data);
      if (!parsed) return reply.code(500).send({ message: 'Anexo em formato inesperado' });
      reply.header('content-type', f.mimeType ?? parsed.mime);
      reply.header('cache-control', 'private, max-age=3600');
      if (f.fileName) {
        reply.header(
          'content-disposition',
          `inline; filename="${encodeURIComponent(f.fileName).replace(/['()]/g, '')}"`
        );
      }
      return reply.send(parsed.buf);
    }
    return reply.code(404).send({ message: 'Anexo não encontrado neste atendimento' });
  });
}
