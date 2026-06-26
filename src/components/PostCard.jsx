import { avatarFor, formatDate } from "../utils";

export function PostCard({ post, currentUser, onAuthorClick, onDeletePost, onLike, onOpenPost }) {
  const canDeletePost = currentUser.role === "admin" || currentUser.id === post.userId;
  const liked = post.likes.includes(currentUser.id);

  return (
    <article className="post">
      <div className="post-head">
        <div>
          <span className="tag"># {post.game?.name || "Jogo removido"}</span>
          <br />
          <button style={{ padding: "0.6rem 0 0.1rem 0" }} className="author-link" type="button" onClick={() => onAuthorClick(post.author?.id)}>
            <span className="avatar" aria-hidden="true">{avatarFor(post.author)}</span>
            <span>por @{post.author?.username || "usuario removido"} - {formatDate(post.createdAt)}</span>
          </button>
          <h3>{post.title}</h3>
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
        <button className="btn" type="button" onClick={() => onOpenPost(post.id)}>Comentar ({post.comments.length})</button>
      </div>
    </article>
  );
}
