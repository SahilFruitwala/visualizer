import { toggleFavorite, useFavorites } from "../engine/favorites";

export function FavoriteButton({ topicId }: { topicId: string }) {
  const favorites = useFavorites();
  const active = favorites.includes(topicId);

  return (
    <button
      type="button"
      className="favorite-btn"
      data-active={active}
      onClick={() => toggleFavorite(topicId)}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      title={active ? "Remove favorite" : "Add favorite"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
