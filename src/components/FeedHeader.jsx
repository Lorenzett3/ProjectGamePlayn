import { coverForGame } from "../data/gameCovers";

export function FeedHeader({ selectedGame, currentUser, onPinGame }) {
  const title = selectedGame ? selectedGame.name : "Feed";
  const subtitle = selectedGame ? `${selectedGame.genre} - ${selectedGame.platform}` : "Todas as discussoes publicadas no GamePlayn.";
  const canPin = selectedGame && currentUser;

  return (
    <header className="game-cover" style={{ "--cover": `url(${coverForGame(selectedGame)})` }}>
      <div className="game-cover__content">
        <div className="game-cover__top">
          <span className="tag">{selectedGame ? "Jogo" : "Comunidade"}</span>
          {canPin && (
            <button className="btn game-cover__pin" type="button" onClick={() => onPinGame(selectedGame.id)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 4l6 6-3 1-4 4v4l-2 2-2-6-6-2 2-2h4l4-4 1-3z" />
              </svg>
              {selectedGame.pinned ? "Desfixar topico" : "Fixar topico"}
            </button>
          )}
        </div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}
