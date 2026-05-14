import { useState } from "react";
import { avatarFor } from "../utils";

export function AdminPanel({ games, users, currentUser, onCreateGame, onDeleteGame, onDeleteUser, onPinGame, onProfileSelect }) {
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");

  function submit(event) {
    event.preventDefault();
    onCreateGame({ name, genre, platform });
    setName("");
    setGenre("");
    setPlatform("");
  }

  return (
    <section className="panel" id="adminPanel">
      <h3>Painel admin</h3>
      <form className="form-grid" onSubmit={submit}>
        <label>Novo jogo
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

      <h3>Jogos</h3>
      {games.map(game => (
        <div className="admin-row" key={game.id}>
          <span>{game.pinned && <span className="pin-label">Fixado</span>}{game.name}</span>
          <div className="row-actions">
            <button className="btn" type="button" onClick={() => onPinGame(game.id)}>{game.pinned ? "Desfixar" : "Fixar"}</button>
            <button className="btn danger" type="button" onClick={() => onDeleteGame(game.id)}>Excluir</button>
          </div>
        </div>
      ))}

      <h3>Usuarios</h3>
      {users.map(user => (
        <div className="admin-row" key={user.id}>
          <button className="admin-user" type="button" onClick={() => onProfileSelect(user.id)}>
            <span className="avatar" aria-hidden="true">{avatarFor(user)}</span>
            <span>@{user.username} ({user.role})</span>
          </button>
          {user.id === currentUser.id ? <span className="muted">logado</span> : <button className="btn danger" type="button" onClick={() => onDeleteUser(user.id)}>Excluir</button>}
        </div>
      ))}
    </section>
  );
}
