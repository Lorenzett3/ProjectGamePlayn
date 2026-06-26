import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle.jsx";

export function LoginPage({ error, theme, onThemeToggle, onLogin }) {
  const [username, setUsername] = useState("lorenzo");
  const [password, setPassword] = useState("123456");

  function submit(event) {
    event.preventDefault();
    onLogin(username, password);
  }

  return (
    <main className="login-page">
      <div className="login-theme">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>

      <section className="login-box">
        <div className="login-hero">
          <div className="login-sun" aria-hidden="true" />
          <div className="login-grid" aria-hidden="true" />
          <h1>GamePlayn</h1>
          <p>Converse sobre jogos, descubra tópicos e ache comunidades</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          <label>Usuário
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
