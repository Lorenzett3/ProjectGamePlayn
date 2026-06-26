import { useEffect, useMemo, useState } from "react";
import { api } from "./api/client";
import { AdminPanel } from "./components/AdminPanel.jsx";
import { Composer } from "./components/Composer.jsx";
import { FeedHeader } from "./components/FeedHeader.jsx";
import { LoginPage } from "./components/LoginPage.jsx";
import { PostCard } from "./components/PostCard.jsx";
import { PostPage } from "./components/PostPage.jsx";
import { ProfilePage } from "./components/ProfilePage.jsx";
import { RecentPostsPanel } from "./components/RecentPostsPanel.jsx";
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
  const [loading, setLoading] = useState(true);

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

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredGames = useMemo(() => {
    if (!normalizedSearch) return games;
    return games.filter(game => [
      game.name,
      game.genre,
      game.platform
    ].some(value => String(value || "").toLowerCase().includes(normalizedSearch)));
  }, [games, normalizedSearch]);

  const filteredPosts = useMemo(() => {
    if (!normalizedSearch) return posts;
    return posts.filter(post => {
      const game = games.find(item => item.id === post.gameId);
      return [
        post.title,
        post.content,
        post.author?.name,
        post.author?.username,
        game?.name,
        game?.genre,
        game?.platform
      ].some(value => String(value || "").toLowerCase().includes(normalizedSearch));
    });
  }, [games, normalizedSearch, posts]);

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
    if (!user) return;
    loadData().catch(error => setError(error.message));
  }, [user, selectedGameId]);

  async function login(username, password) {
    try {
      setError("");
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("gamehub_token", data.token);
    } catch (error) {
      setError(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("gamehub_token");
    setToken("");
    setUser(null);
    setGames([]);
    setPosts([]);
    setAllPosts([]);
    setUsers([]);
    setSelectedGameId("all");
    setSelectedProfileId("");
    setSelectedPostId("");
    setSearchQuery("");
    setView("feed");
  }

  async function refresh() {
    await loadData();
  }

  async function createPost(payload) {
    await request("/api/posts", { method: "POST", body: JSON.stringify(payload) });
    await refresh();
  }

  async function toggleLike(postId) {
    await request(`/api/posts/${postId}/like`, { method: "POST" });
    await refresh();
  }

  async function addComment(postId, content) {
    await request(`/api/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) });
    await refresh();
  }

  async function toggleCommentLike(postId, commentId) {
    await request(`/api/posts/${postId}/comments/${commentId}/like`, { method: "POST" });
    await refresh();
  }

  async function deletePost(postId) {
    if (!confirm("Excluir este post?")) return;
    await request(`/api/posts/${postId}`, { method: "DELETE" });
    if (selectedPostId === postId) {
      setSelectedPostId("");
      setView("feed");
    }
    await refresh();
  }

  async function deleteComment(postId, commentId) {
    if (!confirm("Excluir este comentario?")) return;
    await request(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
    await refresh();
  }

  async function saveBio(bio) {
    const data = await request("/api/users/me", { method: "PATCH", body: JSON.stringify({ bio }) });
    setUser(data.user);
    await refresh();
  }

  async function createGame(payload) {
    await request("/api/games", { method: "POST", body: JSON.stringify(payload) });
    await refresh();
  }

  async function updateGame(gameId, payload) {
    await request(`/api/games/${gameId}`, { method: "PATCH", body: JSON.stringify(payload) });
    await refresh();
  }

  async function deleteGame(gameId) {
    if (!confirm("Excluir jogo e todos os posts desse topico?")) return;
    await request(`/api/games/${gameId}`, { method: "DELETE" });
    setSelectedGameId("all");
    await loadData("all");
  }

  async function pinGame(gameId) {
    await request(`/api/games/${gameId}/pin`, { method: "PATCH" });
    await refresh();
  }

  async function deleteUser(userId) {
    if (!confirm("Excluir este usuario e seus posts?")) return;
    await request(`/api/users/${userId}`, { method: "DELETE" });
    await refresh();
  }

  async function updateUser(userId, payload) {
    const data = await request(`/api/users/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
    if (userId === user.id) setUser(data.user);
    await refresh();
  }

  function openProfile(userId) {
    setSelectedProfileId(userId);
    setView("profile");
  }

  function openPost(postId) {
    setSelectedPostId(postId);
    setView("post");
    window.setTimeout(() => {
      document.querySelector(".main-view")?.scrollIntoView({ block: "start" });
    }, 0);
  }

  function openAdmin() {
    if (user?.role !== "admin") return;
    setView("admin");
    window.setTimeout(() => {
      document.getElementById("adminPanel")?.scrollIntoView({ block: "start" });
    }, 0);
  }

  function openGame(gameId) {
    setSelectedGameId(gameId);
    setSelectedPostId("");
    setView("feed");
  }

  if (loading) return <main className="loading-screen">Carregando...</main>;
  if (!user) return <LoginPage error={error} theme={theme} onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")} onLogin={login} />;

  const commonPostProps = {
    currentUser: user,
    onAuthorClick: openProfile,
    onComment: addComment,
    onDeleteComment: deleteComment,
    onDeletePost: deletePost,
    onLikeComment: toggleCommentLike,
    onLike: toggleLike,
    onOpenPost: openPost
  };

  const isAdminView = view === "admin" && user.role === "admin";
  const isFocusedView = isAdminView || view === "post";

  return (
    <div className={`app-shell ${isFocusedView ? "admin-shell" : ""}`}>
      {!isFocusedView && (
        <Sidebar
          games={filteredGames}
          postsCount={filteredPosts.length}
          searchQuery={searchQuery}
          selectedGameId={selectedGameId}
          theme={theme}
          view={view}
          profileUser={profileUser}
          currentUser={user}
          onAdminOpen={openAdmin}
          onGameSelect={openGame}
          onLogout={logout}
          onPinGame={pinGame}
          onProfileSelect={openProfile}
          onSearchChange={setSearchQuery}
          onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
          onViewChange={setView}
        />
      )}

      <main className="main-view">
        <div className="top-actions">
          {!isFocusedView && (
            <label className="desktop-search">
              <input
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Buscar posts, tópicos ou pessoas"
              />
            </label>
          )}
          <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
          <button className="btn" type="button" onClick={logout}>Sair</button>
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
        ) : view === "profile" ? (
          <ProfilePage
            user={profileUser}
            currentUser={user}
            posts={allPosts.filter(post => post.userId === profileUser?.id)}
            onBack={() => setView("feed")}
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
          />
        ) : (
          <>
            <FeedHeader
              selectedGame={selectedGame}
              currentUser={user}
              onPinGame={pinGame}
            />
            <Composer games={games} selectedGame={selectedGame} onSubmit={createPost} />
            <section className="feed">
              {filteredPosts.length ? filteredPosts.map(post => <PostCard key={post.id} post={post} {...commonPostProps} />) : (
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
    </div>
  );
}
