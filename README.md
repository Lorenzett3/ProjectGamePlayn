# GamePlayn

MVP acadêmico de uma rede social/fórum para jogadores, desenvolvido por **Lorenzett3**. A aplicação organiza discussões por jogo, permitindo publicar posts, comentar, curtir, buscar tópicos e administrar o catálogo.

## Visão geral

O GamePlayn centraliza conversas sobre games em tópicos separados por jogo, em vez de espalhar discussões por redes sociais genéricas. A ideia segue um modelo próximo de comunidades: cada jogo funciona como um espaço próprio para recomendações, opiniões, dicas e debates.

## Funcionalidades principais

- Login de usuários comuns e administrador.
- Feed geral e feed filtrado por jogo.
- Criação, exclusão, curtida e fixação de posts.
- Página individual de post com comentários e curtidas em comentários.
- Busca por posts, jogos, gêneros, plataformas e usuários.
- Perfil de usuário com avatar visual, bio editável e posts publicados.
- Temas claro e escuro.
- Painel lateral com posts recentes.
- Painel administrativo para gerenciar jogos/tópicos e usuários.
- Persistência local em arquivo JSON.

## Tecnologias

- **React 19** para a interface.
- **Vite 7** para desenvolvimento e build.
- **SCSS/Sass** para estilos organizados por base, layout e componentes.
- **Node.js HTTP nativo** para servir a API e o build de produção.
- **JSON local** em `data/db.json` como banco simples para o MVP.

## Como executar

Requisitos:

- Node.js
- NPM

Instale as dependências:

```bash
npm install
```

Em desenvolvimento, rode a API em um terminal:

```bash
npm run api
```

Em outro terminal, rode o frontend:

```bash
npm run dev
```

Acesse:

```text
http://127.0.0.1:5173
```

Para gerar e servir a versão de produção:

```bash
npm run build
npm start
```

Acesse:

```text
http://127.0.0.1:3000
```

## Usuários iniciais

| Perfil | Usuário | Senha | Permissões |
| --- | --- | --- | --- |
| Jogador | `lorenzett3` | `123456` | Criar posts, comentar, curtir, fixar posts/tópicos, editar bio e excluir o que for permitido |
| Administrador | `admin` | `admin123` | Gerenciar jogos, usuários, posts, comentários e tópicos |
| Jogador | `malena0202` | `marina123` | Perfil de exemplo |
| Jogador | `rafa` | `rafa123` | Perfil de exemplo |
| Jogador | `bia` | `bia123` | Perfil de exemplo |
| Jogador | `diego` | `diego123` | Perfil de exemplo |
| Jogador | `camila` | `camila123` | Perfil de exemplo |

## Estrutura do projeto

```text
.
├── data/
│   └── db.json              # Dados persistidos localmente
├── src/
│   ├── api/                 # Cliente HTTP da API
│   ├── components/          # Componentes React da interface
│   ├── data/                # Dados auxiliares do frontend
│   ├── styles/              # SCSS dividido por base, layout e componentes
│   ├── App.jsx              # Estado principal e navegação da aplicação
│   ├── main.jsx             # Entrada React
│   └── utils.js             # Helpers de avatar, data e bio
├── index.html
├── package.json
├── server.js                # Servidor HTTP, API e regras de negócio
└── vite.config.js           # Configuração do Vite e proxy da API
```

## Principais rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/login` | Autentica usuário |
| `GET` | `/api/session` | Retorna o usuário da sessão |
| `GET` | `/api/games` | Lista jogos/tópicos |
| `POST` | `/api/games` | Cria jogo/tópico como admin |
| `PATCH` | `/api/games/:id` | Edita jogo/tópico como admin |
| `PATCH` | `/api/games/:id/pin` | Fixa ou desfixa tópico |
| `DELETE` | `/api/games/:id` | Remove jogo/tópico como admin |
| `GET` | `/api/posts` | Lista posts, com filtro opcional por `gameId` |
| `POST` | `/api/posts` | Cria post |
| `DELETE` | `/api/posts/:id` | Remove post com permissão |
| `POST` | `/api/posts/:id/like` | Alterna curtida do post |
| `PATCH` | `/api/posts/:id/pin` | Fixa ou desfixa post |
| `POST` | `/api/posts/:id/comments` | Adiciona comentário |
| `POST` | `/api/posts/:id/comments/:commentId/like` | Alterna curtida do comentário |
| `DELETE` | `/api/posts/:id/comments/:commentId` | Remove comentário com permissão |
| `PATCH` | `/api/users/me` | Atualiza a bio do usuário logado |
| `GET` | `/api/users` | Lista usuários como admin |
| `PATCH` | `/api/users/:id` | Edita usuário como admin |
| `DELETE` | `/api/users/:id` | Remove usuário como admin |

## Persistência

Os dados ficam em `data/db.json`. O arquivo armazena usuários, jogos, posts, comentários, curtidas e estados de fixação. Por ser um MVP, não há banco de dados externo nem autenticação com senha criptografada.

## Roteiro rápido de apresentação

1. Rodar `npm install`.
2. Rodar `npm run build`.
3. Rodar `npm start`.
4. Abrir `http://127.0.0.1:3000`.
5. Entrar como `lorenzett3` ou `admin`.
6. Demonstrar busca, troca de tema, criação de post, comentários e curtidas.
7. Abrir o painel admin e mostrar o gerenciamento de tópicos e usuários.

## Status

MVP funcional para demonstração acadêmica, com frontend em React, estilos em SCSS, API em Node.js, responsividade, temas, busca global, perfis, comentários e painel administrativo.
