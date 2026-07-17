require("dotenv").config({ quiet: true });

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const database = require("./database");
const appDatabase = createAppDatabase();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, "dist");
const MAX_BODY_BYTES = 6_000_000;
const MAX_IMAGE_BYTES = 2_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function createAppDatabase() {
  if (process.env.GAMEPLAYN_SQLITE_DB === "1") {
    return require("./database-sqlite").createSqliteDatabase();
  }
  if (process.env.GAMEPLAYN_MEMORY_DB === "1") {
    return database.createMemoryDatabase();
  }
  return database;
}

function requestError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;
    req.on("data", chunk => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        tooLarge = true;
        body = "";
      }
    });
    req.on("end", () => {
      if (tooLarge) return reject(requestError("Payload muito grande.", 413));
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(requestError("JSON invalido.", 400));
      }
    });
    req.on("error", reject);
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
    pinned: Boolean(post.pinned),
    game,
    author: publicUser(author),
    comments: post.comments.map(comment => ({
      ...comment,
      likes: Array.isArray(comment.likes) ? comment.likes : [],
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

function normalizeImageData(imageData) {
  const value = String(imageData || "").trim();
  if (!value) return "";

  const match = value.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) {
    throw new Error("Imagem invalida. Use PNG, JPG, WEBP ou GIF.");
  }

  const mimeType = match[1];
  const base64 = match[2];
  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new Error("Tipo de imagem nao permitido.");
  }

  const bytes = Buffer.byteLength(base64, "base64");
  if (bytes > MAX_IMAGE_BYTES) {
    throw new Error("A imagem deve ter no maximo 2 MB.");
  }

  return `data:${mimeType};base64,${base64}`;
}

async function handleApi(req, res, dbAdapter = appDatabase) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    const db = await dbAdapter.readDb();

    if (req.method === "POST" && url.pathname === "/api/login") {
      const body = await readBody(req);
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = db.users.find(item => item.username.toLowerCase() === username && item.password === password);
      if (!user) return sendJson(res, 401, { error: "Usuario ou senha invalidos." });
      return sendJson(res, 200, { token: user.id, user: publicUser(user) });
    }

    if (req.method === "POST" && url.pathname === "/api/register") {
      const body = await readBody(req);
      const name = String(body.name || "").trim();
      const username = String(body.username || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!name || !username || !password) {
        return sendJson(res, 400, { error: "Nome, usuario e senha sao obrigatorios." });
      }
      if (username.length < 3) {
        return sendJson(res, 400, { error: "O usuario deve ter pelo menos 3 caracteres." });
      }
      if (!/^[a-z0-9_.-]+$/.test(username)) {
        return sendJson(res, 400, { error: "Use apenas letras, numeros, ponto, hifen ou underline no usuario." });
      }
      if (password.length < 6) {
        return sendJson(res, 400, { error: "A senha deve ter pelo menos 6 caracteres." });
      }
      if (db.users.some(item => item.username.toLowerCase() === username)) {
        return sendJson(res, 409, { error: "Nome de usuario ja existe." });
      }

      const user = {
        id: id("u"),
        name,
        username,
        password,
        role: "user",
        bio: ""
      };
      db.users.push(user);
      await dbAdapter.writeDb(db);
      return sendJson(res, 201, { token: user.id, user: publicUser(user) });
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
      await dbAdapter.writeDb(db);
      return sendJson(res, 201, { game });
    }

    const gamePin = url.pathname.match(/^\/api\/games\/([^/]+)\/pin$/);
    if (req.method === "PATCH" && gamePin) {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const game = db.games.find(item => item.id === gamePin[1]);
      if (!game) return sendJson(res, 404, { error: "Jogo nao encontrado." });
      game.pinned = !Boolean(game.pinned);
      await dbAdapter.writeDb(db);
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
      await dbAdapter.writeDb(db);
      return sendJson(res, 200, { game });
    }

    if (req.method === "DELETE" && gameRoute) {
      const admin = requireAdmin(req, res, db);
      if (!admin) return;
      const gameId = gameRoute[1];
      db.games = db.games.filter(game => game.id !== gameId);
      db.posts = db.posts.filter(post => post.gameId !== gameId);
      await dbAdapter.writeDb(db);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/api/posts") {
      const gameId = url.searchParams.get("gameId");
      const posts = db.posts
        .filter(post => !gameId || post.gameId === gameId)
        .sort((a, b) => (
          Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
          || new Date(b.createdAt) - new Date(a.createdAt)
        ))
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
      let imageData = "";
      try {
        imageData = normalizeImageData(body.imageData);
      } catch (error) {
        return sendJson(res, 400, { error: error.message });
      }
      const post = {
        id: id("p"),
        gameId: body.gameId,
        userId: user.id,
        title: body.title.trim(),
        content: body.content.trim(),
        imageData,
        createdAt: new Date().toISOString(),
        pinned: false,
        likes: [],
        comments: []
      };
      db.posts.unshift(post);
      await dbAdapter.writeDb(db);
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
      await dbAdapter.writeDb(db);
      return sendJson(res, 200, { ok: true });
    }

    const postPin = url.pathname.match(/^\/api\/posts\/([^/]+)\/pin$/);
    if (req.method === "PATCH" && postPin) {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const post = db.posts.find(item => item.id === postPin[1]);
      if (!post) return sendJson(res, 404, { error: "Post nao encontrado." });
      post.pinned = !Boolean(post.pinned);
      await dbAdapter.writeDb(db);
      return sendJson(res, 200, { post: hydratePost(post, db) });
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
      await dbAdapter.writeDb(db);
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
        createdAt: new Date().toISOString(),
        likes: []
      });
      await dbAdapter.writeDb(db);
      return sendJson(res, 201, { post: hydratePost(post, db) });
    }

    const commentLike = url.pathname.match(/^\/api\/posts\/([^/]+)\/comments\/([^/]+)\/like$/);
    if (req.method === "POST" && commentLike) {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const post = db.posts.find(item => item.id === commentLike[1]);
      if (!post) return sendJson(res, 404, { error: "Post nao encontrado." });
      const comment = post.comments.find(item => item.id === commentLike[2]);
      if (!comment) return sendJson(res, 404, { error: "Comentario nao encontrado." });
      const likes = Array.isArray(comment.likes) ? comment.likes : [];
      comment.likes = likes.includes(user.id)
        ? likes.filter(item => item !== user.id)
        : [...likes, user.id];
      await dbAdapter.writeDb(db);
      return sendJson(res, 200, { post: hydratePost(post, db) });
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
      await dbAdapter.writeDb(db);
      return sendJson(res, 200, { post: hydratePost(post, db) });
    }

    if (req.method === "PATCH" && url.pathname === "/api/users/me") {
      const user = requireAuth(req, res, db);
      if (!user) return;
      const body = await readBody(req);
      const bio = String(body.bio || "").trim();
      if (bio.length > 200) return sendJson(res, 400, { error: "A bio deve ter no maximo 200 caracteres." });
      user.bio = bio;
      await dbAdapter.writeDb(db);
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
      await dbAdapter.writeDb(db);
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
        comments: post.comments
          .filter(comment => comment.userId !== userId)
          .map(comment => ({
            ...comment,
            likes: Array.isArray(comment.likes) ? comment.likes.filter(like => like !== userId) : []
          }))
      }));
      await dbAdapter.writeDb(db);
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { error: "Rota nao encontrada." });
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 500;
    return sendJson(res, status, {
      error: status >= 500 ? "Erro interno." : error.message,
      ...(status >= 500 ? { details: error.message } : {})
    });
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

function createAppServer(dbAdapter = appDatabase) {
  return http.createServer((req, res) => {
    if (req.url.startsWith("/api/")) return handleApi(req, res, dbAdapter);
    return serveStatic(req, res);
  });
}

async function start() {
  await appDatabase.initDb();

  createAppServer(appDatabase).listen(PORT, HOST, () => {
    console.log(`GamePlayn rodando em http://${HOST}:${PORT}`);
    console.log(`Banco: ${databaseLabel()}`);
    console.log("Admin inicial: lorenzo/lorenzoadmin");
  });
}

function databaseLabel() {
  if (process.env.GAMEPLAYN_SQLITE_DB === "1") return "SQLite local (data/gameplayn.sqlite)";
  if (process.env.GAMEPLAYN_MEMORY_DB === "1") return "PostgreSQL em memoria (dev/teste)";
  return "PostgreSQL";
}

if (require.main === module) {
  start().catch(error => {
    console.error("Falha ao iniciar o GamePlayn:", error.message);
    console.error("Configure DATABASE_URL ou PGHOST, PGPORT, PGDATABASE, PGUSER e PGPASSWORD.");
    process.exit(1);
  });
}

module.exports = {
  createAppServer,
  handleApi,
  start
};
