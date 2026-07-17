import { useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 2_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function Composer({ games, selectedGame, onSubmit }) {
  const [gameId, setGameId] = useState(selectedGame?.id || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageData, setImageData] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [open, setOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    setGameId(selectedGame?.id || "");
  }, [selectedGame?.id]);

  async function submit(event) {
    event.preventDefault();
    setImageError("");
    try {
      await onSubmit({ gameId, title, content, imageData });
    } catch (error) {
      setImageError(error.message || "Nao foi possivel publicar o post.");
      return;
    }
    setTitle("");
    setContent("");
    clearImage();
    setAttachOpen(false);
    setOpen(false);
  }

  function selectImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageError("");
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageError("Use uma imagem PNG, JPG, WEBP ou GIF.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("A imagem deve ter no maximo 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result || ""));
      setImageName(file.name);
      setAttachOpen(false);
    };
    reader.onerror = () => {
      setImageError("Nao foi possivel carregar a imagem.");
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageData("");
    setImageName("");
    setImageError("");
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
              <input
                ref={imageInputRef}
                className="attachment-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={selectImage}
              />
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
                  <button type="button" onClick={() => imageInputRef.current?.click()}>
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
        {imageError && <span className="attachment-error">{imageError}</span>}
        {imageData && (
          <div className="image-preview">
            <img src={imageData} alt={`Previa de ${imageName}`} />
            <div>
              <strong>{imageName}</strong>
              <button className="text-danger" type="button" onClick={clearImage}>Remover imagem</button>
            </div>
          </div>
        )}
      </label>
      <div className="composer-actions">
        <button className="btn" type="button" onClick={() => setOpen(false)}>Cancelar</button>
        <button className="btn primary" type="submit">Publicar</button>
      </div>
    </form>
  );
}
