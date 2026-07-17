import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle.jsx";

export function LoginPage({ error, notice, theme, onBack, onThemeToggle, onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("lorenzo");
  const [password, setPassword] = useState("lorenzoadmin");

  function submit(event) {
    event.preventDefault();
    if (mode === "login") {
      onLogin(username, password);
      return;
    }
    onRegister({ name, username, password });
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
          <p>Converse sobre jogos, descubra topicos e ache comunidades</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          <div className="quick-users">
            <button className={`btn ${mode === "login" ? "primary" : ""}`} type="button" onClick={() => setMode("login")}>Entrar</button>
            <button className={`btn ${mode === "register" ? "primary" : ""}`} type="button" onClick={() => setMode("register")}>Criar conta</button>
          </div>

          {notice && !error && <div className="notice">{notice}</div>}
          {error && <div className="error">{error}</div>}

          {mode === "register" && (
            <label>Nome
              <input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required />
            </label>
          )}

          <label>Usuario
            <input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label>Senha
            <input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
          </label>

          <button className="btn primary" type="submit">{mode === "login" ? "Entrar" : "Criar conta"}</button>
          <button className="btn" type="button" onClick={onBack}>Voltar ao feed</button>
        </form>
      </section>
    </main>
  );
}
