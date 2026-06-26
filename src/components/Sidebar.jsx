import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle.jsx";

export function Sidebar({
  games,
  postsCount,
  searchQuery,
  selectedGameId,
  theme,
  view,
  profileUser,
  currentUser,
  onAdminOpen,
  onGameSelect,
  onLogout,
  onPinGame,
  onProfileSelect,
  onSearchChange,
  onThemeToggle,
  onViewChange
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = currentUser.role === "admin";
  const pinIcon = (
    <span className="pin-label" aria-label="Fixado" title="Fixado">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 4l6 6-3 1-4 4v4l-2 2-2-6-6-2 2-2h4l4-4 1-3z" />
      </svg>
    </span>
  );
  const mobileMenuId = "mobile-navigation";

  function selectGame(gameId) {
    onGameSelect(gameId);
    setMobileOpen(false);
  }

  function openOwnProfile() {
    onProfileSelect(currentUser.id);
    setMobileOpen(false);
  }

  function openAdminPanel() {
    onAdminOpen();
    setMobileOpen(false);
  }

  function showFeed() {
    onViewChange("feed");
    setMobileOpen(false);
  }

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="mobile-menu-bar">
        <button
          className={`icon-btn mobile-menu-toggle ${mobileOpen ? "active" : ""}`}
          type="button"
          aria-controls={mobileMenuId}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMobileOpen(open => !open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
        <strong>GamePlayn</strong>
        <span>{postsCount} posts</span>
      </div>

      <div className="brand">
        <h1>GamePlayn</h1>
        <p>Sua comunidade Gamer</p>
      </div>

      <nav className="nav-list" aria-label="Navegação principal">
        <button className={`nav-btn ${view === "feed" ? "active" : ""}`} type="button" onClick={showFeed}>Feed</button>
        <button className={`nav-btn ${view === "profile" && profileUser?.id === currentUser.id ? "active" : ""}`} type="button" onClick={openOwnProfile}>Meu perfil</button>
        {isAdmin && (
          <button className={`nav-btn ${view === "admin" ? "active" : ""}`} type="button" onClick={openAdminPanel}>Painel admin</button>
        )}
      </nav>

      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} id={mobileMenuId}>
        <nav className="mobile-menu__actions" aria-label="Navegação mobile">
          <button className={`nav-btn ${view === "feed" ? "active" : ""}`} type="button" onClick={showFeed}>Feed</button>
          <button className={`nav-btn ${view === "profile" && profileUser?.id === currentUser.id ? "active" : ""}`} type="button" onClick={openOwnProfile}>Meu perfil</button>
          {isAdmin && (
            <button className={`nav-btn ${view === "admin" ? "active" : ""}`} type="button" onClick={openAdminPanel}>Painel admin</button>
          )}
        </nav>
      </div>

      <div className="game-list">
        <button className={`game-btn ${selectedGameId === "all" ? "active" : ""}`} type="button" onClick={() => selectGame("all")}>
          <strong>Feed</strong>
          <span>{postsCount} posts</span>
        </button>
        {games.map(game => (
          <div className="game-item" key={game.id}>
            <button className={`game-btn ${selectedGameId === game.id ? "active" : ""}`} type="button" onClick={() => selectGame(game.id)}>
              <strong>{game.pinned && pinIcon}{game.name}</strong>
              <span>{game.postCount} posts</span>
            </button>
            {isAdmin && (
              <button
                className={`icon-btn pin-topic-btn ${game.pinned ? "active" : ""}`}
                type="button"
                title={game.pinned ? "Desfixar topico" : "Fixar topico"}
                aria-label={game.pinned ? `Desfixar ${game.name}` : `Fixar ${game.name}`}
                onClick={() => onPinGame(game.id)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 4l6 6-3 1-4 4v4l-2 2-2-6-6-2 2-2h4l4-4 1-3z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <label className="mobile-search">
        <input
          type="search"
          value={searchQuery}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Buscar posts e tópicos"
        />
      </label>

      <div className="mobile-menu__footer">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <button className="btn" type="button" onClick={onLogout}>Sair</button>
      </div>
    </aside>
  );
}
