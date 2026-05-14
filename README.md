# GamePlayn - MVP

Projeto academico desenvolvido por **Lorenzett3** como MVP de uma rede social/forum voltada ao universo dos games.

A proposta e criar uma plataforma onde jogadores possam publicar opinioes, recomendacoes, dicas, curiosidades e discussoes sobre jogos digitais em topicos separados por jogo, seguindo uma ideia parecida com comunidades/subreddits.

## Objetivo do projeto

O problema identificado e a falta de uma plataforma centralizada e organizada exclusivamente para troca de experiencias sobre jogos. Hoje, jogadores costumam usar redes sociais genericas, foruns espalhados ou plataformas de avaliacao que nao foram pensadas especificamente para esse tipo de interacao.

O **GamePlayn** busca resolver isso oferecendo:

- Catalogo de jogos organizado.
- Topicos de discussao separados por jogo.
- Posts textuais criados por usuarios.
- Interacao por curtidas e comentarios.
- Perfil de usuario com avatar em emoji, nickname, bio e posts.
- Bio personalizavel com limite de 200 caracteres.
- Criacao de post em fluxo colapsado, abrindo o formulario apenas ao clicar em **Postar**.
- Editor textual com toolbar visual no estilo comunidade/reddit.
- Menu estetico de anexos com opcoes de foto, video e camera.
- Topicos fixados no topo da lista.
- Tema claro e tema escuro.
- Moderacao e manutencao do catalogo por administrador.

## Tecnologias utilizadas

- **Node.js** com HTTP nativo para servidor, API e persistencia simples.
- **React** para a interface em componentes.
- **Vite** para build e servidor de desenvolvimento do frontend.
- **SCSS/Sass** para estilos, variaveis, temas e organizacao visual.
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
| Jogador normal | `lorenzo` | `123456` | Criar posts, comentar, curtir, editar bio e excluir seus comentarios |
| Administrador | `admin` | `admin123` | Gerenciar jogos, usuarios, posts, comentarios e topicos fixados |
| Jogador | `marina` | `marina123` | Perfil de exemplo com foco em RPG e mundo aberto |
| Jogador | `rafa` | `rafa123` | Perfil de exemplo com foco em FPS competitivo |
| Jogador | `bia` | `bia123` | Perfil de exemplo com foco em sandbox e criatividade |
| Jogador | `diego` | `diego123` | Perfil de exemplo com foco em exploracao |
| Jogador | `camila` | `camila123` | Perfil de exemplo com foco em MOBA e battle royale |

## Funcionalidades

- Login de usuario comum e administrador.
- Feed geral com posts de todos os jogos.
- Visualizacao de posts por jogo/topico.
- Foto de capa tematica ao entrar em um topico de jogo.
- Criacao de posts por botao **Postar**, que abre selecao de topico, titulo e conteudo.
- Editor de conteudo com icones esteticos de anexo, link, enquete, codigo e emoji.
- Menu de anexo visual com opcoes de Foto, Video e Camera.
- Comentarios em posts.
- Exclusao de comentarios por autor, dono do post ou admin.
- Exclusao de posts e comentarios por icone de lixeira.
- Curtidas em posts.
- Pagina de perfil com avatar fake em emoji, nickname, bio, contador de posts e posts do usuario.
- Personalizacao da bio com limite de 200 caracteres.
- Alternancia entre tema claro e escuro.
- Topicos fixados no topo da lista.
- Painel administrativo para cadastrar/remover jogos, fixar/desfixar topicos e excluir usuarios.
- Dados de demonstracao com 7 usuarios, posts e comentarios em diferentes topicos de jogos.

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
│   │   ├── ProfilePage.jsx
│   │   ├── ProfilePanel.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatsPanel.jsx
│   │   └── ThemeToggle.jsx
│   ├── data/
│   │   └── gameCovers.js          # Capas tematicas dos topicos
│   ├── styles/
│   │   ├── abstracts/             # Variaveis e mixins SCSS
│   │   ├── base/                  # Reset e animacoes
│   │   ├── components/            # Estilos por componente
│   │   ├── layout/                # Grid principal responsivo
│   │   └── main.scss
│   ├── App.jsx                    # Estado principal e orquestracao
│   ├── main.jsx                   # Entrada React
│   └── utils.js                   # Helpers de avatar, data e bio
├── index.html                     # Entrada do Vite
├── package.json                   # Scripts e dependencias
├── package-lock.json              # Versoes travadas das dependencias
├── server.js                      # Servidor, API e regras de negocio
└── vite.config.js                 # Configuracao do Vite e proxy da API
```

## Principais rotas da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `POST` | `/api/login` | Autentica usuario |
| `GET` | `/api/session` | Retorna usuario logado |
| `GET` | `/api/games` | Lista jogos do catalogo, com fixados primeiro |
| `POST` | `/api/games` | Cadastra jogo novo, apenas admin |
| `PATCH` | `/api/games/:id/pin` | Fixa ou desfixa topico, apenas admin |
| `DELETE` | `/api/games/:id` | Remove jogo, apenas admin |
| `GET` | `/api/posts` | Lista posts |
| `POST` | `/api/posts` | Cria novo post |
| `DELETE` | `/api/posts/:id` | Remove post |
| `POST` | `/api/posts/:id/like` | Curte ou remove curtida |
| `POST` | `/api/posts/:id/comments` | Adiciona comentario |
| `DELETE` | `/api/posts/:id/comments/:commentId` | Remove comentario com permissao |
| `PATCH` | `/api/users/me` | Atualiza a bio do usuario logado |
| `GET` | `/api/users` | Lista usuarios, apenas admin |
| `DELETE` | `/api/users/:id` | Remove usuario, apenas admin |

## Persistencia dos dados

Os dados sao salvos em:

```text
data/db.json
```

Esse arquivo guarda usuarios, jogos, posts, curtidas, comentarios e o estado de topicos fixados quando alterado pela interface.

## Roteiro rapido para apresentacao

1. Rodar `npm install`.
2. Rodar `npm run build`.
3. Rodar `npm start`.
4. Abrir `http://127.0.0.1:3000`.
5. Entrar como `lorenzo`.
6. Alternar entre tema claro e escuro.
7. Abrir um topico de jogo e mostrar a foto de capa.
8. Clicar em **Postar** para abrir o formulario de novo post.
9. Mostrar a toolbar visual do editor e o menu de anexos com Foto, Video e Camera.
10. Criar post, curtir e comentar.
11. Excluir comentario/post pelo icone de lixeira quando houver permissao.
12. Editar a bio no perfil.
13. Sair e entrar como `admin`.
14. Fixar/desfixar topicos e excluir comentarios/posts quando necessario.

## Status

MVP funcional para demonstracao academica, agora com frontend em React, arquitetura de componentes, SCSS organizado, responsividade aprimorada, animacoes, temas claro/escuro, capas tematicas por topico, compositor colapsado e dados de exemplo para preencher a comunidade.
