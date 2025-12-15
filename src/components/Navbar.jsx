import React from "react";

export default function Navbar({ onToggle }) {
  return (
    <header className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="hamburger" onClick={onToggle} aria-label="Toggle sidebar">
          ☰
        </button>
        <h2 style={{ margin: 0, fontSize: 18 }}>MANAJEMEN MAHASISWA</h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        
        <img src="/image/unpam.png" alt="Unpam"
          className="nav-logo"
          width="50"
          height="50"
        />
      </div>
    </header>
  );
}
