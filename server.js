const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PUBLIC_DIR = path.join(ROOT, "public");

const initialData = {
  users: [
    {
      id: "u1",
      name: "Lorenzode Oliveira Moraes",
      username: "lorenzo",
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
      bio: "Conta administrativa para moderacao e gestao do catalogo."
    }
  ],
  games: [
    { id: "g1", name: "The Legend of Zelda: Breath of the Wild", genre: "Aventura", platform: "Nintendo Switch" },
    { id: "g2", name: "Minecraft", genre: "Sandbox", platform: "Multiplataforma" },
    { id: "g3", name: "Elden Ring", genre: "RPG de Acao", platform: "PC, PlayStation, Xbox" },
    { id: "g4", name: "God of War Ragnarok", genre: "Acao e Aventura", platform: "PlayStation, PC" },
    { id: "g5", name: "Fortnite", genre: "Battle Royale", platform: "Multiplataforma" },
    { id: "g6", name: "League of Legends", genre: "MOBA", platform: "PC" },
    { id: "g7", name: "Counter-Strike 2", genre: "FPS", platform: "PC" },
    { id: "g8", name: "Grand Theft Auto V", genre: "Mundo Aberto", platform: "Multiplataforma" },
    { id: "g9", name: "Red Dead Redemption 2", genre: "Acao e Aventura", platform: "PC, PlayStation, Xbox" },
    { id: "g10", name: "Valorant", genre: "FPS Tatico", platform: "PC" }
  ],
  posts: [
    {
      id: "p1",
      gameId: "g3",
      userId: "u1",
      title: "Elden Ring recompensa exploracao como poucos jogos",
      content: "A melhor parte para mim e como o jogo deixa o jogador descobrir caminhos, chefes e historias sem ficar explicando tudo o tempo todo.",
      createdAt: new Date().toISOString(),
      likes: ["u2"],
      comments: [
        { id: "c1", userId: "u2", content: "Boa abertura para demonstrar o formato de discussao por jogo.", createdAt: new Date().toISOString() }
      ]
    },
    {
      id: "p2",
      gameId: "g2",
      userId: "u2",
      title: "Minecraft continua forte por causa da criatividade",
      content: "Mesmo sendo antigo, o jogo continua relevante porque cada servidor e cada mundo vira uma experiencia diferente.",
      createdAt: new Date().toISOString(),
      likes: ["u1"],
      comments: []
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
      const games = db.games.map(game => ({
        ...game,
        postCount: db.posts.filter(post => post.gameId === game.id).length
      }));
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
        platform: body.platform?.trim() || "Nao informado"
      };
      db.games.unshift(game);
      writeDb(db);
      return sendJson(res, 201, { game });
    }

    const gameDelete = url.pathname.match(/^\/api\/games\/([^/]+)$/);
    if (req.method === "DELETE" && gameDelete) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const gameId = gameDelete[1];
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

    if (req.method === "GET" && url.pathname === "/api/users") {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const users = db.users.map(user => ({
        ...publicUser(user),
        postCount: db.posts.filter(post => post.userId === user.id).length
      }));
      return sendJson(res, 200, { users });
    }

    const userDelete = url.pathname.match(/^\/api\/users\/([^/]+)$/);
    if (req.method === "DELETE" && userDelete) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const userId = userDelete[1];
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
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      return res.end("Not found");
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
  console.log(`GameHub Forum rodando em http://${HOST}:${PORT}`);
  console.log("Usuarios: lorenzo/123456 e admin/admin123");
});
