export function avatarFor(user) {
  const avatars = ["🎮", "🕹️", "👾", "🔥", "⭐", "🚀", "🏆", "💎"];
  const key = user?.username || user?.id || "player";
  const index = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatars.length;
  return avatars[index];
}

export function formatDate(iso) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function limitBio(bio) {
  const text = String(bio || "").trim();
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}
