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

export function AdminPanel({ games, users, currentUser, onBack, onCreateGame, onDeleteGame, onDeleteUser, onPinGame, onProfileSelect, onUpdateGame, onUpdateUser }) {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [editingGameId, setEditingGameId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [gameDraft, setGameDraft] = useState({ name: "", genre: "", platform: "" });
  const [userDraft, setUserDraft] = useState({ name: "", username: "", role: "user", bio: "" });
  const [editDialog, setEditDialog] = useState(null);
  const [adminTab, setAdminTab] = useState("users");
  const [adminError, setAdminError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!editDialog) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => {
      dialogRef.current?.scrollIntoView({ block: "center" });
      dialogRef.current?.querySelector("input, select, button")?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editDialog]);

  function submit(event) {
    event.preventDefault();
    onCreateGame({ name, genre, platform });
    setName("");
    setGenre("");
    setPlatform("");
  }

  function startGameEdit(game) {
    setAdminError("");
    setGameDraft({ name: game.name, genre: game.genre || "", platform: game.platform || "" });
    setEditDialog({ type: "game", id: game.id, title: game.name });
  }

  async function saveGameEdit(gameId) {
    try {
      setAdminError("");
      await onUpdateGame(gameId, gameDraft);
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
          <button className="btn" type="button" onClick={onBack}>Voltar</button>
        </div>
      </header>

      {adminError && <div className="admin-error" role="alert">{adminError}</div>}

      <div className="admin-tabs" role="tablist" aria-label="Visualizacao do painel admin">
        <button className={adminTab === "users" ? "active" : ""} type="button" role="tab" aria-selected={adminTab === "users"} onClick={() => setAdminTab("users")}>Usuários</button>
        <button className={adminTab === "games" ? "active" : ""} type="button" role="tab" aria-selected={adminTab === "games"} onClick={() => setAdminTab("games")}>Tópicos/Jogos</button>
      </div>

      {adminTab === "games" && (
        <>
      <section className="admin-section">
        <h3>Novo jogo/tópico</h3>
        <form className="admin-create-form" onSubmit={submit}>
          <label>Nome
            <input value={name} onChange={event => setName(event.target.value)} placeholder="Nome do jogo" required />
          </label>
          <label>Genero
            <input value={genre} onChange={event => setGenre(event.target.value)} placeholder="RPG, FPS, MOBA..." />
          </label>
          <label>Plataforma
            <input value={platform} onChange={event => setPlatform(event.target.value)} placeholder="PC, PlayStation..." />
          </label>
          <button className="btn primary" type="submit">Cadastrar jogo</button>
        </form>
      </section>

      <section className="admin-section">
        <h3>Topicos e jogos</h3>
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
              {games.map(game => (
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
          {games.map(game => (
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
      </section>
        </>
      )}

      {adminTab === "users" && (
      <section className="admin-section">
        <h3>Usuarios</h3>
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
              {users.map(user => (
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
                          {user.id === currentUser.id ? <span className="muted">Logado</span> : <button className="icon-btn danger" type="button" title="Excluir" aria-label={`Excluir ${user.name}`} onClick={() => onDeleteUser(user.id)}>{icons.delete}</button>}
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
          {users.map(user => (
            <article className="admin-mobile-card" key={user.id}>
              <button className="admin-mobile-card__main admin-mobile-user" type="button" onClick={() => onProfileSelect(user.id)}>
                <span className="avatar" aria-hidden="true">{avatarFor(user)}</span>
                <span>
                  <h4>{user.name}</h4>
                  <p>@{user.username} - {user.role}</p>
                </span>
              </button>
              <div className="admin-mobile-card__actions">
                <button className="icon-btn" type="button" title="Editar" aria-label={`Editar ${user.name}`} onClick={() => startUserEdit(user)}>{icons.edit}</button>
                {user.id === currentUser.id ? <span className="muted">Logado</span> : <button className="icon-btn danger" type="button" title="Excluir" aria-label={`Excluir ${user.name}`} onClick={() => onDeleteUser(user.id)}>{icons.delete}</button>}
              </div>
            </article>
          ))}
        </div>
      </section>
      )}

      {editDialog && (
        <div className="mat-dialog-backdrop" role="presentation" onMouseDown={closeDialog}>
          <section ref={dialogRef} className="mat-dialog" role="dialog" aria-modal="true" aria-labelledby="adminEditTitle" onMouseDown={event => event.stopPropagation()}>
            <header className="mat-dialog__header">
              <h3 id="adminEditTitle">{editDialog.type === "game" ? "Editar topico" : "Editar usuario"}</h3>
              <button className="icon-btn" type="button" title="Fechar" aria-label="Fechar modal" onClick={closeDialog}>{icons.cancel}</button>
            </header>

            {editDialog.type === "game" ? (
              <form className="mat-dialog__form" onSubmit={event => { event.preventDefault(); saveGameEdit(editDialog.id); }}>
                <label>Nome
                  <input value={gameDraft.name} onChange={event => setGameDraft({ ...gameDraft, name: event.target.value })} required />
                </label>
                <label>Genero
                  <input value={gameDraft.genre} onChange={event => setGameDraft({ ...gameDraft, genre: event.target.value })} />
                </label>
                <label>Plataforma
                  <input value={gameDraft.platform} onChange={event => setGameDraft({ ...gameDraft, platform: event.target.value })} />
                </label>
                <footer className="mat-dialog__actions">
                  <button className="btn" type="button" onClick={closeDialog}>Cancelar</button>
                  <button className="btn primary" type="submit">Salvar</button>
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
