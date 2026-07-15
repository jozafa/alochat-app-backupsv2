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
cp .env.example .env   # defina APP_PASSWORD
docker compose up -d --build
```

A aplicação sobe em `http://<host>:8080`.

O `.env` contém apenas `APP_PASSWORD`, a senha única de acesso à UI (vazia = sem senha).

### Configuração da instância e do B2

Feita pela tela **Configurações** da UI após o primeiro acesso (fica salva no SQLite, no volume):

| Campo | Descrição |
|---|---|
| URL da instância | ex. `https://cliente.alochat.com.br` |
| Chave da API | Chave global da API (Configurações → Geral na instância AlôChat) |
| Access Key ID / Secret | Credenciais da application key B2 |
| Endpoint / Região | Opcionais — detectados automaticamente via `b2_authorize_account` |
| Bucket | Opcional se a application key for restrita a um bucket (detectado); obrigatório caso contrário |

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
