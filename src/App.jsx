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

  async function pinPost(postId) {
    await request(`/api/posts/${postId}/pin`, { method: "PATCH" });
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
    scrollMainToTop();
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
    scrollMainToTop();
  }

  function showFeed() {
    setView("feed");
    scrollMainToTop();
  }

  function scrollMainToTop() {
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 0);
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
    onOpenPost: openPost,
    onPinPost: pinPost
  };

  const isAdminView = view === "admin" && user.role === "admin";
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
            <Composer games={games} selectedGame={selectedGame} onSubmit={createPost} />
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
    </div>
  );
}
