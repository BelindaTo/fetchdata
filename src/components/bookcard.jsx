// components/bookcard.jsx
import React from "react";

export default function BookCard({
  book,
  selected,
  onToggleSelect,
  onShowDetails,
}) {
  return (
    <div
      className={`book-card ${selected ? "selected" : ""}`}
      onClick={onToggleSelect}
    >
      <div className="book-image">
        {book.url ? (
          <img src={book.url} alt={book.title} />
        ) : (
          <div className="book-details-placeholder">No cover</div>
        )}
      </div>
      <div className="book-meta">
        <h3>{book.title || "Untitled"}</h3>
        {book.author && <p className="author">{book.author}</p>}
        {book.publisher && <p className="publisher">{book.publisher}</p>}
        {book.language && <p className="language">{book.language}</p>}
      </div>
      <button
        type="button"
        className="view-button"
        onClick={(e) => {
          e.stopPropagation(); // so it doesn’t toggle select
          onShowDetails?.();
        }}
      >
        View Details
      </button>
    </div>
  );
}
