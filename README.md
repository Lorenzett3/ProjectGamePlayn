# GameHub Forum - MVP

Projeto academico desenvolvido por **Lorenzode Oliveira Moraes** como MVP de uma rede social/forum voltada ao universo dos games.

A proposta e criar uma plataforma onde jogadores possam publicar opinioes, recomendacoes, dicas, curiosidades e discussoes sobre jogos digitais em topicos separados por jogo, seguindo uma ideia parecida com comunidades/subreddits.

## Objetivo do projeto

O problema identificado e a falta de uma plataforma centralizada e organizada exclusivamente para troca de experiencias sobre jogos. Hoje, jogadores costumam usar redes sociais genericas, foruns espalhados ou plataformas de avaliacao que nao foram pensadas especificamente para esse tipo de interacao.

O **GameHub Forum** busca resolver isso oferecendo:

- Catalogo de jogos organizado.
- Topicos de discussao separados por jogo.
- Posts textuais criados por usuarios.
- Interacao por curtidas e comentarios.
- Perfil basico de usuario.
- Moderacao e manutencao do catalogo por administrador.

## Escopo do MVP

Esta primeira versao prioriza as funcionalidades essenciais para demonstracao:

- Cadastro inicial simulado por usuarios ja existentes.
- Login de usuario comum e administrador.
- Feed geral com posts de todos os jogos.
- Visualizacao de posts por jogo/topico.
- Criacao de posts em formato textual.
- Comentarios em posts.
- Curtidas em posts.
- Catalogo inicial com 10 jogos conhecidos.
- Painel administrativo para gerenciar jogos, usuarios e posts.

Nesta etapa, o sistema nao possui upload de imagens ou videos. O foco e validar o fluxo principal da comunidade com conteudo textual.

## Tecnologias utilizadas

- **Node.js**: servidor backend.
- **HTTP nativo do Node.js**: criacao da API e servidor de arquivos estaticos.
- **HTML, CSS e JavaScript**: interface web.
- **JSON local**: armazenamento simples dos dados em `data/db.json`.

Observacao: a proposta original pode evoluir para React, Express, PostgreSQL e Prisma. Para este MVP de apresentacao, a aplicacao foi feita sem dependencias externas para facilitar a execucao em qualquer computador.

## Como executar

Requisitos:

- Node.js instalado.
- NPM instalado.

No terminal, dentro da pasta do projeto, execute:

```bash
npm start
```

Depois acesse no navegador:

```text
http://127.0.0.1:3000
```

Tambem pode funcionar com:

```text
http://localhost:3000
```

## Usuarios iniciais

| Perfil | Usuario | Senha | Permissoes |
| --- | --- | --- | --- |
| Jogador normal | `lorenzo` | `123456` | Criar posts, comentar e curtir |
| Administrador | `admin` | `admin123` | Gerenciar jogos, usuarios e posts |

## Jogos cadastrados inicialmente

O catalogo inicial contem 10 jogos conhecidos:

1. The Legend of Zelda: Breath of the Wild
2. Minecraft
3. Elden Ring
4. God of War Ragnarok
5. Fortnite
6. League of Legends
7. Counter-Strike 2
8. Grand Theft Auto V
9. Red Dead Redemption 2
10. Valorant

## Funcionalidades por tipo de usuario

### Usuario comum

- Fazer login.
- Visualizar feed geral.
- Visualizar topicos por jogo.
- Criar posts textuais.
- Curtir posts.
- Comentar posts.
- Ver informacoes basicas do proprio perfil.

### Administrador

- Fazer login.
- Acessar todas as funcoes do usuario comum.
- Cadastrar novos jogos no catalogo.
- Remover jogos do catalogo.
- Excluir usuarios.
- Excluir posts.
- Visualizar painel administrativo.

## Estrutura do projeto

```text
.
├── data/
│   └── db.json              # Dados persistidos localmente
├── public/
│   ├── app.js               # Logica da interface e chamadas para API
│   ├── index.html           # Estrutura HTML principal
│   └── styles.css           # Estilos visuais da aplicacao
├── package.json             # Scripts do projeto
├── README.md                # Documentacao do projeto
└── server.js                # Servidor, API e regras de negocio
```

## Principais rotas da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `POST` | `/api/login` | Autentica usuario |
| `GET` | `/api/session` | Retorna usuario logado |
| `GET` | `/api/games` | Lista jogos do catalogo |
| `POST` | `/api/games` | Cadastra jogo novo, apenas admin |
| `DELETE` | `/api/games/:id` | Remove jogo, apenas admin |
| `GET` | `/api/posts` | Lista posts |
| `POST` | `/api/posts` | Cria novo post |
| `DELETE` | `/api/posts/:id` | Remove post |
| `POST` | `/api/posts/:id/like` | Curte ou remove curtida |
| `POST` | `/api/posts/:id/comments` | Adiciona comentario |
| `GET` | `/api/users` | Lista usuarios, apenas admin |
| `DELETE` | `/api/users/:id` | Remove usuario, apenas admin |

## Persistencia dos dados

Os dados sao salvos em:

```text
data/db.json
```

Esse arquivo guarda:

- Usuarios.
- Jogos.
- Posts.
- Curtidas.
- Comentarios.

Caso o arquivo nao exista, o servidor cria automaticamente uma base inicial com os usuarios, jogos e posts de exemplo.

## Roteiro rapido para apresentacao

1. Rodar o projeto com `npm start`.
2. Abrir `http://127.0.0.1:3000`.
3. Entrar como usuario `lorenzo`.
4. Mostrar o feed geral e a lista de jogos.
5. Selecionar um jogo e criar um post textual.
6. Curtir e comentar um post.
7. Sair e entrar como `admin`.
8. Mostrar o painel administrativo.
9. Cadastrar um novo jogo.
10. Demonstrar a possibilidade de excluir jogos, usuarios ou posts.

## Possiveis melhorias futuras

- Cadastro real de novos usuarios.
- Recuperacao de senha.
- Upload de imagens e videos.
- Sistema de seguidores.
- Busca por jogos e posts.
- Tags por tipo de conteudo, como review, dica, tutorial e noticia.
- Banco de dados PostgreSQL.
- Backend com Express.
- Frontend com React.
- ORM com Prisma.
- Deploy em plataforma web.

## Status

MVP funcional para demonstracao academica, com foco em apresentar o conceito de uma rede social/forum para games com topicos por jogo e painel administrativo basico.
