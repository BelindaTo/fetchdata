import React from "react";

export default function AddButton({ onClick }) {
  return (
    <div className="add-card" onClick={onClick}>
      Add Book
    </div>
  );
}