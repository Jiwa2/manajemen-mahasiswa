import React from "react";

export default function Sidebar({ open, onSelect }) {

  const handleClick = (e, page) => {
    const item = e.currentTarget;

    onSelect(page);

    item.classList.add("glow");
    setTimeout(() => {
      item.classList.remove("glow");
    }, 300);
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <h3 style={{ marginTop: 0, marginBottom: 14, textAlign: "center" }}>
        Menu
      </h3>
      <ul>
        <li onClick={() => onSelect("Home")}>Home</li>
        <li onClick={() => onSelect("input")}>Input Data</li>
        <li onClick={() => onSelect("view")}>Lihat Data</li>
        <li onClick={() => onSelect("search")}>Cari Data</li>
        <li onClick={() => onSelect("sort")}>Pengurutan Data</li>
      </ul>
      <div style={{ marginTop: "auto" }}>
        <button
          className="logout-btn"
          onClick={() => onSelect("logout")}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
