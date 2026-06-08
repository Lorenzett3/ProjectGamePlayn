export function Sidebar({ games, postsCount, selectedGameId, view, profileUser, currentUser, onGameSelect, onPinGame, onProfileSelect, onViewChange }) {
  const isAdmin = currentUser.role === "admin";
  const pinIcon = (
    <span className="pin-label" aria-label="Fixado" title="Fixado">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 4l6 6-3 1-4 4v4l-2 2-2-6-6-2 2-2h4l4-4 1-3z" />
      </svg>
    </span>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>GamePlayn</h1>
        <p>Sua comunidade Gamer</p>
      </div>
      <nav className="nav-list" aria-label="Navegação principal">
        <button className={`nav-btn ${view === "feed" ? "active" : ""}`} type="button" onClick={() => onViewChange("feed")}>Feed</button>
        <button className={`nav-btn ${view === "profile" && profileUser?.id === currentUser.id ? "active" : ""}`} type="button" onClick={() => onProfileSelect(currentUser.id)}>Meu perfil</button>
      </nav>
      <div className="game-list">
        <button className={`game-btn ${selectedGameId === "all" ? "active" : ""}`} type="button" onClick={() => onGameSelect("all")}>
          <strong>Feed</strong>
          <span>{postsCount} posts</span>
        </button>
        {games.map(game => (
          <div className="game-item" key={game.id}>
            <button className={`game-btn ${selectedGameId === game.id ? "active" : ""}`} type="button" onClick={() => onGameSelect(game.id)}>
              <strong>{game.pinned && pinIcon}{game.name}</strong>
              <span>{game.genre} - {game.postCount} posts</span>
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
    </aside>
  );
}
