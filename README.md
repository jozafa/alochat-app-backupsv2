# AlôChat Backup Web

Aplicação web de backup para uma instância AlôChat. Exporta cada atendimento como JSON
(`POST /int/backupChatAsJson`), grava gzipado num bucket Backblaze B2 (S3-compatible) e mantém o
catálogo num SQLite local. Inclui backup completo, por período, rotina diária agendada, backup
preventivo antes da limpeza da instância, visualizador de atendimento e restauração.

A especificação completa do projeto está em `docs/AGENTS.md`.

## Requisitos

- Docker + Docker Compose (nada precisa ser instalado no host).

## Deploy

```bash
git clone <repo> && cd alochat-app-backupsv2
cp .env.example .env   # preencha as variáveis
docker compose up -d --build
```

A aplicação sobe em `http://<host>:8080`.

### Variáveis de ambiente (`.env`)

| Variável | Descrição |
|---|---|
| `ALOCHAT_BASE_URL` | URL da instância, ex. `https://cliente.alochat.com.br` |
| `ALOCHAT_API_KEY` | Chave global da API (Configurações → Geral na instância) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Credenciais da application key B2 |
| `S3_ENDPOINT` | Opcional — detectado automaticamente via `b2_authorize_account` |
| `S3_REGION` | Opcional — detectada automaticamente |
| `S3_BUCKET` | Opcional se a application key for restrita a um bucket (detectado); obrigatório caso contrário |
| `APP_PASSWORD` | Senha única de acesso à UI (vazia = sem senha) |

As credenciais também podem ser preenchidas/alteradas depois pela tela **Configurações** da UI
(ficam no SQLite; as env vars servem de valor inicial).

### Volume

O volume nomeado `app-data` (montado em `/data`) guarda o SQLite (catálogo, agendamento,
configurações) e o cache de visualização. Os artefatos de backup em si ficam no B2
(`backups/{YYYY}/{MM}/chat-{id}.json.gz`) — perder o volume não perde backups; o catálogo pode ser
reconstruído re-executando o backup completo (chats já presentes no bucket são re-enviados, mas nada
é perdido).

## Atualização

```bash
git pull
docker compose up -d --build
```

## Desenvolvimento

```bash
# testes (módulos de lógica pura)
docker build --target backend-build -t alochat-backup:test .
docker run --rm alochat-backup:test npm test

# logs
docker compose logs -f app
```
