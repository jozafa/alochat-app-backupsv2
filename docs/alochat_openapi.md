openapi: 3.0.1
info:
  title: API IntegraÃ§Ã£o
  description: |
    API REST para integrar sistemas externos Ã  plataforma de atendimento.

    ## Campos obrigatÃ³rios por grupo de permissÃ£o

    Cada endpoint pertence a um de quatro grupos. O que enviar depende do grupo:

    ### 1. Endpoints de fila â€” aceitam **AMBAS** as chaves
    Operam sobre uma fila especÃ­fica. Envie:
    - **`queueId`** â€” ID da fila, que precisa estar **ativa**. Ã‰ **obrigatÃ³rio** mesmo quando se usa a chave global.
    - **`apiKey`** â€” a **chave configurada na fila informada** _ou_ a **chave global**.

    Todo endpoint que nÃ£o estiver nos grupos 2, 3 ou 4 pertence a este. Por categoria (tag):
    - **Chat** â€” todos os endpoints da tag, exceto `getGlobalChatDetail` (grupo 2)
    - **Fila** â€” todos os endpoints da tag, exceto `getAllQueues`, `createNewQueue` e `changeQueueConfiguration` (grupo 2) e `enableQueue` (grupo 3)
    - **Arquivos e Galeria** â€” todos os endpoints da tag, exceto `uploadFileGlobal` (grupo 2)
    - **Mensagens** â€” todos os endpoints da tag
    - **UsuÃ¡rios** â€” todos os endpoints da tag, exceto `createNewUser` (grupo 2)
    - **Contatos** â€” todos os endpoints da tag
    - **Empresas** â€” todos os endpoints da tag
    - **Tarefas** â€” todos os endpoints da tag
    - **CRM** â€” todos os endpoints da tag, exceto `getAllPipelines` (grupo 2)
    - **Produtos** â€” todos os endpoints da tag (os **Grupos de Produtos** sÃ£o tag separada, no grupo 2)
    - **FAQs** e **Grupos de FAQs** â€” todos os endpoints da tag
    - **Armazenamento Permanente** â€” todos os endpoints da tag

    ### 2. Endpoints globais â€” apenas a **CHAVE GLOBAL**
    Operam em escopo global (sem fila). Envie:
    - **`apiKey`** â€” somente a **chave global** (a chave da fila Ã© rejeitada com `AUTH_018`).
    - **`queueId`** nÃ£o Ã© necessÃ¡rio (Ã© ignorado se enviado).

    Pertencem a este grupo:
    - **AdministraÃ§Ã£o de filas/chats**: `createNewQueue`, `changeQueueConfiguration`, `getAllQueues`, `getGlobalChatDetail`, `getAllPipelines`, `getAllWebhookCaptures`, `getNextCleaningInfo`, `getAllChatsClosedYesterday`, `getChatsByDateRange`, `getChatsMinIdAndDate`, `backupChat`, `backupChatAsJson`, `importChatFromJson`
    - **UsuÃ¡rios e arquivos**: `createNewUser`, `uploadFileGlobal`
    - **Grupos de Produtos**: todos os endpoints da tag
    - **HorÃ¡rio de Atendimento**: todos os endpoints da tag
    - **Tickets**: todos os endpoints da tag
    - **simplePBX**: todos os endpoints da tag

    ### 3. Habilitar fila (`enableQueue`) â€” apenas a **CHAVE DA FILA**
    - **`queueId`** â€” ID da fila a habilitar (nÃ£o exige que ela jÃ¡ esteja habilitada).
    - **`apiKey`** â€” somente a **chave configurada na prÃ³pria fila** (a global Ã© rejeitada).

    ### 4. PÃºblico (`ping`)
    - NÃ£o exige nenhuma chave.

    ## CÃ³digos de erro de autenticaÃ§Ã£o

    | CÃ³digo | HTTP | Significado |
    |---|---|---|
    | `GENERIC_001` | 400 | Falta `apiKey` e/ou `queueId` no corpo |
    | `AUTH_018` | 401 | Chave invÃ¡lida ou que nÃ£o corresponde Ã  fila informada |
    | `AUTH_001` | 401 | InstÃ¢ncia bloqueada |
    | `AUTH_014` | 401 | API de integraÃ§Ã£o desabilitada |
    | `AUTH_021` | 401 | IP de origem nÃ£o autorizado |
    | `QUEUE_008` | 503 | A fila informada estÃ¡ desabilitada |
  version: 10.3.0
tags:
  - name: Chat
    description: Chamadas para manipulaÃ§Ã£o de atendimentos
  - name: Fila
    description: Chamadas para manipulaÃ§Ã£o das filas
  - name: Arquivos e Galeria
    description: Chamadas para manipulaÃ§Ã£o de arquivos, galeria e mensagens pre definidas
  - name: Mensagens
    description: Chamadas para manipulaÃ§Ã£o de mensagens
  - name: UsuÃ¡rios
    description: Chamadas para manipulaÃ§Ã£o de usuÃ¡rios
  - name: Contatos
    description: Chamadas para manipulaÃ§Ã£o de contatos
  - name: Empresas
    description: Chamadas para manipulaÃ§Ã£o de empresas
  - name: Tarefas
    description: Chamadas para manipulaÃ§Ã£o de tarefas
  - name: CRM
    description: Chamadas para manipulaÃ§Ã£o de oportunidades
  - name: Produtos
    description: Chamadas para manipulaÃ§Ã£o de produtos
  - name: Grupos de Produtos
    description: Chamadas para manipulaÃ§Ã£o de grupos de produtos
  - name: FAQs
    description: Chamadas para manipulaÃ§Ã£o de FAQs (perguntas frequentes)
  - name: Grupos de FAQs
    description: Chamadas para manipulaÃ§Ã£o de grupos de FAQs
  - name: Armazenamento Permanente
    description: Chamadas para manipulaÃ§Ã£o do armazenamento permanente
  - name: Capturas de Webhook
    description: Chamadas para manipulaÃ§Ã£o de capturas de webhook
  - name: Backup
    description: Chamadas para automaÃ§Ã£o de backups
  - name: HorÃ¡rio de Atendimento
    description: Chamadas para verificaÃ§Ã£o de horÃ¡rio de atendimento
  - name: Tickets
    description: Chamadas para manipulaÃ§Ã£o de tickets de atendimento
paths:
  /externalnewchat:
    get:
      tags:
        - Chat
      summary: Abre um novo atendimento para o usuÃ¡rio logado no navegador.
      description: Essa chamada abre um novo atendimento para o usuÃ¡rio logado. Ela nÃ£o necessita que seja passado uma apiKey, porÃ©m exige que a url seja aberta por um navegador com uma sessÃ£o vÃ¡lida ativa no sistema. Ela utiliza a sessÃ£o logada para se autenticar e abrir o atendimento. O usuÃ¡rio logado deve possuir a permissÃ£o "Pode abrir novo chat" e fazer parte da fila informada em queueId.
      operationId: externalnewchat
      parameters:
        - in: query
          name: queueId
          schema:
            type: integer
            format: int32
          required: true
          description: ID da fila
        - in: query
          name: templateId
          schema:
            type: integer
            format: int32
          required: true
          description: ID do template. ObrigatÃ³rio para filas oficiais.
        - in: query
          name: templateParams
          schema:
            type: string
          required: false
          description: |
            Lista em JSON contendo os parÃ¢metros do template. Exemplo: ["param1","param2"]
        - in: query
          name: number
          schema:
            type: string
          required: true
          description: NÃºmero de telefone do cliente para quem se deseja iniciar atendimento
        - in: query
          name: openchat
          schema:
            type: boolean
          required: true
          description: Deve sempre ser passado true
        - in: query
          name: message
          schema:
            type: string
          required: false
          description: Mensagem prÃ© digitada que serÃ¡ exibida no campo de texto do atendimento para o agente quando este abrir o atendimento pela primeira vez.
      responses:
        200:
          description: Atendimento aberto
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
        401:
          description: AutenticaÃ§Ã£o falhou
        403:
          description: JÃ¡ existe um atendimento aberto para o cliente ou usuÃ¡rio estÃ¡ indisponÃ­vel / nÃ£o tem permissÃ£o para abertura.
        404:
          description: O nÃºmero de telefone nÃ£o possui Whatsapp.
        500:
          description: Erro interno do servidor
  /int/openNewChat:
    get:
      tags:
        - Chat
      summary: Abre um novo atendimento para o usuÃ¡rio informado em userId.
      description: Essa chamada abre um novo atendimento para o usuÃ¡rio informado em userId.
      operationId: openNewChat
      parameters:
        - in: query
          name: queueId
          schema:
            type: integer
            format: int32
          required: true
          description: ID da fila
        - in: query
          name: apiKey
          schema:
            type: string
          required: true
          description: Chave de autenticaÃ§Ã£o da API para a fila
        - in: query
          name: userId
          schema:
            type: number
            format: int32
          required: false
          description: ID do usuÃ¡rio que irÃ¡ receber o atendimento. Se nÃ£o informado, o atendimento serÃ¡ distribuÃ­do pela fila.
        - in: query
          name: number
          schema:
            type: string
          required: true
          description: NÃºmero de telefone do cliente para quem se deseja iniciar atendimento
        - in: query
          name: country
          schema:
            type: string
          required: false
          description: CÃ³digo do paÃ­s (ex. BR) do nÃºmero de telefone. Se nÃ£o informado, o padrÃ£o da instÃ¢ncia serÃ¡ usado.
        - in: query
          name: markerId
          schema:
            type: number
            format: int32
          required: false
          description: ID do marcador
        - in: query
          name: message
          schema:
            type: string
          required: false
          description: Mensagem prÃ© digitada que serÃ¡ exibida no campo de texto do atendimento para o agente quando este abrir o atendimento pela primeira vez.
      responses:
        200:
          description: Atendimento aberto
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
        401:
          description: AutenticaÃ§Ã£o falhou
        403:
          description: JÃ¡ existe um atendimento aberto para o cliente ou usuÃ¡rio estÃ¡ indisponÃ­vel / nÃ£o tem permissÃ£o para abertura.
        404:
          description: O nÃºmero de telefone nÃ£o possui Whatsapp.
        500:
          description: Erro interno do servidor
  /int/openChat:
    post:
      tags:
        - Chat
      summary: Abre um novo atendimento na fila ou para um usuÃ¡rio especificado
      operationId: openChat
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                number:
                  description: NÃºmero de telefone do cliente para quem se deseja iniciar atendimento
                  type: string
                userId:
                  description: ID do usuÃ¡rio que irÃ¡ receber esse atendimento. Se o usuÃ¡rio nÃ£o estiver disponÃ­vel no momento, o atendimento serÃ¡ encaminhado para a fila e serÃ¡ distribuÃ­do.
                  type: integer
                  format: int32
                country:
                  description: CÃ³digo do paÃ­s (ex. BR) do nÃºmero de telefone. Se nÃ£o informado, o padrÃ£o da instÃ¢ncia serÃ¡ usado.
                  type: string
                markerId:
                  description: Id de uma etiqueta para aplicaÃ§Ã£o no atendimento
                  type: integer
                  format: int32
                filters:
                  description: Lista de filtros para serem aplicados ao novo atendimento aberto. Um string com os filtros separados por ,. Exemplo "filtro1,filtro2,filtro3"
                  type: string
                message:
                  description: Mensagem prÃ© digitada que serÃ¡ exibida no campo de texto do atendimento para o agente quando este abrir o atendimento pela primeira vez.
                  type: string
              required: [ queueId, apiKey, number ]
        required: true
      responses:
        200:
          description: Atendimento aberto com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        403:
          description: JÃ¡ hÃ¡ um atendimento aberto para o cliente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: O nÃºmero de telefone informado nÃ£o possui Whatsapp.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/sendWaTemplate:
    post:
      tags:
        - Chat
        - Mensagens
      summary: Envia um modelo prÃ© aprovado na Cloud API.
      operationId: sendWaTemplate
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                number:
                  description: NÃºmero de telefone do cliente para quem se deseja iniciar atendimento
                  type: string
                templateId:
                  description: ID do template que serÃ¡ enviado
                  type: integer
                  format: int32
                data:
                  description: Array com os dados das variÃ¡veis do template. O primeiro item do Array serÃ¡ o primeiro campo do template, o segundo item serÃ¡ o segundo campo e assim por diante.
                  type: array
                  items:
                      type: string
                userId:
                  description: ID do usuÃ¡rio que irÃ¡ receber esse atendimento, caso seja solicitada a abertura de um atendimento. Se o usuÃ¡rio nÃ£o estiver disponÃ­vel no momento, o atendimento serÃ¡ encaminhado para a fila e serÃ¡ distribuÃ­do.
                  type: integer
                  format: int32
                country:
                  description: CÃ³digo do paÃ­s (ex. BR) do nÃºmero de telefone. Se nÃ£o informado, o padrÃ£o da instÃ¢ncia serÃ¡ usado.
                  type: string
                markerId:
                  description: Id de uma etiqueta para aplicaÃ§Ã£o no novo atendimento.
                  type: integer
                  format: int32
                message:
                  description: Mensagem prÃ© digitada que serÃ¡ exibida no campo de texto do atendimento para o agente quando este abrir o atendimento pela primeira vez.
                  type: string
                filters:
                  description: Lista de filtros para serem aplicados ao novo atendimento aberto. Um string com os filtros separados por ,. Exemplo "filtro1,filtro2,filtro3". SÃ³ Ã© utilizado caso openNewChat seja true e nÃ£o exista um atendimento aberto.
                  type: string
                cancelIfAlreadyOpen:
                  description: Cancela a requisiÃ§Ã£o se o cliente jÃ¡ possuir um atendimento no moment. RetornarÃ¡ erro 403.
                  type: boolean
                openNewChat:
                  description: Se verdadeiro, um novo atendimento para o cliente serÃ¡ aberto se este nÃ£o possuir atendimento aberto no momento. Se falso, somente o modelo serÃ¡ enviado, sem que o atendimento seja aberto.
                  type: boolean
              required: [ queueId, apiKey, number, templateId, data ]
        required: true
      responses:
        200:
          description: Atendimento aberto com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        403:
          description: JÃ¡ hÃ¡ um atendimento aberto para o cliente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: O nÃºmero de telefone informado nÃ£o possui Whatsapp.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/checkIfUserExists:
    post:
      tags:
        - Chat
      summary: Verifica se um nÃºmero de telefone possui cadastro no serviÃ§o de mensageria, e se sim, retorna seu ID no serviÃ§o
      operationId: checkIfUserExists
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                number:
                  type: string
                  description: NÃºmero de telefone do cliente
                country:
                  description: CÃ³digo do paÃ­s (ex. BR) do nÃºmero de telefone. Se nÃ£o informado, o padrÃ£o da instÃ¢ncia serÃ¡ usado.
                  type: string
              required: [ queueId, apiKey, number ]
        required: true
      responses:
        200:
          description: Resultado da verificaÃ§Ã£o
          content:
            application/json:
              schema:
                type: object
                properties:
                  exits:
                    type: boolean
                    description: true se o usuÃ¡rio estiver cadastrado no serviÃ§o de mensageria, false se nÃ£o estiver
                  clientId:
                    type: string
                    description: ID do cliente no serviÃ§o de mensageria
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getUserProfilePicture:
    post:
      tags:
        - Chat
      summary: Busca a foto de perfil de um cliente
      operationId: getUserProfilePicture
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                chatId:
                  type: integer
                  format: int32
                  description: ID do chat para o qual se deseja baixar a imagem de perfil do cliente
              required: [ queueId, apiKey, chatId ]
        required: true
      responses:
        200:
          description: Imagem do perfil do cliente
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Atendimento nÃ£o encontrado ou usuÃ¡rio nÃ£o possui imagem de perfil
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getAllOpenChats:
    post:
      tags:
        - Chat
      summary: Busca atendimentos abertos
      description: Retorna todos os atendimentos abertos na fila
      operationId: getAllOpenChats
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Atendimentos abertos na fila
          content:
            application/json:
              schema:
                type: object
                properties:
                  openChats:
                    type: integer
                    format: int32
                    description: Total de atendimentos abertos no momento, incluindo atendimentos na fila e com agentes.
                  chatsOnQueue:
                    type: integer
                    format: int32
                    description: Total atendimentos abertos aguardando na fila.
                  ivrId:
                    type: integer
                    format: int32
                    description: ID da URA de atendimento vinculada Ã  fila. SerÃ¡ 0 caso a fila nÃ£o possua URA vinculada.
                  chats:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatObject'

        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getClientOpenChats:
    post:
      tags:
        - Chat
      summary: Busca todos os atendimentos abertos para um determinado cliente, em todas as filas ativas
      description: Retorna todos os atendimentos abertos para um determinado cliente, em todas as filas ativas
      operationId: getClientOpenChats
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila para autenticaÃ§Ã£o
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                clientId:
                  type: string
                  description: ID do cliente no serviÃ§o de mensageria. Deve-se informar o clientId OU o number.
                number:
                  type: string
                  description: NÃºmero do telefone do cliente no serviÃ§o de mensageria. Deve-se informar o clientId OU o number.
                country:
                  type: string
                  description: CÃ³digo ISO com dois caracteres, do paÃ­s ao qual o nÃºmero de telefone pertence. Usado somente quando utilizando a propriedade number, desconsiderado se usando clientId. Caso nÃ£o seja informado, serÃ¡ considerado o paÃ­s padrÃ£o da instÃ¢ncia.
              required: [ queueId, apiKey, clientId ]
        required: true
      responses:
        200:
          description: Atendimentos abertos para o cliente
          content:
            application/json:
              schema:
                type: object
                properties:
                  openChats:
                    type: integer
                    format: int32
                    description: Total de atendimentos abertos no momento, incluindo atendimentos na fila e com agentes.
                  chats:
                    type: array
                    items:
                      type: object
                      properties:
                        queueId:
                          type: integer
                          description: ID da fila onde estÃ¡ o atendimento
                        chatId:
                          type: integer
                          description: ID do atendimento
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getChatDetail:
    post:
      tags:
        - Chat
      summary: Busca detalhes de um atendimento
      operationId: getChatDetail
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                chatId:
                  type: integer
                  format: int32
                  description: ID do atendimento
              required: [ queueId, apiKey, chatId ]
        required: true
      responses:
        200:
          description: Detalhes do atendimento
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatObject'

        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Atendimento nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getGlobalChatDetail:
    post:
      tags:
        - Chat
      summary: Busca detalhes de um atendimento
      operationId: getGlobalChatDetail
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o global da API
                chatId:
                  type: integer
                  format: int32
                  description: ID do atendimento
              required: [ apiKey, chatId ]
        required: true
      responses:
        200:
          description: Detalhes do atendimento
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResumedChatObject'

        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Atendimento nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getClientChatHistory:
    post:
      tags:
        - Chat
      summary: Busca histÃ³rico de atendimentos para um determinado cliente
      operationId: getClientChatHistory
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                clientId:
                  type: string
                  description: ID do cliente no serviÃ§o de mensageria
              required: [ queueId, apiKey, clientId ]
        required: true
      responses:
        200:
          description: HistÃ³rico de atendimentos para o cliente
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ChatObject'

        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Nenhum atendimento encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/endChat:
    post:
      tags:
        - Chat
      summary: Encerra um atendimento aberto
      operationId: endChat
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                chatId:
                  type: integer
                  format: int32
                  description: ID do atendimento
                reason:
                  type: string
                  description: Motivo do encerramento
                reasonObs:
                  type: string
                  description: ObservaÃ§Ãµes do encerramento
                reopenDate:
                  type: string
                  format: date
                  description: Data para reabertura agendada, se desejado. Para o agendamento de reabertura funcionar Ã© necessÃ¡rio informar o reopenDate, reopenHour e reopenMinute.
                reopenHour:
                  type: integer
                  description: Hora para reabertura agendada.
                reopenMinute:
                  type: integer
                  description: Minuto para reabertura agendada.
                dontSendAutoEndMessage:
                  type: boolean
                  description: Se true, o sistema nÃ£o irÃ¡ enviar a mensagem automÃ¡tica de encerramento, caso esta esteja configurada para a fila.
              required: [ queueId, apiKey, chatId ]
        required: true
      responses:
        200:
          description: Atendimento encerrado com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'

        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Atendimento nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel, desabilitada, desconectada ou nÃ£o autenticada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getAllQueues:
    post:
      tags:
        - Fila
      summary: Retorna uma lista com todas as filas do sistema e seus detalhes
      operationId: getAllQueues
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de filas com seus detalhes
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      description: ID da fila
                    name:
                      type: string
                      description: Nome da fila
                    connected:
                      type: boolean
                      description: Se a fila estÃ¡ ou nÃ£o conectada ao serviÃ§o de mensageria
                    authenticated:
                      type: boolean
                      description: Se a fila estÃ¡ ou nÃ£o autenticada ao serviÃ§o de mensageria. Para estar apta a enviar e receber mensagens, a fila precisa estar conectada e autenticada ao serviÃ§o.
                    authenticatedNumber:
                      type: string
                      description: NÃºmero de telefone autenticado na fila, quando houver
                    enabled:
                      type: boolean
                      description: Se a fila estÃ¡ habilitada no sistema.
                    type:
                      type: string
                      description: Tipo da fila
                    openChats:
                      type: integer
                      description: Total de atendimentos abertos na fila no momento, inclusive os jÃ¡ distribuÃ­dos a atendentes.
                    chatsOnQueue:
                      type: integer
                      description: Total de atendimentos abertos na fila no momento aguardando atendimento (ainda nÃ£o distribuÃ­dos).
                    todaysAvgContactTime:
                      type: integer
                      description: TMA do dia em segundos.
                    todaysAvgAnswerTime:
                      type: integer
                      description: TMPR do dia em segundos.
                    todaysRespondedChats:
                      type: integer
                      description: Total de chats jÃ¡ respondidos nessa fila hoje.
                    todaysSurveyGrade:
                      type: integer
                      description: Nota da fila de hoje, conforme pesquisas respondidas.
                    todaysRespondedSurveys:
                      type: integer
                      description: Total de pesquisas de satisfaÃ§Ã£o respondidas hoje na fila.
                    ivrId:
                      type: integer
                      description: ID da URA vinculada Ã  fila, se houver.
                    loggedAgentsCount:
                      type: integer
                      description: Total de agentes logados na fila no momento.
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getQueueStatus:
    post:
      tags:
        - Fila
      summary: Busca detalhes de uma fila
      operationId: getQueueStatus
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Detalhes da fila
          content:
            application/json:
              schema:
                type: object
                properties:
                  name:
                    type: string
                    description: Nome da fila
                  connected:
                    type: boolean
                    description: Se a fila estÃ¡ ou nÃ£o conectada ao serviÃ§o de mensageria
                  authenticated:
                    type: boolean
                    description: Se a fila estÃ¡ ou nÃ£o autenticada ao serviÃ§o de mensageria. Para estar apta a enviar e receber mensagens, a fila precisa estar conectada e autenticada ao serviÃ§o.
                  authenticatedNumber:
                    type: string
                    description: NÃºmero de telefone autenticado na fila, quando houver
                  enabled:
                    type: boolean
                    description: Se a fila estÃ¡ habilitada no sistema.
                  type:
                    type: string
                    description: Tipo da fila
                  openChats:
                    type: integer
                    description: Total de atendimentos abertos na fila no momento, inclusive os jÃ¡ distribuÃ­dos a atendentes.
                  chatsOnQueue:
                    type: integer
                    description: Total de atendimentos abertos na fila no momento aguardando atendimento (ainda nÃ£o distribuÃ­dos).
                  todaysAvgContactTime:
                    type: integer
                    description: TMA do dia em segundos.
                  todaysAvgAnswerTime:
                    type: integer
                    description: TMPR do dia em segundos.
                  todaysRespondedChats:
                    type: integer
                    description: Total de chats jÃ¡ respondidos nessa fila hoje.
                  todaysSurveyGrade:
                    type: integer
                    description: Nota da fila de hoje, conforme pesquisas respondidas.
                  todaysRespondedSurveys:
                    type: integer
                    description: Total de pesquisas de satisfaÃ§Ã£o respondidas hoje na fila.
                  ivrId:
                    type: integer
                    description: ID da URA vinculada Ã  fila, se houver.
                  loggedAgentsCount:
                    type: integer
                    description: Total de agentes logados na fila no momento.
                  businessHoursConfigId:
                    type: integer
                    nullable: true
                    description: ID da configuraÃ§Ã£o de horÃ¡rio de atendimento vinculada Ã  fila, se houver. Pode ser utilizado com o endpoint /int/checkBusinessHours para verificar disponibilidade.
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getQueueQrCode:
    post:
      tags:
        - Fila
      summary: Busca o qrcode de autenticaÃ§Ã£o do serviÃ§o mensageria, retorna um SVG
      operationId: getQueueQrCode
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Retorna o qrcode em formato SVG
          content:
            image/svg+xml: { }
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        404:
          description: Qrcode nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/enableQueue:
    post:
      tags:
        - Fila
      summary: Habilita uma fila, iniciando seu servidor de mensageria
      operationId: enableQueue
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Fila habilitada com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
  /int/disableQueue:
    post:
      tags:
        - Fila
      summary: Desabilita uma fila, destruindo seu servidor de mensageria
      operationId: disableQueue
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Fila desabilitada com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
  /int/connectQueue:
    post:
      tags:
        - Fila
      summary: Conecta a fila do servidor de mensageria
      operationId: connectQueue
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Fila conectada com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        503:
          description: Fila indisponÃ­vel, desabilitada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/disconnectQueue:
    post:
      tags:
        - Fila
      summary: Desconecta a fila do servidor de mensageria
      operationId: disconnectQueue
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Fila desconectada com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        503:
          description: Fila indisponÃ­vel, desabilitada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/logoutQueue:
    post:
      tags:
        - Fila
      summary: Desloga a fila do servidor de mensageria, apagando os dados de autenticaÃ§Ã£o da memÃ³ria
      operationId: logoutQueue
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Logout realizado com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        503:
          description: Fila indisponÃ­vel, desabilitada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createNewQueue:
    post:
      tags:
        - Fila
      summary: Cria uma nova fila
      operationId: createNewQueue
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
                name:
                  type: string
                  description: Nome para a nova fila
                type:
                  type: number
                  description: Tipo da fila. 2 para FB, 3 para TG, 5 para WAMD, 9 para WAGS, 10 para WA Cloud API, 12 para Webchat, 13 para Google Business Messaging
                queueapikey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da fila.
                authstatushook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para alteraÃ§Ã£o no estado da fila
                  $ref: '#/components/schemas/HookConfig'
                callreceivedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para chamada recebida
                  $ref: '#/components/schemas/HookConfig'
                typinghook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para cliente digitando
                  $ref: '#/components/schemas/HookConfig'
                msgsenthook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para evento de mensagem enviada
                  $ref: '#/components/schemas/HookConfig'
                msgreceivedbyserverhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para confirmaÃ§Ã£o de mensagem recebida pelo servidor
                  $ref: '#/components/schemas/HookConfig'
                msgreceivedbyuserhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para confirmaÃ§Ã£o de mensagem recebida pelo cliente
                  $ref: '#/components/schemas/HookConfig'
                msgreceivedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para mensagem recebida no sistema
                  $ref: '#/components/schemas/HookConfig'
                msgdeletedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para comunicaÃ§Ã£o de mensagem excluÃ­da pelo cliente
                  $ref: '#/components/schemas/HookConfig'
                msgreadedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para confirmaÃ§Ã£o de mensagem lida pelo cliente
                  $ref: '#/components/schemas/HookConfig'
                newchathook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para a abertura de um novo atendimento
                  $ref: '#/components/schemas/HookConfig'
                chatclosedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para fechamento de um atendimento aberto
                  $ref: '#/components/schemas/HookConfig'
              required: [ name, type, apiKey ]
        required: true
      responses:
        200:
          description: Fila criada com sucesso, irÃ¡ retornar o objeto da fila
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
  /int/changeQueueConfiguration:
    post:
      tags:
        - Fila
      summary: Troca a configuraÃ§Ã£o base de uma fila
      operationId: changeQueueConfiguration
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
                name:
                  type: string
                  description: Nome para a nova fila
                ivrid:
                  type: integer
                  description: ID da URA que serÃ¡ vinculada Ã  fila.
                distributionstrategy:
                  type: integer
                  description: EstratÃ©gia de distribuiÃ§Ã£o. 0 para "Menos atendimentos abertos", 1 para "Menos atendimentos encerrados", 2 para "AleatÃ³rio" e 3 para "Circular"
                importtime:
                  type: integer
                  description: Tempo em segundos para considerar uma mensagem do histÃ³rico como vÃ¡lida e importÃ¡-la. Se 0, nÃ£o irÃ¡ importar mensagens antigas. Se maior que zero, irÃ¡ importar mensagens com idade atÃ© o nÃºmero de segundos configurados. Essa operaÃ§Ã£o sÃ³ ocorre na sincronizaÃ§Ã£o inicial, apÃ³s leitura do qrcode em filas wamd.
                queueapikey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da fila.
                authstatushook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para alteraÃ§Ã£o no estado da fila
                  $ref: '#/components/schemas/HookConfig'
                callreceivedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para chamada recebida
                  $ref: '#/components/schemas/HookConfig'
                qrcodechangedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para eventos de atualizaÃ§Ã£o do qrcode de autenticaÃ§Ã£o da fila
                  $ref: '#/components/schemas/HookConfig'
                enqueuedmessagehook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para alteraÃ§Ã£o de estado de mensagem enfileirada
                  $ref: '#/components/schemas/HookConfig'
                typinghook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para cliente digitando
                  $ref: '#/components/schemas/HookConfig'
                msgsenthook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para evento de mensagem enviada
                  $ref: '#/components/schemas/HookConfig'
                msgreceivedbyserverhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para confirmaÃ§Ã£o de mensagem recebida pelo servidor
                  $ref: '#/components/schemas/HookConfig'
                msgreceivedbyuserhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para confirmaÃ§Ã£o de mensagem recebida pelo cliente
                  $ref: '#/components/schemas/HookConfig'
                msgreceivedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para mensagem recebida no sistema
                  $ref: '#/components/schemas/HookConfig'
                msgdeletedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para comunicaÃ§Ã£o de mensagem excluÃ­da pelo cliente
                  $ref: '#/components/schemas/HookConfig'
                msgreadedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para confirmaÃ§Ã£o de mensagem lida pelo cliente
                  $ref: '#/components/schemas/HookConfig'
                newchathook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para a abertura de um novo atendimento
                  $ref: '#/components/schemas/HookConfig'
                chatclosedhook:
                  type: object
                  description: Objeto de configuraÃ§Ã£o do Hook para fechamento de um atendimento aberto
                  $ref: '#/components/schemas/HookConfig'
              required: [ id, apiKey ]
        required: true
      responses:
        200:
          description: Fila atualizada com sucesso, irÃ¡ retornar o objeto da fila
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
  /int/downloadFile:
    post:
      tags:
        - Arquivos e Galeria
      summary: Faz o download de um arquivo a partir do ID do arquivo
      operationId: downloadFile
      requestBody:
        content:
          application/json:
            schema:
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                fileId:
                  type: integer
                  format: int32
                  description: ID interno do arquivo
                download:
                  type: boolean
                  description: true se desejar baixar o arquivo, false para fazer streaming
              required: [ queueId, apiKey, fileId ]
        required: true
      responses:
        200:
          description: Quando fazendo download, sinaliza que o arquivo foi encontrado, envia o conteÃºdo do arquivo
        206:
          description: Quando fazendo streaming, sinaliza que o arquivo foi encontrado e faz o streaming
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        404:
          description: Arquivo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        416:
          description: Range invÃ¡lido, nÃ£o estÃ¡ em bytes (para streaming)
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/generateDownloadUrl:
    post:
      tags:
        - Arquivos e Galeria
      summary: Gera um link para download do arquivo por terceiros. Qualquer pessoa com esse link poderÃ¡ acessar o arquivo. O link nÃ£o pode ser revogado.
      operationId: generateDownloadUrl
      requestBody:
        content:
          application/json:
            schema:
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                fileId:
                  type: integer
                  format: int32
                  description: ID interno do arquivo
              required: [ queueId, apiKey, fileId ]
        required: true
      responses:
        200:
          description: Retorna o caminho para acesso ao arquivo
          content:
            application/json:
              schema:
                type: object
                properties:
                  path:
                    description: Caminho para acesso ao arquivo. Deve ser concatenado com o domÃ­nio.
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        404:
          description: Arquivo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/uploadFile:
    post:
      tags:
        - Arquivos e Galeria
      summary: Carrega um arquivo no servidor para envio, opcionalmente, salva-o na galeria
      operationId: uploadFile
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/File'
        required: true
      responses:
        200:
          description: Arquivo carregado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  fileId:
                    description: ID do arquivo no banco de dados
                    type: integer
                    format: int32
                  mimeType:
                    description: Mimetype do arquivo
                    type: string
                  galleryId:
                    type: integer
                    description: ID do item na galeria, caso ele tenha sido salvo.
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/uploadFileGlobal:
    post:
      tags:
        - Arquivos e Galeria
      summary: Carrega um arquivo no servidor usando autenticaÃ§Ã£o global, sem necessidade de informar fila
      operationId: uploadFileGlobal
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/File'
                - type: object
                  properties:
                    apiKey:
                      type: string
                      description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
                  required: [ apiKey, fileName, mimeType, data ]
        required: true
      responses:
        200:
          description: Arquivo carregado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  fileId:
                    description: ID do arquivo no banco de dados
                    type: integer
                    format: int32
                  mimeType:
                    description: Mimetype do arquivo
                    type: string
                  galleryId:
                    type: integer
                    description: ID do item na galeria, caso ele tenha sido salvo.
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getGalleryItems:
    post:
      tags:
        - Arquivos e Galeria
      summary: Retorna lista de itens da galeria
      operationId: getGalleryItems
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Itens da galeria
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do item
                    galleryId:
                      type: integer
                      description: ID do item na galeria
                    fileId:
                      type: integer
                      description: ID do arquivo vinculado ao item.
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Nenhum item encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/deleteGalleryItem:
    post:
      tags:
        - Arquivos e Galeria
      summary: Apaga um item da galeria
      operationId: deleteGalleryItem
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                galleryId:
                  type: integer
                  description: ID do item na galeria
              required: [ queueId, apiKey, galleryId ]
        required: true
      responses:
        200:
          description: Item removido com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Item nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getPredefinedTexts:
    post:
      tags:
        - Arquivos e Galeria
      summary: Retorna lista de itens das mensagens prÃ© definidas
      operationId: getPredefinedTexts
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Itens da galeria
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do item
                    textId:
                      type: integer
                      description: ID do item na galeria
                    text:
                      type: string
                      description: ConteÃºdo da mensagem prÃ© definida
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Nenhum item encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createPredefinedText:
    post:
      tags:
        - Arquivos e Galeria
      summary: Cria uma mensagem prÃ© definida
      operationId: createPredefinedText
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                text:
                  type: string
                  description: ConteÃºdo da mensagem prÃ© definida
                title:
                  type: string
                  description: TÃ­tulo do item
              required: [ queueId, apiKey, text, title ]
        required: true
      responses:
        200:
          description: Mensagem cadastrada com sucesso
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do item
                    textId:
                      type: integer
                      description: ID do item na galeria
                    text:
                      type: string
                      description: ConteÃºdo da mensagem prÃ© definida
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/deletePredefinedText:
    post:
      tags:
        - Arquivos e Galeria
      summary: Exclui uma mensagem prÃ© definida
      operationId: deletePredefinedText
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                textId:
                  type: integer
                  description: ID da mensagem prÃ© definida
              required: [ queueId, apiKey, textId ]
        required: true
      responses:
        200:
          description: Mensagem excluÃ­da com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getChatMessages:
    post:
      tags:
        - Mensagens
      summary: Retorna as mensagens de um atendimento.
      operationId: getChatMessages
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                chatId:
                  type: integer
                  description: ID do atendimento
                fromId:
                  type: integer
                  description: Caso deseje buscar apenas as mensagens a partir de um certo ID. Deve-se usar o kId da mensagem para isso.
                includeUserInfo:
                  type: boolean
                  description: Incluir mensagens do tipo informaÃ§Ã£o inseridas pelos agentes
                includeSystemInfo:
                  type: boolean
                  description: Incluir mensagens do tipo informaÃ§Ã£o do sistema inseridas pelo sistema
                includeSupervisorAlerts:
                  type: boolean
                  description: Incluir mensagens do tipo alerta inseridas pelos supervisores
              required: [ queueId, apiKey, chatId ]
        required: true
      responses:
        200:
          description: Retorna lista de mensagens
          content:
            application/json:
              schema:
                properties:
                  maxKId:
                    type: integer
                    format: int32
                    description: O maior ID presente no resultado
                  messages:
                    type: array
                    description: Lista com mensagens
                    items:
                      type: object
                      properties:
                        kId:
                          type: integer
                          format: int32
                          description: ID da mensagem
                        mId:
                          type: string
                          description: ID da mensagem no serviÃ§o de mensageria
                        queueId:
                          type: integer
                          format: int32
                          description: ID da fila
                        clientId:
                          type: string
                          description: ID do cliente no serviÃ§o de mensageria
                        userId:
                          type: integer
                          description: ID do usuÃ¡rio que enviou a mensagem, caso sentido seja out
                        direction:
                          type: string
                          enum: [ 'in', 'out', 'system-info', 'info', 'alert' ]
                          description: DireÃ§Ã£o da mensagem, in para recebida, out para enviada
                        text:
                          type: string
                          description: ConteÃºdo de texto da mensagem
                        quotedText:
                          type: string
                          description: ConteÃºdo de texto da mensagem sitada, se houver
                        quotedId:
                          type: string
                          description: ID da mensagem sitada no serviÃ§o de mensageria, se houver
                        messageTimestamp:
                          type: integer
                          format: int64
                          description: Timestamp da mensagem
                        srvRcvTime:
                          type: integer
                          format: int64
                          description: Timestamp da hora em que o servidor recebeu a mensagem
                        clientRcvTime:
                          type: integer
                          format: int64
                          description: Timestamp da hora em que o cliente recebeu a mensagem
                        clientReadTime:
                          type: integer
                          format: int64
                          description: Timestamp da hora em que o cliente leu a mensagem
                        location:
                          type: object
                          description: Objeto sÃ³ disponÃ­vel quando se tratar de mensagem de localizaÃ§Ã£o
                          properties:
                            latitude:
                              type: string
                              description: Latitude
                            longitude:
                              type: string
                              description: Longitude
                        file:
                          type: object
                          description: Objeto sÃ³ disponÃ­vel quando mensagem possuir arquivo associado
                          properties:
                            fileId:
                              type: integer
                              format: int32
                              description: ID do arquivo vinculado Ã  mensagem, se houver
                            mimeType:
                              type: string
                              description: MimeType da mÃ­dia vinculada Ã  mensagem, se houver
                            name:
                              type: string
                              description: Nome do arquivo da mÃ­dia vinculada Ã  mensagem, se houver
                        deleted:
                          type: boolean
                          description: true se a mensagem tiver sido deletada pelo cliente ou agente
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
        404:
          description: Atendimento nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getMessageStatus:
    post:
      tags:
        - Mensagens
      summary: Busca o estado da fila
      operationId: getMessageStatus
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                kId:
                  type: integer
                  format: int32
                  description: ID da mensagem
              required: [ queueId, apiKey, kId ]
        required: true
      responses:
        200:
          description: Retorna o estado da mensagem
          content:
            application/json:
              schema:
                properties:
                  mId:
                    type: string
                    description: ID da mensagem do serviÃ§o de mensageria
                  srvRcvTime:
                    type: integer
                    description: Timestamp em que a mensagem foi recebida pelo servidor
                  clientRcvTime:
                    type: integer
                    description: Timestamp em que a mensagem foi recebida pelo cliente, se em branco, mensagem ainda nÃ£o foi recebida pelo cliente
                  clientReadTime:
                    type: integer
                    description: Timestamp em que a mensagem foi lida, se em branco, a mensagem ainda nÃ£o foi marcada como lida
                  deleted:
                    type: boolean
                    description: Se true, a mensagem foi deletada pelo cliente ou pelo agente
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Mensagem nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/enqueueMessageToSend:
    post:
      tags:
        - Mensagens
      summary: Enfileira uma mensagem para envio.
      description: OperaÃ§Ã£o assÃ­ncrona, a mensagem Ã© adicionada em uma fila para envio. O status do envio pode ser consultado utilizando a chamada checkEnqueuedMessage
      operationId: enqueueMessageToSend
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                templateId:
                  type: integer
                  format: int32
                  description: ID do template de mensagem, obrigatÃ³rio quando for uma fila oficial
                headerFile:
                  type: string
                  description: URL da mÃ­dia do cabeÃ§alho do template. ObrigatÃ³rio quando for uma fila oficial e o template selecionado possuir cabeÃ§alho de mÃ­dia.
                headerFileName:
                  type: string
                  description: Nome do arquivo da mÃ­dia do cabeÃ§alho do template. Opcional, serÃ¡ enviado junto com a URL da mÃ­dia quando informado.
                varsdata:
                  type: array
                  description: Lista de strings para substituiÃ§Ã£o nas variÃ¡veis do template. O primeiro item da lista serÃ¡ utilizado para a variÃ¡vel {{1}} do template, a segunda para a {{2}} e assim por diante. Segue a ordem de variÃ¡veis do cabeÃ§alho, corpo, botÃµes e listas e por fim rodapÃ©.
                number:
                  type: string
                  description: NÃºmero de telefone do cliente para quem se deseja enviar a mensagem. Deve-se informar o number ou o clientId. NÃ£o Ã© necessÃ¡rio informar ambos. O atributo number possui prioridade sobre o clientId.
                country:
                  type: string
                  description: CÃ³digo ISO do paÃ­s do nÃºmero de telefone com dois caracteres. Se nÃ£o informado, serÃ¡ utilizado o padrÃ£o da instÃ¢ncia. (Ex. BR)
                clientId:
                  type: string
                  description: ID do destinatÃ¡rio no serviÃ§o de mensageria. Deve-se informar o number ou o clientId. NÃ£o Ã© necessÃ¡rio informar ambos. O atributo number possui prioridade sobre o clientId.
                text:
                  type: string
                  description: ConteÃºdo de texto da mensagem, se houver. Se esta propriedade nÃ£o estiver presente, o fileId Ã© obrigatÃ³rio.
                fileId:
                  type: integer
                  description: ID do arquivo que se deseja enviar, se houver. Se esta propriedade nÃ£o estiver presente o text Ã© obrigatÃ³rio.
                buttonsConfig:
                  type: object
                  description: Objeto de configuraÃ§Ã£o para botÃµes de resposta rÃ¡pida. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 3 botÃµes de resposta rÃ¡pida por mensagem.
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                    buttons:
                      type: array
                      description: Define a quantidade e o texto dos botÃµes de resposta rÃ¡pida
                      items:
                        oneOf:
                          - type: string
                          - type: object
                            properties:
                              text:
                                type: string
                              id:
                                type: string
                urlButtonConfig:
                  type: object
                  description: Objeto de configuraÃ§Ã£o para botÃ£o de URL. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 1 botÃ£o de URL por mensagem.
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                    buttons:
                      type: array
                      description: Define a quantidade e o texto dos botÃµes de resposta rÃ¡pida
                      items:
                        type: object
                        description: Dados do botÃ£o
                        properties:
                          url:
                            type: string
                            description: Url que serÃ¡ aberta quando o botÃ£o for clicado
                          text:
                            type: string
                            description: Texto do botÃ£o
                listConfig:
                  type: object
                  description: Objeto de configuraÃ§Ã£o para lista de seleÃ§Ã£o. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton.
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                    items:
                      type: array
                      description: Define os itens da lista
                      items:
                        type: object
                        properties:
                          title:
                            type: string
                            description: TÃ­tulo do item
                          description:
                            type: string
                            description: DescriÃ§Ã£o do item
                campaignName:
                  type: string
                  description: Nome da campanha. Ã‰ utilizado para composiÃ§Ã£o de relatÃ³rios.
                extData:
                  type: string
                  description: Campo de texto livre. Utilizado para salvar dados para integraÃ§Ãµes.
                extFlag:
                  type: integer
                  description: Campo nÃºmerico inteiro livre. Utilizado para salvar dados para integraÃ§Ãµes. Somente inteiros positivos. Valor mÃ¡ximo 2147483647
                hidden:
                  type: boolean
                  description: Se verdadeiro, a mensagem enviada nÃ£o ficarÃ¡ visÃ­vel no histÃ³rico de mensagens dos agentes nem serÃ¡ exibida se um atendimento com o cliente estiver em curso
              required: [ queueId, apiKey, number, clientId ]
        required: true
      responses:
        200:
          description: Retorna o estado da mensagem
          content:
            application/json:
              schema:
                properties:
                  enqueuedId:
                    type: integer
                    description: ID da mensagem na fila de envio
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
    get:
      tags:
        - Mensagens
      summary: Enfileira uma mensagem para envio.
      description: OperaÃ§Ã£o assÃ­ncrona, a mensagem Ã© adicionada em uma fila para envio. O status do envio pode ser consultado utilizando a chamada checkEnqueuedMessage
      operationId: enqueueMessageToSendGet
      parameters:
        - name: queueId
          description: ID da fila
          in: query
          required: true
          schema:
            type: integer
            format: int32
        - name: apiKey
          in: query
          required: true
          description: Chave de autenticaÃ§Ã£o da API para a fila especificada
          schema:
            type: string
        - name: number
          in: query
          required: true
          description: NÃºmero de telefone do cliente para quem se deseja enviar a mensagem. Deve-se informar o number ou o clientId. NÃ£o Ã© necessÃ¡rio informar ambos. O atributo number possui prioridade sobre o clientId.
          schema:
            type: string
        - name: country
          in: query
          description: CÃ³digo ISO do paÃ­s do nÃºmero de telefone com dois caracteres. Se nÃ£o informado, serÃ¡ utilizado o padrÃ£o da instÃ¢ncia.
          schema:
            type: string
        - name: clientId
          in: query
          description: ID do destinatÃ¡rio no serviÃ§o de mensageria. Deve-se informar o number ou o clientId. NÃ£o Ã© necessÃ¡rio informar ambos. O atributo number possui prioridade sobre o clientId.
          schema:
            type: string
        - name: text
          in: query
          description: ConteÃºdo de texto da mensagem, se houver. Se esta propriedade nÃ£o estiver presente, o fileId Ã© obrigatÃ³rio.
          schema:
            type: string
        - name: fileId
          in: query
          description: ID do arquivo que se deseja enviar, se houver. Se esta propriedade nÃ£o estiver presente o text Ã© obrigatÃ³rio.
          schema:
            type: integer
        - name: headerFileName
          in: query
          description: Nome do arquivo da mÃ­dia do cabeÃ§alho do template. Opcional, serÃ¡ enviado junto com a URL da mÃ­dia quando informado.
          schema:
            type: string
        - name: buttonsConfig
          in: query
          description: Objeto de configuraÃ§Ã£o para botÃµes de resposta rÃ¡pida textualizado. Ver estrutura no enqueueMessageToSend (POST). Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 3 botÃµes de resposta rÃ¡pida por mensagem.
          schema:
            type: string
        - name: urlButtonConfig
          in: query
          description: Objeto de configuraÃ§Ã£o para botÃ£o de URLtextualizado. Ver estrutura no enqueueMessageToSend (POST). Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 1 botÃ£o de URL por mensagem.
          schema:
            type: string
        - name: listConfig
          in: query
          description: Objeto de configuraÃ§Ã£o para lista de seleÃ§Ã£o textualizado. Ver estrutura no enqueueMessageToSend (POST). Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton.
          schema:
            type: string
        - name: campaignName
          in: query
          description: Nome da campanha. Ã‰ utilizado para composiÃ§Ã£o de relatÃ³rios.
          schema:
            type: string
        - name: extData
          in: query
          description: Campo de texto livre. Utilizado para salvar dados para integraÃ§Ãµes.
          schema:
            type: string
        - name: extFlag
          in: query
          description: Campo nÃºmerico inteiro livre. Utilizado para salvar dados para integraÃ§Ãµes. Somente inteiros positivos. Valor mÃ¡ximo 2147483647
          schema:
            type: integer
      responses:
        200:
          description: Retorna o estado da mensagem
          content:
            application/json:
              schema:
                properties:
                  enqueuedId:
                    type: integer
                    description: ID da mensagem na fila de envio
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/enqueueMessagesToSend:
    post:
      tags:
        - Mensagens
      summary: Enfileira vÃ¡rias mensagens para envio.
      description: OperaÃ§Ã£o assÃ­ncrona, as mensagens sÃ£o adicionadas em uma fila para envio. O status do envio pode ser consultado utilizando a chamada checkEnqueuedMessage. Podem ser efileiradas atÃ© 50 mensagens por chamada.
      operationId: enqueueMessagesToSend
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                messages:
                  type: array
                  description: Lista com as mensagens que serÃ£o enfileiradas
                  items:
                    type: object
                    properties:
                      templateId:
                        type: integer
                        format: int32
                        description: ID do template de mensagem, obrigatÃ³rio quando for uma fila oficial
                      headerFile:
                        type: string
                        description: URL da mÃ­dia do cabeÃ§alho do template. ObrigatÃ³rio quando for uma fila oficial e o template selecionado possuir cabeÃ§alho de mÃ­dia.
                      headerFileName:
                        type: string
                        description: Nome do arquivo da mÃ­dia do cabeÃ§alho do template. Opcional, serÃ¡ enviado junto com a URL da mÃ­dia quando informado.
                      varsdata:
                        type: array
                        description: Lista de strings para substituiÃ§Ã£o nas variÃ¡veis do template. O primeiro item da lista serÃ¡ utilizado para a variÃ¡vel {{1}} do template, a segunda para a {{2}} e assim por diante. Segue a ordem de variÃ¡veis do cabeÃ§alho, corpo, botÃµes e listas e por fim rodapÃ©.
                      number:
                        type: string
                        description: NÃºmero de telefone do cliente para quem se deseja enviar a mensagem. Deve-se informar o number ou o clientId. NÃ£o Ã© necessÃ¡rio informar ambos. O atributo number possui prioridade sobre o clientId.
                      country:
                        type: string
                        description: CÃ³digo ISO do paÃ­s do nÃºmero de telefone com dois caracteres. Se nÃ£o informado, serÃ¡ utilizado o padrÃ£o da instÃ¢ncia.
                      clientId:
                        type: string
                        description: ID do destinatÃ¡rio no serviÃ§o de mensageria. Deve-se informar o number ou o clientId. NÃ£o Ã© necessÃ¡rio informar ambos. O atributo number possui prioridade sobre o clientId.
                      text:
                        type: string
                        description: ConteÃºdo de texto da mensagem, se houver. Se esta propriedade nÃ£o estiver presente, o fileId Ã© obrigatÃ³rio.
                      fkFile:
                        type: integer
                        format: int32
                        description: ID de mÃ­dia que se deseja enviar
                      buttonsConfig:
                        type: object
                        description: Objeto de configuraÃ§Ã£o para botÃµes de resposta rÃ¡pida. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 3 botÃµes de resposta rÃ¡pida por mensagem.
                        properties:
                          title:
                            type: string
                            description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                          buttons:
                            type: array
                            description: Define a quantidade e o texto dos botÃµes de resposta rÃ¡pida
                            items:
                              oneOf:
                                - type: string
                                - type: object
                                  properties:
                                    text:
                                      type: string
                                    id:
                                      type: string
                      urlButtonConfig:
                        type: object
                        description: Objeto de configuraÃ§Ã£o para botÃ£o de URL. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 1 botÃ£o de URL por mensagem.
                        properties:
                          title:
                            type: string
                            description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                          buttons:
                            type: array
                            description: Define a quantidade e o texto dos botÃµes de resposta rÃ¡pida
                            items:
                              type: object
                              description: Dados do botÃ£o
                              properties:
                                url:
                                  type: string
                                  description: Url que serÃ¡ aberta quando o botÃ£o for clicado
                                text:
                                  type: string
                                  description: Texto do botÃ£o
                      listConfig:
                        type: object
                        description: Objeto de configuraÃ§Ã£o para lista de seleÃ§Ã£o. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton.
                        properties:
                          title:
                            type: string
                            description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                          items:
                            type: array
                            description: Define os itens da lista
                            items:
                              type: object
                              properties:
                                title:
                                  type: string
                                  description: TÃ­tulo do item
                                description:
                                  type: string
                                  description: DescriÃ§Ã£o do item
                      campaignName:
                        type: string
                        description: Nome da campanha. Ã‰ utilizado para composiÃ§Ã£o de relatÃ³rios.
                      extData:
                        type: string
                        description: Campo de texto livre. Utilizado para salvar dados para integraÃ§Ãµes.
                      extFlag:
                        type: integer
                        description: Campo nÃºmerico inteiro livre. Utilizado para salvar dados para integraÃ§Ãµes. Somente inteiros positivos. Valor mÃ¡ximo 2147483647
                      hidden:
                        type: boolean
                        description: Se verdadeiro, a mensagem enviada nÃ£o ficarÃ¡ visÃ­vel no histÃ³rico de mensagens dos agentes nem serÃ¡ exibida se um atendimento com o cliente estiver em curso
              required: [ queueId, apiKey, messages ]
        required: true
      responses:
        200:
          description: Retorna o estado da mensagem
          content:
            application/json:
              schema:
                properties:
                  success:
                    type: array
                    description: Mensagens enfileiradas com sucesso. O sucesso no enfileiramento nÃ£o garante o sucesso no envio.
                    items:
                      type: object
                      properties:
                        enqueuedId:
                          type: integer
                          description: ID da mensagem na fila de envio
                  fails:
                    type: array
                    description: Lista com as mensagens que falharam em serem enfileiradas
                    items:
                      type: object
                  failsCount:
                    type: integer
                  successCount:
                    type: integer
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/sendMessageToChat:
    post:
      tags:
        - Mensagens
      summary: Envia uma mensagem por um atendimento aberto.
      operationId: sendMessageToChat
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                chatId:
                  type: integer
                  description: ID do atendimento
                text:
                  type: string
                  description: ConteÃºdo de texto da mensagem, se houver. Se esta propriedade nÃ£o estiver presente, o fileId Ã© obrigatÃ³rio.
                fileId:
                  type: integer
                  description: ID do arquivo que se deseja enviar, se houver. Se esta propriedade nÃ£o estiver presente o text Ã© obrigatÃ³rio.
                info:
                  type: boolean
                  description: Se true, a mensagem serÃ¡ considerada como uma mensagem de informaÃ§Ã£o apenas, serÃ¡ inserida no atendimento porÃ©m nÃ£o serÃ¡ enviada ao cliente.
                buttonsConfig:
                  type: object
                  description: Objeto de configuraÃ§Ã£o para botÃµes de resposta rÃ¡pida. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 3 botÃµes de resposta rÃ¡pida por mensagem.
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                    buttons:
                      type: array
                      description: Define a quantidade e o texto dos botÃµes de resposta rÃ¡pida
                      items:
                        oneOf:
                          - type: string
                          - type: object
                            properties:
                              text:
                                type: string
                              id:
                                type: string
                urlButtonConfig:
                  type: object
                  description: Objeto de configuraÃ§Ã£o para botÃ£o de URL. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton. Recomenda-se o mÃ¡ximo de 1 botÃ£o de URL por mensagem.
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                    buttons:
                      type: array
                      description: Define a quantidade e o texto dos botÃµes de resposta rÃ¡pida
                      items:
                        type: object
                        description: Dados do botÃ£o
                        properties:
                          url:
                            type: string
                            description: Url que serÃ¡ aberta quando o botÃ£o for clicado
                          text:
                            type: string
                            description: Texto do botÃ£o
                listConfig:
                  type: object
                  description: Objeto de configuraÃ§Ã£o para lista de seleÃ§Ã£o. Esse campo sÃ³ Ã© utilizado em filas do tipo WAMD e WAGS. SÃ³ pode haver uma das trÃªs opÃ§Ãµes, buttons, list ou urlButton.
                  properties:
                    title:
                      type: string
                      description: TÃ­tulo do botÃ£o. Desconsiderado se houver um fileId.
                    items:
                      type: array
                      description: Define os itens da lista
                      items:
                        type: object
                        properties:
                          title:
                            type: string
                            description: TÃ­tulo do item
                          description:
                            type: string
                            description: DescriÃ§Ã£o do item
                hidden:
                  type: boolean
                  description: Se verdadeiro, a mensagem enviada nÃ£o ficarÃ¡ visÃ­vel no histÃ³rico de mensagens dos agentes nem serÃ¡ exibida se um atendimento com o cliente estiver em curso
              required: [ queueId, apiKey, chatId ]
        required: true
      responses:
        200:
          description: Mensagem enviada com sucesso
          content:
            application/json:
              schema:
                properties:
                  mId:
                    type: string
                    description: ID da mensagem no serviÃ§o de mensageria
                  kId:
                    type: integer
                    description: ID da mensagem no sistema
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Atendimento ou arquivo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/checkEnqueuedMessage:
    post:
      tags:
        - Mensagens
      summary: Retorna os estado de uma mensagem enfileirada para envio.
      operationId: checkEnqueuedMessage
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                enqueuedId:
                  type: integer
                  description: ID da mensagem enfileirada
              required: [ queueId, apiKey, enqueuedId ]
        required: true
      responses:
        200:
          description: Estado da mensagem enfileirada
          content:
            application/json:
              schema:
                properties:
                  kId:
                    type: integer
                    format: int32
                    description: ID da mensagem
                  mId:
                    type: string
                    description: ID da mensagem no serviÃ§o de mensageria
                  status:
                    type: integer
                    description: Se 0, ainda aguardando envio. Se 1, mensagem jÃ¡ foi enviada, 2, nÃºmero nÃ£o possui WA, 3, a fila Ã© invÃ¡lida ou nÃ£o estava disponÃ­vel, 4, o nÃºmero informado Ã© invÃ¡lido, 5, o objeto de botÃµes Ã© invÃ¡lido, 6 o objeto de lista Ã© invÃ¡lido, 7, o envio foi cancelado por API.
                  srvRcvTime:
                    type: integer
                    format: int64
                    description: Timestamp da hora em que o servidor recebeu a mensagem
                  clientRcvTime:
                    type: integer
                    format: int64
                    description: Timestamp da hora em que o cliente recebeu a mensagem
                  clientReadTime:
                    type: integer
                    format: int64
                    description: Timestamp da hora em que o cliente leu a mensagem
                  deleted:
                    type: boolean
                    description: true se a mensagem tiver sido deletada pelo cliente ou agente
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Mensagem nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/cancelEnqueuedMessages:
    post:
      tags:
        - Mensagens
      summary: Cancela uma ou mais mensagens enfileiradas para envio.
      operationId: cancelEnqueuedMessages
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                enqueuedIds:
                  type: array
                  description: Lista com os IDs das mensagens que devem ter seu envio cancelado. MÃ¡ximo de 100 por requisiÃ§Ã£o. Se uma mensagem jÃ¡ tiver sido processada, seu status nÃ£o serÃ¡ alterado.
                  items:
                    type: integer
                    format: int32
              required: [ queueId, apiKey, enqueuedIds ]
        required: true
      responses:
        200:
          description: Resultado da operaÃ§Ã£o
          content:
            application/json:
              schema:
                properties:
                  status:
                    type: string
                    description: Resultado da operaÃ§Ã£o
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/changeEnqueuedMessagesStatus:
    post:
      tags:
        - Mensagens
      summary: Altera o estado de uma ou mais mensagens enfileiradas para envio.
      operationId: changeEnqueuedMessagesStatus
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                enqueuedIds:
                  type: array
                  description: Lista com os IDs das mensagens que devem ter seu status alterado. MÃ¡ximo de 100 por requisiÃ§Ã£o. Se uma mensagem jÃ¡ tiver sido processada, seu status nÃ£o serÃ¡ alterado.
                  items:
                    type: integer
                    format: int32
                newStatus:
                  type: integer
                  format: int32
                  description: CÃ³digo do novo status que serÃ¡ definido nas mensagens
              required: [ queueId, apiKey, enqueuedIds, newStatus ]
        required: true
      responses:
        200:
          description: Resultado da operaÃ§Ã£o
          content:
            application/json:
              schema:
                properties:
                  status:
                    type: string
                    description: Resultado da operaÃ§Ã£o
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createNewUser:
    post:
      tags:
        - UsuÃ¡rios
      summary: Cria um novo usuÃ¡rio do tipo agente
      description: Somente usuÃ¡rios do tipo agente podem ser criados pela API.
      operationId: createNewUser
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API
                username:
                  type: string
                  description: Nome de usuÃ¡rio
                  maxLength: 32
                password:
                  type: string
                  description: Senha do usuÃ¡rio
                fullname:
                  type: string
                  description: Nome completo do usuÃ¡rio
                sipuser:
                  type: string
                  description: UsuÃ¡rio SIP para o agente, caso a telefonia esteja ativa
                  maxLength: 32
                sippass:
                  type: string
                  description: Senha SIP para o agente, caso a telefonia esteja ativa
                changepass:
                  type: integer
                  description: Se 1, o usuÃ¡rio serÃ¡ obrigado a trocar a senha no prÃ³ximo login
                canaccessabandoned:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode acessar o relatÃ³rio de chamadas abandonadas
                canreopenchat:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode reabrir atendimentos
                canreopenotherschat:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode reabrir atendimentos de outros agentes
                canuseinternalchat:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode usar o chat interno
                canopennewchat:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode abrir novos atendimentos
                canexportchat:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode exportar atendimentos no histÃ³rico de atendimentos
                canreadhistorymessages:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode visualizar as mensagens de um atendimento no histÃ³rico de atendimentos
                limitpulledchats:
                    type: integer
                    description: Se 1, o capacidade de puxar atendimentos do agente serÃ¡ limitada pelos limites de atendimento individual e da fila
                keeponline:
                  type: integer
                  description: Se 1, o usuÃ¡rio serÃ¡ mantido sempre disponÃ­vel mesmo que ele nÃ£o esteja utilizando o sistema em nenhum dispositivo
                cancreatetasksforeveryone:
                  type: integer
                  description: Se 1, o usuÃ¡rio pode criar tarefas para qualquer outro usuÃ¡rio
                autologin:
                  type: integer
                  description: Se 1, o usuÃ¡rio serÃ¡ automaticamente logado a todas as filas que faz parte ao entrar no sistema
                queues:
                    type: array
                    description: Lista de IDs das filas que o usuÃ¡rio farÃ¡ parte
                    items:
                        type: integer
                extid:
                  type: string
                  description: ID externo, usado para integraÃ§Ãµes
                  maxLength: 128
                extdata:
                  type: string
                  description: Campo de texto livre. Utilizado para salvar dados para integraÃ§Ãµes.
                  maxLength: 128
                chatenabled:
                  type: integer
                  description: Se 1, as funcionalidades de atendimento estarÃ£o habilitadas para o usuÃ¡rio
                tasksenabled:
                  type: integer
                  description: Se 1, as funcionalidades de tarefas estarÃ£o habilitadas para o usuÃ¡rio
                allcontactsgroups:
                  type: integer
                  description: Se 1, o usuÃ¡rio terÃ¡ acesso a todos os grupos de contatos
                tasksmonitoring:
                  type: integer
                  description: Se 1, o monitoramento de atividades estarÃ¡ habilitado para o usuÃ¡rio
                contactsgroups:
                  type: array
                  description: Lista de IDs dos grupos de contatos que o usuÃ¡rio terÃ¡ acesso
                  items:
                      type: integer
                maxchats:
                  type: integer
                  description: NÃºmero mÃ¡ximo de atendimentos simultÃ¢neos que o usuÃ¡rio pode ter
                fk_visualgroup:
                  type: integer
                  description: ID do grupo de visualizaÃ§Ã£o do usuÃ¡rio
                enablesoftphone:
                  type: integer
                  description: Se 1, o softphone serÃ¡ habilitado para o usuÃ¡rio, caso a telefonia esteja ativa na instÃ¢ncia
                tags:
                  type: array
                  description: Lista de filtros de atendimento que o usuÃ¡rio pode atender
                  items:
                      type: string
              required: [ apiKey, username, password, fullname ]
        required: true
      responses:
        200:
          description: UsuÃ¡rio criado com sucesso
          content:
            application/json:
              schema:
                properties:
                  id:
                    type: integer
                    description: ID do novo usuÃ¡rio criado
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        403:
          description: NÃ£o permitido. Tipo de usuÃ¡rio nÃ£o Ã© agente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: UsuÃ¡rio nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/generateUserAuthKey:
    post:
      tags:
        - UsuÃ¡rios
      summary: Gera uma chave de autenticaÃ§Ã£o para o usuÃ¡rio.
      description: Essa chave pode ser usada para autenticaÃ§Ã£o sem senha, e Ã© vÃ¡lida uma Ãºnica vez. SÃ³ podem ser geradas chaves para usuÃ¡rios do tipo agente.
      operationId: generateUserAuthKey
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                userId:
                  type: integer
                  description: ID do usuÃ¡rio para o qual se deseja gerar a chave de autenticaÃ§Ã£o
              required: [ queueId, apiKey, userId ]
        required: true
      responses:
        200:
          description: Chave de autenticaÃ§Ã£o
          content:
            application/json:
              schema:
                properties:
                  username:
                    type: string
                    description: Nome do usuÃ¡rio
                  authkey:
                    type: string
                    description: Chave de autenticaÃ§Ã£o
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        403:
          description: NÃ£o permitido. Tipo de usuÃ¡rio nÃ£o Ã© agente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: UsuÃ¡rio nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getUserDetail:
    post:
      tags:
        - UsuÃ¡rios
      summary: Busca detalhes de um usuÃ¡rio
      operationId: getUserDetail
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                userId:
                  type: integer
                  description: ID do usuÃ¡rio para o qual se deseja gerar a chave de autenticaÃ§Ã£o
              required: [ queueId, apiKey, userId ]
        required: true
      responses:
        200:
          description: Chave de autenticaÃ§Ã£o
          content:
            application/json:
              schema:
                properties:
                  username:
                    type: string
                    description: Nome de usuÃ¡rio utilizado para autenticaÃ§Ã£o
                  extid:
                    type: string
                    description: ID externo, usado para integraÃ§Ãµes
                  fullName:
                    type: string
                    description: Nome completo do usuÃ¡rio
                  type:
                    type: string
                    description: Tipo do usuÃ¡rio
                  tags:
                    type: array
                    description: Filtros que o agente faz parte
                    items:
                      type: string
                  userPicVersion:
                    type: integer
                    description: VersÃ£o da foto do usuÃ¡rio
                  available:
                    type: boolean
                    description: true se o usuÃ¡rio estiver disponÃ­vel no momento
                  locked:
                    type: boolean
                    description: true se o usuÃ¡rio estiver bloqueado no momento
                  inChat:
                    type: boolean
                    description: true se o usuÃ¡rio estiver com atendimento no momento
                  chatsToday:
                    type: integer
                    description: Total de atendimentos realizados hoje
                  chatsRespondedToday:
                    type: integer
                    description: Total de atendimentos respondidos hoje
                  todaysSurveyGrade:
                    type: integer
                    description: Nota mÃ©dia da pesquisa de satisfaÃ§Ã£o hoje
                  todaysRespondedSurveys:
                    type: integer
                    description: Total de respostas a pesquisa de satisfaÃ§Ã£o em atendimentos do usuÃ¡rio
                  todaysAvgContactTime:
                    type: integer
                    description: TMA do usuÃ¡rio hoje
                  todaysPauses:
                    type: integer
                    description: Total de pausas hoje
                  todaysBlowedPausas:
                    type: integer
                    description: Total de estouros de pausa hoje
                  queuesCount:
                    type: integer
                    description: NÃºmero de filas que o usuÃ¡rio faz parte
                  chatsCount:
                    type: integer
                    description: NÃºmero te atendimentos com o usuÃ¡rio no momento
                  paused:
                    type: boolean
                    description: true se o usuÃ¡rio estiver em pausa no momento
                  pauseReason:
                    type: string
                    description: Motivo da pausa, caso o usuÃ¡rio esteja em pausa
                  pauseBeginTime:
                    type: integer
                    description: Timestamp do inÃ­cio da pausa caso o usuÃ¡rio esteja em pausa
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        403:
          description: NÃ£o permitido. Tipo de usuÃ¡rio nÃ£o Ã© agente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: UsuÃ¡rio nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/addUserNotification:
    post:
      tags:
        - UsuÃ¡rios
      summary: Adiciona uma notificaÃ§Ã£o ao usuÃ¡rio
      operationId: addUserNotification
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  type: integer
                  format: int32
                  description: ID da fila
                apiKey:
                  type: string
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                userId:
                  type: integer
                  description: ID do usuÃ¡rio para o qual se deseja adicionar uma notificaÃ§Ã£o
                text:
                  type: string
                  description: Texto da notificaÃ§Ã£o
                type:
                  type: integer
                  description: Tipo da notificaÃ§Ã£o. 0 para informaÃ§Ã£o, 1 para sucesso, 2 para alerta e 3 para erro
              required: [ queueId, apiKey, userId, text, type ]
        required: true
      responses:
        200:
          description: NotificaÃ§Ã£o adicionada com sucesso
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        403:
          description: NÃ£o permitido. Tipo de usuÃ¡rio nÃ£o Ã© agente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: UsuÃ¡rio nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTags:
    post:
      tags:
        - Contatos
      summary: Busca a lista de etiquetas de contatos
      operationId: getTags
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: RelaÃ§Ã£o de etiquetas de contato
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      format: int32
                      description: ID da etiqueta
                    name:
                      type: string
                      description: Nome da etiqueta
                    bgcolor:
                      type: string
                      description: Cor do fundo da etiqueta
                    fgcolor:
                      type: string
                      description: Cor da fonte da etiqueta
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getChatTags:
    post:
      tags:
        - Fila
      summary: Busca a lista de etiquetas de chat cadastradas no sistema e atribuÃ­das a fila
      operationId: getChatTags
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: RelaÃ§Ã£o de etiquetas de chat
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      format: int32
                      description: ID da etiqueta
                    name:
                      type: string
                      description: Nome da etiqueta
                    description:
                      type: string
                      description: DescriÃ§Ã£o
                    marker:
                      type: string
                      description: Emoji da etiqueta
                    priority:
                      type: integer
                      description: Prioridade
                    locktag:
                      type: boolean
                      description: Se verdadeiro, o agente nÃ£o pode remover essa etiqueta do atendimento
                    alertonpanel:
                      type: boolean
                      description: Se verdadeiro, essa etiqueta gera um alerta no painel do supervisor
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/insertContactNote:
    post:
      tags:
        - Contatos
      summary: Insere uma nota em um contato
      operationId: insertContactNote
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID do contato que receberÃ¡ a nota
                  type: integer
                  format: int32
                note:
                  description: Nota que serÃ¡ inserida
                  type: string
              required: [ queueId, apiKey, id, note ]
        required: true
      responses:
        200:
          description: Nota inserida com sucesso
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/addContact:
    post:
      tags:
        - Contatos
      summary: Cria um novo contato
      operationId: addContact
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                name:
                  description: Nome do contato
                  type: string
                  maxLength: 255
                document:
                  description: NÃºmero do documento (CPF / CNPJ). Somente nÃºmeros.
                  type: string
                  maxLength: 40
                number:
                  description: NÃºmero de telefone do contato
                  type: string
                  maxLength: 30
                facebook:
                  description: Facebook do usuÃ¡rio
                  type: string
                  maxLength: 100
                instagram:
                  description: Instagram do usuÃ¡rio
                  type: string
                  maxLength: 100
                email:
                  description: EndereÃ§o de e-mail do contato
                  type: string
                  maxLength: 155
                address:
                  description: EndereÃ§o do contato
                  type: string
                  maxLength: 255
                houseNumber:
                  description: NÃºmero do imÃ³vel
                  type: string
                  maxLength: 10
                addressComp:
                  description: Complemento do endereÃ§o
                  type: string
                  maxLength: 50
                neighborhood:
                  description: Bairro do endereÃ§o
                  type: string
                city:
                  description: Cidade
                  type: string
                  maxLength: 100
                state:
                  description: Estado
                  type: string
                  maxLength: 100
                country:
                  type: string
                  description: PaÃ­s
                  maxLength: 50
                postalCode:
                  description: CÃ³digo postal (CEP)
                  type: string
                  maxLength: 15
                free1:
                  description: Campo livre 1.
                  type: string
                  maxLength: 100
                free2:
                  description: Campo livre 2.
                  type: string
                  maxLength: 100
                donotdisturb:
                  description: Se 1, o contato ficarÃ¡ bloqueado para atendimentos ativos. Se 0, atendimentos ativos serÃ£o permitidos.
                  type: integer
                  format: int8
                fk_company:
                  description: ID da empresa a qual o contato estÃ¡ vinculado
                  type: integer
                  format: int32
                groups:
                  description: Lista com os IDs dos grupos de contato a que este contato faz parte
                  type: array
                  items:
                    type: integer
                tags:
                  description: Lista com os IDs das tags que se deseja associar a esse contato
                  type: array
                  items:
                    type: integer
                preferredAgent:
                  description: ID do primeiro agente preferencial, se houver
                  type: integer
                  format: int32
                preferredAgents:
                  description: Lista com os IDs dos agentes preferenciais, na ordem em que devem ser aplicados. Se informado, o campo preferredAgent Ã© ignorado.
                  type: array
                  items:
                    type: integer
              required: [ queueId, apiKey, name ]
        required: true
      responses:
        200:
          description: Contato criado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  contactId:
                    description: ID do contato criado
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/editContact:
    post:
      tags:
        - Contatos
      summary: Atualiza os dados de um contato existente
      operationId: editContact
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID do contato que serÃ¡ atualizado
                  type: integer
                  format: int32
                name:
                  description: Nome do contato
                  type: string
                  maxLength: 255
                document:
                  description: NÃºmero do documento (CPF / CNPJ). Somente nÃºmeros.
                  type: string
                  maxLength: 40
                number:
                  description: NÃºmero de telefone do contato
                  type: string
                  maxLength: 30
                facebook:
                  description: Facebook do usuÃ¡rio
                  type: string
                  maxLength: 100
                instagram:
                  description: Instagram do usuÃ¡rio
                  type: string
                  maxLength: 100
                email:
                  description: EndereÃ§o de e-mail do contato
                  type: string
                  maxLength: 155
                address:
                  description: EndereÃ§o do contato
                  type: string
                  maxLength: 255
                houseNumber:
                  description: NÃºmero do imÃ³vel
                  type: string
                  maxLength: 10
                addressComp:
                  description: Complemento do endereÃ§o
                  type: string
                  maxLength: 50
                neighborhood:
                  description: Bairro do endereÃ§o
                  type: string
                city:
                  description: Cidade
                  type: string
                  maxLength: 100
                state:
                  description: Estado
                  type: string
                  maxLength: 100
                country:
                  type: string
                  description: PaÃ­s
                  maxLength: 50
                postalCode:
                  description: CÃ³digo postal (CEP)
                  type: string
                  maxLength: 15
                free1:
                  description: Campo livre 1.
                  type: string
                  maxLength: 100
                free2:
                  description: Campo livre 2.
                  type: string
                  maxLength: 100
                fk_company:
                  description: ID da empresa a qual o contato estÃ¡ vinculado
                  type: integer
                  format: int32
                donotdisturb:
                  description: Se 1, o contato ficarÃ¡ bloqueado para atendimentos ativos. Se 0, atendimentos ativos serÃ£o permitidos.
                  type: integer
                  format: int8
                groups:
                  description: Lista com os IDs dos grupos de contato a que este contato faz parte
                  type: array
                  items:
                    type: integer
                tags:
                  description: Lista com os IDs das tags que se deseja associar a esse contato
                  type: array
                  items:
                    type: integer
                preferredAgent:
                  description: ID do agente preferencial, se houver
                  type: integer
                  format: int32
                preferredAgents:
                  description: Lista com os IDs dos agentes preferenciais, na ordem em que devem ser aplicados. Se informado, o campo preferredAgent Ã© ignorado.
                  type: array
                  items:
                    type: integer
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Contato atualizado com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Contato nÃ£o encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getContact:
    post:
      tags:
        - Contatos
      summary: Busca um contato a partir de seu ID
      operationId: getContact
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID do contato
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Dados do contato
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContactObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Contato nÃ£o encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/deleteContact:
    post:
      tags:
        - Contatos
      summary: Remove um contato
      operationId: deleteContact
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID do contato que serÃ¡ removido
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Contato removido com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContactObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Contato nÃ£o encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/searchContact:
    post:
      tags:
        - Contatos
      summary: Busca um contato na base
      operationId: searchContact
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                searchField:
                  description: Nome do campo que serÃ¡ usado na busca. Os nomes possÃ­veis sÃ£o, 'name', 'number', 'email', 'document', 'free1', 'free2', 'facebook' e 'instagram'
                  type: string
                searchValue:
                  description: Valor que serÃ¡ procurado
                  type: string
              required: [ queueId, apiKey, searchField, searchValue ]
        required: true
      responses:
        200:
          description: Contato encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContactObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Nenhum contato encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/addCompany:
    post:
      tags:
        - Empresas
      summary: Cria uma nova empresa
      operationId: addCompany
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                name:
                  description: Nome
                  type: string
                  maxLength: 255
                document:
                  description: NÃºmero do documento (CNPJ). Somente nÃºmeros.
                  type: string
                  maxLength: 40
                number:
                  description: NÃºmero de telefone
                  type: string
                  maxLength: 30
                facebook:
                  description: Facebook
                  type: string
                  maxLength: 100
                instagram:
                  description: Instagram
                  type: string
                  maxLength: 100
                email:
                  description: EndereÃ§o de e-mail
                  type: string
                  maxLength: 155
                website:
                  description: EndereÃ§o do website
                  type: string
                  maxLength: 155
                address:
                  description: EndereÃ§o
                  type: string
                  maxLength: 255
                neighborhood:
                  description: Bairro do endereÃ§o
                  type: string
                city:
                  description: Cidade
                  type: string
                  maxLength: 100
                state:
                  description: Estado
                  type: string
                  maxLength: 100
                country:
                  type: string
                  description: PaÃ­s
                  maxLength: 50
                zipcode:
                  description: CÃ³digo postal (CEP)
                  type: string
                  maxLength: 15
              required: [ queueId, apiKey, name ]
        required: true
      responses:
        200:
          description: Empresa criada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  companyId:
                    description: ID da empresa criada
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/editCompany:
    post:
      tags:
        - Empresas
      summary: Atualiza os dados de uma empresa existente
      operationId: editCompany
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da empresa que serÃ¡ atualizado
                  type: integer
                  format: int32
                name:
                  description: Nome
                  type: string
                  maxLength: 255
                document:
                  description: NÃºmero do documento (CNPJ). Somente nÃºmeros.
                  type: string
                  maxLength: 40
                number:
                  description: NÃºmero de telefone
                  type: string
                  maxLength: 30
                facebook:
                  description: Facebook
                  type: string
                  maxLength: 100
                instagram:
                  description: Instagram
                  type: string
                  maxLength: 100
                email:
                  description: EndereÃ§o de e-mail
                  type: string
                  maxLength: 155
                website:
                  description: EndereÃ§o do website
                  type: string
                  maxLength: 155
                address:
                  description: EndereÃ§o do contato
                  type: string
                  maxLength: 255
                neighborhood:
                  description: Bairro do endereÃ§o
                  type: string
                city:
                  description: Cidade
                  type: string
                  maxLength: 100
                state:
                  description: Estado
                  type: string
                  maxLength: 100
                country:
                  type: string
                  description: PaÃ­s
                  maxLength: 50
                zipcode:
                  description: CÃ³digo postal (CEP)
                  type: string
                  maxLength: 15
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Empresa atualizada com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Contato nÃ£o encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getCompany:
    post:
      tags:
        - Empresas
      summary: Busca uma empresa a partir de seu ID
      operationId: getCompany
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da empresa
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Dados da empresa
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CompanyObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Contato nÃ£o encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/deleteCompany:
    post:
      tags:
        - Empresas
      summary: Remove uma empresa
      operationId: deleteCompany
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da empresa que serÃ¡ removida
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Empresa removida com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CompanyObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Contato nÃ£o encontrado.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/searchCompany:
    post:
      tags:
        - Empresas
      summary: Busca uma empresa na base
      operationId: searchCompany
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                searchField:
                  description: Nome do campo que serÃ¡ usado na busca. Os nomes possÃ­veis sÃ£o, 'name', 'document', 'email', 'number', 'id', 'facebook', 'instagram' e 'website'
                  type: string
                searchValue:
                  description: Valor que serÃ¡ procurado. Para o campo 'document' (CNPJ), a pontuaÃ§Ã£o Ã© ignorada (somente os nÃºmeros sÃ£o considerados).
                  type: string
              required: [ queueId, apiKey, searchField, searchValue ]
        required: true
      responses:
        200:
          description: Empresa encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CompanyObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Nenhuma empresa encontrada.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createTask:
    post:
      tags:
        - Tarefas
      summary: Cria uma nova tarefa
      operationId: createTask
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                owner:
                  description: ID do usuÃ¡rio proprietÃ¡rio da tarefa
                  type: integer
                  format: int32
                title:
                  description: TÃ­tulo da tarefa
                  type: string
                  maxLength: 255
                description:
                  description: DescriÃ§Ã£o da tarefa
                  type: string
                  maxLength: 65500
                duedate:
                  description: Data de vencimento da tarefa, em formato ISO 8601
                  type: string
                  maxLength: 100
                fkOpportunity:
                  description: ID da oportunidade associada Ã  tarefa
                  type: integer
                  format: int32
                progress:
                  description: Progresso da tarefa, de 0 a 100
                  type: integer
                  format: int32
                action:
                  description: AÃ§Ã£o vinculada a tarefa. 1 para ligaÃ§Ã£o, 2 para atendimento por chat.
                  type: integer
                  format: int32
                actiondata:
                  description: NÃºmero do telefone associado a aÃ§Ã£o.
                  type: string
                  maxLength: 50
                checklist:
                  description: Itens da checklist da tarefa. MÃ¡ximo de 100 itens por checklist.
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        description: ID do item da checklist. Deve ser Ãºnico para cada item da checklist.
                        type: string
                        maxLength: 50
                      title:
                        description: TÃ­tulo do item da checklist
                        type: string
                        maxLength: 255
                      checked:
                        description: Indica se o item da checklist estÃ¡ marcado como concluÃ­do
                        type: boolean
                watchers:
                  description: RelaÃ§Ã£o de IDs de usuÃ¡rios que estÃ£o observando esta tarefa. UsuÃ¡rios observando serÃ£o notificados de alteraÃ§Ãµes no tÃ­tulo, progresso e estado da tarefa.
                  type: array
                  items:
                    type: integer
                contacts:
                  description: RelaÃ§Ã£o de IDs de contatos associados Ã  tarefa.
                  type: array
                  items:
                    type: integer
                users:
                  description: RelaÃ§Ã£o de IDs de usuÃ¡rios que sÃ£o responsÃ¡veis por esta tarefa. Ao menos um usuÃ¡rio deve ser responsÃ¡vel pela tarefa.
                  type: array
                  items:
                    type: integer
                files:
                  description: RelaÃ§Ã£o de IDs de arquivos anexados Ã  tarefa.
                  type: array
                  items:
                    type: integer
                tags:
                  description: RelaÃ§Ã£o de IDs de etiquetas associadas Ã  tarefa.
                  type: array
                  items:
                    type: integer
              required: [ queueId, apiKey, owner, users ]
        required: true
      responses:
        200:
          description: Tarefa criada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da tarefa criada
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateTask:
    post:
      tags:
        - Tarefas
      summary: Atualiza uma tarefa existente
      operationId: updateTask
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da tarefa que serÃ¡ atualizada
                  type: integer
                  format: int32
                title:
                  description: TÃ­tulo da tarefa
                  type: string
                  maxLength: 255
                description:
                  description: DescriÃ§Ã£o da tarefa
                  type: string
                  maxLength: 65500
                duedate:
                  description: Data de vencimento da tarefa, em formato ISO 8601
                  type: string
                  maxLength: 100
                progress:
                  description: Progresso da tarefa, de 0 a 100
                  type: integer
                  format: int32
                action:
                  description: AÃ§Ã£o vinculada a tarefa. 1 para ligaÃ§Ã£o, 2 para atendimento por chat.
                  type: integer
                  format: int32
                actiondata:
                  description: NÃºmero do telefone associado a aÃ§Ã£o.
                  type: string
                  maxLength: 50
                checklist:
                  description: Itens da checklist da tarefa. MÃ¡ximo de 100 itens por checklist.
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        description: ID do item da checklist. Deve ser Ãºnico para cada item da checklist.
                        type: string
                        maxLength: 50
                      title:
                        description: TÃ­tulo do item da checklist
                        type: string
                        maxLength: 255
                      checked:
                        description: Indica se o item da checklist estÃ¡ marcado como concluÃ­do
                        type: boolean
                watchers:
                  description: RelaÃ§Ã£o de IDs de usuÃ¡rios que estÃ£o observando esta tarefa. UsuÃ¡rios observando serÃ£o notificados de alteraÃ§Ãµes no tÃ­tulo, progresso e estado da tarefa.
                  type: array
                  items:
                    type: integer
                contacts:
                  description: RelaÃ§Ã£o de IDs de contatos associados Ã  tarefa.
                  type: array
                  items:
                    type: integer
                users:
                  description: RelaÃ§Ã£o de IDs de usuÃ¡rios que sÃ£o responsÃ¡veis por esta tarefa. Ao menos um usuÃ¡rio deve ser responsÃ¡vel pela tarefa.
                  type: array
                  items:
                    type: integer
                files:
                  description: RelaÃ§Ã£o de IDs de arquivos anexados Ã  tarefa.
                  type: array
                  items:
                    type: integer
                tags:
                  description: RelaÃ§Ã£o de IDs de etiquetas associadas Ã  tarefa.
                  type: array
                  items:
                    type: integer
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Tarefa atualizada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da tarefa atualizada
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Item nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/removeTask:
    post:
      tags:
        - Tarefas
      summary: Apaga uma tarefa existente. Essa operaÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.
      operationId: removeTask
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da tarefa que serÃ¡ apagada
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Tarefa atualizada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da tarefa removida
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Item nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/markAsDone:
    post:
      tags:
        - Tarefas
      summary: Marca uma tarefa como concluÃ­da.
      operationId: markAsDone
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da tarefa que serÃ¡ marcada como concluÃ­da
                  type: integer
                  format: int32
                userId:
                  description: ID do usuÃ¡rio responsÃ¡vel pela conclusÃ£o da tarefa
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id, userId ]
        required: true
      responses:
        200:
          description: Tarefa marcada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da tarefa removida
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Item nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/markAsNotDone:
    post:
      tags:
        - Tarefas
      summary: Marca uma tarefa como nÃ£o concluÃ­da.
      operationId: markAsNotDone
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da tarefa que serÃ¡ marcada como nÃ£o concluÃ­da
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Tarefa marcada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da tarefa removida
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Item nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getToDoTasks:
    post:
      tags:
        - Tarefas
      summary: Busca as tarefas a fazer do grupo de usuÃ¡rios informado.
      operationId: getToDoTasks
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                userId:
                  description: Lista com os IDs dos usuÃ¡rios para os quais se deseja buscar as tarefas a fazer.
                  type: array
                  items:
                    type: integer
              required: [ queueId, apiKey, userId ]
        required: true
      responses:
        200:
          description: RelaÃ§Ã£o de tarefas a fazer
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      description: ID da tarefa
                      type: integer
                      format: int32
                    title:
                      description: TÃ­tulo da tarefa
                      type: string
                    description:
                      description: DescriÃ§Ã£o da tarefa
                      type: string
                    duedate:
                      description: Data de vencimento da tarefa em formato ISO 8601
                      type: string
                    owner:
                      description: ID do usuÃ¡rio proprietÃ¡rio da tarefa
                      type: integer
                    progress:
                      description: Progresso da tarefa, de 0 a 100
                      type: integer
                    checklist:
                      description: Lista de itens do checklist da tarefa
                      type: array
                      items:
                        type: object
                        properties:
                          id:
                            description: ID do item da checklist. Deve ser Ãºnico para cada item da checklist.
                            type: string
                            maxLength: 50
                          title:
                            description: TÃ­tulo do item da checklist
                            type: string
                            maxLength: 255
                          checked:
                            description: Indica se o item da checklist estÃ¡ marcado como concluÃ­do
                            type: boolean
                    users:
                      description: Lista de IDs dos usuÃ¡rios responsÃ¡veis pela tarefa
                      type: array
                      items:
                        type: integer
                    watchers:
                      description: Lista de IDs dos usuÃ¡rios observando a tarefa
                      type: array
                      items:
                        type: integer
                    contacts:
                      description: Lista de IDs dos contatos associados Ã  tarefa
                      type: array
                      items:
                        type: integer
                    tags:
                      description: Lista de IDs das etiquetas associadas Ã  tarefa
                      type: array
                      items:
                        type: integer
                    files:
                      description: Lista de IDs dos arquivos associados Ã  tarefa
                      type: array
                      items:
                        type: integer
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Item nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTaskById:
    post:
      tags:
        - Tarefas
      summary: Busca uma tarefa com base em seu ID
      operationId: getTaskById
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                taskId:
                  description: ID da tarefa que se deseja buscar
                  type: integer
                  format: int32
              required: [ queueId, apiKey, taskId ]
        required: true
      responses:
        200:
          description: Tarefa
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da tarefa
                    type: integer
                    format: int32
                  title:
                    description: TÃ­tulo da tarefa
                    type: string
                  description:
                    description: DescriÃ§Ã£o da tarefa
                    type: string
                  duedate:
                    description: Data de vencimento da tarefa em formato ISO 8601
                    type: string
                  owner:
                    description: ID do usuÃ¡rio proprietÃ¡rio da tarefa
                    type: integer
                  progress:
                    description: Progresso da tarefa, de 0 a 100
                    type: integer
                  checklist:
                    description: Lista de itens do checklist da tarefa
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          description: ID do item da checklist. Deve ser Ãºnico para cada item da checklist.
                          type: string
                          maxLength: 50
                        title:
                          description: TÃ­tulo do item da checklist
                          type: string
                          maxLength: 255
                        checked:
                          description: Indica se o item da checklist estÃ¡ marcado como concluÃ­do
                          type: boolean
                  users:
                    description: Lista de IDs dos usuÃ¡rios responsÃ¡veis pela tarefa
                    type: array
                    items:
                      type: integer
                  watchers:
                    description: Lista de IDs dos usuÃ¡rios observando a tarefa
                    type: array
                    items:
                      type: integer
                  contacts:
                    description: Lista de IDs dos contatos associados Ã  tarefa
                    type: array
                    items:
                      type: integer
                  tags:
                    description: Lista de IDs das etiquetas associadas Ã  tarefa
                    type: array
                    items:
                      type: integer
                  files:
                    description: Lista de IDs dos arquivos associados Ã  tarefa
                    type: array
                    items:
                      type: integer
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Item nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createOpportunity:
    post:
      tags:
        - CRM
      summary: Cria uma nova oportunidade
      operationId: createOpportunity
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                fkPipeline:
                  description: ID do funil onde a oportunidade serÃ¡ criada
                  type: integer
                  format: int32
                fkStage:
                  description: ID do estÃ¡gio onde a oportunidade serÃ¡ criada
                  type: integer
                  format: int32
                responsableid:
                  description: ID do usuÃ¡rio que serÃ¡ o responsÃ¡vel pela oportunidade
                  type: integer
                  format: int32
                title:
                  description: TÃ­tulo da oportunidade
                  type: string
                clientid:
                  description: Identificador do cliente no serviÃ§o de mensageria
                  type: string
                mainphone:
                  description: Telefone principal
                  type: string
                mainmail:
                  description: E-mail principal
                  type: string
                description:
                  description: DescriÃ§Ã£o da oportunidade
                  type: string
                expectedclosedate:
                  description: Data esperada para fechamento, em formato ISO 8601. ApÃ³s essa data a oportunidade serÃ¡ considerada vencida.
                  type: string
                formattedlocation:
                  description: LocalizaÃ§Ã£o da oportunidade formatada
                  type: string
                  maxLength: 500
                postalcode:
                  description: CÃ³digo postal
                  type: string
                  maxLength: 45
                address1:
                  description: Campo de endereÃ§o 1
                  type: string
                  maxLength: 500
                address2:
                  description: Campo de endereÃ§o 2
                  type: string
                  maxLength: 500
                city:
                  description: Cidade
                  type: string
                  maxLength: 255
                state:
                  description: Estado
                  type: string
                  maxLength: 100
                country:
                  description: PaÃ­s
                  type: string
                  maxLength: 100
                countrycode:
                  description: CÃ³digo ISO do paÃ­s da oportunidade (Ex. BR)
                  type: string
                  maxLength: 10
                lat:
                  description: Latitude da oportunidade
                  type: number
                  format: float
                lon:
                  description: Longitude da oportunidade
                  type: number
                  format: float
                probability:
                  description: Probabilidade de fechamento, de 0 a 100
                  type: integer
                  format: int32
                value:
                  description: Valor da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                recurrentvalue:
                  description: Valor recorrente da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                origin:
                  description: ID da origem da oportunidade
                  type: integer
                  format: int32
                formsdata:
                  description: Objeto com as informaÃ§Ãµes de formulÃ¡rios personalizados da oportunidade. A chave da propriedade Ã© o ID do campo no formulÃ¡rio personalizado, e o valor Ã© o valor do campo.
                  type: object
                tags:
                  description: Lista com os IDs das etiquetas associadas Ã  oportunidade
                  type: array
                  items:
                    type: integer
                files:
                  description: Lista com os IDs dos arquivos associados Ã  oportunidade
                  type: array
                  items:
                    type: integer
                contacts:
                  description: Lista com os IDs dos contatos associados Ã  oportunidade
                  type: array
                  items:
                    type: integer
                followers:
                  description: Lista com os IDs dos usuÃ¡rios que sÃ£o seguidores da oportunidade
                  type: array
                  items:
                    type: integer
                products:
                  description: Lista com os produtos associados a oportunidade
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        description: ID do produto
                        type: integer
                        format: int32
                      qty:
                        description: Quantidade do produto. Deve ser maior que zero.
                        type: integer
                        format: int32
                      discount:
                        description: Desconto, em %, aplicado ao preÃ§o cadastrado do produto. Deve ser maior ou igual a zero. Exemplo, 10% de desconto deve ser enviado como 10.
                        type: number
                        format: float
              required: [ queueId, apiKey, responsableid, title ]
        required: true
      responses:
        200:
          description: Oportunidade criada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da oportunidade criada
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateOpportunity:
    post:
      tags:
        - CRM
      summary: Atualiza uma oportunidade
      operationId: updateOpportunity
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade que serÃ¡ atualizada
                  type: integer
                  format: int32
                title:
                  description: TÃ­tulo da oportunidade
                  type: string
                mainphone:
                  description: Telefone principal
                  type: string
                mainmail:
                  description: E-mail principal
                  type: string
                description:
                  description: DescriÃ§Ã£o da oportunidade
                  type: string
                expectedclosedate:
                  description: Data esperada para fechamento, em formato ISO 8601. ApÃ³s essa data a oportunidade serÃ¡ considerada vencida.
                  type: string
                formattedlocation:
                  description: LocalizaÃ§Ã£o da oportunidade formatada
                  type: string
                  maxLength: 500
                postalcode:
                  description: CÃ³digo postal
                  type: string
                  maxLength: 45
                address1:
                  description: Campo de endereÃ§o 1
                  type: string
                  maxLength: 500
                address2:
                  description: Campo de endereÃ§o 2
                  type: string
                  maxLength: 500
                city:
                  description: Cidade
                  type: string
                  maxLength: 255
                state:
                  description: Estado
                  type: string
                  maxLength: 100
                country:
                  description: PaÃ­s
                  type: string
                  maxLength: 100
                countrycode:
                  description: CÃ³digo ISO do paÃ­s da oportunidade (Ex. BR)
                  type: string
                  maxLength: 10
                lat:
                  description: Latitude da oportunidade
                  type: number
                  format: float
                lon:
                  description: Longitude da oportunidade
                  type: number
                  format: float
                probability:
                  description: Probabilidade de fechamento, de 0 a 100
                  type: integer
                  format: int32
                value:
                  description: Valor da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                recurrentvalue:
                  description: Valor recorrente da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                origin:
                  description: ID da origem da oportunidade
                  type: integer
                  format: int32
                formsdata:
                  description: Objeto com as informaÃ§Ãµes de formulÃ¡rios personalizados da oportunidade. A chave da propriedade Ã© o ID do campo no formulÃ¡rio personalizado, e o valor Ã© o valor do campo.
                  type: object
                tags:
                  description: Lista com os IDs das etiquetas associadas Ã  oportunidade
                  type: array
                  items:
                    type: integer
                files:
                  description: Lista com os IDs dos arquivos associados Ã  oportunidade
                  type: array
                  items:
                    type: integer
                contacts:
                  description: Lista com os IDs dos contatos associados Ã  oportunidade
                  type: array
                  items:
                    type: integer
                followers:
                  description: Lista com os IDs dos usuÃ¡rios que sÃ£o seguidores da oportunidade
                  type: array
                  items:
                    type: integer
                products:
                  description: Lista com os produtos associados a oportunidade
                  type: array
                  items:
                    type: object
                    properties:
                      id:
                        description: ID do produto
                        type: integer
                        format: int32
                      qty:
                        description: Quantidade do produto. Deve ser maior que zero.
                        type: integer
                        format: int32
                      discount:
                        description: Desconto, em %, aplicado ao preÃ§o cadastrado do produto. Deve ser maior ou igual a zero. Exemplo, 10% de desconto deve ser enviado como 10.
                        type: number
                        format: float
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Oportunidade atualizada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da oportunidade atualizada
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Oportunidade nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/removeOpportunity:
    post:
      tags:
        - CRM
      summary: Exclui uma oportunidade
      operationId: removeOpportunity
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade que serÃ¡ excluÃ­da
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Oportunidade excluÃ­da com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da oportunidade excluÃ­da
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Oportunidade nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/loseOpportunity:
    post:
      tags:
        - CRM
      summary: Marca uma oportunidade como perdida
      operationId: loseOpportunity
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade que serÃ¡ atualizada
                  type: integer
                  format: int32
                closereason:
                  description: RazÃ£o para a perda
                  type: string
                closeobs:
                  description: ObservaÃ§Ãµes de perda
                  type: string
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Oportunidade marcada como perdida com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da oportunidade perdida
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/winOpportunity:
    post:
      tags:
        - CRM
      summary: Marca uma oportunidade como ganha
      operationId: winOpportunity
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade que serÃ¡ atualizada
                  type: integer
                  format: int32
                closevalue:
                  description: Valor de fechamento, multiplicado por 100. Exemplo, 100,50 deve ser enviado como 10050.
                  type: integer
                  format: int32
                closerecurrentvalue:
                  description: Valor recorrente de fechamento, multiplicado por 100. Exemplo, 100,50 deve ser enviado como 10050.
                  type: integer
                  format: int32

              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Oportunidade marcada como ganha com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da oportunidade ganha
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/transferOpportunity:
    post:
      tags:
        - CRM
      summary: Transfere a oportunidade para outro responsÃ¡vel
      operationId: transferOpportunity
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade que serÃ¡ atualizada
                  type: integer
                  format: int32
                newResponsableId:
                  description: ID do usuÃ¡rio que serÃ¡ o novo responsÃ¡vel pela oportunidade
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id, newResponsableId ]
        required: true
      responses:
        200:
          description: Responsabilidade da oportunidade transferida com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da oportunidade atualizada
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/changeOpportunityStage:
    post:
      tags:
        - CRM
      summary: Transfere a oportunidade para outra etapa do funil
      operationId: changeOpportunityStage
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade que serÃ¡ atualizada
                  type: integer
                  format: int32
                destStageId:
                  description: ID da etapa do funil de destino, para onde a oportunidade serÃ¡ movida
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id, destStageId ]
        required: true
      responses:
        200:
          description: Oportunidade marcada como ganha com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID da oportunidade ganha
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/insertOpportunityNote:
    post:
      tags:
        - CRM
      summary: Insere uma nota em uma oportunidade
      operationId: insertOpportunityNote
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade que serÃ¡ atualizada
                  type: integer
                  format: int32
                note:
                  description: Nota que serÃ¡ inserida
                  type: string
              required: [ queueId, apiKey, id, note ]
        required: true
      responses:
        200:
          description: Nota inserida com sucesso
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getOpportunity:
    post:
      tags:
        - CRM
      summary: Busca os dados de uma oportunidade
      operationId: getOpportunity
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID da oportunidade
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Dados da oportunidade
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OpportunityObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getPipeOpportunities:
    post:
      tags:
        - CRM
      summary: Busca todas as oportunidades abertas de um funil. Oportunidades jÃ¡ encerradas nÃ£o serÃ£o retornadas.
      operationId: getPipeOpportunities
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                pipelineId:
                  description: ID do funil
                  type: integer
                  format: int32
                stageId:
                  description: Se desejar, pode tambÃ©m filtrar para buscar somente as oportunidades em uma determinada etapa
                  type: integer
                  format: int32
              required: [ queueId, apiKey, pipelineId ]
        required: true
      responses:
        200:
          description: Lista com todas as oportunidades encontradas
          content:
            application/json:
              schema:
                  type: array
                  items:
                    $ref: '#/components/schemas/OpportunityObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getAllPipelines:
    post:
      tags:
        - CRM
      summary: Retorna todos os funis e suas etapas
      description: Busca todos os funis (pipelines) cadastrados no sistema, incluindo todas as etapas de cada funil ordenadas conforme configuraÃ§Ã£o.
      operationId: getAllPipelines
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista com todos os funis e suas etapas
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      description: ID do funil
                      type: integer
                      format: int32
                    name:
                      description: Nome do funil
                      type: string
                    description:
                      description: DescriÃ§Ã£o do funil
                      type: string
                    stageorders:
                      description: Lista ordenada com os IDs das etapas
                      type: array
                      items:
                        type: integer
                    maxdaysonpipeline:
                      description: NÃºmero mÃ¡ximo de dias que uma oportunidade pode ficar no funil
                      type: integer
                    winautomation:
                      description: ID da automaÃ§Ã£o executada ao ganhar
                      type: integer
                    loseautomation:
                      description: ID da automaÃ§Ã£o executada ao perder
                      type: integer
                    duedateautomation:
                      description: ID da automaÃ§Ã£o executada ao vencer a data
                      type: integer
                    frozenautomation:
                      description: ID da automaÃ§Ã£o executada ao congelar
                      type: integer
                    unfrozenautomation:
                      description: ID da automaÃ§Ã£o executada ao descongelar
                      type: integer
                    automationqueue:
                      description: ID da fila para automaÃ§Ãµes
                      type: integer
                    lockoncartvalue:
                      description: Indica se bloqueia alteraÃ§Ã£o quando hÃ¡ valor no carrinho
                      type: integer
                    forms:
                      description: Lista de IDs dos formulÃ¡rios associados ao funil
                      type: array
                      items:
                        type: integer
                    documentstemplates:
                      description: Lista de IDs dos templates de documentos
                      type: array
                      items:
                        type: integer
                    permissions:
                      description: Lista de permissÃµes do funil
                      type: array
                      items:
                        type: object
                    lossreasons:
                      description: Lista de motivos de perda configurados
                      type: array
                      items:
                        type: object
                    groups:
                      description: Lista de grupos associados ao funil
                      type: array
                      items:
                        type: integer
                    opportunitiesautomation:
                      description: Lista de IDs de automaÃ§Ãµes disponÃ­veis para oportunidades
                      type: array
                      items:
                        type: integer
                    stages:
                      description: Lista de etapas do funil ordenadas
                      type: array
                      items:
                        type: object
                        properties:
                          id:
                            description: ID da etapa
                            type: integer
                            format: int32
                          name:
                            description: Nome da etapa
                            type: string
                          fk_pipeline:
                            description: ID do funil ao qual a etapa pertence
                            type: integer
                            format: int32
                          description:
                            description: DescriÃ§Ã£o da etapa
                            type: string
                          intid:
                            description: Identificador interno da etapa
                            type: string
                          enterautomation:
                            description: ID da automaÃ§Ã£o executada ao entrar na etapa
                            type: integer
                          leaveautomation:
                            description: ID da automaÃ§Ã£o executada ao sair da etapa
                            type: integer
                          stagnationautomation:
                            description: ID da automaÃ§Ã£o executada em estagnaÃ§Ã£o
                            type: integer
                          cancreate:
                            description: Define se pode criar oportunidades nesta etapa (0=nÃ£o, 1=sim)
                            type: integer
                          canwin:
                            description: Define se pode ganhar oportunidades nesta etapa (0=nÃ£o, 1=sim)
                            type: integer
                          color:
                            description: Cor da etapa em formato hexadecimal
                            type: string
                          winprobability:
                            description: Probabilidade de ganho desta etapa (0-100)
                            type: integer
                          requiredforms:
                            description: Lista de IDs dos formulÃ¡rios obrigatÃ³rios para avanÃ§ar
                            type: array
                            items:
                              type: integer
                          stagnationalert:
                            description: NÃºmero de dias para alerta de estagnaÃ§Ã£o
                            type: integer
                          createdby:
                            description: ID do usuÃ¡rio que criou a etapa
                            type: integer
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createProduct:
    post:
      tags:
        - Produtos
      summary: Cria um novo produto
      operationId: createProduct
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                name:
                  description: Nome do produto (Meta - title)
                  type: string
                  maxLength: 200
                description:
                  description: DescriÃ§Ã£o do produto (Meta - description)
                  type: string
                  maxLength: 9999
                url:
                  description: URL para pÃ¡gina do produto (Meta - link)
                  type: string
                  maxLength: 2048
                internalcode:
                  description: ReferÃªncia interna do produto (Meta - id)
                  type: string
                  maxLength: 100
                gtin:
                  description: GTIN do produto (Meta - gtin, GTIN-8/UPC-12/EAN-13/GTIN-14)
                  type: string
                  maxLength: 14
                value:
                  description: PreÃ§o do produto em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                recurrentvalue:
                  description: PreÃ§o recorrente do produto em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                maxdiscount:
                  description: Desconto mÃ¡ximo, em percentual, permitido ao agente a dar no produto. Deve ser enviado em formato inteiro, multiplado por 100. Exemplo, 20,5% deve ser enviado como 2050
                  type: integer
                  format: int32
                commission:
                  description: ComissÃ£o de vendas, em percentual, concedida ao agente ao vender o produto. Deve ser enviado em formato inteiro, multiplado por 100. Exemplo, 20,5% deve ser enviado como 2050
                  type: integer
                  format: int32
                hiddenfromclients:
                  description: Se 1, o produto nÃ£o serÃ¡ exibido aos clientes nos catÃ¡logos dos serviÃ§os de mensageria.
                  type: integer
                  format: int8
                addtoqueues:
                  description: Se 1, o produto serÃ¡ automaticamente cadastrado nos catÃ¡logos dos serviÃ§os de mensageria das filas selecionadas, quando disponÃ­vel.
                  type: integer
                  format: int8
                associatedforms:
                  description: Lista com os IDs dos formulÃ¡rios personalizados associados a esse produto.
                  type: array
                  items:
                    type: integer
                queues:
                  description: Lista com os IDs das filas nas quais esse produto estarÃ¡ disponÃ­vel
                  type: array
                  items:
                    type: integer
                files:
                  description: Lista com os IDs dos arquivos associados a esse produto
                  type: array
                  items:
                    type: integer
                photos:
                  description: Lista com os IDs das imagens da galeria desse produto
                  type: array
                  items:
                    type: integer
                groups:
                  description: Lista com os IDs dos grupos de produtos aos quais esse produto pertence
                  type: array
                  items:
                    type: integer
                measurementunit:
                  description: Unidade de medida do produto (ex. un, kg, m)
                  type: string
                  maxLength: 10
                available:
                  description: Se 1, o produto estÃ¡ disponÃ­vel. Se 0, estÃ¡ indisponÃ­vel.
                  type: integer
                  format: int8
                currency:
                  description: CÃ³digo da moeda ISO 4217 para o preÃ§o do produto (ex. BRL, USD). Meta - currency
                  type: string
                  maxLength: 3
                condition:
                  description: CondiÃ§Ã£o do produto (new, refurbished, used)
                  type: string
                  enum: [new, refurbished, used]
                brand:
                  description: Marca do produto (Meta - brand)
                  type: string
                  maxLength: 100
                saleprice:
                  description: PreÃ§o promocional do produto em formato inteiro, multiplicado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                status:
                  description: Status do produto (active, archived)
                  type: string
                  enum: [active, archived]
                gender:
                  description: GÃªnero alvo do produto (female, male, unisex)
                  type: string
                  enum: [female, male, unisex]
                size:
                  description: Tamanho do produto (Meta - size)
                  type: string
                  maxLength: 200
                agegroup:
                  description: Faixa etÃ¡ria alvo do produto
                  type: string
                  enum: [adult, all ages, teen, kids, toddler, infant, newborn]
                mpn:
                  description: NÃºmero de peÃ§a do fabricante - Manufacturer Part Number (Meta - mpn)
                  type: string
                  maxLength: 100
                qty:
                  description: Quantidade em estoque do produto
                  type: integer
                  format: int32
                category:
                  description: Categoria do produto (Meta - google_product_category)
                  type: string
                  maxLength: 255
                color:
                  description: Cor do produto (Meta - color)
                  type: string
                  maxLength: 200
                material:
                  description: Material do produto (Meta - material)
                  type: string
                  maxLength: 200
                itemgroupid:
                  description: ID do grupo de itens para variantes de produto (Meta - item_group_id)
                  type: string
                  maxLength: 100
              required: [ queueId, apiKey, name ]
        required: true
      responses:
        200:
          description: Produto criado com sucesso. Nota - Produtos criados por este endpoint sÃ£o sempre locais (external=0).
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID do produto criado
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateProduct:
    post:
      tags:
        - Produtos
      summary: Atualiza o cadastro de um produto
      description: |
        Atualiza os dados de um produto existente.

        **Importante:** Produtos externos (external=1) sÃ£o importados de feeds externos e possuem ediÃ§Ã£o restrita.
        Para produtos externos, apenas os seguintes campos podem ser editados:
        - files (arquivos)
        - photos (fotos)
        - groups (grupos de produtos)
        - associatedforms (formulÃ¡rios associados)
        - maxdiscount (desconto mÃ¡ximo)
        - maxrecurrentdiscount (desconto mÃ¡ximo recorrente)
        - commission (comissÃ£o)

        Os demais campos sÃ£o bloqueados para ediÃ§Ã£o em produtos externos, pois sÃ£o gerenciados pelo feed de origem.
      operationId: updateProduct
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID do produto que serÃ¡ editado
                  type: integer
                  format: int32
                name:
                  description: Nome do produto (Meta - title)
                  type: string
                  maxLength: 200
                description:
                  description: DescriÃ§Ã£o do produto (Meta - description)
                  type: string
                  maxLength: 9999
                url:
                  description: URL para pÃ¡gina do produto (Meta - link)
                  type: string
                  maxLength: 2048
                internalcode:
                  description: ReferÃªncia interna do produto (Meta - id)
                  type: string
                  maxLength: 100
                gtin:
                  description: GTIN do produto (Meta - gtin, GTIN-8/UPC-12/EAN-13/GTIN-14)
                  type: string
                  maxLength: 14
                value:
                  description: PreÃ§o do produto em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                recurrentvalue:
                  description: PreÃ§o recorrente do produto em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                maxdiscount:
                  description: Desconto mÃ¡ximo, em percentual, permitido ao agente a dar no produto. Deve ser enviado em formato inteiro, multiplado por 100. Exemplo, 20,5% deve ser enviado como 2050
                  type: integer
                  format: int32
                commission:
                  description: ComissÃ£o de vendas, em percentual, concedida ao agente ao vender o produto. Deve ser enviado em formato inteiro, multiplado por 100. Exemplo, 20,5% deve ser enviado como 2050
                  type: integer
                  format: int32
                hiddenfromclients:
                  description: Se 1, o produto nÃ£o serÃ¡ exibido aos clientes nos catÃ¡logos dos serviÃ§os de mensageria.
                  type: integer
                  format: int8
                addtoqueues:
                  description: Se 1, o produto serÃ¡ automaticamente cadastrado nos catÃ¡logos dos serviÃ§os de mensageria das filas selecionadas, quando disponÃ­vel.
                  type: integer
                  format: int8
                associatedforms:
                  description: Lista com os IDs dos formulÃ¡rios personalizados associados a esse produto.
                  type: array
                  items:
                    type: integer
                queues:
                  description: Lista com os IDs das filas nas quais esse produto estarÃ¡ disponÃ­vel
                  type: array
                  items:
                    type: integer
                files:
                  description: Lista com os IDs dos arquivos associados a esse produto
                  type: array
                  items:
                    type: integer
                photos:
                  description: Lista com os IDs das imagens da galeria desse produto
                  type: array
                  items:
                    type: integer
                groups:
                  description: Lista com os IDs dos grupos de produtos aos quais esse produto pertence
                  type: array
                  items:
                    type: integer
                measurementunit:
                  description: Unidade de medida do produto (ex. un, kg, m)
                  type: string
                  maxLength: 10
                available:
                  description: Se 1, o produto estÃ¡ disponÃ­vel. Se 0, estÃ¡ indisponÃ­vel.
                  type: integer
                  format: int8
                currency:
                  description: CÃ³digo da moeda ISO 4217 para o preÃ§o do produto (ex. BRL, USD). Meta - currency
                  type: string
                  maxLength: 3
                condition:
                  description: CondiÃ§Ã£o do produto (new, refurbished, used)
                  type: string
                  enum: [new, refurbished, used]
                brand:
                  description: Marca do produto (Meta - brand)
                  type: string
                  maxLength: 100
                saleprice:
                  description: PreÃ§o promocional do produto em formato inteiro, multiplicado por 100. Exemplo, 100,50 deve ser enviado como 10050
                  type: integer
                  format: int32
                status:
                  description: Status do produto (active, archived)
                  type: string
                  enum: [active, archived]
                gender:
                  description: GÃªnero alvo do produto (female, male, unisex)
                  type: string
                  enum: [female, male, unisex]
                size:
                  description: Tamanho do produto (Meta - size)
                  type: string
                  maxLength: 200
                agegroup:
                  description: Faixa etÃ¡ria alvo do produto
                  type: string
                  enum: [adult, all ages, teen, kids, toddler, infant, newborn]
                mpn:
                  description: NÃºmero de peÃ§a do fabricante - Manufacturer Part Number (Meta - mpn)
                  type: string
                  maxLength: 100
                qty:
                  description: Quantidade em estoque do produto
                  type: integer
                  format: int32
                category:
                  description: Categoria do produto (Meta - google_product_category)
                  type: string
                  maxLength: 255
                color:
                  description: Cor do produto (Meta - color)
                  type: string
                  maxLength: 200
                material:
                  description: Material do produto (Meta - material)
                  type: string
                  maxLength: 200
                itemgroupid:
                  description: ID do grupo de itens para variantes de produto (Meta - item_group_id)
                  type: string
                  maxLength: 100
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Produto atualizado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID do produto atualizado
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/removeProduct:
    post:
      tags:
        - Produtos
      summary: Exclui um produto
      operationId: removeProduct
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID do produto que serÃ¡ excluÃ­do
                  type: integer
                  format: int32
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Produto excluÃ­do com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    description: ID do produto excluÃ­do
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getProducts:
    post:
      tags:
        - Produtos
      summary: Retorna todos os produtos cadastrados
      operationId: getProducts
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                queues:
                  description: Lista com os IDs das filas as quais deseja filtrar. Se informado, somente produtos permitidos em ao menos uma das filas da lista serÃ£o retornados.
                  type: array
                  items:
                    type: integer
              required: [ queueId, apiKey ]
        required: true
      responses:
        200:
          description: Lista com todos os produtos cadastrados
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ProductObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getProductById:
    post:
      tags:
        - Produtos
      summary: Retorna o produto com o ID informado
      operationId: getProductById
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                id:
                  description: ID do produto que se deseja buscar
                  type: integer
              required: [ queueId, apiKey, id ]
        required: true
      responses:
        200:
          description: Produto encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getProductByGtin:
    post:
      tags:
        - Produtos
      summary: Retorna o primeiro produto encontrando com o GTIN informado
      operationId: getProductByGtin
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                filter:
                  description: GTIN do produto buscado
                  type: integer
              required: [ queueId, apiKey, filter ]
        required: true
      responses:
        200:
          description: Produto encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getProductByInternalCode:
    post:
      tags:
        - Produtos
      summary: Retorna o primeiro produto encontrando com o cÃ³digo interno informado
      operationId: getProductByInternalCode
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                filter:
                  description: CÃ³digo interno do produto buscado
                  type: integer
              required: [ queueId, apiKey, filter ]
        required: true
      responses:
        200:
          description: Produto encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getProductGroups:
    post:
      tags:
        - Grupos de Produtos
      summary: Lista todos os grupos de produtos
      operationId: getProductGroups
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de grupos de produtos
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      format: int32
                    name:
                      type: string
                    description:
                      type: string
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getProductGroupById:
    post:
      tags:
        - Grupos de Produtos
      summary: ObtÃ©m um grupo de produtos por ID
      operationId: getProductGroupById
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de produtos
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Grupo de produtos encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
                  name:
                    type: string
                  description:
                    type: string
                  createdby:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createProductGroup:
    post:
      tags:
        - Grupos de Produtos
      summary: Cria um novo grupo de produtos
      operationId: createProductGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                name:
                  description: Nome do grupo
                  type: string
                  maxLength: 255
                description:
                  description: DescriÃ§Ã£o do grupo
                  type: string
                  maxLength: 65535
              required: [ apiKey, name ]
        required: true
      responses:
        200:
          description: Grupo criado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
                  name:
                    type: string
                  description:
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateProductGroup:
    post:
      tags:
        - Grupos de Produtos
      summary: Atualiza um grupo de produtos
      operationId: updateProductGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de produtos
                  type: integer
                  format: int32
                name:
                  description: Nome do grupo
                  type: string
                  maxLength: 255
                description:
                  description: DescriÃ§Ã£o do grupo
                  type: string
                  maxLength: 65535
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Grupo atualizado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/deleteProductGroup:
    post:
      tags:
        - Grupos de Produtos
      summary: Exclui um grupo de produtos
      operationId: deleteProductGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de produtos
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Grupo excluÃ­do com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getProductsFromGroup:
    post:
      tags:
        - Grupos de Produtos
      summary: ObtÃ©m os produtos de um grupo especÃ­fico
      operationId: getProductsFromGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de produtos
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Lista de IDs de produtos do grupo
          content:
            application/json:
              schema:
                type: object
                properties:
                  groupId:
                    type: integer
                    format: int32
                  productIds:
                    type: array
                    items:
                      type: integer
                      format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateGroupProducts:
    post:
      tags:
        - Grupos de Produtos
      summary: Atualiza os produtos de um grupo
      description: Substitui a lista de produtos do grupo pela nova lista informada. Produtos que nÃ£o estiverem na lista serÃ£o removidos do grupo.
      operationId: updateGroupProducts
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de produtos
                  type: integer
                  format: int32
                productIds:
                  description: Lista de IDs dos produtos que devem pertencer ao grupo
                  type: array
                  items:
                    type: integer
                    format: int32
              required: [ apiKey, id, productIds ]
        required: true
      responses:
        200:
          description: Produtos do grupo atualizados com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  added:
                    type: integer
                    format: int32
                    description: Quantidade de produtos adicionados
                  removed:
                    type: integer
                    format: int32
                    description: Quantidade de produtos removidos
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getGroupsFromProduct:
    post:
      tags:
        - Grupos de Produtos
      summary: ObtÃ©m os grupos aos quais um produto pertence
      operationId: getGroupsFromProduct
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do produto
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Lista de IDs de grupos do produto
          content:
            application/json:
              schema:
                type: object
                properties:
                  productId:
                    type: integer
                    format: int32
                  groupIds:
                    type: array
                    items:
                      type: integer
                      format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateProductGroups:
    post:
      tags:
        - Grupos de Produtos
      summary: Atualiza os grupos de um produto
      description: Substitui a lista de grupos do produto pela nova lista informada. Grupos que nÃ£o estiverem na lista serÃ£o removidos do produto.
      operationId: updateProductGroups
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do produto
                  type: integer
                  format: int32
                groupIds:
                  description: Lista de IDs dos grupos aos quais o produto deve pertencer
                  type: array
                  items:
                    type: integer
                    format: int32
              required: [ apiKey, id, groupIds ]
        required: true
      responses:
        200:
          description: Grupos do produto atualizados com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  added:
                    type: integer
                    format: int32
                    description: Quantidade de grupos adicionados
                  removed:
                    type: integer
                    format: int32
                    description: Quantidade de grupos removidos
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getFaqs:
    post:
      tags:
        - FAQs
      summary: Lista todas as FAQs
      operationId: getFaqs
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de FAQs
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      format: int32
                    question:
                      type: string
                    description:
                      type: string
                    keywords:
                      type: array
                      items:
                        type: string
                    type:
                      type: integer
                      format: int32
                    rating:
                      type: number
                    votes:
                      type: integer
                      format: int32
                    writtenby:
                      type: integer
                      format: int32
                    faqgroups:
                      type: array
                      items:
                        type: integer
                        format: int32
                    queues:
                      type: array
                      items:
                        type: integer
                        format: int32
                    tags:
                      type: array
                      items:
                        type: integer
                        format: int32
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getFaqById:
    post:
      tags:
        - FAQs
      summary: ObtÃ©m uma FAQ por ID
      operationId: getFaqById
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID da FAQ
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: FAQ encontrada
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
                  question:
                    type: string
                  description:
                    type: string
                  keywords:
                    type: array
                    items:
                      type: string
                  symptoms:
                    type: string
                  answer:
                    type: string
                  type:
                    type: integer
                    format: int32
                  rating:
                    type: number
                  votes:
                    type: integer
                    format: int32
                  writtenby:
                    type: integer
                    format: int32
                  faqgroups:
                    type: array
                    items:
                      type: integer
                      format: int32
                  queues:
                    type: array
                    items:
                      type: integer
                      format: int32
                  tags:
                    type: array
                    items:
                      type: integer
                      format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: FAQ nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createFaq:
    post:
      tags:
        - FAQs
      summary: Cria uma nova FAQ
      operationId: createFaq
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                question:
                  description: Pergunta da FAQ
                  type: string
                answer:
                  description: Resposta da FAQ (pode conter HTML)
                  type: string
                description:
                  description: DescriÃ§Ã£o breve da FAQ
                  type: string
                symptoms:
                  description: Sintomas relacionados (pode conter HTML)
                  type: string
                keywords:
                  description: Lista de palavras-chave
                  type: array
                  items:
                    type: string
                type:
                  description: "Tipo da FAQ: 0=pÃºblico, 1=interno, 2=pÃºblico restrito, 3=interno restrito"
                  type: integer
                  format: int32
                tags:
                  description: Lista de IDs das tags
                  type: array
                  items:
                    type: integer
                    format: int32
                queues:
                  description: Lista de IDs das filas (para FAQs restritas)
                  type: array
                  items:
                    type: integer
                    format: int32
                faqgroups:
                  description: Lista de IDs dos grupos de FAQs
                  type: array
                  items:
                    type: integer
                    format: int32
              required: [ apiKey, question, answer ]
        required: true
      responses:
        200:
          description: FAQ criada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
                  question:
                    type: string
                  answer:
                    type: string
                  description:
                    type: string
                  type:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateFaq:
    post:
      tags:
        - FAQs
      summary: Atualiza uma FAQ
      operationId: updateFaq
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID da FAQ
                  type: integer
                  format: int32
                question:
                  description: Pergunta da FAQ
                  type: string
                answer:
                  description: Resposta da FAQ (pode conter HTML)
                  type: string
                description:
                  description: DescriÃ§Ã£o breve da FAQ
                  type: string
                symptoms:
                  description: Sintomas relacionados (pode conter HTML)
                  type: string
                keywords:
                  description: Lista de palavras-chave
                  type: array
                  items:
                    type: string
                type:
                  description: "Tipo da FAQ: 0=pÃºblico, 1=interno, 2=pÃºblico restrito, 3=interno restrito"
                  type: integer
                  format: int32
                tags:
                  description: Lista de IDs das tags (substitui as existentes)
                  type: array
                  items:
                    type: integer
                    format: int32
                queues:
                  description: Lista de IDs das filas (substitui as existentes)
                  type: array
                  items:
                    type: integer
                    format: int32
                faqgroups:
                  description: Lista de IDs dos grupos de FAQs (substitui os existentes)
                  type: array
                  items:
                    type: integer
                    format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: FAQ atualizada com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: FAQ nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/deleteFaq:
    post:
      tags:
        - FAQs
      summary: Exclui uma FAQ
      operationId: deleteFaq
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID da FAQ
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: FAQ excluÃ­da com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: FAQ nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getFaqGroups:
    post:
      tags:
        - Grupos de FAQs
      summary: Lista todos os grupos de FAQs
      operationId: getFaqGroups
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de grupos de FAQs
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      format: int32
                    name:
                      type: string
                    items:
                      type: integer
                      format: int32
                      description: Quantidade de FAQs no grupo
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getFaqGroupById:
    post:
      tags:
        - Grupos de FAQs
      summary: ObtÃ©m um grupo de FAQs por ID
      operationId: getFaqGroupById
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de FAQs
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Grupo de FAQs encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
                  name:
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createFaqGroup:
    post:
      tags:
        - Grupos de FAQs
      summary: Cria um novo grupo de FAQs
      operationId: createFaqGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                name:
                  description: Nome do grupo
                  type: string
                  maxLength: 255
              required: [ apiKey, name ]
        required: true
      responses:
        200:
          description: Grupo criado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
                  name:
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateFaqGroup:
    post:
      tags:
        - Grupos de FAQs
      summary: Atualiza um grupo de FAQs
      operationId: updateFaqGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de FAQs
                  type: integer
                  format: int32
                name:
                  description: Nome do grupo
                  type: string
                  maxLength: 255
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Grupo atualizado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/deleteFaqGroup:
    post:
      tags:
        - Grupos de FAQs
      summary: Exclui um grupo de FAQs
      operationId: deleteFaqGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de FAQs
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Grupo excluÃ­do com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getFaqsFromGroup:
    post:
      tags:
        - Grupos de FAQs
      summary: ObtÃ©m as FAQs de um grupo especÃ­fico
      operationId: getFaqsFromGroup
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de FAQs
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Lista de IDs de FAQs do grupo
          content:
            application/json:
              schema:
                type: object
                properties:
                  groupId:
                    type: integer
                    format: int32
                  faqIds:
                    type: array
                    items:
                      type: integer
                      format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateGroupFaqs:
    post:
      tags:
        - Grupos de FAQs
      summary: Atualiza as FAQs de um grupo
      description: Substitui a lista de FAQs do grupo pela nova lista informada. FAQs que nÃ£o estiverem na lista serÃ£o removidas do grupo.
      operationId: updateGroupFaqs
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID do grupo de FAQs
                  type: integer
                  format: int32
                faqIds:
                  description: Lista de IDs das FAQs que devem pertencer ao grupo
                  type: array
                  items:
                    type: integer
                    format: int32
              required: [ apiKey, id, faqIds ]
        required: true
      responses:
        200:
          description: FAQs do grupo atualizadas com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  added:
                    type: integer
                    format: int32
                    description: Quantidade de FAQs adicionadas
                  removed:
                    type: integer
                    format: int32
                    description: Quantidade de FAQs removidas
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Grupo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getGroupsFromFaq:
    post:
      tags:
        - Grupos de FAQs
      summary: ObtÃ©m os grupos aos quais uma FAQ pertence
      operationId: getGroupsFromFaq
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID da FAQ
                  type: integer
                  format: int32
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Lista de IDs de grupos da FAQ
          content:
            application/json:
              schema:
                type: object
                properties:
                  faqId:
                    type: integer
                    format: int32
                  groupIds:
                    type: array
                    items:
                      type: integer
                      format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: FAQ nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/updateFaqGroups:
    post:
      tags:
        - Grupos de FAQs
      summary: Atualiza os grupos de uma FAQ
      description: Substitui a lista de grupos da FAQ pela nova lista informada. Grupos que nÃ£o estiverem na lista serÃ£o removidos da FAQ.
      operationId: updateFaqGroups
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                id:
                  description: ID da FAQ
                  type: integer
                  format: int32
                groupIds:
                  description: Lista de IDs dos grupos aos quais a FAQ deve pertencer
                  type: array
                  items:
                    type: integer
                    format: int32
              required: [ apiKey, id, groupIds ]
        required: true
      responses:
        200:
          description: Grupos da FAQ atualizados com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  added:
                    type: integer
                    format: int32
                    description: Quantidade de grupos adicionados
                  removed:
                    type: integer
                    format: int32
                    description: Quantidade de grupos removidos
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: FAQ nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getPersistentStorageItem:
    post:
      tags:
        - Armazenamento Permanente
      summary: Busca um item do armazenamento permanente, com base em sua chave
      operationId: getPersistentStorageItem
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                key:
                  description: Chave do item que estÃ¡ sendo buscado
                  type: string
              required: [ queueId, apiKey, key ]
        required: true
      responses:
        200:
          description: Item encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    description: Dados armazenados
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/removePersistentStorageItem:
    post:
      tags:
        - Armazenamento Permanente
      summary: Remove um item do armazenamento permanente, com base em sua chave
      operationId: removePersistentStorageItem
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                key:
                  description: Chave do item que serÃ¡ removido
                  type: string
              required: [ queueId, apiKey, key ]
        required: true
      responses:
        200:
          description: Item removido
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createPersistentStorageItem:
    post:
      tags:
        - Armazenamento Permanente
      summary: Adiciona um item ao armazenamento permanente. SÃ£o permitidos atÃ© 10000 itens armazenados.
      operationId: createPersistentStorageItem
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                queueId:
                  description: ID da fila
                  type: integer
                  format: int32
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                key:
                  description: Chave do item que serÃ¡ criado. Se jÃ¡ existir um item com essa chave, ele serÃ¡ substituÃ­do.
                  type: string
                data:
                  description: Dados do item. AtÃ© 4096 caracteres.
                  type: string
                ttl:
                  description: Tempo de vida do item em segundos. Se zero, o item nÃ£o expira.
                  type: integer
              required: [ queueId, apiKey, key, data ]
        required: true
      responses:
        200:
          description: Item criado com sucesso
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Produto nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        503:
          description: Fila indisponÃ­vel
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getAllWebhookCaptures:
    post:
      tags:
        - Capturas de Webhook
      summary: Retorna uma lista com todas as capturas de webhook cadastradas no sistema
      operationId: getAllWebhookCaptures
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de capturas
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      description: ID da captura
                    name:
                      type: string
                      description: Nome da captura
                    key:
                      type: string
                      description: Chave da captura. Deve ser acrescentada Ã  URL do webhook para identificar a captura
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getNextCleaningInfo:
    post:
      tags:
        - Backup
      summary: Retorna os dados do prÃ³ximo agendamento de limpeza
      operationId: getNextCleaningInfo
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Dados da prÃ³xima limpeza agendada
          content:
            application/json:
              schema:
                type: object
                properties:
                  scheduled:
                    type: boolean
                    description: Se true, hÃ¡ uma limpeza agendada, se false, nÃ£o hÃ¡
                  date:
                    type: string
                    description: Data em que a prÃ³xima limpeza agendada irÃ¡ ocorrer. Em formato ISO 8601
                  cutDate:
                    type: string
                    description: Data de corte da prÃ³xima limpeza agendada. Ou seja, atendimentos anteriores a essa data serÃ£o excluÃ­dos. Em formato ISO 8601
                  firstId:
                    type: integer
                    description: InÃ­cio do intervalo de IDs de atendimentos que serÃ¡ excluÃ­do, inclusive.
                  lastId:
                    type: integer
                    description: Fim do intervalo de IDs de atendimentos que serÃ¡ excluÃ­do, inclusive.
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getAllChatsClosedYesterday:
    post:
      tags:
        - Backup
      summary: Retorna uma lista com os IDs de todos os atendimentos que foram ENCERRADOS no dia anterior, em todas as filas.
      operationId: getAllChatsClosedYesterday
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista com os IDs dos atendimentos
          content:
            application/json:
              schema:
                type: array
                items:
                  type: integer
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getChatsByDateRange:
    post:
      tags:
        - Backup
      summary: Retorna uma lista com os IDs de todos os atendimentos que foram ENCERRADOS em um intervalo de datas especificado, em todas as filas.
      operationId: getChatsByDateRange
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
                startDate:
                  type: string
                  format: date
                  description: Data de inÃ­cio do intervalo (formato ISO 8601, ex. "2024-01-01" ou "2024-01-01T00:00:00Z"). SerÃ¡ considerado o inÃ­cio do dia (00:00:00).
                endDate:
                  type: string
                  format: date
                  description: Data de fim do intervalo (formato ISO 8601, ex. "2024-01-31" ou "2024-01-31T23:59:59Z"). SerÃ¡ considerado o fim do dia (23:59:59).
              required: [ apiKey, startDate, endDate ]
        required: true
      responses:
        200:
          description: Lista com os IDs dos atendimentos encerrados no intervalo especificado
          content:
            application/json:
              schema:
                type: array
                items:
                  type: integer
        400:
          description: Dados obrigatÃ³rios faltando ou datas invÃ¡lidas (data de fim anterior Ã  data de inÃ­cio)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/backupChat:
    post:
      tags:
        - Backup
      summary: Retorna um arquivo ZIP com os dados do atendimento, incluindo sessÃµes de suporte remoto.
      description: |
        Exporta um chat completo em formato ZIP contendo:
        - Um arquivo TXT com todas as mensagens formatadas
        - Todos os arquivos anexados Ã s mensagens
        - SessÃµes de suporte remoto (quando existirem) na pasta `remote_support/`
        - Arquivos das sessÃµes de suporte remoto (screenshots, gravaÃ§Ãµes de vÃ­deo, etc.)
      operationId: backupChat
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Arquivo compactado com os dados do atendimento
          content:
            application/zip:
              schema:
                type: string
                format: binary
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/backupChatAsJson:
    post:
      tags:
        - Backup
      summary: Retorna um arquivo JSON estruturado com todos os dados do atendimento, incluindo sessÃµes de suporte remoto. Suporta inclusÃ£o opcional de arquivos em base64 e compactaÃ§Ã£o ZIP.
      description: |
        Este endpoint exporta um chat completo em formato JSON estruturado, incluindo:
        - Metadados do chat (cliente, datas, protocolo, etc.)
        - Todas as mensagens com seus arquivos
        - SessÃµes de suporte remoto com seus arquivos (screenshots, gravaÃ§Ãµes, etc.)
      operationId: backupChatAsJson
      parameters:
        - in: query
          name: id
          schema:
            type: integer
          required: false
          description: ID do atendimento que serÃ¡ exportado (pode ser enviado via query ou body)
        - in: query
          name: zip
          schema:
            type: boolean
          required: false
          description: Se true, o arquivo JSON serÃ¡ compactado em um arquivo ZIP antes de ser enviado. Se false ou ausente, o JSON serÃ¡ enviado sem compactaÃ§Ã£o.
        - in: query
          name: includeFiles
          schema:
            type: boolean
            default: false
          required: false
          description: |
            Se true, os arquivos serÃ£o incorporados no JSON como data URLs (base64). Se false (padrÃ£o), apenas o fileId e SHA256 serÃ£o incluÃ­dos.

            **IMPORTANTE:** Quando includeFiles=true, o tamanho total dos arquivos do chat (incluindo foto de perfil) nÃ£o pode exceder 50 MB. Se exceder, um erro 413 serÃ¡ retornado.

            Para chats grandes, recomenda-se usar includeFiles=false e buscar os arquivos separadamente via API usando os fileIds exportados.
      requestBody:
        description: Objeto requerido. Os parÃ¢metros tambÃ©m podem ser enviados via query string.
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
                id:
                  type: integer
                  description: ID do atendimento que serÃ¡ exportado
                zip:
                  type: boolean
                  description: Se true, o arquivo JSON serÃ¡ compactado em um arquivo ZIP antes de ser enviado
                includeFiles:
                  type: boolean
                  default: false
                  description: |
                    Se true, os arquivos serÃ£o incorporados no JSON como data URLs. Se false (padrÃ£o), apenas fileId e SHA256.
                    Limite total de 50 MB quando true.
              required: [ apiKey, id ]
        required: true
      responses:
        200:
          description: Arquivo JSON estruturado com todos os dados do atendimento (ou ZIP contendo o JSON se o parÃ¢metro zip=true)
          content:
            application/json:
              schema:
                type: object
                properties:
                  version:
                    type: integer
                    description: VersÃ£o do formato de exportaÃ§Ã£o
                  metadata:
                    type: object
                    properties:
                      exportedAt:
                        type: string
                        format: date-time
                        description: Data e hora da exportaÃ§Ã£o em formato ISO 8601
                      systemVersion:
                        type: integer
                        description: VersÃ£o do schema do banco de dados no momento da exportaÃ§Ã£o
                      chatId:
                        type: integer
                        description: ID do chat exportado
                  chat:
                    type: object
                    description: Objeto contendo todos os dados do chat
                    properties:
                      id:
                        type: integer
                        description: ID do chat
                      clientName:
                        type: string
                        description: Nome do cliente
                      clientNumber:
                        type: string
                        description: NÃºmero de telefone do cliente
                      clientId:
                        type: string
                        description: ID do cliente no serviÃ§o de mensageria
                      queueId:
                        type: integer
                        description: ID da fila
                      queueType:
                        type: integer
                        description: CÃ³digo do tipo de fila (1=WA, 2=FB, 3=TG, etc)
                      queueTypeName:
                        type: string
                        description: Nome do tipo de fila
                      beginTime:
                        type: string
                        format: date-time
                        description: Data e hora de inÃ­cio do atendimento
                      endTime:
                        type: string
                        format: date-time
                        description: Data e hora de fim do atendimento
                      status:
                        type: integer
                        description: Status do chat (0=Fechado, 1=Aberto)
                      protocol:
                        type: string
                        description: Protocolo do atendimento
                      profilePicture:
                        type: object
                        nullable: true
                        description: |
                          Foto de perfil do cliente. O conteÃºdo varia conforme o parÃ¢metro includeFiles:

                          - **includeFiles=false (padrÃ£o):** ContÃ©m apenas fileId
                          - **includeFiles=true:** ContÃ©m fileId, mimeType e data (data URL completo)
                        properties:
                          fileId:
                            type: integer
                            description: ID da foto de perfil no sistema (sempre presente quando hÃ¡ foto)
                          mimeType:
                            type: string
                            description: Tipo MIME da imagem (apenas quando includeFiles=true)
                          data:
                            type: string
                            description: Imagem em formato data URL - data:image/jpeg;base64,... (apenas quando includeFiles=true)
                      messages:
                        type: array
                        description: Lista de mensagens do chat
                        items:
                          type: object
                          properties:
                            id:
                              type: integer
                              description: ID da mensagem
                            messageId:
                              type: string
                              description: ID Ãºnico da mensagem no serviÃ§o de mensageria
                            direction:
                              type: string
                              enum: [in, out, info, system, alert]
                              description: DireÃ§Ã£o da mensagem (in=recebida, out=enviada, info=informaÃ§Ã£o, system=sistema, alert=alerta)
                            timestamp:
                              type: string
                              format: date-time
                              description: Data e hora da mensagem
                            text:
                              type: string
                              description: Texto da mensagem
                            file:
                              type: object
                              nullable: true
                              description: |
                                Arquivo anexado Ã  mensagem. O conteÃºdo varia conforme o parÃ¢metro includeFiles:

                                - **includeFiles=false (padrÃ£o):** ContÃ©m apenas fileId e sha256
                                - **includeFiles=true:** ContÃ©m fileId, sha256, mimeType, fileName, size e data (data URL completo)
                              properties:
                                fileId:
                                  type: integer
                                  description: ID do arquivo no sistema (sempre presente)
                                sha256:
                                  type: string
                                  description: Hash SHA256 do arquivo para verificaÃ§Ã£o de integridade (sempre presente)
                                mimeType:
                                  type: string
                                  description: Tipo MIME do arquivo (apenas quando includeFiles=true)
                                fileName:
                                  type: string
                                  description: Nome do arquivo (apenas quando includeFiles=true)
                                size:
                                  type: integer
                                  description: Tamanho do arquivo em bytes (apenas quando includeFiles=true)
                                data:
                                  type: string
                                  description: Arquivo em formato data URL - data:mimetype;base64,... (apenas quando includeFiles=true)
                      remoteSupportSessions:
                        type: array
                        description: Lista de sessÃµes de suporte remoto associadas ao chat
                        items:
                          type: object
                          properties:
                            id:
                              type: integer
                              description: ID da sessÃ£o no banco de dados
                            key:
                              type: string
                              description: UUID Ãºnico da sessÃ£o
                            type:
                              type: integer
                              enum: [0, 1, 2]
                              description: |
                                Tipo da sessÃ£o:
                                - 0: Suporte Remoto
                                - 1: AssistÃªncia Remota Web
                                - 2: AssistÃªncia Remota Desktop
                            status:
                              type: integer
                              enum: [0, 1, 2, 3, 4, 5, 6]
                              description: |
                                Status da sessÃ£o:
                                - 0: Aguardando
                                - 1: Conectando
                                - 2: Conectada
                                - 3: Finalizada pelo usuÃ¡rio remoto
                                - 4: Finalizada pelo agente
                                - 5: Falha
                                - 6: Cancelada
                            failReason:
                              type: string
                              nullable: true
                              description: Motivo da falha (quando status=5)
                            queueId:
                              type: integer
                              nullable: true
                              description: ID da fila
                            userId:
                              type: integer
                              nullable: true
                              description: ID do agente que iniciou a sessÃ£o
                            visualGroupId:
                              type: integer
                              nullable: true
                              description: ID do grupo de visualizaÃ§Ã£o
                            validUntil:
                              type: string
                              format: date-time
                              nullable: true
                              description: Data/hora de expiraÃ§Ã£o da sessÃ£o
                            connectionTime:
                              type: string
                              format: date-time
                              nullable: true
                              description: Data/hora em que a conexÃ£o foi estabelecida
                            endTime:
                              type: string
                              format: date-time
                              nullable: true
                              description: Data/hora de encerramento da sessÃ£o
                            createdAt:
                              type: string
                              format: date-time
                              description: Data/hora de criaÃ§Ã£o da sessÃ£o
                            files:
                              type: array
                              description: |
                                Arquivos da sessÃ£o (screenshots, gravaÃ§Ãµes de vÃ­deo, etc.). O conteÃºdo varia conforme includeFiles:

                                - **includeFiles=false:** ContÃ©m fileId, sha256, mimeType, size, width, height, duration
                                - **includeFiles=true:** Inclui tambÃ©m data (data URL), fileName e transcription
                              items:
                                type: object
                                properties:
                                  fileId:
                                    type: integer
                                    description: ID do arquivo no sistema
                                  sha256:
                                    type: string
                                    description: Hash SHA256 do arquivo
                                  mimeType:
                                    type: string
                                    description: Tipo MIME (image/jpeg, video/webm, etc.)
                                  size:
                                    type: integer
                                    description: Tamanho do arquivo em bytes
                                  width:
                                    type: integer
                                    nullable: true
                                    description: Largura em pixels (para imagens/vÃ­deos)
                                  height:
                                    type: integer
                                    nullable: true
                                    description: Altura em pixels (para imagens/vÃ­deos)
                                  duration:
                                    type: number
                                    nullable: true
                                    description: DuraÃ§Ã£o em segundos (para vÃ­deos)
                                  fileName:
                                    type: string
                                    description: Nome do arquivo (apenas quando includeFiles=true)
                                  transcription:
                                    type: string
                                    nullable: true
                                    description: TranscriÃ§Ã£o OCR da imagem (apenas quando includeFiles=true)
                                  data:
                                    type: string
                                    description: Arquivo em formato data URL (apenas quando includeFiles=true)
            application/zip:
              schema:
                type: string
                format: binary
                description: Arquivo ZIP contendo o JSON (quando zip=true)
        400:
          description: Dados obrigatÃ³rios faltando ou ID invÃ¡lido
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Chat nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        413:
          description: Tamanho total dos arquivos excede o limite de 50 MB (apenas quando includeFiles=true)
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    description: Mensagem de erro
                    example: "File size limit exceeded"
                  detail:
                    type: string
                    description: Detalhes do erro com sugestÃ£o de soluÃ§Ã£o
                    example: "Total file size (75.32 MB) exceeds the maximum allowed (50 MB) for includeFiles=true. Please use includeFiles=false to export only file references."
                  totalSizeBytes:
                    type: integer
                    description: Tamanho total dos arquivos em bytes
                    example: 78954321
                  totalSizeMB:
                    type: number
                    format: float
                    description: Tamanho total dos arquivos em megabytes
                    example: 75.32
                  maxSizeMB:
                    type: integer
                    description: Tamanho mÃ¡ximo permitido em megabytes
                    example: 50
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/importChatFromJson:
    post:
      tags:
        - Backup
      summary: Importa um chat a partir de um arquivo JSON de backup, criando um novo registro no sistema, incluindo sessÃµes de suporte remoto.
      description: |
        Este endpoint permite reimportar chats exportados via `backupChatAsJson`, criando novos registros no sistema.

        **ObservaÃ§Ãµes importantes:**
        - Para que a importaÃ§Ã£o aconteÃ§a, a instÃ¢ncia necessita ter espaÃ§o suficiente disponÃ­vel
        - Cria um novo chat com ID automÃ¡tico (ignora o ID do backup)
        - Importa todas as mensagens associadas
        - Importa sessÃµes de suporte remoto e seus arquivos (screenshots, gravaÃ§Ãµes, etc.)
        - Suporta arquivos incorporados em base64 ou referÃªncias por fileId

        **Tratamento de Arquivos:**
        - **Com dados (base64):** Salva arquivo se necessÃ¡rio e atualiza a referÃªncia do fileId das mensagens.
        - **Sem dados (fileId apenas):** Verifica se arquivo existe, se nÃ£o: importa a mensagem sem o arquivo e adiciona [#FILENOTFOUND] ao texto da mensagem

        **âš ï¸ IMPORTANTE - IDs e Housekeeping:**

        O ID do chat no backup Ã© **SEMPRE IGNORADO**. Um novo ID serÃ¡ gerado automaticamente de forma sequencial pelo banco de dados.

        O sistema de limpeza automÃ¡tica (housekeeping) utiliza o **ID do chat** como critÃ©rio principal para determinar quais chats apagar,
        nÃ£o a data de inÃ­cio ou fim do atendimento. Isso significa que:

        - âœ… **Chats importados recebem IDs altos** (sequenciais a partir do Ãºltimo ID da base)
        - âš ï¸ **Chats importados sÃ£o considerados "mais recentes"** para o housekeeping, independente da data real do atendimento
        - âš ï¸ **Chats existentes com IDs baixos serÃ£o apagados primeiro**, mesmo que tenham datas mais recentes que os chats importados

        **Exemplo prÃ¡tico:**

        CenÃ¡rio: Base atual tem chats com IDs de 5.000 a 10.000

        VocÃª importa um backup antigo de ID original 100 â†’ O chat importado recebe ID 10.001

        Quando o housekeeping executar:
        - Chats mais recentes com IDs 5.000-10.000 serÃ£o apagados primeiro
        - Chat antigo com ID original 100 com novo ID 10.001 serÃ¡ mantido por mais tempo

        **RecomendaÃ§Ãµes:**

        1. **NÃ£o importe backups antigos** se vocÃª deseja manter histÃ³rico cronolÃ³gico correto para limpeza
        2. **Considere ajustar a quota** antes de importar para evitar limpezas nÃ£o desejadas de atendimentos mais recentes
        3. **Use com cautela** em ambientes de produÃ§Ã£o
      operationId: importChatFromJson
      requestBody:
        description: Objeto JSON do backup exportado via backupChatAsJson
        content:
          application/json:
            schema:
              type: object
              description: Estrutura completa do backup (mesma retornada por backupChatAsJson)
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
                version:
                  type: integer
                  description: VersÃ£o do formato de backup
                  example: 1
                metadata:
                  type: object
                  description: Metadados da exportaÃ§Ã£o original
                chat:
                  type: object
                  description: Objeto do chat com todas as suas mensagens
                  required:
                    - beginTime
              required: [ apiKey, version, chat ]
        required: true
      responses:
        200:
          description: Chat importado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    description: Indica se a importaÃ§Ã£o foi bem-sucedida
                    example: true
                  chatId:
                    type: integer
                    description: ID do novo chat criado no sistema
                    example: 98765
                  originalChatId:
                    type: integer
                    description: ID original do chat no backup
                    example: 12345
                  messagesImported:
                    type: integer
                    description: Quantidade de mensagens importadas com sucesso
                    example: 42
                  totalMessages:
                    type: integer
                    description: Quantidade total de mensagens no backup
                    example: 45
                  remoteSupportSessionsImported:
                    type: integer
                    description: Quantidade de sessÃµes de suporte remoto importadas com sucesso
                    example: 2
                  totalRemoteSupportSessions:
                    type: integer
                    description: Quantidade total de sessÃµes de suporte remoto no backup
                    example: 2
                  warnings:
                    type: array
                    description: Lista de avisos durante a importaÃ§Ã£o (arquivos nÃ£o encontrados, erros em mensagens ou sessÃµes)
                    items:
                      type: string
                    example: ["Message 5: File with ID 123 not found", "Session 1, File with ID 789 not found"]
                  dbSizeIncrement:
                    type: integer
                    description: Quantidade de bytes adicionados ao dbSize
                    example: 1048576
        400:
          description: Formato de backup invÃ¡lido ou dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Invalid backup format"
                  detail:
                    type: string
                    example: "The backup JSON must contain version and chat properties"
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        507:
          description: EspaÃ§o de armazenamento insuficiente (quota excedida)
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Insufficient storage"
                  detail:
                    type: string
                    example: "Not enough storage space to import this backup. Available: 50.00 MB, Required: 75.50 MB"
                  usedMB:
                    type: number
                    format: float
                    description: EspaÃ§o atualmente usado em MB
                    example: 450.00
                  quotaMB:
                    type: number
                    format: float
                    description: Quota total em MB
                    example: 500.00
                  neededMB:
                    type: number
                    format: float
                    description: EspaÃ§o necessÃ¡rio para este backup em MB
                    example: 75.50
                  availableMB:
                    type: number
                    format: float
                    description: EspaÃ§o disponÃ­vel em MB
                    example: 50.00
  /int/getChatsMinIdAndDate:
    post:
      tags:
        - Backup
      summary: Retorna informaÃ§Ãµes sobre o menor ID de chat e a data mais antiga no sistema.
      description: |
        Este endpoint retorna duas informaÃ§Ãµes distintas:
        1. O menor ID de chat no sistema
        2. A data mais antiga no sistema (que pode nÃ£o corresponder ao menor ID devido a importaÃ§Ãµes)

        **IMPORTANTE:** Com a funÃ§Ã£o de importaÃ§Ã£o de backups, um chat importado pode ter um ID alto mas data antiga.
        Por isso, esta funÃ§Ã£o retorna ambas as informaÃ§Ãµes separadamente.

        Ã‰ Ãºtil para:
        - OperaÃ§Ãµes de backup incremental
        - RelatÃ³rios de uso histÃ³rico
        - Auditoria de retenÃ§Ã£o de dados
        - IdentificaÃ§Ã£o do range temporal real dos dados
      operationId: getChatsMinIdAndDate
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  type: string
                  description: Chave global de autenticaÃ§Ã£o da API. Configurada em ConfiguraÃ§Ãµes -> Geral
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: InformaÃ§Ãµes sobre o menor ID e data mais antiga
          content:
            application/json:
              schema:
                type: object
                properties:
                  minId:
                    type: integer
                    description: Menor ID de chat no sistema
                    example: 1
                  minIdDate:
                    type: string
                    format: date-time
                    description: Data de inÃ­cio (begintime) do chat com menor ID
                    example: "2023-01-01T10:00:00Z"
                  minIdEndDate:
                    type: string
                    format: date-time
                    nullable: true
                    description: Data de fim (endtime) do chat com menor ID (null se ainda aberto)
                    example: "2023-01-01T11:00:00Z"
                  oldestDate:
                    type: string
                    format: date-time
                    description: Data mais antiga no sistema (considera endtime se disponÃ­vel, senÃ£o begintime)
                    example: "2022-06-15T08:30:00Z"
                  oldestDateChatId:
                    type: integer
                    description: ID do chat que possui a data mais antiga
                    example: 45678
                  oldestDateBeginTime:
                    type: string
                    format: date-time
                    description: Data de inÃ­cio do chat com data mais antiga
                    example: "2022-06-15T08:30:00Z"
                  oldestDateEndTime:
                    type: string
                    format: date-time
                    nullable: true
                    description: Data de fim do chat com data mais antiga (null se ainda aberto)
                    example: "2022-06-15T09:45:00Z"
        400:
          description: Dados obrigatÃ³rios faltando
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/checkBusinessHours:
    post:
      tags:
        - HorÃ¡rio de Atendimento
      summary: Verifica a disponibilidade de uma configuraÃ§Ã£o de horÃ¡rio de atendimento
      description: |
        Verifica se o atendimento estÃ¡ aberto ou fechado com base na configuraÃ§Ã£o de horÃ¡rio de atendimento informada.
        Pode-se informar uma data/hora especÃ­fica para verificaÃ§Ã£o ou, se nÃ£o informada, serÃ¡ utilizada a data/hora atual.
        O ID da configuraÃ§Ã£o de horÃ¡rio de atendimento pode ser obtido atravÃ©s do campo `businessHoursConfigId` do endpoint `/int/getQueueStatus`.
      operationId: checkBusinessHours
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                configId:
                  type: integer
                  format: int32
                  description: ID da configuraÃ§Ã£o de horÃ¡rio de atendimento
                datetime:
                  type: string
                  description: Data/hora para verificar no formato ISO 8601. Se nÃ£o informado, serÃ¡ utilizada a data/hora atual.
                  example: "2024-01-15T14:30:00"
              required: [ apiKey, configId ]
        required: true
      responses:
        200:
          description: Resultado da verificaÃ§Ã£o de disponibilidade
          content:
            application/json:
              schema:
                type: object
                properties:
                  configId:
                    type: integer
                    description: ID da configuraÃ§Ã£o de horÃ¡rio de atendimento
                  configName:
                    type: string
                    description: Nome da configuraÃ§Ã£o
                  checkedAt:
                    type: string
                    description: Data/hora verificada no formato ISO 8601
                  isOpen:
                    type: boolean
                    description: Se o atendimento estÃ¡ aberto ou fechado
                  reason:
                    type: string
                    description: CÃ³digo do motivo (weekly, holiday, special_date, day_closed, etc)
                  reasonLabel:
                    type: string
                    description: Label legÃ­vel do motivo
                  message:
                    type: string
                    description: Mensagem configurada com variÃ¡veis nÃ£o substituÃ­das, se houver
                  messageFormatted:
                    type: string
                    description: Mensagem com variÃ¡veis substituÃ­das
                  description:
                    type: string
                    nullable: true
                    description: DescriÃ§Ã£o adicional (nome do feriado, data especial, etc)
                  closeTime:
                    type: string
                    nullable: true
                    description: HorÃ¡rio de fechamento, se aberto
                  minutesToClose:
                    type: integer
                    nullable: true
                    description: Minutos restantes atÃ© fechar, se aberto
                  minutesToOpen:
                    type: integer
                    nullable: true
                    description: Minutos restantes atÃ© abrir, se fechado
                  nextOpenDate:
                    type: string
                    nullable: true
                    description: PrÃ³xima data/hora de abertura no formato ISO 8601, se fechado
                  nextCloseDate:
                    type: string
                    nullable: true
                    description: PrÃ³xima data/hora de fechamento no formato ISO 8601, se aberto
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: ConfiguraÃ§Ã£o de horÃ¡rio de atendimento nÃ£o encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getBusinessHoursHolidays:
    post:
      tags:
        - HorÃ¡rio de Atendimento
      summary: Retorna feriados ativos dentro de um perÃ­odo
      description: |
        Retorna os feriados ativos cadastrados no sistema que se enquadram no perÃ­odo informado.
        Feriados recorrentes sÃ£o retornados com a data ajustada para cada ano do perÃ­odo.
      operationId: getBusinessHoursHolidays
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
                start:
                  type: string
                  format: date
                  description: Data inÃ­cio no formato YYYY-MM-DD
                  example: "2025-01-01"
                end:
                  type: string
                  format: date
                  description: Data fim no formato YYYY-MM-DD
                  example: "2025-12-31"
              required: [ apiKey, start, end ]
        required: true
      responses:
        200:
          description: Lista de feriados ativos no perÃ­odo
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      description: ID do feriado
                    name:
                      type: string
                      description: Nome do feriado
                    holiday_date:
                      type: string
                      format: date
                      description: Data do feriado no formato YYYY-MM-DD
                    holiday_type:
                      type: integer
                      description: Tipo do feriado
                    is_recurring:
                      type: integer
                      description: Se o feriado Ã© recorrente (1) ou nÃ£o (0)
                    is_active:
                      type: integer
                      description: Se o feriado estÃ¡ ativo (1) ou nÃ£o (0)
        400:
          description: ParÃ¢metros ausentes, formato invÃ¡lido ou range invÃ¡lido
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getBusinessHoursSchedule:
    post:
      tags:
        - HorÃ¡rio de Atendimento
      summary: Retorna o cronograma de horÃ¡rios de atendimento para um perÃ­odo
      description: |
        Retorna um array com informaÃ§Ãµes detalhadas de cada dia no perÃ­odo informado,
        incluindo se estÃ¡ aberto ou fechado, horÃ¡rios de atendimento, tipo do dia
        (normal, feriado ou data especial) e nome do feriado ou data especial quando aplicÃ¡vel.
        O perÃ­odo mÃ¡ximo permitido Ã© de 100 dias.
      operationId: getBusinessHoursSchedule
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API global
                  type: string
                configId:
                  description: ID da configuraÃ§Ã£o de horÃ¡rio de atendimento
                  type: integer
                start:
                  description: Data inÃ­cio no formato YYYY-MM-DD
                  type: string
                  example: "2026-02-01"
                end:
                  description: Data fim no formato YYYY-MM-DD
                  type: string
                  example: "2026-02-07"
              required: [ apiKey, configId, start, end ]
        required: true
      responses:
        200:
          description: Cronograma de horÃ¡rios para o perÃ­odo
          content:
            application/json:
              schema:
                type: object
                properties:
                  configId:
                    type: integer
                    description: ID da configuraÃ§Ã£o
                  configName:
                    type: string
                    description: Nome da configuraÃ§Ã£o
                  period:
                    type: object
                    properties:
                      start:
                        type: string
                        description: Data inÃ­cio do perÃ­odo
                      end:
                        type: string
                        description: Data fim do perÃ­odo
                  schedule:
                    type: array
                    items:
                      type: object
                      properties:
                        date:
                          type: string
                          description: Data no formato YYYY-MM-DD
                        dayOfWeek:
                          type: integer
                          description: Dia da semana (0=Domingo, 6=SÃ¡bado)
                        dayOfWeekName:
                          type: string
                          description: Nome do dia da semana em portuguÃªs
                        isOpen:
                          type: boolean
                          description: Indica se o atendimento estÃ¡ aberto neste dia
                        dayType:
                          type: string
                          enum: [weekly, holiday, special_date]
                          description: Tipo do dia
                        dayTypeLabel:
                          type: string
                          description: Label do tipo do dia em portuguÃªs
                        specialName:
                          type: string
                          nullable: true
                          description: Nome do feriado ou data especial, quando aplicÃ¡vel
                        periods:
                          type: array
                          description: PerÃ­odos de atendimento do dia
                          items:
                            type: object
                            properties:
                              start:
                                type: string
                                description: HorÃ¡rio de inÃ­cio (HH:MM)
                              end:
                                type: string
                                description: HorÃ¡rio de fim (HH:MM)
        400:
          description: ParÃ¢metros invÃ¡lidos ou faltando
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    description: CÃ³digo do erro
                  message:
                    type: string
                    description: DescriÃ§Ã£o do erro
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: ConfiguraÃ§Ã£o nÃ£o encontrada
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                  message:
                    type: string
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getBusinessHoursConfigs:
    post:
      tags:
        - HorÃ¡rio de Atendimento
      summary: Retorna configuraÃ§Ãµes de horÃ¡rio de atendimento ativas
      description: |
        Retorna todas as configuraÃ§Ãµes de horÃ¡rio de atendimento ativas no sistema,
        com informaÃ§Ãµes simplificadas (id, name, description).
      operationId: getBusinessHoursConfigs
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o da API para a fila especificada
                  type: string
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de configuraÃ§Ãµes ativas
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      description: ID da configuraÃ§Ã£o
                    name:
                      type: string
                      description: Nome da configuraÃ§Ã£o
                    description:
                      type: string
                      description: DescriÃ§Ã£o da configuraÃ§Ã£o
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketClassifications:
    post:
      tags:
        - Tickets
      summary: Busca as classificaÃ§Ãµes de tickets disponÃ­veis
      operationId: getTicketClassifications
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                type:
                  description: "Filtrar por tipo de classificaÃ§Ã£o: 0 = Externa, 1 = Interna. Se nÃ£o informado, retorna todas."
                  type: integer
                  format: int32
                  enum: [0, 1]
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de classificaÃ§Ãµes
          content:
            application/json:
              schema:
                type: object
                properties:
                  classifications:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                          format: int32
                          description: ID da classificaÃ§Ã£o
                        name:
                          type: string
                          description: Nome da classificaÃ§Ã£o
                        color:
                          type: string
                          description: Cor da classificaÃ§Ã£o
                        type:
                          type: integer
                          format: int32
                          description: "Tipo da classificaÃ§Ã£o: 0 = Externa, 1 = Interna"
                          enum: [0, 1]
                        sort_order:
                          type: integer
                          format: int32
                          description: Ordem de exibiÃ§Ã£o
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketReasons:
    post:
      tags:
        - Tickets
      summary: Busca os motivos de tickets disponÃ­veis
      description: Retorna os motivos de tickets. Pode ser filtrado por classificaÃ§Ã£o.
      operationId: getTicketReasons
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                classification_id:
                  description: ID da classificaÃ§Ã£o para filtrar os motivos. Se nÃ£o informado, retorna todos os motivos.
                  type: integer
                  format: int32
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de motivos
          content:
            application/json:
              schema:
                type: object
                properties:
                  reasons:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                          format: int32
                          description: ID do motivo
                        classification_id:
                          type: integer
                          format: int32
                          description: ID da classificaÃ§Ã£o vinculada
                        name:
                          type: string
                          description: Nome do motivo
                        code:
                          type: string
                          description: CÃ³digo do motivo
                        sort_order:
                          type: integer
                          format: int32
                          description: Ordem de exibiÃ§Ã£o
                        priority:
                          type: integer
                          format: int32
                          description: Prioridade padrÃ£o do motivo
                        sla_hours:
                          type: integer
                          format: int32
                          description: Horas de SLA para resoluÃ§Ã£o
                        first_response_sla_min:
                          type: integer
                          format: int32
                          description: Minutos de SLA para primeira resposta
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/createTicket:
    post:
      tags:
        - Tickets
      summary: Cria um novo ticket
      description: Cria um novo ticket no sistema de tickets. O ticket serÃ¡ criado na fila especificada e passarÃ¡ pelo processo de distribuiÃ§Ã£o automÃ¡tica.
      operationId: createIntTicket
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                queue_id:
                  description: ID da fila de tickets onde o ticket serÃ¡ criado. Se nÃ£o informado, serÃ¡ utilizada a primeira fila ativa.
                  type: integer
                  format: int32
                subject:
                  description: Assunto do ticket
                  type: string
                  maxLength: 255
                classification_id:
                  description: ID da classificaÃ§Ã£o do ticket
                  type: integer
                  format: int32
                reason_id:
                  description: ID do motivo do ticket
                  type: integer
                  format: int32
                sub_reason_id:
                  description: ID do submotivo do ticket
                  type: integer
                  format: int32
                description:
                  description: DescriÃ§Ã£o detalhada do ticket
                  type: string
                priority:
                  description: "Prioridade do ticket (1=Muito Alta, 2=Alta, 3=MÃ©dia, 4=Baixa, 5=Muito Baixa). Se nÃ£o informado, serÃ¡ utilizada a prioridade padrÃ£o do motivo."
                  type: integer
                  format: int32
                channel:
                  description: "Canal de origem do ticket (padrÃ£o: 1)"
                  type: integer
                  format: int32
                contact_ids:
                  description: Lista de IDs de contatos associados ao ticket
                  type: array
                  items:
                    type: integer
              required: [ apiKey, subject, classification_id ]
        required: true
      responses:
        201:
          description: Ticket criado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  ticket:
                    $ref: '#/components/schemas/TicketObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicket:
    post:
      tags:
        - Tickets
      summary: Consulta um ticket
      description: Retorna os dados de um ticket pelo UUID, nÃºmero ou ID. Inclui contatos e anexos associados.
      operationId: getTicket
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                uuid:
                  description: UUID do ticket
                  type: string
                number:
                  description: NÃºmero do ticket (ex. TK-20260311-00001)
                  type: string
                ticket_id:
                  description: ID numÃ©rico do ticket
                  type: integer
                  format: int32
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Dados do ticket
          content:
            application/json:
              schema:
                type: object
                properties:
                  ticket:
                    allOf:
                      - $ref: '#/components/schemas/TicketObject'
                      - type: object
                        properties:
                          contacts:
                            type: array
                            items:
                              $ref: '#/components/schemas/TicketContactObject'
                          attachments:
                            type: array
                            items:
                              $ref: '#/components/schemas/TicketAttachmentObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/linkTicketAttachment:
    post:
      tags:
        - Tickets
      summary: Vincula um arquivo existente a um ticket
      description: Associa um arquivo jÃ¡ existente no sistema ao ticket informado. Caso o arquivo jÃ¡ esteja vinculado, retorna mensagem informativa.
      operationId: linkTicketAttachment
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                file_id:
                  description: ID do arquivo a ser vinculado
                  type: integer
                  format: int32
              required: [ apiKey, ticket_id, file_id ]
        required: true
      responses:
        201:
          description: Arquivo vinculado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    description: Mensagem de sucesso
                  file_id:
                    type: integer
                    format: int32
                    description: ID do arquivo vinculado
                  filename:
                    type: string
                    description: Nome do arquivo
                  mimetype:
                    type: string
                    description: Tipo MIME do arquivo
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket ou arquivo nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketAttachments:
    post:
      tags:
        - Tickets
      summary: Lista os anexos de um ticket
      operationId: getTicketAttachments
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                uuid:
                  description: UUID do ticket (alternativa ao ticket_id)
                  type: string
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de anexos do ticket
          content:
            application/json:
              schema:
                type: object
                properties:
                  attachments:
                    type: array
                    items:
                      $ref: '#/components/schemas/TicketAttachmentObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketContacts:
    post:
      tags:
        - Tickets
      summary: Lista os contatos associados a um ticket
      operationId: getTicketContacts
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                uuid:
                  description: UUID do ticket (alternativa ao ticket_id)
                  type: string
              required: [ apiKey ]
        required: true
      responses:
        200:
          description: Lista de contatos do ticket
          content:
            application/json:
              schema:
                type: object
                properties:
                  contacts:
                    type: array
                    items:
                      $ref: '#/components/schemas/TicketContactObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/addTicketContact:
    post:
      tags:
        - Tickets
      summary: Associa um contato a um ticket
      description: Adiciona um contato existente ao ticket. Se o contato jÃ¡ estiver associado, retorna sucesso sem duplicar.
      operationId: addTicketContact
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                uuid:
                  description: UUID do ticket (alternativa ao ticket_id)
                  type: string
                contact_id:
                  description: ID do contato a ser associado ao ticket
                  type: integer
                  format: int32
              required: [ apiKey, contact_id ]
        required: true
      responses:
        201:
          description: Contato associado com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket ou contato nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketsByContact:
    post:
      tags:
        - Tickets
      summary: Lista os tickets associados a um contato
      description: Retorna os tickets que possuem o contato informado associado, ordenados do mais recente para o mais antigo (created_at). Por padrÃ£o retorna apenas os tickets do Ãºltimo mÃªs para evitar listas muito grandes; use 'months' ou 'all' para ampliar a janela e 'page'/'limit' para paginar.
      operationId: getTicketsByContact
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                contact_id:
                  description: ID do contato
                  type: integer
                  format: int32
                months:
                  description: Quantidade de meses para trÃ¡s (a partir de agora) a considerar no filtro por created_at. PadrÃ£o 1 (Ãºltimo mÃªs). Aumente para recuperar mais histÃ³rico.
                  type: integer
                  format: int32
                  default: 1
                all:
                  description: Se true, ignora o filtro por data e considera todos os tickets do contato (ainda sujeito a page/limit).
                  type: boolean
                  default: false
                page:
                  description: PÃ¡gina dos resultados (comeÃ§a em 1).
                  type: integer
                  format: int32
                  default: 1
                limit:
                  description: Quantidade mÃ¡xima de tickets por resposta. PadrÃ£o 100, mÃ¡ximo 500.
                  type: integer
                  format: int32
                  default: 100
              required: [ apiKey, contact_id ]
        required: true
      responses:
        200:
          description: Lista de tickets do contato
          content:
            application/json:
              schema:
                type: object
                properties:
                  tickets:
                    type: array
                    items:
                      $ref: '#/components/schemas/TicketObject'
                  page:
                    description: PÃ¡gina retornada
                    type: integer
                    format: int32
                  limit:
                    description: Limite de itens por pÃ¡gina aplicado
                    type: integer
                    format: int32
                  total:
                    description: Total de tickets encontrados dentro da janela/filtro (antes da paginaÃ§Ã£o)
                    type: integer
                    format: int32
                  hasMore:
                    description: true se houver mais pÃ¡ginas alÃ©m da atual
                    type: boolean
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketsByCompany:
    post:
      tags:
        - Tickets
      summary: Lista os tickets associados a uma empresa
      description: Retorna os tickets vinculados Ã  empresa informada (fk_company), ordenados do mais recente para o mais antigo (created_at). Por padrÃ£o retorna apenas os tickets do Ãºltimo mÃªs para evitar listas muito grandes; use 'months' ou 'all' para ampliar a janela e 'page'/'limit' para paginar.
      operationId: getTicketsByCompany
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                company_id:
                  description: ID da empresa
                  type: integer
                  format: int32
                months:
                  description: Quantidade de meses para trÃ¡s (a partir de agora) a considerar no filtro por created_at. PadrÃ£o 1 (Ãºltimo mÃªs). Aumente para recuperar mais histÃ³rico.
                  type: integer
                  format: int32
                  default: 1
                all:
                  description: Se true, ignora o filtro por data e considera todos os tickets da empresa (ainda sujeito a page/limit).
                  type: boolean
                  default: false
                page:
                  description: PÃ¡gina dos resultados (comeÃ§a em 1).
                  type: integer
                  format: int32
                  default: 1
                limit:
                  description: Quantidade mÃ¡xima de tickets por resposta. PadrÃ£o 100, mÃ¡ximo 500.
                  type: integer
                  format: int32
                  default: 100
              required: [ apiKey, company_id ]
        required: true
      responses:
        200:
          description: Lista de tickets da empresa
          content:
            application/json:
              schema:
                type: object
                properties:
                  tickets:
                    type: array
                    items:
                      $ref: '#/components/schemas/TicketObject'
                  page:
                    description: PÃ¡gina retornada
                    type: integer
                    format: int32
                  limit:
                    description: Limite de itens por pÃ¡gina aplicado
                    type: integer
                    format: int32
                  total:
                    description: Total de tickets encontrados dentro da janela/filtro (antes da paginaÃ§Ã£o)
                    type: integer
                    format: int32
                  hasMore:
                    description: true se houver mais pÃ¡ginas alÃ©m da atual
                    type: boolean
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/addTicketComment:
    post:
      tags:
        - Tickets
      summary: Adiciona um comentÃ¡rio ao ticket
      description: Adiciona um comentÃ¡rio pÃºblico (externo), interno ou de cliente ao ticket especificado.
      operationId: addTicketComment
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                content:
                  description: ConteÃºdo do comentÃ¡rio
                  type: string
                type:
                  description: "Tipo do comentÃ¡rio: external (pÃºblico), internal (interno) ou client (cliente). PadrÃ£o: external"
                  type: string
                  enum: [external, internal, client]
                  default: external
              required: [ apiKey, ticket_id, content ]
        required: true
      responses:
        201:
          description: ComentÃ¡rio criado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  comment:
                    $ref: '#/components/schemas/TicketCommentObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/reopenTicket:
    post:
      tags:
        - Tickets
      summary: Reabre um ticket resolvido com um comentÃ¡rio do cliente
      description: Reabre um ticket que estÃ¡ no status Resolvido (4), adicionando um comentÃ¡rio do cliente como justificativa. O ticket volta ao status Aberto (1), recalcula SLAs e Ã© redistribuÃ­do para um agente.
      operationId: reopenTicket
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket a ser reaberto
                  type: integer
                  format: int32
                content:
                  description: ComentÃ¡rio do cliente justificando a reabertura
                  type: string
              required: [ apiKey, ticket_id, content ]
        required: true
      responses:
        200:
          description: Ticket reaberto com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Ticket reopened
                  ticket_id:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou ticket nÃ£o estÃ¡ no status Resolvido
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/closeTicket:
    post:
      tags:
        - Tickets
      summary: Confirma o fechamento de um ticket resolvido
      description: Move um ticket do status Resolvido (4) para Fechado (5). Usado quando o cliente confirma que o problema foi solucionado. Tickets fechados nÃ£o podem mais ser alterados.
      operationId: closeTicket
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket a ser fechado
                  type: integer
                  format: int32
              required: [ apiKey, ticket_id ]
        required: true
      responses:
        200:
          description: Ticket fechado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Ticket closed
                  ticket_id:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou ticket nÃ£o estÃ¡ no status Resolvido
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/changeTicketStatus:
    post:
      tags:
        - Tickets
      summary: Altera o status de um ticket
      description: Altera o status de um ticket ativo entre 1 (Aberto), 2 (Em Atendimento), 3 (Aguardando Cliente) e 4 (Resolvido). A mudanÃ§a Ã© registrada no histÃ³rico do ticket (tickets_history). O status 4 passa pelo fluxo de resoluÃ§Ã£o (cÃ¡lculo de SLA e gravaÃ§Ã£o como Resolvido). Para fechar (5) use o closeTicket; para reativar um ticket resolvido use o reopenTicket. Opera apenas sobre tickets ativos (em memÃ³ria).
      operationId: changeTicketStatus
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                status:
                  description: "Novo status: 1=Aberto, 2=Em Atendimento, 3=Aguardando Cliente, 4=Resolvido"
                  type: integer
                  format: int32
                  enum: [1, 2, 3, 4]
              required: [ apiKey, ticket_id, status ]
        required: true
      responses:
        200:
          description: Status alterado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Ticket status changed
                  ticket_id:
                    type: integer
                    format: int32
                  status:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou status invÃ¡lido (fora de 1-4)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado ou nÃ£o estÃ¡ ativo
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/assignTicket:
    post:
      tags:
        - Tickets
      summary: Atribui um agente a um ticket
      description: Define o agente responsÃ¡vel por um ticket ativo. O agente informado precisa estar entre os agentes que podem atuar na fila do ticket, caso contrÃ¡rio a operaÃ§Ã£o Ã© rejeitada. A atribuiÃ§Ã£o Ã© registrada no histÃ³rico do ticket (tickets_history) como distribuiÃ§Ã£o (primeira atribuiÃ§Ã£o) ou reatribuiÃ§Ã£o (troca de agente).
      operationId: assignTicket
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                agent_id:
                  description: ID do agente (usuÃ¡rio) que serÃ¡ atribuÃ­do ao ticket
                  type: integer
                  format: int32
              required: [ apiKey, ticket_id, agent_id ]
        required: true
      responses:
        200:
          description: Agente atribuÃ­do com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Ticket assigned
                  ticket_id:
                    type: integer
                    format: int32
                  agent_id:
                    type: integer
                    format: int32
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        403:
          description: O agente nÃ£o pertence Ã  fila do ticket
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado/nÃ£o ativo ou agente nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/changeTicketStage:
    post:
      tags:
        - Tickets
      summary: Altera o estÃ¡gio de um ticket
      description: Move um ticket ativo para outro estÃ¡gio do seu fluxo. A transiÃ§Ã£o precisa estar configurada a partir do estÃ¡gio atual (grafo de transiÃ§Ãµes do fluxo); transiÃ§Ãµes nÃ£o permitidas sÃ£o rejeitadas. A mudanÃ§a Ã© registrada no histÃ³rico do ticket (tickets_history) como ESTAGIO_ALTERADO. Tickets resolvidos/fechados nÃ£o estÃ£o ativos em memÃ³ria e retornam 404.
      operationId: changeTicketStage
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
                stage_id:
                  description: ID do estÃ¡gio de destino
                  type: integer
                  format: int32
              required: [ apiKey, ticket_id, stage_id ]
        required: true
      responses:
        200:
          description: EstÃ¡gio alterado com sucesso
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Ticket stage changed
                  ticket_id:
                    type: integer
                    format: int32
                  stage_id:
                    type: integer
                    format: int32
                  stage_name:
                    type: string
                  stage_color:
                    type: string
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        404:
          description: Ticket nÃ£o encontrado/nÃ£o ativo ou estÃ¡gio nÃ£o encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        422:
          description: TransiÃ§Ã£o de estÃ¡gio nÃ£o permitida a partir do estÃ¡gio atual
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketComments:
    post:
      tags:
        - Tickets
      summary: Lista os comentÃ¡rios de um ticket
      description: Retorna todos os comentÃ¡rios (pÃºblicos e internos) do ticket especificado, ordenados por data de criaÃ§Ã£o.
      operationId: getTicketComments
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
              required: [ apiKey, ticket_id ]
        required: true
      responses:
        200:
          description: Lista de comentÃ¡rios do ticket
          content:
            application/json:
              schema:
                type: object
                properties:
                  comments:
                    type: array
                    items:
                      $ref: '#/components/schemas/TicketCommentObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/getTicketHistory:
    post:
      tags:
        - Tickets
      summary: Recupera o histÃ³rico de aÃ§Ãµes de um ticket
      description: Retorna o histÃ³rico de aÃ§Ãµes (criaÃ§Ã£o, atribuiÃ§Ã£o, transferÃªncia, escalonamento, mudanÃ§a de status, resoluÃ§Ã£o, reabertura e mudanÃ§a de estÃ¡gio) do ticket especificado, ordenado por data da aÃ§Ã£o.
      operationId: getTicketHistory
      requestBody:
        description: Objeto requerido
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:
                  description: Chave de autenticaÃ§Ã£o global da API
                  type: string
                ticket_id:
                  description: ID do ticket
                  type: integer
                  format: int32
              required: [ apiKey, ticket_id ]
        required: true
      responses:
        200:
          description: HistÃ³rico de aÃ§Ãµes do ticket
          content:
            application/json:
              schema:
                type: object
                properties:
                  history:
                    type: array
                    items:
                      $ref: '#/components/schemas/TicketHistoryObject'
        400:
          description: Dados obrigatÃ³rios faltando ou invÃ¡lidos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        401:
          description: AutenticaÃ§Ã£o falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
        500:
          description: Erro interno do servidor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReturnMessage'
  /int/simplepbx/calls:
    post:
      tags:
        - simplePbx
      summary: Origina uma chamada externa a partir de um ramal do tenant
      description: |
        Inicia uma chamada de saÃ­da via AMI Originate. ValidaÃ§Ãµes: ramal numÃ©rico (3-8 dÃ­gitos),
        destino com prefixo internacional opcional, callerId em whitelist (troncos + DIDs),
        trunkTag com regex restrito. Falha em qualquer validaÃ§Ã£o retorna 400/403.
      operationId: simplepbxOriginate
      requestBody:
        description: Dados da chamada
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey:    {type: string, description: Chave global da API}
                from:      {type: string, description: NÃºmero do ramal de origem, example: "1001"}
                to:        {type: string, description: NÃºmero de destino (com ou sem +DDI), example: "+5511999999999"}
                callerId:  {type: string, description: CallerID exibido (deve estar na whitelist), example: "+551144444444"}
                trunkTag:  {type: string, description: Tag opcional para roteamento por tronco especÃ­fico}
              required: [apiKey, from, to]
        required: true
      responses:
        200:
          description: Chamada originada
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok: {type: boolean}
                  linkedid: {type: string, description: ID Ãºnico da chamada para correlaÃ§Ã£o posterior com CDR}
        400:
          description: ParÃ¢metros invÃ¡lidos
        401:
          description: apiKey ausente ou invÃ¡lida
        403:
          description: callerId nÃ£o estÃ¡ na whitelist do tenant
        503:
          description: simplePbx desabilitado ou bootstrap em erro
    get:
      tags:
        - simplePbx
      summary: Consulta histÃ³rico de chamadas (CDR) do tenant
      description: |
        Retorna registros do CDR filtrados por janela de datas. Janela mÃ¡xima: 31 dias.
        Suporta paginaÃ§Ã£o. Cada query Ã© auditada.
      operationId: simplepbxCalls
      parameters:
        - in: query
          name: apiKey
          schema: {type: string}
          required: true
        - in: query
          name: from
          schema: {type: string, format: date}
          required: true
          description: Data inÃ­cio (YYYY-MM-DD)
        - in: query
          name: to
          schema: {type: string, format: date}
          required: true
          description: Data fim (YYYY-MM-DD); janela mÃ¡xima 31 dias
        - in: query
          name: page
          schema: {type: integer, default: 1}
        - in: query
          name: limit
          schema: {type: integer, default: 100, maximum: 500}
      responses:
        200:
          description: Lista paginada de CDRs do tenant
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok: {type: boolean}
                  page: {type: integer}
                  limit: {type: integer}
                  rows:
                    type: array
                    items: {type: object}
        400:
          description: Datas ausentes/invÃ¡lidas ou janela > 31 dias
        503:
          description: simplePbx desabilitado
  /int/simplepbx/recordings/{linkedid}/download:
    get:
      tags:
        - simplePbx
      summary: Download direto de gravaÃ§Ã£o por linkedid
      description: |
        Faz streaming proxy do bucket OCI do tenant. Internamente cria token de uso Ãºnico
        e usa pipeline com cancelamento. Sujeito a rate limit (6 req/60s/usuÃ¡rio).
      operationId: simplepbxRecordingDownload
      parameters:
        - in: path
          name: linkedid
          schema: {type: string}
          required: true
        - in: query
          name: apiKey
          schema: {type: string}
          required: true
      responses:
        200:
          description: Ãudio (geralmente WAV/MP3)
          content:
            audio/*:
              schema: {type: string, format: binary}
        400:
          description: linkedid invÃ¡lido
        404:
          description: GravaÃ§Ã£o nÃ£o encontrada
        429:
          description: Rate limit excedido
        503:
          description: simplePbx desabilitado
  /int/simplepbx/export/{recurso}:
    get:
      tags:
        - simplePbx
      summary: Export CSV/JSON de recursos PBX (sem campos sensÃ­veis)
      description: |
        Recursos suportados: extensions, trunks, inbound_routes, outbound_routes, ring_groups.
        Senhas SIP NUNCA aparecem aqui â€” para incluÃ­-las, use o endpoint sensitive (POST).
      operationId: simplepbxExport
      parameters:
        - in: path
          name: recurso
          schema: {type: string, enum: [extensions, trunks, inbound_routes, outbound_routes, ring_groups]}
          required: true
        - in: query
          name: apiKey
          schema: {type: string}
          required: true
        - in: query
          name: format
          schema: {type: string, enum: [csv, json], default: csv}
      responses:
        200:
          description: Arquivo CSV ou JSON
          content:
            text/csv:
              schema: {type: string}
            application/json:
              schema: {type: object}
        400:
          description: Recurso desconhecido
        503:
          description: simplePbx desabilitado
  /int/simplepbx/export/{recurso}/sensitive:
    post:
      tags:
        - simplePbx
      summary: Export sensÃ­vel (com senhas SIP) â€” exige confirmKeyword igual ao slug
      description: |
        Apenas para `trunks`. Body deve conter `confirmKeyword` exatamente igual ao slug
        do tenant (gate UX). Audit registrado ANTES do streaming. Cache-Control: no-store.
      operationId: simplepbxExportSensitive
      parameters:
        - in: path
          name: recurso
          schema: {type: string, enum: [trunks]}
          required: true
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey: {type: string}
                confirmKeyword: {type: string, description: Slug do tenant (digitaÃ§Ã£o obrigatÃ³ria)}
              required: [apiKey, confirmKeyword]
      responses:
        200:
          description: CSV com senhas SIP
          content:
            text/csv:
              schema: {type: string}
        400:
          description: confirmKeyword invÃ¡lido ou recurso nÃ£o suportado
        503:
          description: simplePbx desabilitado
  /int/simplepbx/import/{recurso}:
    post:
      tags:
        - simplePbx
      summary: Importa CSV/JSON para um recurso (com dryRun e validaÃ§Ã£o por regex)
      description: |
        Suporta dryRun=true para validar sem aplicar. Coluna iniciando com `tenant`
        Ã© rejeitada (TENANT_LEAK_BLOCKED). Limite de 1000 linhas. ValidaÃ§Ã£o por regex
        coluna-a-coluna; erros sÃ£o retornados linha-a-linha. Anti CSV-injection ativo.
      operationId: simplepbxImport
      parameters:
        - in: path
          name: recurso
          schema: {type: string, enum: [extensions, trunks, inbound_routes, outbound_routes, ring_groups]}
          required: true
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                apiKey: {type: string}
                format: {type: string, enum: [csv, json], default: csv}
                content: {type: string, description: ConteÃºdo do arquivo (CSV ou JSON serializado)}
                dryRun: {type: boolean, default: false}
              required: [apiKey, content]
      responses:
        200:
          description: Resultado da operaÃ§Ã£o (com errors[] linha-a-linha)
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok: {type: boolean}
                  total: {type: integer}
                  applied: {type: integer}
                  errors:
                    type: array
                    items:
                      type: object
                      properties:
                        line: {type: integer}
                        errors: {type: array, items: {type: object}}
        400:
          description: Coluna tenant detectada, mais de 1000 linhas, ou parse error
        503:
          description: simplePbx desabilitado
  /int/simplepbx/status:
    get:
      tags:
        - simplePbx
      summary: Estado canÃ´nico do PBX para integraÃ§Ã£o
      description: |
        Retorna o estado consolidado dos componentes simplePbx para apps clientes:
        AMI status, API status, derivaÃ§Ã£o `pbxStatus`, housekeeping next/running,
        slug, limites e flag de restart pendente.
      operationId: simplepbxStatus
      parameters:
        - in: query
          name: apiKey
          schema: {type: string}
          required: true
      responses:
        200:
          description: Estado canÃ´nico
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok: {type: boolean}
                  simplePbxEnabled: {type: boolean}
                  simplePbxPublicHost: {type: string}
                  pbxTenantId: {type: integer, nullable: true}
                  pbxTenantSlug: {type: string}
                  pbxLimits:
                    type: object
                    properties:
                      extensions: {type: integer}
                      extraQuotaGb: {type: integer}
                  pbxBootstrapError: {type: string, nullable: true}
                  pbxRestartRequired: {type: boolean}
                  pbxAmiStatus: {type: string, enum: [connected, disconnected, reconnecting]}
                  pbxApiStatus: {type: string, enum: [up, down, unknown]}
                  pbxStatus: {type: string, enum: [online, offline, degraded]}
                  pbxHousekeepNextRun: {type: integer, nullable: true}
                  pbxHousekeepRunning: {type: boolean}
components:
  schemas:
    ClientProfile:
      type: object
      properties:
        clientName:
          type: string
          description: Nome do cliente cadastrado no serviÃ§o de mensageria
        clientUsername:
          type: string
          description: Nome de usuÃ¡rio do cliente no serviÃ§o de mensageria
    ReturnMessage:
      type: object
      properties:
        message:
          type: string
          description: DescriÃ§Ã£o do retorno
    ContactObject:
      type: object
      properties:
        id:
          description: ID do contato
          type: integer
          format: int32
        name:
          description: Nome do contato
          type: string
          maxLength: 255
        document:
          description: NÃºmero do documento (CPF / CNPJ). Somente nÃºmeros.
          type: string
          maxLength: 40
        number:
          description: NÃºmero de telefone do contato
          type: string
          maxLength: 30
        facebook:
          description: Facebook do usuÃ¡rio
          type: string
          maxLength: 100
        instagram:
          description: Instagram do usuÃ¡rio
          type: string
          maxLength: 100
        email:
          description: EndereÃ§o de e-mail do contato
          type: string
          maxLength: 155
        address:
          description: EndereÃ§o do contato
          type: string
          maxLength: 255
        houseNumber:
          description: NÃºmero do imÃ³vel
          type: string
          maxLength: 10
        addressComp:
          description: Complemento do endereÃ§o
          type: string
          maxLength: 50
        neighborhood:
          description: Bairro do endereÃ§o
          type: string
        city:
          description: Cidade
          type: string
          maxLength: 100
        state:
          description: Estado
          type: string
          maxLength: 100
        country:
          type: string
          description: PaÃ­s
          maxLength: 50
        postalCode:
          description: CÃ³digo postal (CEP)
          type: string
          maxLength: 15
        free1:
          description: Campo livre 1.
          type: string
          maxLength: 100
        free2:
          description: Campo livre 2.
          type: string
          maxLength: 100
        tags:
          description: Mensagem prÃ© digitada que serÃ¡ exibida no campo de texto do atendimento para o agente quando este abrir o atendimento pela primeira vez.
          type: string
        fk_company:
          description: ID da empresa a qual o contato estÃ¡ vinculado
          type: integer
          format: int32
        preferredAgent:
          description: ID do primeiro agente preferencial, se houver
          type: integer
          format: int32
        preferredAgents:
          description: Lista com os IDs dos agentes preferenciais, na ordem em que aparecem
          type: array
          items:
            type: integer
    CompanyObject:
      type: object
      properties:
        id:
          description: ID
          type: integer
          format: int32
        name:
          description: Nome
          type: string
          maxLength: 255
        document:
          description: NÃºmero do documento (CNPJ). Somente nÃºmeros.
          type: string
          maxLength: 40
        number:
          description: NÃºmero de telefone
          type: string
          maxLength: 30
        facebook:
          description: Facebook
          type: string
          maxLength: 100
        instagram:
          description: Instagram
          type: string
          maxLength: 100
        email:
          description: EndereÃ§o de e-mail
          type: string
          maxLength: 155
        website:
          description: EndereÃ§o do website
          type: string
          maxLength: 155
        address:
          description: EndereÃ§o
          type: string
          maxLength: 255
        neighborhood:
          description: Bairro do endereÃ§o
          type: string
        city:
          description: Cidade
          type: string
          maxLength: 100
        state:
          description: Estado
          type: string
          maxLength: 100
        country:
          type: string
          description: PaÃ­s
          maxLength: 50
        zipcode:
          description: CÃ³digo postal (CEP)
          type: string
          maxLength: 15
    OpportunityObject:
      type: object
      properties:
        id:
          description: ID da oportunidade
          type: integer
          format: int32
        clientid:
          description: Clientid da oportunidade. Esse campo Ã© preenchido automaticamente utilizando o clientid do serviÃ§o de mensagaria quando a oportunidade Ã© criada no contexto de um atendimento.
          type: string
        title:
          description: TÃ­tulo
          type: string
        value:
          description: Valor da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 serÃ¡ enviado como 10050
          type: integer
          format: int32
        recurrentvalue:
          description: Valor recorrente da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 serÃ¡ enviado como 10050
          type: integer
          format: int32
        closevalue:
          description: Valor de fechamento da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 serÃ¡ enviado como 10050
          type: integer
          format: int32
        closerecurrentvalue:
          description: Valor recorrente de fechamento da oportunidade em formato inteiro, multiplado por 100. Exemplo, 100,50 serÃ¡ enviado como 10050
          type: integer
          format: int32
        order:
          description: Ordem da oportunidade no funil
          type: integer
          format: int32
        origin:
          description: ID da origem da oportunidade
          type: integer
          format: int32
        stagnated:
          description: Indica se a oportunidade estÃ¡ estagnada
          type: boolean
        formattedlocation:
          description: LocalizaÃ§Ã£o da oportunidade formatada
          type: string
        city:
          description: Cidade
          type: string
        state:
          description: Estado
          type: string
        country:
          description: PaÃ­s
          type: string
        countrycode:
          description: CÃ³digo ISO do paÃ­s da oportunidade (Ex. BR)
          type: string
        postalcode:
          description: CÃ³digo postal
          type: string
        locationtype:
          description: Tipo de localizaÃ§Ã£o
          type: string
        lat:
          description: Latitude da oportunidade
          type: number
          format: float
        lon:
          description: Longitude da oportunidade
          type: number
          format: float
        address1:
          description: Campo de endereÃ§o 1
          type: string
        address2:
          description: Campo de endereÃ§o 2
          type: string
        probability:
          description: Probabilidade de fechamento, de 0 a 100
          type: integer
          format: int32
        description:
          description: DescriÃ§Ã£o da oportunidade
          type: string
        fkPipeline:
          description: ID do funil onde a oportunidade estÃ¡
          type: integer
          format: int32
        fkStage:
          description: ID do estÃ¡gio onde a oportunidade estÃ¡
          type: integer
          format: int32
        mainphone:
          description: Telefone principal
          type: string
        mainmail:
          description: E-mail principal
          type: string
        expectedclosedate:
          description: Data esperada para fechamento, em formato ISO 8601. ApÃ³s essa data a oportunidade serÃ¡ considerada vencida.
          type: string
        status:
          description: Status da oportunidade. 0 para aberta, 1 para ganha, 2 para perdida
          type: integer
        stagebegintime:
          description: Timestamp do inÃ­cio do estÃ¡gio atual
          type: integer
          format: int32
        responsableid:
          description: ID do usuÃ¡rio que Ã© responsÃ¡vel pela oportunidade
          type: integer
          format: int32
        followers:
          description: Lista com os IDs dos usuÃ¡rios que sÃ£o seguidores da oportunidade
          type: array
          items:
            type: integer
        createdby:
          description: ID do usuÃ¡rio que criou a oportunidade
          type: integer
          format: int32
        closedby:
          description: ID do usuÃ¡rio que fechou a oportunidade
          type: integer
          format: int32
        closedat:
          description: Data de fechamento da oportunidade no formato ISO 8601
          type: string
        formsdata:
          description: Objeto com as informaÃ§Ãµes de formulÃ¡rios personalizados da oportunidade. A chave da propriedade Ã© o ID do campo no formulÃ¡rio personalizado, e o valor Ã© o valor do campo.
          type: object
        filesCount:
          description: Quantidade de arquivos associados Ã  oportunidade
          type: integer
          format: int32
        contactsCount:
          description: Quantidade de contatos associados Ã  oportunidade
          type: integer
          format: int32
        tasksCount:
          description: Quantidade de tarefas associadas Ã  oportunidade
          type: integer
          format: int32
        files:
          description: Lista com os IDs dos arquivos associados Ã  oportunidade
          type: array
          items:
            type: integer
        contacts:
          description: Lista com os IDs dos contatos associados Ã  oportunidade
          type: array
          items:
            type: integer
        tags:
          description: Lista com os IDs das etiquetas associadas Ã  oportunidade
          type: array
          items:
            type: integer
        fk_campaign:
          description: ID da campanha de disparo de mensagens que originou a oportunidade. Preenchido automaticamente quando a oportunidade Ã© criada no contexto de um atendimento que veio de uma campanha. 0 quando nÃ£o houver vinculaÃ§Ã£o.
          type: integer
          format: int32
        createdAt:
          description: Data de criaÃ§Ã£o da oportunidade no formato ISO 8601
          type: string
    ProductObject:
      type: object
      properties:
        id:
          description: ID do produto
          type: integer
          format: int32
        name:
          description: Nome do produto
          type: string
          maxLength: 255
        description:
          description: DescriÃ§Ã£o do produto
          type: string
          maxLength: 65535
        url:
          description: URL para pÃ¡gina do produto
          type: string
          maxLength: 2048
        internalcode:
          description: ReferÃªncia interna do produto
          type: string
          maxLength: 255
        gtin:
          description: GTIN do produto
          type: string
          maxLength: 15
        value:
          description: PreÃ§o do produto em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
          type: integer
          format: int32
        recurrentvalue:
          description: PreÃ§o recorrente do produto em formato inteiro, multiplado por 100. Exemplo, 100,50 deve ser enviado como 10050
          type: integer
          format: int32
        maxdiscount:
          description: Desconto mÃ¡ximo, em percentual, permitido ao agente a dar no produto. Deve ser enviado em formato inteiro, multiplado por 100. Exemplo, 20,5% deve ser enviado como 2050
          type: integer
          format: int32
        commission:
          description: ComissÃ£o de vendas, em percentual, concedida ao agente ao vender o produto. Deve ser enviado em formato inteiro, multiplado por 100. Exemplo, 20,5% deve ser enviado como 2050
          type: integer
          format: int32
        hiddenfromclients:
          description: Se 1, o produto nÃ£o serÃ¡ exibido aos clientes nos catÃ¡logos dos serviÃ§os de mensageria.
          type: integer
          format: int8
        addtoqueues:
          description: Se 1, o produto serÃ¡ automaticamente cadastrado nos catÃ¡logos dos serviÃ§os de mensageria das filas selecionadas, quando disponÃ­vel.
          type: integer
          format: int8
        associatedforms:
          description: Lista com os IDs dos formulÃ¡rios personalizados associados a esse produto.
          type: array
          items:
            type: integer
        queues:
          description: Lista com os IDs das filas nas quais esse produto estarÃ¡ disponÃ­vel
          type: array
          items:
            type: integer
        files:
          description: Lista com os IDs dos arquivos associados a esse produto
          type: array
          items:
            $ref: '#/components/schemas/ResumedFile'
        photos:
          description: Lista com os IDs das imagens da galeria desse produto
          type: array
          items:
            type: integer
        groups:
          description: Lista com os IDs dos grupos de produtos aos quais esse produto pertence
          type: array
          items:
            type: integer
        measurementunit:
          description: Unidade de medida do produto (ex. un, kg, m)
          type: string
          maxLength: 10
        available:
          description: Se 1, o produto estÃ¡ disponÃ­vel. Se 0, estÃ¡ indisponÃ­vel.
          type: integer
          format: int8
        currency:
          description: CÃ³digo da moeda (ISO 4217) para o preÃ§o do produto (ex. BRL, USD)
          type: string
          maxLength: 4
        condition:
          description: CondiÃ§Ã£o do produto (new, refurbished, used)
          type: string
          enum: [new, refurbished, used]
        brand:
          description: Marca do produto
          type: string
          maxLength: 100
        saleprice:
          description: PreÃ§o promocional do produto em formato inteiro, multiplicado por 100. Exemplo, 100,50 deve ser enviado como 10050
          type: integer
          format: int32
        status:
          description: Status do produto (active, archived)
          type: string
          enum: [active, archived]
        gender:
          description: GÃªnero alvo do produto (female, male, unisex)
          type: string
          enum: [female, male, unisex]
        size:
          description: Tamanho do produto
          type: string
          maxLength: 200
        agegroup:
          description: Faixa etÃ¡ria alvo do produto
          type: string
          enum: [adult, all ages, teen, kids, toddler, infant, newborn]
        mpn:
          description: NÃºmero de peÃ§a do fabricante (Manufacturer Part Number)
          type: string
          maxLength: 100
        createdby:
          description: ID do usuÃ¡rio que cadastrou o produto
          type: integer
    ChatObject:
      type: object
      properties:
        chatId:
          type: integer
          format: int32
          description: ID do atendimento
        clientId:
          type: string
          description: ID do cliente no serviÃ§o de mensageria
        clientName:
          type: string
          description: Nome do cliente, se disponÃ­vel
        clientEmail:
          type: string
          description: E-mail do cliente, se disponÃ­vel
        clientUsername:
          type: string
          description: Nome do usuÃ¡rio do cliente no serviÃ§o de mensageria, se disponÃ­vel
        clientNumber:
          type: string
          description: NÃºmero de telefone do cliente, se disponÃ­vel
        markerId:
          type: integer
          description: ID da etiqueta
        protocol:
          type: string
          description: Protocolo do atendimento
        beginTime:
          type: integer
          description: Timestamp do inÃ­cio do atendimento
        endTime:
          type: integer
          description: Timestamp do encerramento do atendimento. SerÃ¡ 0 se o atendimento ainda nÃ£o tiver sido encerrado.
        status:
          type: integer
          description: Estado do atendimento, 1 se aberto, 0 se fechado
        userId:
          type: integer
          description: ID do usuÃ¡rio com o atendimento. 0 se o atendimento estiver aguardando na fila.
        firstMsgTime:
          type: integer
          description: Timestamp da primeira mensagem recebida.
        lastSendMsgTime:
          type: integer
          description: Timestamp da Ãºltima mensagem enviada.
        lastRcvMsgTime:
          type: integer
          description: Timestamp da Ãºltima mensagem recebida.
        closeUserId:
          type: integer
          description: ID do usuÃ¡rio que encerrou o chat. 0 se o chat ainda nÃ£o tiver sido encerrado.
        endReason:
          type: string
          description: Motivo do encerramento.
        endReasonObs:
          type: string
          description: ObservaÃ§Ã£o do encerramento.
        responded:
          type: boolean
          description: Se o atendimento jÃ¡ foi respondido.
        userResponded:
          type: boolean
          description: Se o atendimento jÃ¡ foi respondido por algum agente.
        onIvr:
          type: boolean
          description: Se o atendimento estÃ¡ na URA
        locked:
          type: boolean
          description: Se o atendimento estÃ¡ bloqueado para algum usuÃ¡rio.
        lockUserId:
          type: integer
          description: ID do usuÃ¡rio para o qual o atendimento estÃ¡ bloqueado. SÃ³ Ã© vÃ¡lido caso locked for true.
        lockDuration:
          type: integer
          description: DuraÃ§Ã£o do bloqueio do atendimento, em segundos.
        lockTime:
          type: integer
          description: Timestamp em que o atendimento foi bloqueado.
        lockEnd:
          type: integer
          description: Timestamp de quando o atendimento serÃ¡ desbloqueado.
        firstResponseTime:
          type: integer
          description: Timestamp do horÃ¡rio da primeira resposta enviada no atendimento.
        distributionFilter:
          type: array
          description: Filtros aplicados ao atendimento. O atendimento sÃ³ serÃ¡ distribuÃ­do pela fila para agentes que possuÃ­rem pelo menos um dos filtros.
          items:
            type: string
        firstResponseUserId:
          type: integer
          description: ID do usuÃ¡rio que enviou a primeira resposta
        onQueue:
          type: boolean
          description: true se o atendimento estiver aguardando na fila
        fkCampaign:
          type: integer
          format: int32
          description: ID da campanha de disparo de mensagens que originou o atendimento. 0 quando o atendimento nÃ£o tiver sido originado por uma campanha.
    ResumedChatObject:
      type: object
      properties:
        chatId:
          type: integer
          format: int32
          description: ID do atendimento
        queueId:
          type: integer
          format: int32
          description: ID da fila do atendimento
        clientId:
          type: string
          description: ID do cliente no serviÃ§o de mensageria
        clientName:
          type: string
          description: Nome do cliente, se disponÃ­vel
        clientEmail:
          type: string
          description: E-mail do cliente, se disponÃ­vel
        clientUsername:
          type: string
          description: Nome do usuÃ¡rio do cliente no serviÃ§o de mensageria, se disponÃ­vel
        clientNumber:
          type: string
          description: NÃºmero de telefone do cliente, se disponÃ­vel
        markerId:
          type: integer
          description: ID da etiqueta
        protocol:
          type: string
          description: Protocolo do atendimento
        beginTime:
          type: integer
          description: Timestamp do inÃ­cio do atendimento
        endTime:
          type: integer
          description: Timestamp do encerramento do atendimento. SerÃ¡ 0 se o atendimento ainda nÃ£o tiver sido encerrado.
        status:
          type: integer
          description: Estado do atendimento, 1 se aberto, 0 se fechado
        userId:
          type: integer
          description: ID do usuÃ¡rio com o atendimento. 0 se o atendimento estiver aguardando na fila.
        closeUserId:
          type: integer
          description: ID do usuÃ¡rio que encerrou o chat. 0 se o chat ainda nÃ£o tiver sido encerrado.
        endReason:
          type: string
          description: Motivo do encerramento.
        endReasonObs:
          type: string
          description: ObservaÃ§Ã£o do encerramento.
        responded:
          type: boolean
          description: Se o atendimento jÃ¡ foi respondido.
        userResponded:
          type: boolean
          description: Se o atendimento jÃ¡ foi respondido por algum agente.
        distributionFilter:
          type: array
          description: Filtros aplicados ao atendimento. O atendimento sÃ³ serÃ¡ distribuÃ­do pela fila para agentes que possuÃ­rem pelo menos um dos filtros.
          items:
            type: string
        firstResponseUserId:
          type: integer
          description: ID do usuÃ¡rio que enviou a primeira resposta
        fkCampaign:
          type: integer
          format: int32
          description: ID da campanha de disparo de mensagens que originou o atendimento. 0 quando o atendimento nÃ£o tiver sido originado por uma campanha.
    HookConfig:
      type: object
      properties:
        url:
          type: string
          description: URL da requisiÃ§Ã£o
        method:
          type: string
          description: MÃ©todo da requisiÃ§Ã£o. Pode ser "get", "post", "put", "patch" ou "delete"
        dataType:
          type: string
          description: Formato que serÃ¡ utilizado para envio dos dados. Pode ser "json" ou "urlencoded".
        data:
          type: object
          description: (Opcional) Objeto com os dados da requisiÃ§Ã£o. Se nÃ£o enviado, os dados padrÃ£o do hook serÃ£o utilizados.
        headers:
          type: object
          description: (Opcional) Objeto com os cabeÃ§alhos da requisiÃ§Ã£o.
    File:
      type: object
      properties:
        fileName:
          type: string
          description: Nome do arquivo
          example: foto.png
        mimeType:
          type: string
          description: Mimetype do arquivo
          example: image/png
        data:
          type: string
          format: byte
          description: ConteÃºdo do arquivo, codificado em base64
        waveform:
          type: array
          description: Lista com 64 itens inteiros entre 0 e 255, representando a forma de onda do Ã¡udio
          items:
            maxItems: 64
            minItems: 64
            type: integer
            maximum: 255
            minimum: 0
        thumbnail:
          type: string
          format: byte
          description: Thumbnail do arquivo, codificado em base64
        width:
          type: integer
          format: int32
          description: Largura. ObrigatÃ³rio se o arquivo for vÃ­deo ou foto
          example: 56
        height:
          type: integer
          format: int32
          description: Altura. ObrigatÃ³rio se o arquivo for vÃ­deo ou foto
          example: 56
        duration:
          type: integer
          format: int32
          description: DuraÃ§Ã£o da mÃ­dia em segundos. ObrigatÃ³rio se o arquivo for Ã¡udio ou vÃ­deo
          example: 0
        saveToGallery:
          type: boolean
          description: Se true, o arquivo serÃ¡ salvo na galeria do sistema. Para o salvamento ocorrer, a propriedade title deve ser informada.
        title:
          type: string
          description: TÃ­tulo do arquivo na galeria caso saveToGallery seja true.
    ResumedFile:
      type: object
      properties:
        id:
          type: integer
          description: ID do arquivo
        name:
          type: string
          description: Nome do arquivo
          example: foto.png
        mimetype:
          type: string
          description: Mimetype do arquivo
          example: image/png
        auth:
          type: string
          description: Chave de autenticaÃ§Ã£o para acesso ao arquivo
    TicketObject:
      type: object
      properties:
        id:
          type: integer
          format: int32
          description: ID do ticket
        number:
          type: string
          description: NÃºmero do ticket (ex. TK-20260311-00001)
        uuid:
          type: string
          description: UUID Ãºnico do ticket
        subject:
          type: string
          description: Assunto do ticket
        description:
          type: string
          description: DescriÃ§Ã£o do ticket
        status:
          type: integer
          format: int32
          description: "Status do ticket: 1=Aberto, 2=Em Atendimento, 3=Aguardando Cliente, 4=Resolvido, 5=Fechado"
        priority:
          type: integer
          format: int32
          description: "Prioridade: 1=Muito Alta, 2=Alta, 3=MÃ©dia, 4=Baixa, 5=Muito Baixa"
        channel:
          type: integer
          format: int32
          description: Canal de origem do ticket
        classification_id:
          type: integer
          format: int32
          description: ID da classificaÃ§Ã£o
        reason_id:
          type: integer
          format: int32
          description: ID do motivo
        sub_reason_id:
          type: integer
          format: int32
          description: ID do submotivo
        queue_id:
          type: integer
          format: int32
          description: ID da fila de tickets
        user_id:
          type: integer
          format: int32
          description: ID do agente atribuÃ­do
        distributed_at:
          type: string
          format: date-time
          description: Data/hora da distribuiÃ§Ã£o ao agente
        first_response_at:
          type: string
          format: date-time
          description: Data/hora da primeira resposta
        first_response_deadline:
          type: string
          format: date-time
          description: Prazo para primeira resposta
        resolved_at:
          type: string
          format: date-time
          description: Data/hora da resoluÃ§Ã£o
        stage_id:
          type: integer
          format: int32
          description: ID do estÃ¡gio atual do ticket (configurÃ¡vel por fluxo). null se o ticket nÃ£o estiver em um estÃ¡gio.
        stage_name:
          type: string
          description: Nome do estÃ¡gio atual do ticket, resolvido a partir do stage_id. Como o estÃ¡gio Ã© configurÃ¡vel (diferente do status, que Ã© fixo), o nome Ã© retornado junto. null se nÃ£o houver estÃ¡gio.
        stage_color:
          type: string
          description: Cor configurada para o estÃ¡gio atual (ex. hexadecimal), resolvida a partir do stage_id. Permite seguir a configuraÃ§Ã£o visual do estÃ¡gio. null se nÃ£o houver estÃ¡gio ou cor configurada.
        sla_deadline:
          type: string
          format: date-time
          description: Prazo de SLA para resoluÃ§Ã£o
        is_sla_met:
          type: integer
          format: int32
          description: "Status do SLA: null=Pendente, 0=Violado, 1=Cumprido"
        created_at:
          type: string
          format: date-time
          description: Data/hora de criaÃ§Ã£o
        updated_at:
          type: string
          format: date-time
          description: Data/hora da Ãºltima atualizaÃ§Ã£o
    TicketContactObject:
      type: object
      properties:
        id:
          type: integer
          format: int32
          description: ID do contato
        name:
          type: string
          description: Nome do contato
        email:
          type: string
          description: E-mail do contato
        number:
          type: string
          description: NÃºmero de telefone do contato
        document:
          type: string
          description: Documento do contato (CPF/CNPJ)
        city:
          type: string
          description: Cidade do contato
        state:
          type: string
          description: Estado do contato
        country:
          type: string
          description: PaÃ­s do contato
    TicketAttachmentObject:
      type: object
      properties:
        id:
          type: integer
          format: int32
          description: ID do arquivo
        filename:
          type: string
          description: Nome do arquivo
        mimetype:
          type: string
          description: Tipo MIME do arquivo
        width:
          type: integer
          format: int32
          description: Largura em pixels (se aplicÃ¡vel)
        height:
          type: integer
          format: int32
          description: Altura em pixels (se aplicÃ¡vel)
        duration:
          type: integer
          format: int32
          description: DuraÃ§Ã£o em segundos (se aplicÃ¡vel)
        created_at:
          type: string
          format: date-time
          description: Data/hora de criaÃ§Ã£o
    TicketCommentObject:
      type: object
      properties:
        id:
          type: integer
          format: int32
          description: ID do comentÃ¡rio
        ticket_id:
          type: integer
          format: int32
          description: ID do ticket
        content:
          type: string
          description: ConteÃºdo do comentÃ¡rio
        type:
          type: string
          description: "Tipo: external (pÃºblico), internal (interno) ou client (cliente)"
          enum: [external, internal, client]
        author:
          type: string
          description: Nome do autor do comentÃ¡rio
        created_at:
          type: string
          format: date-time
          description: Data/hora de criaÃ§Ã£o
    TicketHistoryObject:
      type: object
      properties:
        id:
          type: integer
          format: int32
          description: ID do registro de histÃ³rico
        ticket_id:
          type: integer
          format: int32
          description: ID do ticket
        user_id:
          type: integer
          format: int32
          nullable: true
          description: ID do usuÃ¡rio que executou a aÃ§Ã£o (null quando aÃ§Ã£o do sistema)
        author:
          type: string
          description: "Autor da aÃ§Ã£o: 'Agente #<id>' ou 'Sistema'"
        action:
          type: integer
          format: int32
          description: "CÃ³digo da aÃ§Ã£o: 1=Criado, 2=Agente alterado, 3=Transferido, 4=Escalado, 5=Status alterado, 6=Resolvido, 7=Reaberto, 8=EstÃ¡gio alterado"
        actionLabel:
          type: string
          description: DescriÃ§Ã£o legÃ­vel do cÃ³digo da aÃ§Ã£o
        description:
          type: string
          nullable: true
          description: DescriÃ§Ã£o da aÃ§Ã£o
        old_value:
          type: string
          nullable: true
          description: Valor anterior (quando aplicÃ¡vel)
        new_value:
          type: string
          nullable: true
          description: Novo valor (quando aplicÃ¡vel)
        action_at:
          type: string
          format: date-time
          description: Data/hora em que a aÃ§Ã£o ocorreu
