# GamePlayn

> MVP acadêmico de uma rede social voltada para jogadores, desenvolvida como projeto da disciplina **Projeto de Desenvolvimento II**.

O **GamePlayn** é uma aplicação web inspirada em fóruns e comunidades de jogos, criada com o objetivo de centralizar discussões sobre títulos específicos em um único ambiente.

Diferente de redes sociais generalistas, onde o conteúdo fica disperso entre grupos, páginas e servidores, o GamePlayn organiza toda a interação por jogo, permitindo que jogadores encontrem rapidamente recomendações, opiniões, dicas, curiosidades e discussões relacionadas aos seus títulos favoritos.

---

# ✨ Principais funcionalidades

## Autenticação

* Login de usuários
* Controle de permissões
* Perfis de jogador e administrador

---

## Publicações

* Criar posts
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
data/db.json
```

Por se tratar de um MVP acadêmico, a persistência dos dados é realizada utilizando um arquivo JSON local, simplificando a configuração do ambiente e permitindo foco na implementação das regras de negócio.

---

# Tecnologias utilizadas

| Tecnologia      | Finalidade                              |
| --------------- | --------------------------------------- |
| React 19        | Interface da aplicação                  |
| Vite 7          | Ambiente de desenvolvimento e build     |
| SCSS            | Organização e modularização dos estilos |
| Node.js         | Servidor HTTP e API                     |
| JavaScript ES6+ | Lógica da aplicação                     |
| JSON            | Persistência de dados do MVP            |

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
├── package.json
├── server.js
└── vite.config.js
```

---

# Como executar

## Pré-requisitos

* Node.js
* npm

---

## Instalação

```bash
npm install
```

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

Executar servidor:

```bash
npm start
```

Acesse:

```text
http://127.0.0.1:3000
```

---

# Usuários para demonstração

| Perfil        | Usuário    | Senha     |
| ------------- | ---------- | --------- |
| Administrador | admin      | admin123  |
| Jogador       | lorenzett3 | 123456    |
| Jogador       | malena0202 | marina123 |
| Jogador       | rafa       | rafa123   |
| Jogador       | bia        | bia123    |
| Jogador       | diego      | diego123  |
| Jogador       | camila     | camila123 |

---

# Principais endpoints

| Método | Endpoint                                  | Descrição             |
| ------ | ----------------------------------------- | --------------------- |
| POST   | `/api/login`                              | Autentica usuário     |
| GET    | `/api/session`                            | Retorna sessão atual  |
| GET    | `/api/games`                              | Lista jogos           |
| POST   | `/api/games`                              | Cria jogo             |
| PATCH  | `/api/games/:id`                          | Atualiza jogo         |
| DELETE | `/api/games/:id`                          | Remove jogo           |
| GET    | `/api/posts`                              | Lista posts           |
| POST   | `/api/posts`                              | Cria post             |
| DELETE | `/api/posts/:id`                          | Remove post           |
| POST   | `/api/posts/:id/like`                     | Curtida em post       |
| POST   | `/api/posts/:id/comments`                 | Adiciona comentário   |
| POST   | `/api/posts/:id/comments/:commentId/like` | Curtida em comentário |
| PATCH  | `/api/users/me`                           | Atualiza perfil       |

---

# Persistência de dados

A aplicação utiliza um arquivo **`data/db.json`** para armazenar usuários, jogos, posts, comentários, curtidas e demais informações.

Essa abordagem foi adotada por se tratar de um **MVP acadêmico**, reduzindo a complexidade da infraestrutura e permitindo concentrar o desenvolvimento na arquitetura da aplicação, regras de negócio e experiência do usuário.

Em uma evolução futura do projeto, a persistência poderá ser migrada para um banco de dados relacional, como PostgreSQL ou MySQL.

---

# Demonstração rápida

1. Execute `npm install`
2. Execute `npm run build`
3. Execute `npm start`
4. Acesse `http://127.0.0.1:3000`
5. Faça login como **admin** ou **lorenzett3**
6. Demonstre:

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

* Persistência local em JSON
* Ausência de criptografia de senhas
* Sem upload de imagens
* Sem notificações em tempo real
* Sem autenticação OAuth
* Sem banco de dados relacional
---

# Licença

Este projeto foi desenvolvido para fins exclusivamente acadêmicos como MVP da disciplina **Projeto de Desenvolvimento II**.
