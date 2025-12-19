import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_URL = "https://manajemen-mahasiswa-production.up.railway.app";

export default function Home() {
  const navigate = useNavigate();

  // ===== AUTH PROTECTION =====
  useEffect(() => {
    if (!localStorage.getItem("login")) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("login");
    navigate("/");
  };

  // ===== STATE =====
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("Home");

  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editNIM, setEditNIM] = useState("");

  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [prodi, setProdi] = useState("");
  const [searchNIM, setSearchNIM] = useState("");

  const toggle = () => setOpen(!open);

  const handleSelect = (key) => {
    if (key === "logout") {
      handleLogout();
      return;
    }
    setPage(key);
    setOpen(false);
    setSearchNIM("");
    setSortedData([...data]);
  };

  // ===== LOAD DATA =====
  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa`);
      const json = await res.json();
      setData(json);
      setSortedData(json);
    } catch {
      alert("Gagal load data mahasiswa");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===== ADD / EDIT =====
  const handleAdd = async () => {
    if (!nim || !nama || !prodi) return alert("Semua field wajib diisi!");
    try {
      const now = new Date().toISOString();
      await fetch(`${API_URL}/api/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, nama, prodi, createdAt: now }),
      });
      setNim(""); setNama(""); setProdi(""); loadData();
    } catch {
      alert("Gagal menambahkan data");
    }
  };

  const startEdit = (m) => {
    setEditMode(true);
    setEditNIM(m.nim);
    setNim(m.nim); setNama(m.nama); setProdi(m.prodi);
    setPage("input");
  };

  const handleEditSave = async () => {
    try {
      await fetch(`${API_URL}/api/mahasiswa/${editNIM}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, nama, prodi }),
      });
      setEditMode(false); setNim(""); setNama(""); setProdi(""); loadData();
    } catch {
      alert("Gagal update data");
    }
  };

  const handleDelete = async (nim) => {
    if (!window.confirm("Hapus data ini?")) return;
    await fetch(`${API_URL}/api/mahasiswa/${nim}`, { method: "DELETE" });
    loadData();
  };

  // ===== SEARCH =====
  const handleSearch = () => {
    const filtered = data.filter((m) => m.nim.includes(searchNIM));
    setSortedData(filtered);
  };

  // ===== SORTING =====
  const sortNamaAsc = () => setSortedData([...data].sort((a, b) => a.nama.localeCompare(b.nama)));
  const sortNamaDesc = () => setSortedData([...data].sort((a, b) => b.nama.localeCompare(a.nama)));
  const sortNimAsc = () => setSortedData([...data].sort((a, b) => a.nim - b.nim));
  const sortNimDesc = () => setSortedData([...data].sort((a, b) => b.nim - a.nim));
  const sortDateAsc = () => setSortedData([...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
  const sortDateDesc = () => setSortedData([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

  // ===== EXPORT CSV =====
  const exportCSV = () => {
    const headers = ["NIM", "Nama", "Prodi", "Tanggal Input"];
    const rows = sortedData.map(item => [item.nim, item.nama, item.prodi, new Date(item.createdAt).toLocaleString()]);
    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => { csvContent += row.join(",") + "\n"; });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mahasiswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navbar onToggle={toggle} />
      <Sidebar open={open} onSelect={handleSelect} />

      <main className={`content ${open ? "shifted" : ""}`}>
        {/* HOME */}
        {page === "Home" && (
          <div style={homeCard}>
            <h1>Sistem Manajemen Data Mahasiswa</h1>
            <p>Selamat datang di aplikasi manajemen data mahasiswa berbasis web.</p>
            <div style={homeBox}>
              <p><strong>Silahkan pilih menu di Sidebar kiri</strong></p>
              <ul>
                <li>Input Data</li>
                <li>Lihat Data</li>
                <li>Cari Data</li>
                <li>Pengurutan Data</li>
              </ul>
            </div>
          </div>
        )}

        {/* INPUT */}
        {page === "input" && (
          <div style={card}>
            <h2>{editMode ? "Edit Data Mahasiswa" : "Input Data Mahasiswa"}</h2>
            <input style={input} value={nim} onChange={(e) => setNim(e.target.value)} placeholder="NIM" />
            <input style={input} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama" />
            <input style={input} value={prodi} onChange={(e) => setProdi(e.target.value)} placeholder="Prodi" />
            <button style={btnPrimary} onClick={editMode ? handleEditSave : handleAdd}>
              {editMode ? "Simpan Perubahan" : "Simpan Data"}
            </button>
          </div>
        )}

        {/* VIEW */}
        {page === "view" && (
          <div style={card}>
            <h2>Data Mahasiswa</h2>
            <div style={{ marginBottom: 10 }}>
              <button style={btnInfo} onClick={exportCSV}>Export CSV</button>
            </div>
            <table style={table}>
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Prodi</th>
                  <th>Tanggal Input</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.nim}>
                    <td>{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.prodi}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                    <td>
                      <button style={btnWarn} onClick={() => startEdit(m)}>Edit</button>
                      <button style={btnDanger} onClick={() => handleDelete(m.nim)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SEARCH */}
        {page === "search" && (
          <div style={card}>
            <h2>Pencarian Mahasiswa (NIM)</h2>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                style={input}
                placeholder="Masukkan NIM"
                value={searchNIM}
                onChange={e => setSearchNIM(e.target.value)}
              />
              <button style={btnPrimary} onClick={handleSearch}>Cari</button>
            </div>
            <table style={table}>
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Prodi</th>
                  <th>Tanggal Input</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map(m => (
                  <tr key={m.nim}>
                    <td>{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.prodi}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SORTING */}
        {page === "sort" && (
          <div style={card}>
            <h2>Pengurutan Data</h2>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button style={btnPrimary} onClick={sortNamaAsc}>Nama ↑</button>
              <button style={btnInfo} onClick={sortNamaDesc}>Nama ↓</button>
              <button style={btnPrimary} onClick={sortNimAsc}>NIM ↑</button>
              <button style={btnInfo} onClick={sortNimDesc}>NIM ↓</button>
              <button style={btnPrimary} onClick={sortDateAsc}>Tanggal ↑</button>
              <button style={btnInfo} onClick={sortDateDesc}>Tanggal ↓</button>
              <button style={btnPrimary} onClick={exportCSV}>Export CSV</button>
            </div>
            <table style={table}>
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Prodi</th>
                  <th>Tanggal Input</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map(m => (
                  <tr key={m.nim}>
                    <td>{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.prodi}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

/* ===== STYLE ===== */
const card = { background: "#fff", padding: 24, borderRadius: 12, maxWidth: 950, margin: "20px auto", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" };
const input = { width: "100%", padding: 10, marginBottom: 10 };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 10 };
const btnPrimary = { background: "#1e40af", color: "#fff", padding: "8px 14px", marginRight: 6, cursor: "pointer" };
const btnWarn = { background: "#f59e0b", color: "#fff", marginRight: 6, cursor: "pointer" };
const btnDanger = { background: "#dc2626", color: "#fff", marginRight: 6, cursor: "pointer" };
const btnInfo = { background: "#0d9488", color: "#fff", marginRight: 6, cursor: "pointer" };
const homeCard = { background: "#b1b2b3ff", padding: 30, borderRadius: 12, maxWidth: 900, margin: "40px auto", textAlign: "center" };
const homeBox = { background: "#fff", padding: 16, borderRadius: 8 };
