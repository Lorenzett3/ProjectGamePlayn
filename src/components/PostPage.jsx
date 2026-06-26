import { useState } from "react";
import { avatarFor, formatDate } from "../utils";

export function PostPage({ post, currentUser, onAuthorClick, onBack, onComment, onDeleteComment, onDeletePost, onLike, onLikeComment }) {
  const [comment, setComment] = useState("");
  const canDeletePost = currentUser.role === "admin" || currentUser.id === post?.userId;
  const liked = post?.likes.includes(currentUser.id);

  async function submitComment(event) {
    event.preventDefault();
    await onComment(post.id, comment);
    setComment("");
  }

  if (!post) {
    return (
      <section className="post-page">
        <button className="btn" type="button" onClick={onBack}>Voltar</button>
        <div className="empty">Post não encontrado.</div>
      </section>
    );
  }

  return (
    <section className="post-page">
      <header className="post-page__bar">
        <button className="btn post-page__back" type="button" onClick={onBack}>Voltar</button>
        <span className="meta">Discussão</span>
      </header>

      <article className="post post-detail">
        <div className="post-head">
          <div>
            <span className="tag"># {post.game?.name || "Jogo removido"}</span>
            <button className="author-link post-detail__author" type="button" onClick={() => onAuthorClick(post.author?.id)}>
              <span className="avatar" aria-hidden="true">{avatarFor(post.author)}</span>
              <span>por @{post.author?.username || "usuario removido"} - {formatDate(post.createdAt)}</span>
            </button>
            <h2>{post.title}</h2>
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
          <span className="meta">{post.comments.length} comentários</span>
        </div>
      </article>

      <section className="post-comments">
        <header className="post-comments__header">
          <h3>Comentários</h3>
          <span className="meta">{post.comments.length}</span>
        </header>

        <div className="comment-composer">
          <form className="comment-form" onSubmit={submitComment}>
            <textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Comentar neste post" required />
            <button className="btn primary" type="submit">Comentar</button>
          </form>
        </div>

        <div className="comments">
          {post.comments.length ? post.comments.map(item => {
            const likes = Array.isArray(item.likes) ? item.likes : [];
            const commentLiked = likes.includes(currentUser.id);
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
                <div className="comment-actions">
                  <button className="btn" type="button" onClick={() => onLikeComment(post.id, item.id)}>
                    {commentLiked ? "Curtido" : "Curtir"} ({likes.length})
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="empty">Nenhum comentário ainda.</div>
          )}
        </div>
      </section>
    </section>
  );
}
