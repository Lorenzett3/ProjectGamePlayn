import { useState } from "react";

export function LoginPage({ error, onLogin }) {
  const [username, setUsername] = useState("lorenzo");
  const [password, setPassword] = useState("123456");

  function submit(event) {
    event.preventDefault();
    onLogin(username, password);
  }

  return (
    <main className="login-page">
      <section className="login-box">
        <div className="login-hero">
          <h1>GamePlayn</h1>
          <p>Uma comunidade gamer organizada por topicos, perfis e conversas sobre jogos.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <div>
            <h2>Entrar no MVP</h2>
            <p className="muted">Use um dos usuarios prontos para demonstrar o sistema.</p>
          </div>
          {error && <div className="error">{error}</div>}
          <label>Usuario
            <input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label>Senha
            <input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>
          <button className="btn primary" type="submit">Entrar</button>
          <div className="quick-users">
            <button className="btn" type="button" onClick={() => onLogin("lorenzo", "123456")}>Entrar como jogador</button>
            <button className="btn" type="button" onClick={() => onLogin("admin", "admin123")}>Entrar como admin</button>
          </div>
        </form>
      </section>
    </main>
  );
}
