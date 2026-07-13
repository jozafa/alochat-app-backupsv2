import { useEffect, useState } from 'react';
import { api } from './api';
import { fmtDate, fmtDateTime } from './format';

interface BackupFile {
  fileId?: number;
  mimeType?: string;
  fileName?: string;
  size?: number;
  dataIncluded?: boolean;
}

interface Message {
  id: number;
  direction: 'in' | 'out' | 'info' | 'system' | 'alert';
  timestamp: string;
  text?: string;
  file?: BackupFile | null;
}

interface ChatBackup {
  chat: {
    id: number;
    clientName?: string;
    clientNumber?: string;
    protocol?: string;
    queueTypeName?: string;
    beginTime?: string;
    endTime?: string | null;
    profilePicture?: BackupFile | null;
    messages?: Message[];
  };
}

function Attachment({ chatId, file }: { chatId: number; file: BackupFile }) {
  if (!file.dataIncluded) {
    return (
      <p className="text-xs italic text-gray-500 mt-1">
        📎 Anexo não incluído no backup (chat excedeu o limite de 50 MB)
      </p>
    );
  }
  const url = `/api/chats/${chatId}/files/${file.fileId}`;
  const mime = file.mimeType ?? '';
  if (mime.startsWith('image/')) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt={file.fileName ?? 'imagem'} className="mt-1 max-w-full max-h-72 rounded-lg" />
      </a>
    );
  }
  if (mime.startsWith('audio/')) {
    return <audio controls src={url} className="mt-1 max-w-full" />;
  }
  if (mime.startsWith('video/')) {
    return <video controls src={url} className="mt-1 max-w-full max-h-72 rounded-lg" />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block mt-1 text-sm text-blue-600 hover:underline">
      📎 {file.fileName ?? `Baixar anexo #${file.fileId}`}
    </a>
  );
}

function Bubble({ chatId, msg }: { chatId: number; msg: Message }) {
  if (msg.direction === 'info' || msg.direction === 'system' || msg.direction === 'alert') {
    // A instância usa direções info/system/alert também para mensagens com anexo
    // (ex.: áudios chegam como alert com texto vazio) — nesses casos mostra o anexo.
    if (msg.file) {
      return (
        <div className="flex justify-center my-2">
          <div className="rounded-2xl bg-white px-4 py-2 max-w-[75%] shadow-sm">
            {msg.text && (
              <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{msg.text}</p>
            )}
            <Attachment chatId={chatId} file={msg.file} />
            <p className="text-[10px] text-gray-400 text-right mt-1">{fmtDateTime(msg.timestamp)}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-center my-2">
        <div
          className={`rounded-full px-4 py-1.5 text-xs max-w-[85%] text-center ${
            msg.direction === 'alert' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {msg.text}
          <span className="ml-2 opacity-70">{fmtDateTime(msg.timestamp)}</span>
        </div>
      </div>
    );
  }
  const out = msg.direction === 'out';
  return (
    <div className={`flex my-1.5 ${out ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-2xl px-4 py-2 max-w-[75%] shadow-sm ${
          out ? 'bg-emerald-100 rounded-br-sm' : 'bg-white rounded-bl-sm'
        }`}
      >
        {msg.text && <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{msg.text}</p>}
        {msg.file && <Attachment chatId={chatId} file={msg.file} />}
        <p className="text-[10px] text-gray-400 text-right mt-1">{fmtDateTime(msg.timestamp)}</p>
      </div>
    </div>
  );
}

export default function ChatViewer({ id, onBack }: { id: number; onBack: () => void }) {
  const [backup, setBackup] = useState<ChatBackup | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<ChatBackup>(`/api/chats/${id}`)
      .then(setBackup)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar atendimento'));
  }, [id]);

  const chat = backup?.chat;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4">
        ← Voltar ao Dashboard
      </button>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-4">{error}</div>}
      {!error && !backup && <p className="text-gray-400 text-sm">Carregando atendimento…</p>}

      {chat && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4 flex items-center gap-4">
            {chat.profilePicture?.dataIncluded ? (
              <img
                src={`/api/chats/${id}/files/${chat.profilePicture.fileId}`}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-500">
                👤
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                {chat.clientName || chat.clientNumber || `Atendimento #${chat.id}`}
              </h1>
              <p className="text-sm text-gray-500">
                {chat.clientNumber}
                {chat.queueTypeName ? ` · ${chat.queueTypeName}` : ''}
                {chat.protocol ? ` · Protocolo ${chat.protocol}` : ''}
              </p>
              <p className="text-sm text-gray-500">
                Atendimento #{chat.id} · {fmtDate(chat.beginTime)} a {fmtDate(chat.endTime)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-100 p-4">
            {(chat.messages ?? []).length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">Sem mensagens neste atendimento.</p>
            )}
            {(chat.messages ?? []).map((m, i) => (
              <Bubble key={m.id ?? i} chatId={id} msg={m} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
