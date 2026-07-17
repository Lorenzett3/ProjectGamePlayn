# GamePlayn

> MVP acadêmico de uma rede social voltada para jogadores, desenvolvida como projeto da disciplina **Projeto de Desenvolvimento II**.

O **GamePlayn** é uma aplicação web inspirada em fóruns e comunidades de jogos, criada com o objetivo de centralizar discussões sobre títulos específicos em um único ambiente.

Diferente de redes sociais generalistas, onde o conteúdo fica disperso entre grupos, páginas e servidores, o GamePlayn organiza toda a interação por jogo, permitindo que jogadores encontrem rapidamente recomendações, opiniões, dicas, curiosidades e discussões relacionadas aos seus títulos favoritos.

O feed é público para leitura: visitantes conseguem navegar, pesquisar e abrir posts. Para publicar, curtir, comentar, editar perfil ou acessar recursos administrativos, o usuário é levado para a tela de login/cadastro.

---

# ✨ Principais funcionalidades

## Autenticação

* Login de usuários
* Cadastro de novos usuários
* Controle de permissões
* Perfis de jogador e administrador

---

## Publicações

* Criar posts
* Anexar uma imagem por post
* Excluir posts
* Curtir posts
* Fixar posts
* Feed geral
* Feed por jogo

---

## Comentários

* Criar comentários
* Curtir comentários
* Excluir comentários

---

## Pesquisa

Busca por:

* Jogos
* Posts
* Usuários
* Gêneros
* Plataformas

---

## Perfil do usuário

* Avatar visual
* Biografia editável
* Histórico de publicações

---

## Interface

* Tema claro
* Tema escuro
* Layout responsivo
* Barra lateral com posts recentes

---

## Painel administrativo

Administradores podem:

* Promover usuários a administradores
* Gerenciar usuários
* Gerenciar jogos
* Gerenciar tópicos
* Gerenciar posts
* Gerenciar comentários

---

# Arquitetura

O projeto foi desenvolvido seguindo uma arquitetura simples de cliente-servidor.

```text
React (Frontend)
        │
        │ HTTP
        ▼
Node.js (API)
        │
        ▼
SQLite local / PostgreSQL
```

Em desenvolvimento local, a persistência principal é realizada em **SQLite**, um banco relacional salvo no arquivo `data/gameplayn.sqlite`, sem depender de Docker ou virtualização. Para produção ou hospedagem web, a mesma API também suporta **PostgreSQL** via `DATABASE_URL`. O arquivo `data/db.json` permanece apenas como seed inicial: quando o banco está vazio, a API importa esses dados para as tabelas.

---

# Tecnologias utilizadas

| Tecnologia      | Finalidade                              |
| --------------- | --------------------------------------- |
| React 19        | Interface da aplicação                  |
| Vite 7          | Ambiente de desenvolvimento e build     |
| SCSS            | Organização e modularização dos estilos |
| Node.js         | Servidor HTTP e API                     |
| JavaScript ES6+ | Lógica da aplicação                     |
| SQLite          | Banco relacional local sem Docker       |
| PostgreSQL      | Banco relacional para produção/web      |
| JSON            | Seed inicial de demonstração            |

---

# Estrutura do projeto

```text
.
├── data/
│   └── db.json
│
├── src/
│   ├── api/
│   ├── components/
│   ├── data/
│   ├── styles/
│   ├── App.jsx
│   ├── main.jsx
│   └── utils.js
│
├── index.html
├── database.js
├── database-sqlite.js
├── docker-compose.yml
├── package.json
├── server.js
└── vite.config.js
```

---

# Como executar

## Pré-requisitos

* Node.js 22 ou superior
* npm
* PostgreSQL ou Docker Desktop apenas se quiser testar a opção PostgreSQL

---

## Instalação

```bash
npm install
```

---

## Configuração do banco

### Opção 1: SQLite local sem Docker

Esta é a opção recomendada para rodar no seu PC. Não precisa Docker, WSL, virtualização nem PostgreSQL instalado.

Inicie a API:

```bash
npm run api
```

O backend cria automaticamente o arquivo:

```text
data/gameplayn.sqlite
```

Esse arquivo é o banco real da aplicação local. Ele mantém usuários, posts, curtidas, comentários, jogos e imagens mesmo depois de fechar o terminal.

Para apagar os dados locais e voltar ao seed inicial, feche a API e delete:

```text
data/gameplayn.sqlite
```

Na próxima inicialização, o backend recria o banco usando `data/db.json` como seed.

### Opção 2: PostgreSQL com Docker

Suba o banco em container:

```bash
docker compose up -d postgres
```

Copie o arquivo de exemplo de variáveis:

```bash
copy .env.example .env
```

No PowerShell, também é possível:

```powershell
Copy-Item .env.example .env
```

Depois inicie a API:

```bash
npm run api:postgres
```

O Docker Compose cria um volume chamado `gameplayn_postgres_data`, então os dados continuam salvos mesmo se o container for parado.

Para parar o banco:

```bash
docker compose down
```

Para apagar o banco e seus dados:

```bash
docker compose down -v
```

### Opção 3: PostgreSQL instalado localmente

Crie um banco PostgreSQL para a aplicação:

```sql
CREATE DATABASE gameplayn;
```

A API aceita uma URL completa:

```bash
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/gameplayn
```

No PowerShell:

```powershell
$env:DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/gameplayn"
npm run api:postgres
```

Ou variáveis separadas:

```bash
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=gameplayn
PGUSER=postgres
PGPASSWORD=postgres
```

Se nenhuma variável for informada, o backend tenta usar:

```text
postgres://postgres:postgres@127.0.0.1:5432/gameplayn
```

Na primeira execução, o servidor cria as tabelas automaticamente e importa os dados de `data/db.json` se a tabela de usuários estiver vazia.

### Produção ou hospedagem web

Em produção, o ideal é não usar o banco dentro do mesmo servidor da aplicação. A arquitetura recomendada é:

```text
React build + Node API
        │
        │ DATABASE_URL
        ▼
PostgreSQL gerenciado
```

Exemplos de serviços que oferecem PostgreSQL gerenciado são Supabase, Neon, Render, Railway, Aiven, AWS RDS, Google Cloud SQL e Azure Database for PostgreSQL.

Nesse cenário, a aplicação continua igual. A única diferença é configurar a variável `DATABASE_URL` no painel da hospedagem com a URL fornecida pelo provedor do banco.

Para explicar tecnicamente: o `data/db.json` deixou de ser o banco da aplicação e passou a ser apenas uma carga inicial. No seu ambiente local, os dados reais ficam em tabelas relacionais no SQLite. Em produção, os mesmos dados podem ficar em tabelas relacionais no PostgreSQL, com chaves primárias, chaves estrangeiras e armazenamento gerenciado na nuvem.

---

## Ambiente de desenvolvimento

Inicie a API:

```bash
npm run api
```

Em outro terminal:

```bash
npm run dev
```

Acesse:

```text
http://127.0.0.1:5173
```

---

## Produção

Gerar build:

```bash
npm run build
```

Executar servidor local com SQLite:

```bash
npm start
```

Acesse:

```text
http://127.0.0.1:3000
```

Para uma hospedagem com PostgreSQL gerenciado, configure `DATABASE_URL` e use:

```bash
npm run api:postgres
```

---

# Testes

Rodar testes automatizados de backend e banco:

```bash
npm test
```

Rodar separadamente:

```bash
npm run test:backend
npm run test:database
npm run test:front
```

O teste de frontend executa o build do Vite, garantindo que a interface compila sem alterar layout ou estilos. Os testes de backend validam rotas, autenticação, permissões, posts, comentários e curtidas. Os testes de banco validam tanto o PostgreSQL em memória usado nos testes quanto a persistência real em arquivo SQLite.

---

# Usuários para demonstração

| Perfil        | Usuário    | Senha     |
| ------------- | ---------- | --------- |
| Administrador | lorenzo    | lorenzoadmin |
| Jogador       | admin      | admin123  |
| Jogador       | marina     | marina123 |
| Jogador       | rafa       | rafa123   |
| Jogador       | diego      | diego123  |
| Jogador       | camila     | camila123 |

---

# Principais endpoints

| Método | Endpoint                                  | Descrição             |
| ------ | ----------------------------------------- | --------------------- |
| POST   | `/api/login`                              | Autentica usuário     |
| POST   | `/api/register`                           | Cria conta de usuário |
| GET    | `/api/session`                            | Retorna sessão atual  |
| GET    | `/api/games`                              | Lista jogos           |
| POST   | `/api/games`                              | Cria jogo             |
| PATCH  | `/api/games/:id/pin`                      | Fixa/desfixa jogo     |
| PATCH  | `/api/games/:id`                          | Atualiza jogo         |
| DELETE | `/api/games/:id`                          | Remove jogo           |
| GET    | `/api/posts`                              | Lista posts           |
| POST   | `/api/posts`                              | Cria post             |
| PATCH  | `/api/posts/:id/pin`                      | Fixa/desfixa post     |
| DELETE | `/api/posts/:id`                          | Remove post           |
| POST   | `/api/posts/:id/like`                     | Curtida em post       |
| POST   | `/api/posts/:id/comments`                 | Adiciona comentário   |
| POST   | `/api/posts/:id/comments/:commentId/like` | Curtida em comentário |
| DELETE | `/api/posts/:id/comments/:commentId`      | Remove comentário     |
| PATCH  | `/api/users/me`                           | Atualiza perfil       |
| GET    | `/api/users`                              | Lista usuários admin  |
| PATCH  | `/api/users/:id`                          | Atualiza usuário      |
| DELETE | `/api/users/:id`                          | Remove usuário        |

---

# Persistência de dados

A aplicação utiliza **SQLite local** por padrão para armazenar usuários, jogos, posts, comentários, curtidas e demais informações.

As tabelas são criadas automaticamente pelo backend em `database-sqlite.js`. O arquivo **`data/db.json`** é usado somente como seed inicial para popular um banco vazio durante a primeira execução.

Imagens anexadas aos posts são salvas junto do registro do post em formato data URL. O upload aceita uma imagem por post, nos formatos PNG, JPG, WEBP ou GIF, com limite de 2 MB.

Permissões são definidas pela conta do usuário. O seed inicial deixa apenas `lorenzo` como administrador; outros usuários começam como jogadores comuns. Um administrador pode promover outro usuário pelo painel administrativo.

O adaptador PostgreSQL continua disponível em `database.js` para ambientes de produção ou hospedagem web.

---

# Guia para apresentacao tecnica

Esta secao serve como roteiro para explicar o projeto em avaliacao.

## Visao geral do fluxo

```text
Usuario no navegador
        |
        | interage com React
        v
src/App.jsx
        |
        | chama src/api/client.js
        v
server.js (API Node)
        |
        | usa adaptador de banco
        v
database-sqlite.js -> data/gameplayn.sqlite
```

O frontend nunca acessa o banco diretamente. Ele chama endpoints HTTP da API. A API valida login, permissao, dados recebidos e grava no banco.

## Frontend

| Funcao | Arquivos principais | Como explicar |
| ------ | ------------------- | ------------- |
| Entrada da aplicacao | `src/main.jsx`, `src/App.jsx` | `main.jsx` monta o React no HTML. `App.jsx` controla estado global, usuario logado, feed, tema, busca, tela atual e chamadas para a API. |
| Comunicacao com backend | `src/api/client.js` | Centraliza as requisicoes `fetch`, envia `Authorization: Bearer <token>` quando existe usuario logado e transforma erros da API em mensagens. |
| Login e cadastro | `src/components/LoginPage.jsx`, `src/App.jsx` | A tela envia usuario/senha ou dados de cadastro. `App.jsx` chama `/api/login` ou `/api/register`, guarda o token no `localStorage` e atualiza a sessao. |
| Feed publico | `src/App.jsx`, `src/components/FeedHeader.jsx`, `src/components/PostCard.jsx` | Visitantes podem ler posts sem conta. O feed vem de `GET /api/posts` e `GET /api/games`. |
| Criacao de posts | `src/components/Composer.jsx`, `src/App.jsx` | O compositor envia topico, titulo, conteudo e imagem opcional para `POST /api/posts`. Sem login, o app mostra aviso e leva para login/cadastro. |
| Upload de imagem | `src/components/Composer.jsx`, `server.js` | O frontend aceita uma imagem do PC, valida tipo/tamanho e converte para data URL. O backend valida de novo antes de salvar. |
| Comentarios e curtidas | `src/components/PostPage.jsx`, `src/components/PostCard.jsx`, `src/App.jsx` | As acoes chamam endpoints de like/comentario. Sem login, aparece feedback pedindo login. |
| Perfil | `src/components/ProfilePage.jsx`, `src/components/ProfilePanel.jsx`, `src/App.jsx` | Mostra dados do usuario e posts dele. O dono do perfil pode editar a bio via `PATCH /api/users/me`. |
| Painel admin | `src/components/AdminPanel.jsx`, `src/App.jsx` | Apenas usuarios `admin` acessam. Permite gerenciar topicos, usuarios e alterar privilegio `user/admin`. |
| Busca | `src/components/SearchBox.jsx`, `src/App.jsx` | A busca filtra jogos, posts e usuarios carregados no frontend, mostrando sugestoes clicaveis. |
| Feedback visual | `src/App.jsx`, `src/styles/components/_feedback.scss` | Mensagens de sucesso, erro e login obrigatorio aparecem como aviso visual sem quebrar o fluxo. |
| Layout e estilos | `src/styles/main.scss`, `src/styles/components/*`, `src/styles/layout/*` | SCSS separado por componente: feed, login, admin, perfil, sidebar, formularios e feedback. |

## Backend

| Funcao | Arquivo | Como explicar |
| ------ | ------- | ------------- |
| Servidor HTTP | `server.js` | Cria o servidor Node, separa rotas `/api/*` dos arquivos estaticos e inicia em `127.0.0.1:3000`. |
| Escolha do banco | `server.js` | `createAppDatabase()` escolhe SQLite, PostgreSQL ou banco em memoria conforme variaveis de ambiente/scripts. |
| Login | `server.js` | `POST /api/login` compara usuario e senha, retorna token simples baseado no id do usuario e nunca devolve a senha. |
| Cadastro | `server.js` | `POST /api/register` valida nome, usuario, senha, duplicidade e cria conta sempre como `user`. |
| Sessao | `server.js` | `GET /api/session` usa o token recebido no header para recuperar o usuario logado. |
| Autorizacao | `server.js` | `requireAuth()` bloqueia quem nao esta logado. `requireAdmin()` bloqueia quem nao tem `role: "admin"`. |
| Posts | `server.js` | Endpoints criam, listam, curtem, fixam e excluem posts. Tambem hidratam post com autor, jogo, curtidas e comentarios. |
| Comentarios | `server.js` | Endpoints criam, curtem e excluem comentarios, respeitando dono do comentario, dono do post ou admin. |
| Topicos/jogos | `server.js` | Endpoints listam jogos publicamente, mas criacao/edicao/exclusao dependem de admin. |
| Usuarios/admin | `server.js` | `GET /api/users`, `PATCH /api/users/:id` e `DELETE /api/users/:id` sao rotas administrativas. |
| Imagens | `server.js` | `normalizeImageData()` valida data URL, MIME type e limite de 2 MB antes de salvar. |
| Arquivos estaticos | `server.js` | Em build de producao, serve a pasta `dist/` gerada pelo Vite. |

## Banco de dados

| Item | Arquivo | Como explicar |
| ---- | ------- | ------------- |
| Banco real local | `data/gameplayn.sqlite` | Banco SQLite persistente. E arquivo binario, por isso nao abre como texto no VS Code. Deve ser visto com SQLite Viewer ou DB Browser for SQLite. |
| Adaptador SQLite | `database-sqlite.js` | Cria tabelas, le dados do SQLite, grava dados em transacao e importa seed quando o banco esta vazio. |
| Seed inicial | `data/db.json` | Nao e o banco em tempo real. Serve apenas para popular um banco vazio na primeira execucao. |
| Adaptador PostgreSQL | `database.js` | Mesma interface do SQLite, mas usando PostgreSQL. Serve para Docker, banco local instalado ou hospedagem web via `DATABASE_URL`. |
| Docker opcional | `docker-compose.yml` | Opcao para subir PostgreSQL em container em computadores com virtualizacao. No seu PC, o caminho usado e SQLite. |
| Dados de demonstracao | `scripts/enrich-demo-data.js` | Preenche seed e SQLite com usuarios, topicos e posts variados sem duplicar registros. |

Tabelas criadas no SQLite:

```text
users
games
posts
post_likes
comments
comment_likes
```

Relacionamentos principais:

```text
posts.user_id      -> users.id
posts.game_id      -> games.id
comments.post_id   -> posts.id
comments.user_id   -> users.id
post_likes.user_id -> users.id
post_likes.post_id -> posts.id
```

## Funcoes e arquivos por recurso

| Recurso | Frontend | Backend | Banco |
| ------- | -------- | ------- | ----- |
| Login | `LoginPage.jsx`, `App.jsx` | `server.js` -> `/api/login` | `users` |
| Cadastro | `LoginPage.jsx`, `App.jsx` | `server.js` -> `/api/register` | `users` |
| Feed | `App.jsx`, `FeedHeader.jsx`, `PostCard.jsx` | `server.js` -> `GET /api/posts`, `GET /api/games` | `posts`, `games`, `users`, `comments` |
| Criar post | `Composer.jsx`, `App.jsx` | `server.js` -> `POST /api/posts` | `posts` |
| Imagem no post | `Composer.jsx` | `server.js` -> `normalizeImageData()` | `posts.image_data` |
| Curtir post | `PostCard.jsx`, `PostPage.jsx`, `App.jsx` | `server.js` -> `/api/posts/:id/like` | `post_likes` |
| Comentar | `PostPage.jsx`, `App.jsx` | `server.js` -> `/api/posts/:id/comments` | `comments` |
| Curtir comentario | `PostPage.jsx`, `App.jsx` | `server.js` -> `/api/posts/:id/comments/:commentId/like` | `comment_likes` |
| Perfil | `ProfilePage.jsx`, `ProfilePanel.jsx` | `server.js` -> `/api/users/me` | `users.bio` |
| Admin usuarios | `AdminPanel.jsx`, `App.jsx` | `server.js` -> `/api/users` e `/api/users/:id` | `users.role` |
| Admin topicos | `AdminPanel.jsx`, `App.jsx` | `server.js` -> `/api/games` e `/api/games/:id` | `games` |
| Busca | `SearchBox.jsx`, `App.jsx` | Usa dados ja carregados | `posts`, `games`, `users` |
| Feedback | `App.jsx`, `_feedback.scss` | Usa erros retornados pela API | Nao grava dados |

## Como demonstrar para os professores

1. Rode a API:

```bash
npm run api
```

2. Rode o frontend:

```bash
npm run dev
```

3. Abra:

```text
http://127.0.0.1:5173
```

4. Mostre o feed sem login e explique:

```text
Leitura e publica. Interacao exige conta.
```

5. Tente curtir ou postar sem login e mostre o feedback:

```text
O frontend bloqueia a acao, avisa o motivo e leva para login/cadastro.
```

6. Faca login como admin:

```text
usuario: lorenzo
senha: lorenzoadmin
```

7. Mostre:

```text
Criar post
Anexar imagem
Curtir
Comentar
Editar bio
Painel admin
Promover usuario para admin
```

8. Mostre o banco real:

```powershell
dir data\gameplayn.sqlite
```

Ou abra `data/gameplayn.sqlite` com SQLite Viewer/DB Browser for SQLite.

9. Mostre contagem pelo terminal:

```powershell
node --no-warnings -e "const { createSqliteDatabase } = require('./database-sqlite'); const db = createSqliteDatabase(); db.initDb(); const data = db.readDb(); console.log({ usuarios: data.users.length, topicos: data.games.length, posts: data.posts.length, admins: data.users.filter(u => u.role === 'admin').map(u => u.username) }); db.close();"
```

10. Mostre testes:

```bash
npm test
npm run test:front
```

## Respostas para perguntas provaveis

**Por que ainda existe `data/db.json`?**

Porque ele e somente uma carga inicial. O banco real local e `data/gameplayn.sqlite`. Quando o SQLite esta vazio, o backend importa os dados do JSON uma vez.

**Por que SQLite e nao Docker/PostgreSQL no seu computador?**

Porque o computador nao suporta virtualizacao para Docker Desktop. SQLite resolve o desenvolvimento local porque e relacional, persistente e nao depende de servidor externo. Para producao, o projeto ja tem adaptador PostgreSQL em `database.js`.

**O frontend acessa o banco?**

Nao. O frontend chama a API. Apenas o backend acessa o banco.

**Como as permissoes funcionam?**

Cada usuario tem `role` no banco: `user` ou `admin`. O backend usa `requireAuth()` para exigir login e `requireAdmin()` para proteger rotas administrativas.

**Como uma conta vira admin?**

No painel admin, a coluna de tipo permite alterar `user/admin`. Isso chama `PATCH /api/users/:id`, que atualiza `users.role`.

**As senhas estao seguras?**

Para MVP academico, estao simplificadas. Em producao, o correto seria usar hash com bcrypt/argon2, HTTPS e sessao/token mais robusto.

**Onde as imagens ficam?**

No MVP, ficam no campo `posts.image_data` em formato data URL, com limite de 2 MB. Em producao, o ideal seria storage externo como Supabase Storage, S3 ou similar.

**Como provar que nao e mock?**

Criando um post, fechando e abrindo a API de novo. O post continua no banco `data/gameplayn.sqlite`. Tambem da para abrir esse arquivo em um visualizador SQLite e ver as tabelas.

---

# Demonstração rápida

1. Execute `npm install`
2. Execute `npm run api`
3. Em outro terminal, execute `npm run dev`
4. Acesse `http://127.0.0.1:5173`
5. Navegue pelo feed público
6. Faça login como **lorenzo**
7. Demonstre:

   * Busca
   * Criação de post
   * Comentários
   * Curtidas
   * Alteração de tema
   * Perfil do usuário
   * Painel administrativo

---

# Limitações atuais

Por se tratar de um MVP, o projeto apresenta algumas limitações:

* Ausência de criptografia de senhas
* Imagens salvas no banco como data URL, sem CDN ou armazenamento externo
* Sem notificações em tempo real
* Sem autenticação OAuth
* SQLite local não é indicado para alto volume de usuários simultâneos; para produção, usar PostgreSQL gerenciado

---

# Licença

Este projeto foi desenvolvido para fins exclusivamente acadêmicos como MVP da disciplina **Projeto de Desenvolvimento II**.
