import React, { useMemo, useState, useEffect } from "react";
import "./App.css";
import BookCard from "./components/bookcard.jsx";
import AddButton from "./components/addbutton.jsx";
import Modal from "./components/modal.jsx";
import AddBookForm from "./components/addbookform.jsx";
import LoanForm from "./components/loanform.jsx";
import LoansList from "./components/loanslist.jsx";

export default function App() {
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [filterPublisher, setFilterPublisher] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [view, setView] = useState("catalog");

  // NEW: which book is being shown in “details” mode
  const [detailsBook, setDetailsBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("bookCatalog");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBooks(parsed);
      } catch (e) {
        console.error("Failed to parse stored books:", e);
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("bookLoans");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLoans(parsed);
      } catch (e) {
        console.error("Failed to parse stored loans:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (books.length >= 0) {
      localStorage.setItem("bookCatalog", JSON.stringify(books));
    }
  }, [books]);

  useEffect(() => {
    if (loans.length >= 0) {
      localStorage.setItem("bookLoans", JSON.stringify(loans));
    }
  }, [loans]);

  const selectedBook = useMemo(() => books.find((b) => b.selected), [books]);
  const selectedId = selectedBook?._id ?? null;

  const publishers = useMemo(() => {
    const pubs = [...new Set(books.map((b) => b.publisher).filter(Boolean))];
    return pubs.sort();
  }, [books]);

  const languages = useMemo(() => {
    const langs = [...new Set(books.map((b) => b.language).filter(Boolean))];
    return langs.sort();
  }, [books]);

  const booksWithLoanStatus = useMemo(() => {
    return books.map((book) => ({
      ...book,
      onLoan: loans.some((loan) => loan.bookId === book._id),
    }));
  }, [books, loans]);

  const filteredBooks = useMemo(() => {
    return booksWithLoanStatus.filter((b) => {
      if (filterPublisher && b.publisher !== filterPublisher) return false;
      if (filterLanguage && b.language !== filterLanguage) return false;
      return true;
    });
  }, [booksWithLoanStatus, filterPublisher, filterLanguage]);

  const availableBooks = useMemo(() => {
    return books.filter(
      (book) => !loans.some((loan) => loan.bookId === book._id)
    );
  }, [books, loans]);

  const toggleSelect = (id) => {
    setBooks((prev) => {
      const clicked = prev.find((b) => b._id === id);
      const willSelect = clicked ? !clicked.selected : true;
      return prev.map((b) =>
        b._id === id ? { ...b, selected: willSelect } : { ...b, selected: false }
      );
    });
  };

  const handleCreate = ({ title, author, url, publisher, language, year, pages }) => {
    const newBook = {
      _id: `local-${Date.now()}`,
      title: (title || "").trim() || "Untitled",
      author: (author || "").trim(),
      url: (url || "").trim(),
      publisher: (publisher || "").trim(),
      language: (language || "").trim(),
      year: (year || "").trim(),     // optional new fields
      pages: (pages || "").trim(),
      selected: false,
    };
    setBooks((prev) => [newBook, ...prev]);
    setOpenAdd(false);
  };

  const handleUpdate = ({ title, author, url, publisher, language, year, pages }) => {
    if (!selectedId) return;
    setBooks((prev) =>
      prev.map((b) =>
        b._id === selectedId
          ? {
              ...b,
              title: (title || "").trim() || "Untitled",
              author: (author || "").trim(),
              url: (url || "").trim(),
              publisher: (publisher || "").trim(),
              language: (language || "").trim(),
              year: (year || "").trim(),
              pages: (pages || "").trim(),
            }
          : b
      )
    );
    setOpenEdit(false);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setLoans((prev) => prev.filter((loan) => loan.bookId !== selectedId));
    setBooks((prev) => prev.filter((b) => b._id !== selectedId));
  };

  const handleCreateLoan = ({ borrower, bookId, weeks }) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + weeks * 7);

    const newLoan = {
      id: `loan-${Date.now()}`,
      borrower,
      bookId,
      loanDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      weeks,
    };

    setLoans((prev) => [...prev, newLoan]);
  };

  const handleReturnBook = (loanId) => {
    setLoans((prev) => prev.filter((loan) => loan.id !== loanId));
  };

  const clearFilters = () => {
    setFilterPublisher("");
    setFilterLanguage("");
  };

  // ---------- DETAILS VIEW HANDLING ----------
  const openDetailsView = (bookId) => {
    const book = books.find((b) => b._id === bookId);
    if (!book) return;

    setDetailsBook(book);
    setView("bookDetails");
  };

  // when detailsBook changes, fetch similar books
  useEffect(() => {
    const fetchSimilar = async () => {
      if (!detailsBook) {
        setSimilarBooks([]);
        return;
      }

      // pick the best query we have
      const query =
        detailsBook.title?.trim() ||
        detailsBook.author?.trim() ||
        detailsBook.publisher?.trim() ||
        "javascript";

      setSimilarLoading(true);
      setSimilarError("");
      try {
        const res = await fetch(
          `https://api.itbook.store/1.0/search/${encodeURIComponent(query)}`
        );
        if (!res.ok) {
          throw new Error("Failed to load similar books");
        }
        const data = await res.json();
        // API returns { error, total, page, books: [...] }
        setSimilarBooks(data.books || []);
      } catch (err) {
        console.error(err);
        setSimilarError("Unable to load similar books right now.");
        setSimilarBooks([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchSimilar();
  }, [detailsBook]);

  const closeDetailsView = () => {
    setDetailsBook(null);
    setSimilarBooks([]);
    setView("catalog");
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Book Catalog</h1>
      </header>

      <main className="main">
        {view === "catalog" ? (
          <>
            <div className="loan-button-container">
              <button
                onClick={() => setView("loans")}
                className="loan-management-btn"
              >
                Loan Management
              </button>
            </div>

            <div className="filters">
              <h3>Filter Books</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="filterPublisher">Publisher</label>
                  <select
                    id="filterPublisher"
                    value={filterPublisher}
                    onChange={(e) => setFilterPublisher(e.target.value)}
                  >
                    <option value="">All Publishers</option>
                    {publishers.map((pub) => (
                      <option key={pub} value={pub}>
                        {pub}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="filterLanguage">Language</label>
                  <select
                    id="filterLanguage"
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                  >
                    <option value="">All Languages</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {(filterPublisher || filterLanguage) && (
                  <button className="btn-clear" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            <div className="catalog-grid">
              <div className="controls-column">
                <AddButton onClick={() => setOpenAdd(true)} />
                <div className="controls-row">
                  <button
                    className="btn"
                    onClick={() => setOpenEdit(true)}
                    disabled={!selectedId}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={!selectedId}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {filteredBooks.map((b) => (
                <BookCard
                  key={b._id}
                  book={b}
                  selected={!!b.selected}
                  onToggleSelect={() => toggleSelect(b._id)}
                  onShowDetails={() => openDetailsView(b._id)} // NEW
                />
              ))}
            </div>

            {filteredBooks.length === 0 && books.length > 0 && (
              <p className="empty-message">
                No books match the current filters.
              </p>
            )}

            {books.length === 0 && (
              <p className="empty-message">
                No books yet. Click "Add Book" to get started!
              </p>
            )}
          </>
        ) : view === "loans" ? (
          <div className="loans-view">
            <button
              onClick={() => setView("catalog")}
              className="close-loans-btn"
            >
              ✕
            </button>

            <div className="loan-form-container">
              <LoanForm
                availableBooks={availableBooks}
                onSubmit={handleCreateLoan}
              />
            </div>

            <div className="loans-list-container">
              <h3 className="loans-list-title">
                Active Loans ({loans.length})
              </h3>
              <LoansList
                loans={loans}
                books={books}
                onReturn={handleReturnBook}
              />
            </div>
          </div>
        ) : view === "bookDetails" && detailsBook ? (
          <div className="book-details-view">
            <button
              onClick={closeDetailsView}
              className="close-details-btn"
              aria-label="Close details"
            >
              ✕
            </button>

            <div className="book-details-top">
              <div className="book-details-image">
                {detailsBook.url ? (
                  <img src={detailsBook.url} alt={detailsBook.title} />
                ) : (
                  <div className="book-details-placeholder">No cover</div>
                )}
              </div>
              <div className="book-details-meta">
                <h2>{detailsBook.title || "Untitled"}</h2>
                {detailsBook.author && (
                  <p><strong>Author:</strong> {detailsBook.author}</p>
                )}
                {detailsBook.publisher && (
                  <p><strong>Publisher:</strong> {detailsBook.publisher}</p>
                )}
                <p>
                  <strong>Publication Year:</strong>{" "}
                  {detailsBook.year || "N/A"}
                </p>
                <p>
                  <strong>Page Count:</strong>{" "}
                  {detailsBook.pages || "N/A"}
                </p>
                {detailsBook.language && (
                  <p><strong>Language:</strong> {detailsBook.language}</p>
                )}
              </div>
            </div>

            <div className="book-details-similar">
              <h3>Similar books</h3>
              {similarLoading && <p>Loading similar books…</p>}
              {similarError && <p className="error">{similarError}</p>}
              {!similarLoading && !similarError && similarBooks.length === 0 && (
                <p>No similar books found.</p>
              )}
              <div className="similar-books-grid">
                {similarBooks.map((sb) => (
                  <div key={sb.isbn13} className="similar-book-card">
                    <div className="similar-book-img-wrap">
                      {sb.image ? (
                        <img src={sb.image} alt={sb.title} />
                      ) : (
                        <div className="similar-book-placeholder">No image</div>
                      )}
                    </div>
                    <div className="similar-book-info">
                      <p className="similar-book-title">{sb.title}</p>
                      {sb.subtitle && (
                        <p className="similar-book-subtitle">{sb.subtitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="footer">© Belinda To, 2025</footer>

      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Create a new book"
      >
        {/* you can add year/pages to the form if you want */}
        <AddBookForm onSubmit={handleCreate} onCancel={() => setOpenAdd(false)} />
      </Modal>

      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Edit book"
      >
        <AddBookForm
          onSubmit={handleUpdate}
          onCancel={() => setOpenEdit(false)}
          initialData={selectedBook}
        />
      </Modal>
    </div>
  );
}
