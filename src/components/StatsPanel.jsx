export function StatsPanel({ games, posts }) {
  const comments = posts.reduce((sum, post) => sum + post.comments.length, 0);
  const likes = posts.reduce((sum, post) => sum + post.likes.length, 0);

  return (
    <section className="panel">
      <h3>Resumo</h3>
      <div className="stat-row"><span>Jogos no catalogo</span><strong>{games.length}</strong></div>
      <div className="stat-row"><span>Posts carregados</span><strong>{posts.length}</strong></div>
      <div className="stat-row"><span>Curtidas</span><strong>{likes}</strong></div>
      <div className="stat-row"><span>Comentarios</span><strong>{comments}</strong></div>
    </section>
  );
}
