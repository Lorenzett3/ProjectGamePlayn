import { useEffect, useMemo, useState } from "react";
import { api } from "./api/client";
import { AdminPanel } from "./components/AdminPanel.jsx";
import { Composer } from "./components/Composer.jsx";
import { FeedHeader } from "./components/FeedHeader.jsx";
import { LoginPage } from "./components/LoginPage.jsx";
import { PostCard } from "./components/PostCard.jsx";
import { ProfilePage } from "./components/ProfilePage.jsx";
import { ProfilePanel } from "./components/ProfilePanel.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { StatsPanel } from "./components/StatsPanel.jsx";
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
  const [view, setView] = useState("feed");
  const [theme, setTheme] = useState(initialTheme);
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

  async function deletePost(postId) {
    if (!confirm("Excluir este post?")) return;
    await request(`/api/posts/${postId}`, { method: "DELETE" });
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

  function openProfile(userId) {
    setSelectedProfileId(userId);
    setView("profile");
  }

  function openGame(gameId) {
    setSelectedGameId(gameId);
    setView("feed");
  }

  if (loading) return <main className="loading-screen">Carregando...</main>;
  if (!user) return <LoginPage error={error} onLogin={login} />;

  const commonPostProps = {
    currentUser: user,
    onAuthorClick: openProfile,
    onComment: addComment,
    onDeleteComment: deleteComment,
    onDeletePost: deletePost,
    onLike: toggleLike
  };

  return (
    <div className="app-shell">
      <Sidebar
        games={games}
        postsCount={posts.length}
        selectedGameId={selectedGameId}
        view={view}
        profileUser={profileUser}
        currentUser={user}
        onGameSelect={openGame}
        onProfileSelect={openProfile}
        onViewChange={setView}
      />

      <main className="main-view">
        <div className="top-actions">
          <ThemeToggle theme={theme} onToggle={() => setTheme(theme === "dark" ? "light" : "dark")} />
          <button className="btn" type="button" onClick={logout}>Sair</button>
        </div>

        {view === "profile" ? (
          <ProfilePage
            user={profileUser}
            currentUser={user}
            posts={allPosts.filter(post => post.userId === profileUser?.id)}
            onBack={() => setView("feed")}
            onSaveBio={saveBio}
            postProps={commonPostProps}
          />
        ) : (
          <>
            <FeedHeader selectedGame={selectedGame} />
            <Composer games={games} selectedGame={selectedGame} onSubmit={createPost} />
            <section className="feed">
              {posts.length ? posts.map(post => <PostCard key={post.id} post={post} {...commonPostProps} />) : (
                <div className="empty">Nenhum post neste topico ainda.</div>
              )}
            </section>
          </>
        )}
      </main>

      <aside className="right-column">
        <ProfilePanel user={user} posts={allPosts} onProfileSelect={openProfile} />
        <StatsPanel games={games} posts={posts} />
        {user.role === "admin" && (
          <AdminPanel
            games={games}
            users={users}
            currentUser={user}
            onCreateGame={createGame}
            onDeleteGame={deleteGame}
            onDeleteUser={deleteUser}
            onPinGame={pinGame}
            onProfileSelect={openProfile}
          />
        )}
      </aside>
    </div>
  );
}
