import React from "react";

export default function LoansList({ loans, books, onReturn }) {
  if (loans.length === 0) {
    return (
      <div className="empty-loans-message">
        No active loans. Create a loan to get started!
      </div>
    );
  }

  return (
    <div className="loans-list">
      {loans.map((loan) => {
        const book = books.find((b) => b._id === loan.bookId);
        if (!book) return null;

        const dueDate = new Date(loan.dueDate);
        const isOverdue = dueDate < new Date();

        return (
          <div
            key={loan.id}
            className={`loan-item ${isOverdue ? "overdue" : ""}`}
          >
            <div className="loan-info">
              <div className="loan-book-title">
                {book.title}
              </div>
              <div className="loan-borrower">
                Borrowed by: <strong>{loan.borrower}</strong>
              </div>
              <div className="loan-due-date">
                📅 Due: {dueDate.toLocaleDateString()}
                {isOverdue && <span className="overdue-label">(OVERDUE)</span>}
              </div>
            </div>
            <button
              onClick={() => onReturn(loan.id)}
              className="btn-return"
            >
              Return
            </button>
          </div>
        );
      })}
    </div>
  );
}