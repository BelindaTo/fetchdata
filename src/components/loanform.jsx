import React, { useState } from "react";

export default function LoanForm({ availableBooks, onSubmit }) {
  const [borrower, setBorrower] = useState("");
  const [bookId, setBookId] = useState("");
  const [weeks, setWeeks] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (borrower.trim() && bookId) {
      onSubmit({ borrower: borrower.trim(), bookId, weeks: parseInt(weeks) });
      setBorrower("");
      setBookId("");
      setWeeks(1);
    }
  };

  if (availableBooks.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        background: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        color: '#6b7280'
      }}>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          All books are currently on loan
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
          Wait for a book to be returned before creating a new loan.
        </p>
      </div>
    );
  }

  return (
    <div className="book-form" style={{ maxWidth: '600px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>
        Create New Loan
      </h3>
      
      <div className="form-group">
        <label htmlFor="borrower">Borrower Name *</label>
        <input
          id="borrower"
          type="text"
          value={borrower}
          onChange={(e) => setBorrower(e.target.value)}
          placeholder="Enter borrower's name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="book">Book *</label>
        <select
          id="book"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          required
        >
          <option value="">Select a book</option>
          {availableBooks.map((book) => (
            <option key={book._id} value={book._id}>
              {book.title} {book.author ? `by ${book.author}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="weeks">Loan Period (weeks) *</label>
        <input
          id="weeks"
          type="number"
          min="1"
          max="4"
          value={weeks}
          onChange={(e) => setWeeks(e.target.value)}
          required
        />
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn-primary"
          onClick={handleSubmit}
        >
          Create Loan
        </button>
      </div>
    </div>
  );
}