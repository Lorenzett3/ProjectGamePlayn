export function ThemeToggle({ theme, onToggle }) {
  const nextThemeLabel = theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button className="theme-toggle" style={{padding: "11px"}} type="button" onClick={onToggle} aria-label={nextThemeLabel} title={nextThemeLabel}>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />
        </svg>
      )}
    </button>
  );
}
