export function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" type="button" onClick={onToggle} aria-label="Alternar tema">
      <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
      {theme === "dark" ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
