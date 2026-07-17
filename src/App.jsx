import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api/client";
import { AdminPanel } from "./components/AdminPanel.jsx";
import { Composer } from "./components/Composer.jsx";
import { FeedHeader } from "./components/FeedHeader.jsx";
import { LoginPage } from "./components/LoginPage.jsx";
import { PostCard } from "./components/PostCard.jsx";
import { PostPage } from "./components/PostPage.jsx";
import { ProfilePage } from "./components/ProfilePage.jsx";
import { RecentPostsPanel } from "./components/RecentPostsPanel.jsx";
import { SearchBox } from "./components/SearchBox.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { ThemeToggle } from "./components/ThemeToggle.jsx";

const initialTheme = localStorage.getItem("gameplayn_theme") || "dark";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("gamehub_token") || "");
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState("all");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [view, setView] = useState("feed");
  const [theme, setTheme] = useState(initialTheme);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "info" });
  const [loading, setLoading] = useState(true);
  const feedbackTimerRef = useRef(null);

  const selectedGame = useMemo(
    () => games.find(game => game.id === selectedGameId),
    [games, selectedGameId]
  );

  const profileUser = useMemo(() => {
    const profileId = selectedProfileId || user?.id;
    if (!profileId || user?.id === profileId) return user;
    return users.find(item => item.id === profileId) || allPosts.find(post => post.author?.id === profileId)?.author || null;
  }, [allPosts, selectedProfileId, user, users]);

  const selectedPost = useMemo(() => (
    allPosts.find(post => post.id === selectedPostId) || posts.find(post => post.id === selectedPostId) || null
  ), [allPosts, posts, selectedPostId]);

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const matches = values => values.some(value => String(value || "").toLowerCase().includes(query));
    const authors = new Map();
    if (user) authors.set(user.id, user);
    users.forEach(item => authors.set(item.id, item));
    allPosts.forEach(post => {
      if (post.author?.id) authors.set(post.author.id, post.author);
    });

    const gameResults = games
      .filter(game => matches([game.name, game.genre, game.platform]))
      .slice(0, 4)
      .map(game => ({
        type: "game",
        id: game.id,
        title: game.name,
        meta: `${game.genre || "Genero nao informado"} - ${game.platform || "Plataforma nao informada"}`
      }));

    const postResults = allPosts
      .filter(post => matches([
        post.title,
        post.content,
        post.author?.name,
        post.author?.username,
        post.game?.name,
        post.game?.genre,
        post.game?.platform
      ]))
      .slice(0, 5)
      .map(post => ({
        type: "post",
        id: post.id,
        title: post.title,
        meta: `@${post.author?.username || "usuario removido"} em ${post.game?.name || "jogo removido"}`
      }));

    const userResults = [...authors.values()]
      .filter(author => matches([author.name, author.username, author.bio, author.role]))
      .slice(0, 4)
      .map(author => ({
        type: "user",
        id: author.id,
        title: `@${author.username}`,
        meta: author.name || "Usuario"
      }));

    return [...gameResults, ...postResults, ...userResults].slice(0, 10);
  }, [allPosts, games, searchQuery, user, users]);

  function selectSearchSuggestion(item) {
    setSearchQuery("");
    if (item.type === "game") openGame(item.id);
    if (item.type === "post") openPost(item.id);
    if (item.type === "user") openProfile(item.id);
  }

  const recentPosts = useMemo(() => (
    [...allPosts]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 6)
  ), [allPosts]);

  async function request(path, options = {}) {
    return api(path, options, token);
  }

  async function loadData(nextGameId = selectedGameId) {
    const gameParam = nextGameId === "all" ? "" : `?gameId=${nextGameId}`;
    const [gameData, postData, allPostData] = await Promise.all([
      request("/api/games"),
      request(`/api/posts${gameParam}`),
      request("/api/posts")
    ]);
    setGames(gameData.games);
    setPosts(postData.posts);
    setAllPosts(allPostData.posts);
    if (user?.role === "admin") {
      const usersData = await request("/api/users");
      setUsers(usersData.users);
    } else {
      setUsers([]);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("gameplayn_theme", theme);
  }, [theme]);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api("/api/session", {}, token);
        setUser(data.user);
      } catch {
        localStorage.removeItem("gamehub_token");
        setToken("");
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, [token]);

  useEffect(() => {
    if (loading) return;
    loadData().catch(error => {
      setError(error.message);
      showFeedback(error.message, "error");
    });
  }, [loading, user?.role, selectedGameId]);

  useEffect(() => () => {
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
  }, []);

  function showFeedback(message, type = "info") {
    if (!message) return;
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    setFeedback({ message, type });
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback({ message: "", type: "info" });
    }, 4200);
  }

  function clearFeedback() {
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    setFeedback({ message: "", type: "info" });
  }

  function showActionError(error, fallback = "Nao foi possivel concluir a acao.") {
    showFeedback(error?.message || fallback, "error");
  }

  async function login(username, password) {
    try {
      setError("");
      setAuthNotice("");
      clearFeedback();
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      setToken(data.token);
      setUser(data.user);
      setView("feed");
      localStorage.setItem("gamehub_token", data.token);
      showFeedback(`Bem-vindo, ${data.user.name}.`, "success");
    } catch (error) {
      setError(error.message);
    }
  }

  async function register(payload) {
    try {
      setError("");
      setAuthNotice("");
      clearFeedback();
      const data = await api("/api/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setToken(data.token);
      setUser(data.user);
      setView("feed");
      localStorage.setItem("gamehub_token", data.token);
      showFeedback("Conta criada com sucesso.", "success");
    } catch (error) {
      setError(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("gamehub_token");
    setToken("");
    setUser(null);
    setUsers([]);
    setSelectedGameId("all");
    setSelectedProfileId("");
    setSelectedPostId("");
    setSearchQuery("");
    setError("");
    setAuthNotice("");
    setView("feed");
    showFeedback("Voce saiu da conta.", "info");
  }

  async function refresh() {
    await loadData();
  }

  function requireAuthAction(message = "Faca login ou crie uma conta para continuar.") {
    setError("");
    setAuthNotice(message);
    showFeedback(message, "info");
    setView("auth");
    scrollMainToTop();
    return false;
  }

  async function createPost(payload) {
    if (!user) {
      const message = "Faca login ou crie uma conta para publicar posts.";
      requireAuthAction(message);
      throw new Error(message);
    }
    try {
      await request("/api/posts", { method: "POST", body: JSON.stringify(payload) });
      await refresh();
      showFeedback("Post publicado com sucesso.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel publicar o post.");
      throw error;
    }
  }

  async function toggleLike(postId) {
    if (!user) return requireAuthAction("Faca login ou crie uma conta para curtir posts.");
    try {
      await request(`/api/posts/${postId}/like`, { method: "POST" });
      await refresh();
    } catch (error) {
      showActionError(error, "Nao foi possivel curtir o post.");
    }
  }

  async function pinPost(postId) {
    if (!user) return requireAuthAction("Faca login para fixar posts.");
    try {
      await request(`/api/posts/${postId}/pin`, { method: "PATCH" });
      await refresh();
      showFeedback("Post atualizado.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel fixar o post.");
    }
  }

  async function addComment(postId, content) {
    if (!user) return requireAuthAction("Faca login ou crie uma conta para comentar.");
    try {
      await request(`/api/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) });
      await refresh();
      showFeedback("Comentario publicado.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel comentar.");
      throw error;
    }
  }

  async function toggleCommentLike(postId, commentId) {
    if (!user) return requireAuthAction("Faca login para curtir comentarios.");
    try {
      await request(`/api/posts/${postId}/comments/${commentId}/like`, { method: "POST" });
      await refresh();
    } catch (error) {
      showActionError(error, "Nao foi possivel curtir o comentario.");
    }
  }

  async function deletePost(postId) {
    if (!user) return requireAuthAction("Faca login para excluir posts.");
    if (!confirm("Excluir este post?")) return;
    try {
      await request(`/api/posts/${postId}`, { method: "DELETE" });
      if (selectedPostId === postId) {
        setSelectedPostId("");
        setView("feed");
      }
      await refresh();
      showFeedback("Post excluido.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel excluir o post.");
    }
  }

  async function deleteComment(postId, commentId) {
    if (!user) return requireAuthAction("Faca login para excluir comentarios.");
    if (!confirm("Excluir este comentario?")) return;
    try {
      await request(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
      await refresh();
      showFeedback("Comentario excluido.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel excluir o comentario.");
    }
  }

  async function saveBio(bio) {
    if (!user) return requireAuthAction("Faca login para editar seu perfil.");
    try {
      const data = await request("/api/users/me", { method: "PATCH", body: JSON.stringify({ bio }) });
      setUser(data.user);
      await refresh();
      showFeedback("Perfil atualizado.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel atualizar o perfil.");
    }
  }

  async function createGame(payload) {
    if (!user) return requireAuthAction("Faca login como administrador para criar topicos.");
    try {
      await request("/api/games", { method: "POST", body: JSON.stringify(payload) });
      await refresh();
      showFeedback("Topico criado.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel criar o topico.");
      throw error;
    }
  }

  async function updateGame(gameId, payload) {
    if (!user) return requireAuthAction("Faca login como administrador para editar topicos.");
    try {
      await request(`/api/games/${gameId}`, { method: "PATCH", body: JSON.stringify(payload) });
      await refresh();
      showFeedback("Topico atualizado.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel atualizar o topico.");
      throw error;
    }
  }

  async function deleteGame(gameId) {
    if (!user) return requireAuthAction("Faca login como administrador para excluir topicos.");
    if (!confirm("Excluir jogo e todos os posts desse topico?")) return;
    try {
      await request(`/api/games/${gameId}`, { method: "DELETE" });
      setSelectedGameId("all");
      scrollMainToTop();
      await loadData("all");
      showFeedback("Topico excluido.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel excluir o topico.");
    }
  }

  async function pinGame(gameId) {
    if (!user) return requireAuthAction("Faca login para fixar topicos.");
    try {
      await request(`/api/games/${gameId}/pin`, { method: "PATCH" });
      await refresh();
      showFeedback("Topico atualizado.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel fixar o topico.");
    }
  }

  async function deleteUser(userId) {
    if (!user) return requireAuthAction("Faca login como administrador para gerenciar usuarios.");
    if (!confirm("Excluir este usuario e seus posts?")) return;
    try {
      await request(`/api/users/${userId}`, { method: "DELETE" });
      await refresh();
      showFeedback("Usuario excluido.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel excluir o usuario.");
    }
  }

  async function updateUser(userId, payload) {
    if (!user) return requireAuthAction("Faca login como administrador para gerenciar usuarios.");
    try {
      const data = await request(`/api/users/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
      if (userId === user.id) setUser(data.user);
      await refresh();
      showFeedback("Usuario atualizado.", "success");
    } catch (error) {
      showActionError(error, "Nao foi possivel atualizar o usuario.");
      throw error;
    }
  }

  function openProfile(userId) {
    if (!user) return requireAuthAction("Faca login ou crie uma conta para ver perfis.");
    setSelectedProfileId(userId);
    setView("profile");
    scrollMainToTop();
  }

  function openPost(postId) {
    setSelectedPostId(postId);
    setView("post");
    window.setTimeout(() => {
      document.querySelector(".main-view")?.scrollIntoView({ block: "start" });
    }, 0);
  }

  function openAdmin() {
    if (!user) return requireAuthAction("Faca login como administrador para acessar o painel.");
    if (user.role !== "admin") {
      showFeedback("Apenas administradores podem acessar esse painel.", "error");
      return;
    }
    setView("admin");
    window.setTimeout(() => {
      document.getElementById("adminPanel")?.scrollIntoView({ block: "start" });
    }, 0);
  }

  function openGame(gameId) {
    setSelectedGameId(gameId);
    setSelectedPostId("");
    setView("feed");
    scrollMainToTop();
  }

  function showFeed() {
    setError("");
    setAuthNotice("");
    setView("feed");
    scrollMainToTop();
  }

  function scrollMainToTop() {
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 0);
  }

  if (loading) return <main className="loading-screen">Carregando...</main>;
  if (view === "auth" && !user) {
    return (
      <LoginPage
        error={error}
        notice={authNotice}
        theme={theme}
        onBack={showFeed}
        onRegister={register}
        onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
        onLogin={login}
      />
    );
  }

  const commonPostProps = {
    currentUser: user,
    onAuthorClick: openProfile,
    onComment: addComment,
    onDeleteComment: deleteComment,
    onDeletePost: deletePost,
    onLikeComment: toggleCommentLike,
    onLike: toggleLike,
    onOpenPost: openPost,
    onPinPost: pinPost
  };

  const isAdminView = view === "admin" && user?.role === "admin";
  const isFocusedView = isAdminView || view === "post";

  return (
    <div className={`app-shell ${isFocusedView ? "admin-shell" : ""}`}>
      {!isFocusedView && (
        <Sidebar
          games={games}
          postsCount={posts.length}
          searchQuery={searchQuery}
          searchSuggestions={searchSuggestions}
          selectedGameId={selectedGameId}
          theme={theme}
          view={view}
          profileUser={profileUser}
          currentUser={user}
          onAdminOpen={openAdmin}
          onGameSelect={openGame}
          onLogout={logout}
          onLoginOpen={requireAuthAction}
          onPinGame={pinGame}
          onProfileSelect={openProfile}
          onSearchChange={setSearchQuery}
          onSearchSelect={selectSearchSuggestion}
          onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
          onViewChange={nextView => {
            if (nextView === "feed") {
              showFeed();
              return;
            }
            setView(nextView);
          }}
        />
      )}

      <main className="main-view">
        <div className="top-actions">
          {!isFocusedView && (
            <div className="desktop-search">
              <SearchBox
                query={searchQuery}
                suggestions={searchSuggestions}
                onQueryChange={setSearchQuery}
                onSelect={selectSearchSuggestion}
                placeholder="Buscar posts, tópicos ou pessoas"
              />
            </div>
          )}
          <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
          <button className="btn" type="button" onClick={user ? logout : () => requireAuthAction("Entre ou crie uma conta para continuar.")}>{user ? "Sair" : "Entrar"}</button>
        </div>

        {view === "admin" && user.role === "admin" ? (
          <AdminPanel
            games={games}
            users={users}
            currentUser={user}
            onBack={() => setView("feed")}
            onCreateGame={createGame}
            onDeleteGame={deleteGame}
            onDeleteUser={deleteUser}
            onPinGame={pinGame}
            onProfileSelect={openProfile}
            onUpdateGame={updateGame}
            onUpdateUser={updateUser}
          />
        ) : view === "profile" && user ? (
          <ProfilePage
            user={profileUser}
            currentUser={user}
            posts={allPosts.filter(post => post.userId === profileUser?.id)}
            onBack={showFeed}
            onSaveBio={saveBio}
            postProps={commonPostProps}
          />
        ) : view === "post" ? (
          <PostPage
            post={selectedPost}
            currentUser={user}
            onAuthorClick={openProfile}
            onBack={() => setView("feed")}
            onComment={addComment}
            onDeleteComment={deleteComment}
            onDeletePost={deletePost}
            onLike={toggleLike}
            onLikeComment={toggleCommentLike}
            onPinPost={pinPost}
          />
        ) : (
          <>
            <FeedHeader
              selectedGame={selectedGame}
              currentUser={user}
              onPinGame={pinGame}
            />
            {user ? (
              <Composer games={games} selectedGame={selectedGame} onSubmit={createPost} />
            ) : (
              <section className="composer composer-closed">
                <button className="post-trigger" type="button" onClick={() => requireAuthAction("Faca login ou crie uma conta para publicar posts.")}>
                  <span className="post-trigger__avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span>
                    <strong>Entrar para postar</strong>
                    <small>Leia livremente. Para publicar, curtir ou comentar, use uma conta.</small>
                  </span>
                </button>
              </section>
            )}
            <section className="feed">
              {posts.length ? posts.map(post => <PostCard key={post.id} post={post} {...commonPostProps} />) : (
                <div className="empty">Nenhum post neste topico ainda.</div>
              )}
            </section>
          </>
        )}
      </main>

      {!isFocusedView && (
        <aside className="right-column">
          <RecentPostsPanel posts={recentPosts} onOpenPost={openPost} />
        </aside>
      )}

      {feedback.message && (
        <div className={`app-feedback app-feedback--${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
          <span>{feedback.message}</span>
          <button type="button" onClick={clearFeedback} aria-label="Fechar aviso">x</button>
        </div>
      )}
    </div>
  );
}
