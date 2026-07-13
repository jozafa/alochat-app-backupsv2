# AlôChat Backup Web

## O que é este projeto

Aplicação web de backup para uma instância AlôChat de um cliente específico. É a versão web (single-tenant) de uma ferramenta desktop já existente. Roda em **um único container Docker**, deployada via Dokploy (Docker Swarm). Em vez de gravar backups em disco local, envia tudo para um bucket **Backblaze B2 (S3-compatible)**.

Referência da API: o arquivo `docs/alochat_openapi.md` contém a spec OpenAPI completa da instância AlôChat. **Leia apenas a tag `Backup` e os schemas referenciados por ela.** Não leia o arquivo inteiro.

## Princípios (obrigatório)

- **YAGNI agressivo**: escreva o mínimo que funciona. Prefira stdlib do Node, depois dependências já instaladas. Nada de abstrações especulativas, camadas de serviço genéricas, interfaces com uma única implementação ou "preparar para o futuro".
- Um container só. Sem Redis, sem fila, sem worker separado, sem BFF, sem microserviço.
- Sem framework de ORM. SQL direto via better-sqlite3.
- Se uma feature não está listada em "Funcionalidades", ela não existe. Pergunte antes de adicionar.

## Stack (fixa, não substituir)

- **Runtime**: Node.js 22 + TypeScript
- **Backend**: Fastify (serve API REST + frontend estático buildado)
- **Frontend**: React + Vite + Tailwind CSS (build estático em `frontend/dist`, servido pelo Fastify via `@fastify/static`)
- **Banco local**: better-sqlite3 (arquivo em volume Docker: estado de agendamentos, catálogo de backups, config)
- **Agendador**: node-cron (timezone `America/Fortaleza`)
- **Storage**: `@aws-sdk/client-s3` + `@aws-sdk/lib-storage` apontando para endpoint B2 (`forcePathStyle: true`)
- **Deploy**: Dockerfile multi-stage (build frontend → build backend → runtime slim)

## Variáveis de ambiente

```
PORT=8080
DATA_DIR=/data                     # volume: sqlite + cache temporário
ALOCHAT_BASE_URL=https://<instancia>.alochat.com.br
ALOCHAT_API_KEY=...                # chave global (Configurações -> Geral)
S3_ENDPOINT=https://s3.<region>.backblazeb2.com
S3_REGION=<region>
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
APP_PASSWORD=...                   # senha única de acesso à UI (gate simples, cookie de sessão)
TZ=America/Fortaleza
```

## Formato de backup (decisão de arquitetura)

Cada atendimento é exportado via **`POST /int/backupChatAsJson`** com inclusão de arquivos (base64) e compressão ativada quando o endpoint suportar. O artefato é gravado no B2 **gzipado** com a chave:

```
backups/{YYYY}/{MM}/chat-{id}.json.gz
```

Por que JSON e não o ZIP de `backupChat`:
1. O requisito "Ver atendimento" exige renderizar o chat na web — JSON estruturado elimina parsing de TXT.
2. O mesmo artefato serve para restauração via `POST /int/importChatFromJson` sem conversão.

Metadados de cada backup (id do chat, cliente, número, datas início/fim, tamanho, chave S3, data do backup) são registrados no SQLite para listagem/busca sem precisar listar o bucket.

## Endpoints AlôChat utilizados (todos POST, autenticação via `apiKey` no body)

| Endpoint | Uso |
|---|---|
| `/int/getChatsMinIdAndDate` | Descobrir intervalo total de chats (backup completo) |
| `/int/getChatsByDateRange` | IDs de chats encerrados num intervalo (backup por período) |
| `/int/getAllChatsClosedYesterday` | IDs encerrados ontem (rotina diária agendada) |
| `/int/getNextCleaningInfo` | Próxima limpeza agendada (firstId/lastId/cutDate) — dispara backup preventivo e alimenta o alerta na UI |
| `/int/backupChatAsJson` | Exportação do atendimento (formato primário) |
| `/int/importChatFromJson` | Restauração (atenção: ID original é SEMPRE ignorado, novo ID sequencial é gerado) |

## Funcionalidades (escopo completo — nada além disso)

1. **Login simples**: gate por senha única (`APP_PASSWORD`), cookie de sessão. Sem multiusuário.
2. **Backup completo**: varre todos os chats da instância (via `getChatsMinIdAndDate` + iteração) e envia ao B2. Roda em background com progresso visível na UI (SSE ou polling simples — escolher o mais simples). Deve ser retomável: chats já presentes no catálogo SQLite são pulados.
3. **Backup por período**: usuário informa data inicial/final → `getChatsByDateRange` → backup dos IDs retornados.
4. **Rotina diária agendada**: tabela de agendamento por dia da semana + horário (igual à versão desktop: checkbox por dia, campo de hora). No horário, roda `getAllChatsClosedYesterday` e backupeia.
5. **Backup preventivo de limpeza**: consulta `getNextCleaningInfo` 1x/dia; se houver limpeza agendada, garante backup de todos os chats no intervalo `firstId..lastId` antes da data. Exibe alerta na UI ("Há uma limpeza agendada para os chats do ID X até Y...").
6. **Listagem/busca**: tabela paginada dos backups catalogados (colunas: ID, cliente, número, início, fim, ação Ver). Busca por ID, nome ou número. Filtro por data. Cards de resumo (total, resultados, página, último backup).
7. **Ver atendimento**: botão "Ver" baixa o `chat-{id}.json.gz` do B2 (server-side), descomprime em memória, e renderiza o chat visualmente (bolhas de mensagem, remetente, timestamps). Anexos: rota `GET /api/chats/:id/files/:fileId` que extrai o base64 do JSON e serve com o content-type correto (com cache em `DATA_DIR/cache`, limpo por LRU simples ou TTL).
8. **Restaurar selecionados**: checkbox na tabela → confirma → para cada selecionado, baixa do B2 e chama `importChatFromJson`. Exibir aviso sobre novo ID e o erro 4xx de espaço insuficiente quando ocorrer.
9. **Configurações**: link da instância, API key (mascarada), credenciais B2, botão "testar conexão" (AlôChat e B2). Persistidas no SQLite (env vars servem de default inicial).

## Regras de implementação

- Downloads/uploads de backup sempre em **stream** — nunca carregar ZIPs grandes inteiros em memória além do necessário; o JSON gzipado pode ser processado com `zlib` + streaming de parse apenas se ficar grande demais (começar simples: gunzip + JSON.parse; otimizar só se medir problema).
- Concorrência do backup em lote: máximo 3 chats em paralelo, com retry (3 tentativas, backoff) por chat. Falhas registradas no catálogo com status `error` e re-tentáveis.
- Datas exibidas em `America/Fortaleza`, formato `dd/mm/aa`.
- UI em português (PT-BR), visual limpo similar aos prints da versão desktop (tabela, cards de resumo, alertas âmbar).
- Logs estruturados via logger nativo do Fastify (pino). Sem lib extra de log.
- Testes: apenas nos módulos de lógica pura (montagem de chaves S3, parser de agendamento, cálculo de intervalo de limpeza). Sem e2e.

## Estrutura esperada (aproximada — não criar mais que isso)

```
/
├── AGENTS.md
├── Dockerfile
├── docker-compose.yml          # dev local
├── docs/alochat_openapi.md
├── backend/
│   ├── src/
│   │   ├── server.ts           # bootstrap Fastify
│   │   ├── db.ts               # sqlite (schema + queries)
│   │   ├── alochat.ts          # client HTTP da API AlôChat
│   │   ├── s3.ts               # client B2
│   │   ├── backup.ts           # orquestração (completo/período/diário/limpeza)
│   │   ├── scheduler.ts        # node-cron
│   │   └── routes/             # api.ts, auth.ts, files.ts
│   └── test/
└── frontend/
    └── src/                    # React: Dashboard, Configurações, Visualizador de chat
```
