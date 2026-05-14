import { avatarFor, limitBio } from "../utils";

export function ProfilePanel({ user, posts, onProfileSelect }) {
  const count = posts.filter(post => post.userId === user.id).length;

  return (
    <section className="panel">
      <h3>Perfil</h3>
      <button className="profile-card" type="button" onClick={() => onProfileSelect(user.id)}>
        <span className="avatar lg" aria-hidden="true">{avatarFor(user)}</span>
        <span>
          <strong>@{user.username}</strong>
          <small>{count} {count === 1 ? "post" : "posts"}</small>
        </span>
      </button>
      <div className="profile-row"><span>Nome</span><strong>{user.name}</strong></div>
      <div className="profile-row"><span>Tipo</span><strong>{user.role === "admin" ? "Admin" : "Jogador"}</strong></div>
      <p className="muted">{limitBio(user.bio) || "Sem bio cadastrada."}</p>
      <button className="btn panel-action" type="button" onClick={() => onProfileSelect(user.id)}>Editar bio</button>
    </section>
  );
}
