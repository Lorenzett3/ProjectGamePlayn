import { useState } from "react";
import { avatarFor, formatDate } from "../utils";

export function PostCard({ post, currentUser, onAuthorClick, onComment, onDeleteComment, onDeletePost, onLike }) {
  const [comment, setComment] = useState("");
  const canDeletePost = currentUser.role === "admin" || currentUser.id === post.userId;
  const liked = post.likes.includes(currentUser.id);

  function submitComment(event) {
    event.preventDefault();
    onComment(post.id, comment);
    setComment("");
  }

  return (
    <article className="post">
      <div className="post-head">
        <div>
          <span className="tag"># {post.game?.name || "Jogo removido"}</span>
          <h3>{post.title}</h3>
          <button className="author-link" type="button" onClick={() => onAuthorClick(post.author?.id)}>
            <span className="avatar" aria-hidden="true">{avatarFor(post.author)}</span>
            <span>por @{post.author?.username || "usuario removido"} - {formatDate(post.createdAt)}</span>
          </button>
        </div>
        {canDeletePost && (
          <button className="icon-btn danger" type="button" onClick={() => onDeletePost(post.id)} aria-label="Excluir post" title="Excluir post">
            🗑
          </button>
        )}
      </div>
      <p>{post.content}</p>
      <div className="post-actions">
        <button className="btn" type="button" onClick={() => onLike(post.id)}>{liked ? "Curtido" : "Curtir"} ({post.likes.length})</button>
        <span className="meta">{post.comments.length} comentarios</span>
      </div>
      <div className="comments">
        {post.comments.map(item => {
          const canDeleteComment = currentUser.role === "admin" || currentUser.id === post.userId || currentUser.id === item.userId;
          return (
            <div className="comment" key={item.id}>
              <div className="comment-head">
                <div className="meta">@{item.author?.username || "usuario removido"} - {formatDate(item.createdAt)}</div>
                {canDeleteComment && (
                  <button className="icon-btn danger small" type="button" onClick={() => onDeleteComment(post.id, item.id)} aria-label="Excluir comentario" title="Excluir comentario">
                    🗑
                  </button>
                )}
              </div>
              <div>{item.content}</div>
            </div>
          );
        })}
        <form className="actions" onSubmit={submitComment}>
          <input value={comment} onChange={event => setComment(event.target.value)} placeholder="Comentar neste post" required />
          <button className="btn" type="submit">Comentar</button>
        </form>
      </div>
    </article>
  );
}
