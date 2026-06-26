import { formatDate } from "../utils";

export function RecentPostsPanel({ posts, onOpenPost }) {
  return (
    <section className="panel recent-panel">
      <h3>Posts recentes</h3>
      <div className="recent-list">
        {posts.length ? posts.map(post => (
          <button className="recent-post" type="button" key={post.id} onClick={() => onOpenPost(post.id)}>
            <strong style={{fontSize: "15px"}}>{post.title}</strong>
            <span>@{post.author?.username} - {formatDate(post.createdAt)}</span>
          </button>
        )) : (
          <p className="muted">Nenhum post recente.</p>
        )}
      </div>
    </section>
  );
}
