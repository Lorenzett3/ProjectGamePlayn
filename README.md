# GamePlayn - MVP

Projeto academico desenvolvido por **Lorenzett3** como MVP de uma rede social/forum voltada ao universo dos games.

A proposta e criar uma plataforma onde jogadores possam publicar opinioes, recomendações, dicas, curiosidades e discussoes sobre jogos digitais em topicos separados por jogo, seguindo uma ideia parecida com comunidades/subreddits.

## Objetivo do projeto

O problema identificado e a falta de uma plataforma centralizada e organizada exclusivamente para troca de experiencias sobre jogos. Hoje, jogadores costumam usar redes sociais genericas, foruns espalhados ou plataformas de avaliação que nao foram pensadas especificamente para esse tipo de interação.

O **GamePlayn** busca resolver isso oferecendo:

- Catalogo de jogos organizado.
- Topicos de discussao separados por jogo.
- Posts textuais criados por usuarios.
- Interação por curtidas e comentarios.
- Curtidas tambem em comentarios dentro da pagina de discussao.
- Perfil de usuario com avatar em emoji, nickname, bio e posts.
- Bio personalizavel com limite de 200 caracteres.
- Busca com sugestoes de posts, topicos, jogos, generos, plataformas e usuarios.
- Pagina dedicada para cada post, com foco na discussao e comentarios.
- Painel lateral com posts recentes para facilitar a navegacao.
- Criação de post em fluxo colapsado, abrindo o formulario apenas ao clicar em **Postar**.
- Editor textual com toolbar visual no estilo comunidade/reddit.
- Menu estetico de anexos com opcoes visuais de foto, video e camera.
- Topicos fixados no topo da lista.
- Tema claro e tema escuro.
- Moderação e manutencao do catalogo e dos usuarios por administrador.

## Tecnologias utilizadas

- **Node.js** com HTTP nativo para servidor, API e persistencia simples.
- **React** para a interface em componentes.
- **Vite** para build e servidor de desenvolvimento do frontend.
- **SCSS/Sass** para estilos, variaveis, temas e organização visual.
- **JSON local** para armazenamento simples em `data/db.json`.

## Como executar

Requisitos:

- Node.js instalado.
- NPM instalado.

Instale as dependencias:

```bash
npm install
```

Para desenvolvimento, rode a API em um terminal:

```bash
npm run api
```

E o frontend React em outro terminal:

```bash
npm run dev
```

Acesse:

```text
http://127.0.0.1:5173
```

Para gerar a versao final e servir pelo Node:

```bash
npm run build
npm start
```

Depois acesse:

```text
http://127.0.0.1:3000
```

## Usuarios iniciais

| Perfil | Usuario | Senha | Permissoes |
| --- | --- | --- | --- |
| Jogador normal | `lorenzo` | `123456` | Criar posts, comentar, curtir, fixar posts e topicos, editar bio e excluir seus comentarios |
| Administrador | `admin` | `admin123` | Gerenciar jogos, usuarios, posts, comentarios e topicos fixados |
| Jogador | `malena0202` | `marina123` | Perfil de exemplo com foco em RPG e mundo aberto |
| Jogador | `rafa` | `rafa123` | Perfil de exemplo com foco em FPS competitivo |
| Jogador | `bia` | `bia123` | Perfil de exemplo com foco em sandbox e criatividade |
| Jogador | `diego` | `diego123` | Perfil de exemplo com foco em exploração |
| Jogador | `camila` | `camila123` | Perfil de exemplo com foco em MOBA e battle royale |

## Funcionalidades

- Login de usuario comum e administrador.
- Feed geral com posts de todos os jogos.
- Visualização de posts por jogo/topico.
- Busca global com sugestoes conforme a digitacao, sem filtrar automaticamente o feed.
- Foto de capa tematica ao entrar em um topico de jogo.
- Painel lateral de posts recentes com acesso rapido para discussoes.
- Criação de posts por botao **Postar**, que abre selecao de topico, titulo e conteudo.
- Editor de conteudo com icones esteticos de anexo, link, enquete, codigo e emoji.
- Menu de anexo visual com opcoes de Foto, Video e Camera.
- Pagina individual de post para leitura focada, curtidas e comentarios.
- Comentarios em posts.
- Curtidas em comentarios.
- Exclusao de comentarios por autor, dono do post ou admin.
- Exclusao de posts e comentarios por icone de lixeira.
- Curtidas em posts.
- Fixacao de posts por qualquer usuario autenticado, mantendo mensagens importantes no topo.
- Pagina de perfil com avatar fake em emoji, nickname, bio, contador de posts e posts do usuario.
- Personalização da bio com limite de 200 caracteres.
- Alternancia entre tema claro e escuro.
- Topicos fixados no topo da lista por qualquer usuario autenticado.
- Painel administrativo com abas para usuarios e topicos.
- Cadastro, edicao, fixacao e remocao de jogos/topicos pelo admin.
- Edicao de usuarios pelo admin, incluindo nome, username, tipo e bio.
- Exclusao de usuarios pelo admin, removendo tambem posts, comentarios e curtidas relacionados.
- Paginacao no painel administrativo para listas de usuarios e topicos.
- Modal de cadastro/edicao com sugestoes de generos e plataformas.
- Menu mobile responsivo para navegacao em telas menores.
- Dados de demonstração com 7 usuarios, posts e comentarios em diferentes topicos de jogos.

## Estrutura do projeto

```text
.
├── data/
│   └── db.json                    # Dados persistidos localmente
├── src/
│   ├── api/
│   │   └── client.js              # Cliente HTTP da API
│   ├── components/
│   │   ├── AdminPanel.jsx
│   │   ├── Composer.jsx
│   │   ├── FeedHeader.jsx
│   │   ├── LoginPage.jsx
│   │   ├── PostCard.jsx
│   │   ├── PostPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── ProfilePanel.jsx
│   │   ├── RecentPostsPanel.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatsPanel.jsx
│   │   └── ThemeToggle.jsx
│   ├── data/
│   │   └── gameCovers.js          # Capas tematicas dos topicos
│   ├── styles/
│   │   ├── abstracts/             # Variaveis e mixins SCSS
│   │   ├── base/                  # Reset e animações
│   │   ├── components/            # Estilos por componente
│   │   ├── layout/                # Grid principal responsivo
│   │   └── main.scss
│   ├── App.jsx                    # Estado principal e orquestração
│   ├── main.jsx                   # Entrada React
│   └── utils.js                   # Helpers de avatar, data e bio
├── index.html                     # Entrada do Vite
├── package.json                   # Scripts e dependencias
├── package-lock.json              # Versoes travadas das dependencias
├── server.js                      # Servidor, API e regras de negocio
└── vite.config.js                 # Configuração do Vite e proxy da API
```

## Principais rotas da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `POST` | `/api/login` | Autentica usuario |
| `GET` | `/api/session` | Retorna usuario logado |
| `GET` | `/api/games` | Lista jogos do catalogo, com fixados primeiro |
| `POST` | `/api/games` | Cadastra jogo novo, apenas admin |
| `PATCH` | `/api/games/:id` | Edita nome, genero e plataforma de um jogo, apenas admin |
| `PATCH` | `/api/games/:id/pin` | Fixa ou desfixa topico para usuario autenticado |
| `DELETE` | `/api/games/:id` | Remove jogo, apenas admin |
| `GET` | `/api/posts` | Lista posts, com filtro opcional por `gameId` |
| `POST` | `/api/posts` | Cria novo post |
| `DELETE` | `/api/posts/:id` | Remove post |
| `POST` | `/api/posts/:id/like` | Curte ou remove curtida |
| `PATCH` | `/api/posts/:id/pin` | Fixa ou desfixa post para usuario autenticado |
| `POST` | `/api/posts/:id/comments` | Adiciona comentario |
| `POST` | `/api/posts/:id/comments/:commentId/like` | Curte ou remove curtida de comentario |
| `DELETE` | `/api/posts/:id/comments/:commentId` | Remove comentario com permissao |
| `PATCH` | `/api/users/me` | Atualiza a bio do usuario logado |
| `GET` | `/api/users` | Lista usuarios, apenas admin |
| `PATCH` | `/api/users/:id` | Edita dados de usuario, apenas admin |
| `DELETE` | `/api/users/:id` | Remove usuario, apenas admin |

## Persistencia dos dados

Os dados sao salvos em:

```text
data/db.json
```

Esse arquivo guarda usuarios, jogos, posts, posts fixados, curtidas em posts, curtidas em comentarios, comentarios e o estado de topicos fixados quando alterado pela interface.

## Roteiro rapido para apresentação

1. Rodar `npm install`.
2. Rodar `npm run build`.
3. Rodar `npm start`.
4. Abrir `http://127.0.0.1:3000`.
5. Entrar como `lorenzo`.
6. Usar a busca para ver sugestoes de topicos, posts ou autores.
7. Alternar entre tema claro e escuro.
8. Abrir um topico de jogo e mostrar a foto de capa.
9. Clicar em **Postar** para abrir o formulario de novo post.
10. Mostrar a toolbar visual do editor e o menu de anexos com Foto, Video e Camera.
11. Criar um post, curtir e abrir a pagina individual da discussao.
12. Comentar no post e curtir um comentario.
13. Abrir um post recente pelo painel lateral.
14. Excluir comentario/post pelo icone de lixeira quando houver permissao.
15. Editar a bio no perfil.
16. Sair e entrar como `admin`.
17. Abrir o painel admin e demonstrar abas, paginacao e modais.
18. Cadastrar ou editar um topico usando sugestoes de genero/plataforma.
19. Fixar/desfixar topicos e editar/excluir usuarios quando necessario.

## Status

MVP funcional para demonstração academica, agora com frontend em React, arquitetura de componentes, SCSS organizado, responsividade, animações, temas claro/escuro, busca global, capas tematicas por topico, compositor colapsado, pagina individual de discussao, posts recentes, curtidas em comentarios e painel administrativo mais completo para gerenciar topicos e usuarios.
