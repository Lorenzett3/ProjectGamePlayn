import { coverForGame } from "../data/gameCovers";

export function FeedHeader({ selectedGame }) {
  const title = selectedGame ? selectedGame.name : "Feed geral";
  const subtitle = selectedGame ? `${selectedGame.genre} - ${selectedGame.platform}` : "Todas as discussoes publicadas no GamePlayn.";

  return (
    <header className="game-cover" style={{ "--cover": `url(${coverForGame(selectedGame)})` }}>
      <div className="game-cover__content">
        <span className="tag">{selectedGame ? "Topico de jogo" : "Comunidade"}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}
