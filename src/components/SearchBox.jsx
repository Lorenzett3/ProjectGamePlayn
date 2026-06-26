const labels = {
  game: "Topico",
  post: "Post",
  user: "Usuario"
};

export function SearchBox({ query, suggestions, onQueryChange, onSelect, placeholder = "Buscar" }) {
  const showSuggestions = query.trim().length > 0;

  return (
    <div className="search-box">
      <input
        type="search"
        value={query}
        onChange={event => onQueryChange(event.target.value)}
        placeholder={placeholder}
      />

      {showSuggestions && (
        <div className="search-suggestions" role="listbox" aria-label="Sugestoes de busca">
          {suggestions.length ? suggestions.map(item => (
            <button
              className="search-suggestion"
              key={`${item.type}-${item.id}`}
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                onSelect(item);
              }}
            >
              <span className="search-suggestion__type">{labels[item.type] || "Resultado"}</span>
              <span className="search-suggestion__text">
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
              </span>
            </button>
          )) : (
            <div className="search-suggestion search-suggestion--empty">
              Nenhuma opcao encontrada.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
