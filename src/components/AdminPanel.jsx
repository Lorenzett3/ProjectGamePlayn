import { useEffect, useRef, useState } from "react";
import { avatarFor } from "../utils";

const icons = {
  cancel: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4l6 6-3 1-4 4v4l-2 2-2-6-6-2 2-2h4l4-4 1-3z" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
};

const PAGE_SIZE = 10;
const MAX_MARKERS = 5;
const POPULAR_GENRES = ["Aventura", "RPG", "Ação", "FPS", "MOBA", "Sandbox", "Battle Royale", "Estratégia", "Corrida", "Esporte", "Terror", "Indie"];
const POPULAR_PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Multiplataforma"];

function markerList(value) {
  const markers = String(value || "")
    .split(",")
    .map(marker => marker.trim())
    .filter(Boolean);

  return markers.filter((marker, index) => (
    markers.findIndex(item => item.toLowerCase() === marker.toLowerCase()) === index
  ));
}

function markerText(markers) {
  return markers.join(", ");
}

function toggleMarker(value, option) {
  const markers = markerList(value);
  const markerIndex = markers.findIndex(marker => marker.toLowerCase() === option.toLowerCase());

  if (markerIndex >= 0) {
    return markerText(markers.filter((_, index) => index !== markerIndex));
  }

  if (markers.length >= MAX_MARKERS) return markerText(markers);
  return markerText([...markers, option]);
}

function normalizeGameDraft(draft) {
  return {
    ...draft,
    genre: markerText(markerList(draft.genre)),
    platform: markerText(markerList(draft.platform))
  };
}

function hasTooManyMarkers(draft) {
  return markerList(draft.genre).length > MAX_MARKERS || markerList(draft.platform).length > MAX_MARKERS;
}

function SuggestionChips({ label, options, value, onSelect }) {
  const selectedMarkers = markerList(value);

  return (
    <>
      <div className="admin-suggestion-chips" aria-label={label}>
        {options.map(option => {
          const isActive = selectedMarkers.some(marker => marker.toLowerCase() === option.toLowerCase());
          const isDisabled = !isActive && selectedMarkers.length >= MAX_MARKERS;

          return (
            <button
              className={isActive ? "active" : ""}
              disabled={isDisabled}
              key={option}
              type="button"
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      <span className="admin-marker-count">{selectedMarkers.length}/{MAX_MARKERS}</span>
    </>
  );
}

export function AdminPanel({ games, users, currentUser, onBack, onCreateGame, onDeleteGame, onDeleteUser, onPinGame, onProfileSelect, onUpdateGame, onUpdateUser }) {
  const [editingGameId, setEditingGameId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [gameDraft, setGameDraft] = useState({ name: "", genre: "", platform: "" });
  const [userDraft, setUserDraft] = useState({ name: "", username: "", role: "user", bio: "" });
  const [editDialog, setEditDialog] = useState(null);
  const [adminTab, setAdminTab] = useState("users");
  const [gamesPage, setGamesPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [adminError, setAdminError] = useState("");
  const dialogRef = useRef(null);
  const gamesPageCount = Math.max(1, Math.ceil(games.length / PAGE_SIZE));
  const usersPageCount = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visibleGames = games.slice((gamesPage - 1) * PAGE_SIZE, gamesPage * PAGE_SIZE);
  const visibleUsers = users.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE);

  useEffect(() => {
    if (!editDialog) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = event => {
      if (event.key === "Escape") closeDialog();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector("form input, form select, form button")?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editDialog]);

  useEffect(() => {
    setGamesPage(page => Math.min(page, gamesPageCount));
  }, [gamesPageCount]);

  useEffect(() => {
    setUsersPage(page => Math.min(page, usersPageCount));
  }, [usersPageCount]);

  function startCreateGame() {
    setAdminError("");
    setGameDraft({ name: "", genre: "", platform: "" });
    setEditDialog({ type: "createGame", id: "", title: "Novo jogo" });
  }

  async function saveNewGame() {
    try {
      setAdminError("");
      if (hasTooManyMarkers(gameDraft)) {
        setAdminError(`Use no maximo ${MAX_MARKERS} marcadores em genero e plataforma.`);
        return;
      }

      const normalizedDraft = normalizeGameDraft(gameDraft);
      await onCreateGame(normalizedDraft);
      setEditDialog(null);
      setGameDraft({ name: "", genre: "", platform: "" });
    } catch (error) {
      setAdminError(error.message);
    }
  }

  function startGameEdit(game) {
    setAdminError("");
    setGameDraft({ name: game.name, genre: game.genre || "", platform: game.platform || "" });
    setEditDialog({ type: "game", id: game.id, title: game.name });
  }

  async function saveGameEdit(gameId) {
    try {
      setAdminError("");
      if (hasTooManyMarkers(gameDraft)) {
        setAdminError(`Use no maximo ${MAX_MARKERS} marcadores em genero e plataforma.`);
        return;
      }

      await onUpdateGame(gameId, normalizeGameDraft(gameDraft));
      setEditingGameId("");
      setEditDialog(null);
    } catch (error) {
      setAdminError(error.message);
    }
  }

  function startUserEdit(user) {
    setAdminError("");
    setUserDraft({ name: user.name, username: user.username, role: user.role, bio: user.bio || "" });
    setEditDialog({ type: "user", id: user.id, title: user.name });
  }

  async function saveUserEdit(userId) {
    try {
      setAdminError("");
      await onUpdateUser(userId, userDraft);
      setEditingUserId("");
      setEditDialog(null);
    } catch (error) {
      setAdminError(error.message);
    }
  }

  function closeDialog() {
    setEditDialog(null);
    setEditingGameId("");
    setEditingUserId("");
  }

  function Pagination({ page, pageCount, total, onPageChange }) {
    const start = total ? (page - 1) * PAGE_SIZE + 1 : 0;
    const end = Math.min(page * PAGE_SIZE, total);

    return (
      <div className="admin-pagination">
        <span>{start}-{end} de {total}</span>
        <div className="admin-pagination__actions">
          <button className="btn" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
          <span>Página {page} de {pageCount}</span>
          <button className="btn" type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Próxima</button>
        </div>
      </div>
    );
  }

  return (
    <section className="admin-page" id="adminPanel">
      <header className="admin-page__header">
        <div>
          <span className="tag">administração</span>
          <h2>Painel admin</h2>
        </div>
        <div className="admin-page__actions">
          <div className="admin-metrics" aria-label="Resumo administrativo">
            <span><strong>{games.length}</strong> jogos</span>
            <span><strong>{users.length}</strong> usuarios</span>
          </div>
          <button className="btn" style={{ padding: "0.7rem 1.2rem" }} type="button" onClick={onBack}>Voltar</button>
        </div>
      </header>

      {adminError && <div className="admin-error" role="alert">{adminError}</div>}

      <div className="admin-tabs" role="tablist" aria-label="Visualizacao do painel admin">
        <button className={adminTab === "users" ? "active" : ""} type="button" role="tab" aria-selected={adminTab === "users"} onClick={() => setAdminTab("users")}>Usuários</button>
        <button className={adminTab === "games" ? "active" : ""} type="button" role="tab" aria-selected={adminTab === "games"} onClick={() => setAdminTab("games")}>Tópicos</button>
      </div>

      {adminTab === "games" && (
        <>
      <section className="admin-section">
        <div className="admin-section-title">
          <button className="btn primary" type="button" onClick={startCreateGame}>Cadastrar jogo</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--games">
            <thead>
              <tr>
                <th>Jogo</th>
                <th>Genero</th>
                <th>Plataforma</th>
                <th>Posts</th>
                <th>ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleGames.map(game => (
                <tr key={game.id}>
                  <td className="admin-table-title" data-label="Jogo">
                    {editingGameId === game.id ? (
                      <input value={gameDraft.name} onChange={event => setGameDraft({ ...gameDraft, name: event.target.value })} aria-label="Nome do jogo" />
                    ) : (
                      <span className="cell-text" title={game.name}>{game.name}</span>
                    )}
                  </td>
                  <td data-label="Genero">
                    {editingGameId === game.id ? (
                      <input value={gameDraft.genre} onChange={event => setGameDraft({ ...gameDraft, genre: event.target.value })} aria-label="Genero do jogo" />
                    ) : (
                      <span className="cell-text" title={game.genre || "Sem genero"}>{game.genre || "Sem genero"}</span>
                    )}
                  </td>
                  <td data-label="Plataforma">
                    {editingGameId === game.id ? (
                      <input value={gameDraft.platform} onChange={event => setGameDraft({ ...gameDraft, platform: event.target.value })} aria-label="Plataforma do jogo" />
                    ) : (
                      <span className="cell-text" title={game.platform || "Sem plataforma"}>{game.platform || "Sem plataforma"}</span>
                    )}
                  </td>
                  <td data-label="Posts">{game.postCount}</td>
                  <td data-label="ações">
                    <div className="row-actions">
                      {editingGameId === game.id ? (
                        <>
                          <button className="icon-btn primary" type="button" title="Salvar" aria-label="Salvar jogo" onClick={() => saveGameEdit(game.id)}>{icons.save}</button>
                          <button className="icon-btn" type="button" title="Cancelar" aria-label="Cancelar edicao" onClick={() => setEditingGameId("")}>{icons.cancel}</button>
                        </>
                      ) : (
                        <>
                          <button className="icon-btn" type="button" title="Editar" aria-label={`Editar ${game.name}`} onClick={() => startGameEdit(game)}>{icons.edit}</button>
                          <button className={`icon-btn ${game.pinned ? "active" : ""}`} type="button" title={game.pinned ? "Desfixar" : "Fixar"} aria-label={game.pinned ? `Desfixar ${game.name}` : `Fixar ${game.name}`} onClick={() => onPinGame(game.id)}>{icons.pin}</button>
                          <button className="icon-btn danger" type="button" title="Excluir" aria-label={`Excluir ${game.name}`} onClick={() => onDeleteGame(game.id)}>{icons.delete}</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card-list">
          {visibleGames.map(game => (
            <article className="admin-mobile-card" key={game.id}>
              <div className="admin-mobile-card__main">
                <h4>{game.name}</h4>
                <p>{game.genre || "Sem genero"} - {game.platform || "Sem plataforma"}</p>
                <span>{game.postCount} posts</span>
              </div>
              <div className="admin-mobile-card__actions">
                <button className="icon-btn" type="button" title="Editar" aria-label={`Editar ${game.name}`} onClick={() => startGameEdit(game)}>{icons.edit}</button>
                <button className={`icon-btn ${game.pinned ? "active" : ""}`} type="button" title={game.pinned ? "Desfixar" : "Fixar"} aria-label={game.pinned ? `Desfixar ${game.name}` : `Fixar ${game.name}`} onClick={() => onPinGame(game.id)}>{icons.pin}</button>
                <button className="icon-btn danger" type="button" title="Excluir" aria-label={`Excluir ${game.name}`} onClick={() => onDeleteGame(game.id)}>{icons.delete}</button>
              </div>
            </article>
          ))}
        </div>
        <Pagination page={gamesPage} pageCount={gamesPageCount} total={games.length} onPageChange={setGamesPage} />
      </section>
        </>
      )}

      {adminTab === "users" && (
      <section className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--users">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Username</th>
                <th>Tipo</th>
                <th>ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(user => (
                <tr key={user.id}>
                  <td data-label="Usuario">
                    {editingUserId === user.id ? (
                      <input value={userDraft.name} onChange={event => setUserDraft({ ...userDraft, name: event.target.value })} aria-label="Nome do usuario" />
                    ) : (
                      <button className="admin-user" type="button" onClick={() => onProfileSelect(user.id)} title={user.name}>
                        <span className="avatar" aria-hidden="true">{avatarFor(user)}</span>
                        <strong className="cell-text">{user.name}</strong>
                      </button>
                    )}
                  </td>
                  <td data-label="Username">
                    {editingUserId === user.id ? (
                      <input value={userDraft.username} onChange={event => setUserDraft({ ...userDraft, username: event.target.value })} aria-label="Username" />
                    ) : (
                      <span className="cell-text" title={`@${user.username}`}>@{user.username}</span>
                    )}
                  </td>
                  <td data-label="Tipo">
                    {editingUserId === user.id ? (
                      <select value={userDraft.role} onChange={event => setUserDraft({ ...userDraft, role: event.target.value })} aria-label="Tipo de usuario">
                        <option className="select-tipo" value="user">user</option>
                        <option className="select-tipo" value="admin">admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td data-label="ações">
                    <div className="row-actions">
                      {editingUserId === user.id ? (
                        <>
                          <button className="icon-btn primary" type="button" title="Salvar" aria-label="Salvar usuario" onClick={() => saveUserEdit(user.id)}>{icons.save}</button>
                          <button className="icon-btn" type="button" title="Cancelar" aria-label="Cancelar edicao" onClick={() => setEditingUserId("")}>{icons.cancel}</button>
                        </>
                      ) : (
                        <>
                          <button className="icon-btn" type="button" title="Editar" aria-label={`Editar ${user.name}`} onClick={() => startUserEdit(user)}>{icons.edit}</button>
                          {user.id === currentUser.id ? <span className="muted" style={{ padding: "0.3rem", color: "green" }}>Logado</span> : <button className="icon-btn danger" type="button" title="Excluir" aria-label={`Excluir ${user.name}`} onClick={() => onDeleteUser(user.id)}>{icons.delete}</button>}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card-list">
          {visibleUsers.map(user => (
            <article className="admin-mobile-card" key={user.id}>
              <button className="admin-mobile-card__main admin-mobile-user" style={{ backgroundColor: "var(--surface-3)" }} type="button" onClick={() => onProfileSelect(user.id)}>
                <span className="avatar" aria-hidden="true">{avatarFor(user)}</span>
                <span>
                  <h4>{user.name}</h4>
                  <p>@{user.username} - {user.role}</p>
                </span>
              </button>
              <div className="admin-mobile-card__actions">
                <button className="icon-btn" type="button" title="Editar" aria-label={`Editar ${user.name}`} onClick={() => startUserEdit(user)}>{icons.edit}</button>
                {user.id === currentUser.id ? <span className="muted" style={{ padding: "0.3rem", color: "green" }}>Logado</span> : <button className="icon-btn danger" type="button" title="Excluir" aria-label={`Excluir ${user.name}`} onClick={() => onDeleteUser(user.id)}>{icons.delete}</button>}
              </div>
            </article>
          ))}
        </div>
        <Pagination page={usersPage} pageCount={usersPageCount} total={users.length} onPageChange={setUsersPage} />
      </section>
      )}

      {editDialog && (
        <div className="mat-dialog-backdrop" role="presentation" onMouseDown={closeDialog}>
          <section ref={dialogRef} className="mat-dialog" role="dialog" aria-modal="true" aria-labelledby="adminEditTitle" onMouseDown={event => event.stopPropagation()}>
            <header className="mat-dialog__header">
              <h3 id="adminEditTitle">{editDialog.type === "createGame" ? "Cadastrar jogo" : editDialog.type === "game" ? "Editar topico" : "Editar usuario"}</h3>
              <button className="icon-btn" type="button" title="Fechar" aria-label="Fechar modal" onClick={closeDialog}>{icons.cancel}</button>
            </header>

            {editDialog.type === "game" || editDialog.type === "createGame" ? (
              <form className="mat-dialog__form" onSubmit={event => { event.preventDefault(); editDialog.type === "createGame" ? saveNewGame() : saveGameEdit(editDialog.id); }}>
                <div className="mat-dialog__field">
                  <label htmlFor="gameName">Nome</label>
                  <input id="gameName" value={gameDraft.name} onChange={event => setGameDraft({ ...gameDraft, name: event.target.value })} placeholder="Nome do jogo" required />
                </div>
                <div className="mat-dialog__field">
                  <label htmlFor="gameGenre">Genero</label>
                  <input id="gameGenre" value={gameDraft.genre} onChange={event => setGameDraft({ ...gameDraft, genre: event.target.value })} placeholder="RPG, FPS, MOBA..." />
                  <SuggestionChips
                    label="Generos populares"
                    options={POPULAR_GENRES}
                    value={gameDraft.genre}
                    onSelect={genre => setGameDraft({ ...gameDraft, genre: toggleMarker(gameDraft.genre, genre) })}
                  />
                </div>
                <div className="mat-dialog__field">
                  <label htmlFor="gamePlatform">Plataforma</label>
                  <input id="gamePlatform" value={gameDraft.platform} onChange={event => setGameDraft({ ...gameDraft, platform: event.target.value })} placeholder="PC, PlayStation..." />
                  <SuggestionChips
                    label="Plataformas populares"
                    options={POPULAR_PLATFORMS}
                    value={gameDraft.platform}
                    onSelect={platform => setGameDraft({ ...gameDraft, platform: toggleMarker(gameDraft.platform, platform) })}
                  />
                </div>
                <footer className="mat-dialog__actions">
                  <button className="btn" type="button" onClick={closeDialog}>Cancelar</button>
                  <button className="btn primary" type="submit">{editDialog.type === "createGame" ? "Cadastrar" : "Salvar"}</button>
                </footer>
              </form>
            ) : (
              <form className="mat-dialog__form" onSubmit={event => { event.preventDefault(); saveUserEdit(editDialog.id); }}>
                <label>Nome
                  <input value={userDraft.name} onChange={event => setUserDraft({ ...userDraft, name: event.target.value })} required />
                </label>
                <label>Username
                  <input value={userDraft.username} onChange={event => setUserDraft({ ...userDraft, username: event.target.value })} required />
                </label>
                <label>Tipo
                  <select value={userDraft.role} onChange={event => setUserDraft({ ...userDraft, role: event.target.value })}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </label>
                <footer className="mat-dialog__actions">
                  <button className="btn" type="button" onClick={closeDialog}>Cancelar</button>
                  <button className="btn primary" type="submit">Salvar</button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
