const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const DIST_DIR = path.join(ROOT, "dist");

const initialData = {
  users: [
    {
      id: "u1",
      name: "Lorenzo",
      username: "lorenzett3",
      password: "123456",
      role: "user",
      bio: "Jogador, estudante e criador do projeto GameHub Forum."
    },
    {
      id: "u2",
      name: "Administrador",
      username: "admin",
      password: "admin123",
      role: "admin",
      bio: "Conta administrativa para moderação e gestao do catalogo."
    },
    {
      id: "u3",
      name: "Malena",
      username: "malena0202",
      password: "marina123",
      role: "user",
      bio: "Fas de RPG, jogos indie e mundos abertos. Sempre procurando uma boa historia para discutir."
    },
    {
      id: "u4",
      name: "Rafael Costa",
      username: "rafa",
      password: "rafa123",
      role: "user",
      bio: "Jogador competitivo de FPS, viciado em mapas taticos, mira limpa e boas callouts."
    },
    {
      id: "u5",
      name: "Bianca Souza",
      username: "bia",
      password: "bia123",
      role: "user",
      bio: "Curto sandbox, construcao, sobrevivencia e qualquer jogo que deixe criar coisas do zero."
    },
    {
      id: "u6",
      name: "Diego Martins",
      username: "diego",
      password: "diego123",
      role: "user",
      bio: "Explorador de mapas gigantes, side quests e segredos escondidos."
    },
    {
      id: "u7",
      name: "Camila Rocha",
      username: "camila",
      password: "camila123",
      role: "user",
      bio: "Jogo MOBA, battle royale e aventuras narrativas. Gosto de comparar mecanicas e balanceamento."
    }
  ],
  games: [
    { id: "g1", name: "The Legend of Zelda: Breath of the Wild", genre: "Aventura", platform: "Nintendo Switch", pinned: false },
    { id: "g2", name: "Minecraft", genre: "Sandbox", platform: "Multiplataforma", pinned: false },
    { id: "g3", name: "Elden Ring", genre: "RPG de ação", platform: "PC, PlayStation, Xbox", pinned: true },
    { id: "g4", name: "God of War Ragnarok", genre: "ação e Aventura", platform: "PlayStation, PC", pinned: false },
    { id: "g5", name: "Fortnite", genre: "Battle Royale", platform: "Multiplataforma", pinned: false },
    { id: "g6", name: "League of Legends", genre: "MOBA", platform: "PC", pinned: false },
    { id: "g7", name: "Counter-Strike 2", genre: "FPS", platform: "PC", pinned: false },
    { id: "g8", name: "Grand Theft Auto V", genre: "Mundo Aberto", platform: "Multiplataforma", pinned: false },
    { id: "g9", name: "Red Dead Redemption 2", genre: "ação e Aventura", platform: "PC, PlayStation, Xbox", pinned: false },
    { id: "g10", name: "Valorant", genre: "FPS Tatico", platform: "PC", pinned: false }
  ],
  posts: [
    {
      id: "p1",
      gameId: "g3",
      userId: "u1",
      title: "Elden Ring recompensa exploração como poucos jogos",
      content: "A melhor parte para mim e como o jogo deixa o jogador descobrir caminhos, chefes e historias sem ficar explicando tudo o tempo todo.",
      createdAt: new Date().toISOString(),
      likes: ["u2", "u3", "u6"],
      comments: [
        { id: "c1", userId: "u2", content: "Boa abertura para demonstrar o formato de discussao por jogo.", createdAt: new Date().toISOString() },
        { id: "cseed02", userId: "u6", content: "Concordo. O mapa parece enorme, mas sempre tem algum detalhe guiando sem virar tutorial.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "p2",
      gameId: "g2",
      userId: "u2",
      title: "Minecraft continua forte por causa da criatividade",
      content: "Mesmo sendo antigo, o jogo continua relevante porque cada servidor e cada mundo vira uma experiencia diferente.",
      createdAt: new Date().toISOString(),
      likes: ["u1", "u5", "u6"],
      comments: [
        { id: "cseed01", userId: "u5", content: "O modo sobrevivencia ainda rende muita historia boa com amigos.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "pseed02",
      gameId: "g10",
      userId: "u4",
      title: "Valorant recompensa comunicação mais do que mira pura",
      content: "Mira ajuda, mas o round muda quando o time usa utilidade junto, troca informação e sabe esperar o retake.",
      createdAt: new Date().toISOString(),
      likes: ["u2", "u7"],
      comments: [
        { id: "cseed04", userId: "u7", content: "Principalmente em mapa fechado. Uma smoke boa vale mais que sair correndo.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "pseed03",
      gameId: "g4",
      userId: "u6",
      title: "God of War Ragnarok mistura combate e narrativa muito bem",
      content: "O jogo consegue alternar momentos cinematograficos, exploração e lutas pesadas sem perder ritmo.",
      createdAt: new Date().toISOString(),
      likes: ["u1", "u3", "u5"],
      comments: [
        { id: "cseed05", userId: "u3", content: "A evolucao dos personagens e o que mais prende. Nao e so pancadaria bonita.", createdAt: new Date().toISOString() },
        { id: "cseed06", userId: "u2", content: "Bom topico para discutir narrativa em jogos de ação.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "pseed04",
      gameId: "g6",
      userId: "u7",
      title: "League of Legends precisa de paciencia para aprender macro",
      content: "Muita gente foca so em mecanica, mas wave, visao e tempo de objetivo decidem a partida antes da luta comecar.",
      createdAt: new Date().toISOString(),
      likes: ["u4", "u5"],
      comments: [
        { id: "cseed07", userId: "u4", content: "Isso vale para quase todo competitivo. Posicionamento ganha jogo.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "pseed05",
      gameId: "g9",
      userId: "u3",
      title: "Red Dead Redemption 2 e lento de um jeito necessario",
      content: "O ritmo mais calmo faz o mundo parecer vivo. Cacar, cavalgar e conversar com NPC vira parte da experiencia.",
      createdAt: new Date().toISOString(),
      likes: ["u6", "u1"],
      comments: [
        { id: "cseed08", userId: "u6", content: "Esse e um dos poucos mundos abertos em que eu gosto de andar devagar.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "pseed06",
      gameId: "g7",
      userId: "u4",
      title: "Counter-Strike 2 ainda vive de fundamentos",
      content: "Mesmo com mudancas tecnicas, o basico segue decidindo: mira na altura certa, granada bem usada e economia organizada.",
      createdAt: new Date().toISOString(),
      likes: ["u2", "u7", "u1"],
      comments: [
        { id: "cseed09", userId: "u7", content: "Economia e o detalhe que iniciante mais ignora.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "pseed07",
      gameId: "g5",
      userId: "u5",
      title: "Fortnite muda tanto que sempre parece uma temporada nova",
      content: "As colaborações, eventos e mecanicas novas fazem o jogo continuar comentavel mesmo para quem joga casualmente.",
      createdAt: new Date().toISOString(),
      likes: ["u7", "u3"],
      comments: [
        { id: "cseed10", userId: "u3", content: "Eu nem jogo todo dia, mas sempre vejo gente falando da temporada atual.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "pseed08",
      gameId: "g1",
      userId: "u6",
      title: "Zelda Breath of the Wild ensina pela curiosidade",
      content: "O jogo quase nunca interrompe. Ele coloca um ponto estranho no horizonte e deixa voce decidir se quer ir ate la.",
      createdAt: new Date().toISOString(),
      likes: ["u1", "u3", "u5"],
      comments: [
        { id: "cseed11", userId: "u5", content: "Esse tipo de liberdade combina muito com fisica emergente.", createdAt: new Date().toISOString() }
      ]
    }
  ]
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getUserFromRequest(req, db) {
  const id = req.headers.authorization?.replace("Bearer ", "");
  if (!id) return null;
  return db.users.find(user => user.id === id) || null;
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function hydratePost(post, db) {
  const game = db.games.find(item => item.id === post.gameId);
  const author = db.users.find(item => item.id === post.userId);
  return {
    ...post,
    game,
    author: publicUser(author),
    comments: post.comments.map(comment => ({
      ...comment,
      author: publicUser(db.users.find(item => item.id === comment.userId))
    }))
  };
}

function requireAuth(req, res, db) {
  const user = getUserFromRequest(req, db);
  if (!user) sendJson(res, 401, { error: "Login necessario." });
  return user;
}

function requireAdmin(req, res, db) {
  const user = requireAuth(req, res, db);
  if (!user) return null;
  if (user.role !== "admin") {
    sendJson(res, 403, { error: "Acesso restrito ao administrador." });
    return null;
  }
  return user;
}

function id(prefix) {
  return `${prefix}${crypto.randomBytes(6).toString("hex")}`;
}

function sortPinnedFirst(items) {
  return [...items].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = readDb();

  try {
    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await readBody(req);
      const user = db.users.find(item => item.username === body.username && item.password === body.password);
      if (!user) return sendJson(res, 401, { error: "Usuario ou senha invalidos." });
      return sendJson(res, 200, { token: user.id, user: publicUser(user) });
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      const user = getUserFromRequest(req, db);
      return sendJson(res, 200, { user: publicUser(user) });
    }

    if (req.method === "GET" && url.pathname === "/api/games") {
      const games = sortPinnedFirst(db.games.map(game => ({
        ...game,
        pinned: Boolean(game.pinned),
        postCount: db.posts.filter(post => post.gameId === game.id).length
      })));
      return sendJson(res, 200, { games });
    }

    if (req.method === "POST" && url.pathname === "/api/games") {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const body = await readBody(req);
      if (!body.name?.trim()) return sendJson(res, 400, { error: "Nome do jogo e obrigatorio." });
      const game = {
        id: id("g"),
        name: body.name.trim(),
        genre: body.genre?.trim() || "Nao informado",
        platform: body.platform?.trim() || "Nao informado",
        pinned: false
      };
      db.games.unshift(game);
      writeDb(db);
      return sendJson(res, 201, { game });
    }

    const gamePin = url.pathname.match(/^\/api\/games\/([^/]+)\/pin$/);
    if (req.method === "PATCH" && gamePin) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const game = db.games.find(item => item.id === gamePin[1]);
      if (!game) return sendJson(res, 404, { error: "Jogo nao encontrado." });
      game.pinned = !Boolean(game.pinned);
      writeDb(db);
      return sendJson(res, 200, { game });
    }

    const gameRoute = url.pathname.match(/^\/api\/games\/([^/]+)$/);
    if (req.method === "PATCH" && gameRoute) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const game = db.games.find(item => item.id === gameRoute[1]);
      if (!game) return sendJson(res, 404, { error: "Jogo nao encontrado." });
      const body = await readBody(req);
      if (!body.name?.trim()) return sendJson(res, 400, { error: "Nome do jogo e obrigatorio." });
      game.name = body.name.trim();
      game.genre = body.genre?.trim() || "Nao informado";
      game.platform = body.platform?.trim() || "Nao informado";
      writeDb(db);
      return sendJson(res, 200, { game });
    }

    if (req.method === "DELETE" && gameRoute) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const gameId = gameRoute[1];
      db.games = db.games.filter(game => game.id !== gameId);
      db.posts = db.posts.filter(post => post.gameId !== gameId);
      writeDb(db);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/api/posts") {
      const gameId = url.searchParams.get("gameId");
      const posts = db.posts
        .filter(post => !gameId || post.gameId === gameId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(post => hydratePost(post, db));
      return sendJson(res, 200, { posts });
    }

    if (req.method === "POST" && url.pathname === "/api/posts") {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const body = await readBody(req);
      if (!body.gameId || !body.title?.trim() || !body.content?.trim()) {
        return sendJson(res, 400, { error: "Jogo, titulo e conteudo sao obrigatorios." });
      }
      if (!db.games.some(game => game.id === body.gameId)) {
        return sendJson(res, 400, { error: "Jogo nao encontrado." });
      }
      const post = {
        id: id("p"),
        gameId: body.gameId,
        userId: user.id,
        title: body.title.trim(),
        content: body.content.trim(),
        createdAt: new Date().toISOString(),
        likes: [],
        comments: []
      };
      db.posts.unshift(post);
      writeDb(db);
      return sendJson(res, 201, { post: hydratePost(post, db) });
    }

    const postDelete = url.pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (req.method === "DELETE" && postDelete) {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const post = db.posts.find(item => item.id === postDelete[1]);
      if (!post) return sendJson(res, 404, { error: "Post nao encontrado." });
      if (post.userId !== user.id && user.role !== "admin") return sendJson(res, 403, { error: "Sem permissao." });
      db.posts = db.posts.filter(item => item.id !== post.id);
      writeDb(db);
      return sendJson(res, 200, { ok: true });
    }

    const likeRoute = url.pathname.match(/^\/api\/posts\/([^/]+)\/like$/);
    if (req.method === "POST" && likeRoute) {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const post = db.posts.find(item => item.id === likeRoute[1]);
      if (!post) return sendJson(res, 404, { error: "Post nao encontrado." });
      post.likes = post.likes.includes(user.id)
        ? post.likes.filter(item => item !== user.id)
        : [...post.likes, user.id];
      writeDb(db);
      return sendJson(res, 200, { post: hydratePost(post, db) });
    }

    const commentRoute = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
    if (req.method === "POST" && commentRoute) {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const body = await readBody(req);
      const post = db.posts.find(item => item.id === commentRoute[1]);
      if (!post) return sendJson(res, 404, { error: "Post nao encontrado." });
      if (!body.content?.trim()) return sendJson(res, 400, { error: "Comentario vazio." });
      post.comments.push({
        id: id("c"),
        userId: user.id,
        content: body.content.trim(),
        createdAt: new Date().toISOString()
      });
      writeDb(db);
      return sendJson(res, 201, { post: hydratePost(post, db) });
    }

    const commentDelete = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments\/([^/]+)$/);
    if (req.method === "DELETE" && commentDelete) {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const post = db.posts.find(item => item.id === commentDelete[1]);
      if (!post) return sendJson(res, 404, { error: "Post nao encontrado." });
      const comment = post.comments.find(item => item.id === commentDelete[2]);
      if (!comment) return sendJson(res, 404, { error: "Comentario nao encontrado." });
      const canDelete = user.role === "admin" || user.id === post.userId || user.id === comment.userId;
      if (!canDelete) return sendJson(res, 403, { error: "Sem permissao." });
      post.comments = post.comments.filter(item => item.id !== comment.id);
      writeDb(db);
      return sendJson(res, 200, { post: hydratePost(post, db) });
    }

    if (req.method === "PATCH" && url.pathname === "/api/users/me") {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const body = await readBody(req);
      const bio = String(body.bio || "").trim();
      if (bio.length > 200) return sendJson(res, 400, { error: "A bio deve ter no maximo 200 caracteres." });
      user.bio = bio;
      writeDb(db);
      return sendJson(res, 200, { user: publicUser(user) });
    }

    if (req.method === "GET" && url.pathname === "/api/users") {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const users = db.users.map(user => ({
        ...publicUser(user),
        postCount: db.posts.filter(post => post.userId === user.id).length
      }));
      return sendJson(res, 200, { users });
    }

    const userRoute = url.pathname.match(/^\/api\/users\/([^/]+)$/);
    if (req.method === "PATCH" && userRoute) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const target = db.users.find(user => user.id === userRoute[1]);
      if (!target) return sendJson(res, 404, { error: "Usuario nao encontrado." });
      const body = await readBody(req);
      const name = String(body.name || "").trim();
      const username = String(body.username || "").trim().toLowerCase();
      const role = String(body.role || "").trim();
      const bio = String(body.bio || "").trim();
      if (!name || !username) return sendJson(res, 400, { error: "Nome e usuario sao obrigatorios." });
      if (!["admin", "user"].includes(role)) return sendJson(res, 400, { error: "Tipo de usuario invalido." });
      if (bio.length > 200) return sendJson(res, 400, { error: "A bio deve ter no maximo 200 caracteres." });
      if (db.users.some(user => user.id !== target.id && user.username.toLowerCase() === username)) {
        return sendJson(res, 409, { error: "Nome de usuario ja existe." });
      }
      if (target.id === admin.id && role !== "admin") {
        return sendJson(res, 400, { error: "O admin logado nao pode remover o proprio acesso admin." });
      }
      target.name = name;
      target.username = username;
      target.role = role;
      target.bio = bio;
      writeDb(db);
      return sendJson(res, 200, { user: publicUser(target) });
    }

    if (req.method === "DELETE" && userRoute) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const userId = userRoute[1];
      if (userId === admin.id) return sendJson(res, 400, { error: "O admin logado nao pode excluir a propria conta." });
      db.users = db.users.filter(user => user.id !== userId);
      db.posts = db.posts.filter(post => post.userId !== userId).map(post => ({
        ...post,
        likes: post.likes.filter(like => like !== userId),
        comments: post.comments.filter(comment => comment.userId !== userId)
      }));
      writeDb(db);
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { error: "Rota nao encontrada." });
  } catch (error) {
    return sendJson(res, 500, { error: "Erro interno.", details: error.message });
  }
}

function serveStatic(req, res) {
  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Build do React nao encontrado. Rode npm run build antes de npm start.");
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(DIST_DIR, requested));

  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(DIST_DIR, "index.html"), (indexError, indexContent) => {
        if (indexError) {
          res.writeHead(404);
          return res.end("Not found");
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(indexContent);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8"
    };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(content);
  });
}

ensureDb();

http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) return handleApi(req, res);
  return serveStatic(req, res);
}).listen(PORT, HOST, () => {
  console.log(`GamePlayn rodando em http://${HOST}:${PORT}`);
  console.log("Usuarios: lorenzo/123456 e admin/admin123");
});
