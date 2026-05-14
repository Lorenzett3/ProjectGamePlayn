const state = {
  user: null,
  token: localStorage.getItem("gamehub_token") || "",
  games: [],
  posts: [],
  users: [],
  selectedGameId: "all",
  error: ""
};

const app = document.querySelector("#app");

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro na requisicao.");
  return data;
};

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatDate = iso => new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
}).format(new Date(iso));

async function init() {
  if (state.token) {
    try {
      const data = await api("/api/session");
      state.user = data.user;
    } catch {
      localStorage.removeItem("gamehub_token");
      state.token = "";
    }
  }
  if (state.user) await loadData();
  render();
}

async function loadData() {
  const gameParam = state.selectedGameId === "all" ? "" : `?gameId=${state.selectedGameId}`;
  const [games, posts] = await Promise.all([
    api("/api/games"),
    api(`/api/posts${gameParam}`)
  ]);
  state.games = games.games;
  state.posts = posts.posts;
  if (state.user?.role === "admin") {
    state.users = (await api("/api/users")).users;
  }
}

function render() {
  if (!state.user) {
    app.innerHTML = loginTemplate();
    bindLogin();
    return;
  }
  app.innerHTML = shellTemplate();
  bindApp();
}

function loginTemplate() {
  return `
    <main class="login-page">
      <section class="login-box">
        <div class="login-hero">
          <h1>GameHub Forum</h1>
          <p>Uma comunidade gamer onde cada jogo vira um topico de discussao para opinioes, recomendacoes, curiosidades, dicas e tutoriais.</p>
        </div>
        <form class="login-form" id="loginForm">
          <div>
            <h2>Entrar no MVP</h2>
            <p class="muted">Use um dos usuarios prontos para demonstrar o sistema.</p>
          </div>
          ${state.error ? `<div class="error">${escapeHtml(state.error)}</div>` : ""}
          <label>Usuario
            <input name="username" value="lorenzo" autocomplete="username" required />
          </label>
          <label>Senha
            <input name="password" type="password" value="123456" autocomplete="current-password" required />
          </label>
          <button class="btn primary" type="submit">Entrar</button>
          <div class="quick-users">
            <button class="btn" type="button" data-quick="lorenzo:123456">Entrar como jogador</button>
            <button class="btn" type="button" data-quick="admin:admin123">Entrar como admin</button>
          </div>
        </form>
      </section>
    </main>
  `;
}

function shellTemplate() {
  const selectedGame = state.games.find(game => game.id === state.selectedGameId);
  return `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <h1>GameHub Forum</h1>
          <p>Topicos por jogo, estilo comunidade gamer.</p>
        </div>
        <div class="game-list">
          <button class="game-btn ${state.selectedGameId === "all" ? "active" : ""}" data-game="all">
            <strong>Feed geral</strong>
            <span>${state.posts.length} posts carregados</span>
          </button>
          ${state.games.map(game => `
            <button class="game-btn ${state.selectedGameId === game.id ? "active" : ""}" data-game="${game.id}">
              <strong>${escapeHtml(game.name)}</strong>
              <span>${escapeHtml(game.genre)} - ${game.postCount} posts</span>
            </button>
          `).join("")}
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <h2>${selectedGame ? escapeHtml(selectedGame.name) : "Feed geral"}</h2>
            <p>${selectedGame ? `${escapeHtml(selectedGame.genre)} - ${escapeHtml(selectedGame.platform)}` : "Todas as discussoes publicadas no GameHub."}</p>
          </div>
          <div class="actions">
            ${state.user.role === "admin" ? `<button class="btn" data-scroll-admin>Painel admin</button>` : ""}
            <button class="btn" data-logout>Sair</button>
          </div>
        </header>

        ${composerTemplate(selectedGame)}
        <section class="feed">
          ${state.posts.length ? state.posts.map(postTemplate).join("") : `<div class="empty">Nenhum post neste topico ainda.</div>`}
        </section>
      </main>

      <aside class="right-col">
        ${profileTemplate()}
        ${statsTemplate()}
        ${state.user.role === "admin" ? adminTemplate() : ""}
      </aside>
    </div>
  `;
}

function composerTemplate(selectedGame) {
  return `
    <form class="composer form-grid" id="postForm">
      <label>Jogo/topico
        <select name="gameId" required>
          <option value="">Selecione um jogo</option>
          ${state.games.map(game => `
            <option value="${game.id}" ${selectedGame?.id === game.id ? "selected" : ""}>${escapeHtml(game.name)}</option>
          `).join("")}
        </select>
      </label>
      <label>Titulo
        <input name="title" maxlength="90" placeholder="Ex: Vale a pena jogar em 2026?" required />
      </label>
      <label>Post textual
        <textarea name="content" placeholder="Escreva sua opiniao, dica, tutorial ou pergunta..." required></textarea>
      </label>
      <button class="btn primary" type="submit">Publicar no topico</button>
    </form>
  `;
}

function postTemplate(post) {
  const canDelete = state.user.role === "admin" || state.user.id === post.userId;
  const liked = post.likes.includes(state.user.id);
  return `
    <article class="post" data-post="${post.id}">
      <div class="post-head">
        <div>
          <span class="tag"># ${escapeHtml(post.game?.name || "Jogo removido")}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <div class="meta">por ${escapeHtml(post.author?.username || "usuario removido")} - ${formatDate(post.createdAt)}</div>
        </div>
        ${canDelete ? `<button class="btn danger" data-delete-post="${post.id}">Excluir</button>` : ""}
      </div>
      <p>${escapeHtml(post.content)}</p>
      <div class="post-actions">
        <button class="btn" data-like="${post.id}">${liked ? "Curtido" : "Curtir"} (${post.likes.length})</button>
        <span class="meta">${post.comments.length} comentarios</span>
      </div>
      <div class="comments">
        ${post.comments.map(comment => `
          <div class="comment">
            <div class="meta">${escapeHtml(comment.author?.username || "usuario removido")} - ${formatDate(comment.createdAt)}</div>
            <div>${escapeHtml(comment.content)}</div>
          </div>
        `).join("")}
        <form class="actions" data-comment-form="${post.id}">
          <input name="content" placeholder="Comentar neste post" required />
          <button class="btn" type="submit">Comentar</button>
        </form>
      </div>
    </article>
  `;
}

function profileTemplate() {
  return `
    <section class="panel">
      <h3>Perfil</h3>
      <div class="profile-row"><span>Nome</span><strong>${escapeHtml(state.user.name)}</strong></div>
      <div class="profile-row"><span>Usuario</span><strong>@${escapeHtml(state.user.username)}</strong></div>
      <div class="profile-row"><span>Tipo</span><strong>${state.user.role === "admin" ? "Admin" : "Jogador"}</strong></div>
      <p class="muted">${escapeHtml(state.user.bio)}</p>
    </section>
  `;
}

function statsTemplate() {
  const totalComments = state.posts.reduce((sum, post) => sum + post.comments.length, 0);
  const totalLikes = state.posts.reduce((sum, post) => sum + post.likes.length, 0);
  return `
    <section class="panel">
      <h3>Resumo</h3>
      <div class="stat-row"><span>Jogos no catalogo</span><strong>${state.games.length}</strong></div>
      <div class="stat-row"><span>Posts carregados</span><strong>${state.posts.length}</strong></div>
      <div class="stat-row"><span>Curtidas</span><strong>${totalLikes}</strong></div>
      <div class="stat-row"><span>Comentarios</span><strong>${totalComments}</strong></div>
    </section>
  `;
}

function adminTemplate() {
  return `
    <section class="panel" id="adminPanel">
      <h3>Painel admin</h3>
      <form class="form-grid" id="gameForm">
        <label>Novo jogo
          <input name="name" placeholder="Nome do jogo" required />
        </label>
        <label>Genero
          <input name="genre" placeholder="RPG, FPS, MOBA..." />
        </label>
        <label>Plataforma
          <input name="platform" placeholder="PC, PlayStation..." />
        </label>
        <button class="btn primary" type="submit">Cadastrar jogo</button>
      </form>
      <h3>Jogos</h3>
      ${state.games.map(game => `
        <div class="admin-row">
          <span>${escapeHtml(game.name)}</span>
          <button class="btn danger" data-delete-game="${game.id}">Excluir</button>
        </div>
      `).join("")}
      <h3>Usuarios</h3>
      ${state.users.map(user => `
        <div class="admin-row">
          <span>@${escapeHtml(user.username)} (${user.role})</span>
          ${user.id === state.user.id ? `<span class="muted">logado</span>` : `<button class="btn danger" data-delete-user="${user.id}">Excluir</button>`}
        </div>
      `).join("")}
    </section>
  `;
}

function bindLogin() {
  document.querySelector("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await login(form.get("username"), form.get("password"));
  });

  document.querySelectorAll("[data-quick]").forEach(button => {
    button.addEventListener("click", async () => {
      const [username, password] = button.dataset.quick.split(":");
      await login(username, password);
    });
  });
}

async function login(username, password) {
  try {
    state.error = "";
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("gamehub_token", data.token);
    await loadData();
    render();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

function bindApp() {
  document.querySelectorAll("[data-game]").forEach(button => {
    button.addEventListener("click", async () => {
      state.selectedGameId = button.dataset.game;
      await loadData();
      render();
    });
  });

  document.querySelector("[data-logout]").addEventListener("click", () => {
    localStorage.removeItem("gamehub_token");
    Object.assign(state, { user: null, token: "", posts: [], games: [], users: [], selectedGameId: "all" });
    render();
  });

  document.querySelector("[data-scroll-admin]")?.addEventListener("click", () => {
    document.querySelector("#adminPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelector("#postForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api("/api/posts", {
      method: "POST",
      body: JSON.stringify({
        gameId: form.get("gameId"),
        title: form.get("title"),
        content: form.get("content")
      })
    });
    await loadData();
    render();
  });

  document.querySelectorAll("[data-like]").forEach(button => {
    button.addEventListener("click", async () => {
      await api(`/api/posts/${button.dataset.like}/like`, { method: "POST" });
      await loadData();
      render();
    });
  });

  document.querySelectorAll("[data-comment-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = new FormData(form);
      await api(`/api/posts/${form.dataset.commentForm}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: data.get("content") })
      });
      await loadData();
      render();
    });
  });

  document.querySelectorAll("[data-delete-post]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Excluir este post?")) return;
      await api(`/api/posts/${button.dataset.deletePost}`, { method: "DELETE" });
      await loadData();
      render();
    });
  });

  document.querySelector("#gameForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api("/api/games", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        genre: form.get("genre"),
        platform: form.get("platform")
      })
    });
    await loadData();
    render();
  });

  document.querySelectorAll("[data-delete-game]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Excluir jogo e todos os posts desse topico?")) return;
      await api(`/api/games/${button.dataset.deleteGame}`, { method: "DELETE" });
      state.selectedGameId = "all";
      await loadData();
      render();
    });
  });

  document.querySelectorAll("[data-delete-user]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Excluir este usuario e seus posts?")) return;
      await api(`/api/users/${button.dataset.deleteUser}`, { method: "DELETE" });
      await loadData();
      render();
    });
  });
}

init();
