export function Sidebar({ games, postsCount, selectedGameId, view, profileUser, currentUser, onGameSelect, onProfileSelect, onViewChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>GamePlayn</h1>
        <p>Topicos por jogo, estilo comunidade gamer.</p>
      </div>
      <nav className="nav-list" aria-label="Navegacao principal">
        <button className={`nav-btn ${view === "feed" ? "active" : ""}`} type="button" onClick={() => onViewChange("feed")}>Feed</button>
        <button className={`nav-btn ${view === "profile" && profileUser?.id === currentUser.id ? "active" : ""}`} type="button" onClick={() => onProfileSelect(currentUser.id)}>Meu perfil</button>
      </nav>
      <div className="game-list">
        <button className={`game-btn ${selectedGameId === "all" ? "active" : ""}`} type="button" onClick={() => onGameSelect("all")}>
          <strong>Feed geral</strong>
          <span>{postsCount} posts carregados</span>
        </button>
        {games.map(game => (
          <button className={`game-btn ${selectedGameId === game.id ? "active" : ""}`} key={game.id} type="button" onClick={() => onGameSelect(game.id)}>
            <strong>{game.pinned && <span className="pin-label">Fixado</span>}{game.name}</strong>
            <span>{game.genre} - {game.postCount} posts</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
