import { useEffect, useState } from "react";

export function Composer({ games, selectedGame, onSubmit }) {
  const [gameId, setGameId] = useState(selectedGame?.id || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);

  useEffect(() => {
    setGameId(selectedGame?.id || "");
  }, [selectedGame?.id]);

  function submit(event) {
    event.preventDefault();
    onSubmit({ gameId, title, content });
    setTitle("");
    setContent("");
    setAttachOpen(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <section className="composer composer-closed">
        <button className="post-trigger" type="button" onClick={() => setOpen(true)}>
          <span className="post-trigger__avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span>
            <strong>Postar</strong>
            <small>Compartilhe uma opiniao, dica ou pergunta com a comunidade</small>
          </span>
        </button>
      </section>
    );
  }

  return (
    <form className="composer composer-open form-grid" onSubmit={submit}>
      <div className="composer-head">
        <div>
          <h3>Novo post</h3>
          <p>Escolha um topico e escreva para a comunidade.</p>
        </div>
        <button className="icon-btn" type="button" onClick={() => setOpen(false)} aria-label="Fechar compositor" title="Fechar">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="composer-grid">
        <label>Topico
          <select value={gameId || selectedGame?.id || ""} onChange={event => setGameId(event.target.value)} required>
            <option value="">Selecione um jogo</option>
            {games.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
          </select>
        </label>
        <label>Titulo
          <input value={title} onChange={event => setTitle(event.target.value)} maxLength="90" placeholder="Ex: Vale a pena jogar em 2026?" required />
        </label>
      </div>
      <label>Conteudo
        <div className="text-editor-shell">
          <textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Escreva sua opiniao, dica, tutorial ou pergunta..." required />
          <div className="editor-toolbar" aria-label="Ferramentas visuais do editor">
            <div className="attachment-menu">
              <button
                className="toolbar-btn"
                type="button"
                title="Anexar"
                aria-label="Anexar"
                aria-expanded={attachOpen}
                onClick={() => setAttachOpen(!attachOpen)}
              >
                📎
              </button>
              {attachOpen && (
                <div className="attachment-popover">
                  <button type="button" onClick={() => setAttachOpen(false)}>
                    <span className="menu-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="8" cy="10" r="2" />
                        <path d="M4 17l5-5 4 4 2-2 5 5" />
                      </svg>
                    </span>
                    Foto
                  </button>
                  <button type="button" onClick={() => setAttachOpen(false)}>
                    <span className="menu-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <rect x="3" y="6" width="13" height="12" rx="2" />
                        <path d="M16 10l5-3v10l-5-3z" />
                      </svg>
                    </span>
                    Video
                  </button>
                  <button type="button" onClick={() => setAttachOpen(false)}>
                    <span className="menu-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M4 8h4l1.5-2h5L16 8h4v11H4z" />
                        <circle cx="12" cy="13.5" r="3" />
                      </svg>
                    </span>
                    Camera
                  </button>
                </div>
              )}
            </div>
            <button className="toolbar-btn" type="button" title="Link decorativo" aria-label="Link decorativo">🔗</button>
            <button className="toolbar-btn" type="button" title="Enquete decorativo" aria-label="Enquete decorativo">▦</button>
            <button className="toolbar-btn" type="button" title="Codigo decorativo" aria-label="Codigo decorativo">{"</>"}</button>
            <button className="toolbar-btn" type="button" title="Emoji decorativo" aria-label="Emoji decorativo">☺</button>
          </div>
        </div>
      </label>
      <div className="composer-actions">
        <button className="btn" type="button" onClick={() => setOpen(false)}>Cancelar</button>
        <button className="btn primary" type="submit">Publicar</button>
      </div>
    </form>
  );
}
