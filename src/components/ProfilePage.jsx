import { useState } from "react";
import { avatarFor, limitBio } from "../utils";
import { PostCard } from "./PostCard.jsx";

export function ProfilePage({ user, currentUser, posts, onBack, onSaveBio, postProps }) {
  const [bio, setBio] = useState(limitBio(currentUser.bio));

  if (!user) {
    return (
      <header className="topbar">
        <div>
          <h2>Perfil nao encontrado</h2>
          <p>O usuario pode ter sido removido.</p>
        </div>
        <button className="btn" type="button" onClick={onBack}>Voltar ao feed</button>
      </header>
    );
  }

  const isCurrentUser = user.id === currentUser.id;

  function submit(event) {
    event.preventDefault();
    onSaveBio(bio);
  }

  return (
    <>
      <header className="profile-hero">
        <div className="avatar xl" aria-hidden="true">{avatarFor(user)}</div>
        <div className="profile-copy">
          <span className="tag">{user.role === "admin" ? "Admin" : "Jogador"}</span>
          <h2>@{user.username}</h2>
          <p>{limitBio(user.bio) || "Sem bio cadastrada."}</p>
        </div>
        <div className="profile-counter">
          <strong>{posts.length}</strong>
          <span>{posts.length === 1 ? "post" : "posts"}</span>
        </div>
      </header>

      {isCurrentUser && (
        <form className="bio-form form-grid" onSubmit={submit}>
          <label>Personalizar bio
            <textarea value={bio} maxLength="200" onChange={event => setBio(event.target.value)} placeholder="Escreva uma bio de ate 200 caracteres..." />
          </label>
          <div className="form-footer">
            <span className="meta">{bio.length}/200 caracteres</span>
            <button className="btn primary" type="submit">Salvar bio</button>
          </div>
        </form>
      )}

      <section className="profile-posts">
        <div className="section-title">
          <h3>Posts de @{user.username}</h3>
          <button className="btn" type="button" onClick={onBack}>Voltar ao feed</button>
        </div>
        <div className="feed">
          {posts.length ? posts.map(post => <PostCard key={post.id} post={post} {...postProps} />) : (
            <div className="empty">Este usuario ainda nao publicou posts.</div>
          )}
        </div>
      </section>
    </>
  );
}
