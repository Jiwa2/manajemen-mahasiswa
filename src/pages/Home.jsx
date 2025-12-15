import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Home() {
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
  const [searchResult, setSearchResult] = useState([]);

  const toggle = () => setOpen(!open);
  const handleSelect = (key) => {
    setPage(key);
    setOpen(false);
  };

  const loadData = async () => {
    const res = await fetch("http://localhost:5000/api/mahasiswa");
    const json = await res.json();
    setData(json);
    setSortedData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!nim || !nama || !prodi) return alert("Semua field wajib diisi!");
    const res = await fetch("http://localhost:5000/api/mahasiswa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim, nama, prodi }),
    });
    if (!res.ok) return alert("NIM sudah terdaftar!");
    setNim(""); setNama(""); setProdi("");
    loadData();
  };

  const startEdit = (mhs) => {
    setEditMode(true);
    setEditNIM(mhs.nim);
    setNim(mhs.nim);
    setNama(mhs.nama);
    setProdi(mhs.prodi);
    setPage("input");
  };

  const handleEditSave = async () => {
    await fetch(`http://localhost:5000/api/mahasiswa/${editNIM}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim, nama, prodi }),
    });
    setEditMode(false);
    setNim(""); setNama(""); setProdi("");
    loadData();
  };

  const handleDelete = async (nim) => {
    if (!window.confirm("Hapus data ini?")) return;
    await fetch(`http://localhost:5000/api/mahasiswa/${nim}`, { method: "DELETE" });
    loadData();
  };

  const handleSearch = async () => {
    const res = await fetch(`http://localhost:5000/api/mahasiswa/search/${searchNIM}`);
    const json = await res.json();
    setSearchResult(json);
  };

  // =================== SORT ===================
  const sortNamaAsc = () => setSortedData([...data].sort((a, b) => a.nama.localeCompare(b.nama)));
  const sortNamaDesc = () => setSortedData([...data].sort((a, b) => b.nama.localeCompare(a.nama)));
  const sortNimAsc = () => setSortedData([...data].sort((a, b) => a.nim - b.nim));
  const sortNimDesc = () => setSortedData([...data].sort((a, b) => b.nim - a.nim));

  // =================== EXPORT CSV ===================
  const exportCSV = (dataToExport) => {
    if (!dataToExport || dataToExport.length === 0) {
      alert("Data kosong!");
      return;
    }
    const header = ["NIM", "Nama", "Prodi"];
    const rows = dataToExport.map(m => `"${m.nim}","${m.nama}","${m.prodi}"`);
    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data_mahasiswa.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar onToggle={toggle} />
      <Sidebar open={open} onSelect={handleSelect} />

      <main className={`content ${open ? "shifted" : ""}`}>
        {page === "Home" && (
          <div style={homeCard}>
            <h1 style={{ color: "#1e3a8a", marginBottom: 8 }}>
              Sistem Manajemen Data Mahasiswa
            </h1>
            <p style={{ color: "#555", marginBottom: 16, fontSize: 20 }}>
              Selamat datang di aplikasi manajemen data mahasiswa berbasis web.
            </p>
            <div style={homeBox}>
              <p style={{ marginBottom: 8 }}>
                📌 <strong>Petunjuk penggunaan:</strong>
              </p>
              <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Gunakan menu <strong>Input Data</strong> untuk menambahkan mahasiswa.</li>
                <li>Gunakan menu <strong>Lihat Data</strong> untuk melihat, edit, dan hapus data.</li>
                <li>Gunakan menu <strong>Cari Data</strong> untuk pencarian berdasarkan NIM.</li>
                <li>Gunakan menu <strong>Pengurutan Data</strong> untuk mengurutkan data mahasiswa.</li>
              </ul>
            </div>
            <p style={{ fontSize: 20, color: "#777", marginTop: 16 }}>
              Silakan buka <strong>Sidebar</strong> untuk memilih menu yang tersedia.
            </p>
          </div>
        )}

        {/* INPUT */}
        {page === "input" && (
          <div style={card}>
            <h2>{editMode ? "Edit Data Mahasiswa" : "Input Data Mahasiswa"}</h2>
            <label>NIM</label>
            <input style={input} value={nim} onChange={e => setNim(e.target.value)} />
            <label>Nama</label>
            <input style={input} value={nama} onChange={e => setNama(e.target.value)} />
            <label>Program Studi</label>
            <input style={input} value={prodi} onChange={e => setProdi(e.target.value)} />
            <button style={btnPrimary} onClick={editMode ? handleEditSave : handleAdd}>
              {editMode ? "Simpan Perubahan" : "Simpan Data"}
            </button>
          </div>
        )}

        {/* VIEW */}
        {page === "view" && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0 }}>Data Mahasiswa</h2>
                <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Data dapat diunduh dalam format CSV</p>
              </div>
              <button type="button" style={btnInfo} onClick={() => exportCSV(data)}>
                Export CSV
              </button>
            </div>
            <div style={{ overflowX: "auto", background: "#f3f4f6", padding: 12, borderRadius: 8 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th>NIM</th>
                    <th>Nama</th>
                    <th>Prodi</th>
                    <th style={{ textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: 16 }}>Data masih kosong</td>
                    </tr>
                  ) : (
                    data.map(m => (
                      <tr key={m.nim}>
                        <td>{m.nim}</td>
                        <td>{m.nama}</td>
                        <td>{m.prodi}</td>
                        <td style={{ textAlign: "center" }}>
                          <button style={btnWarn} onClick={() => startEdit(m)}>Edit</button>
                          <button style={btnDanger} onClick={() => handleDelete(m.nim)}>Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEARCH */}
        {page === "search" && (
          <div style={card}>
            <h2>Pencarian Mahasiswa (NIM)</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={input} value={searchNIM} onChange={e => setSearchNIM(e.target.value)} />
              <button style={btnPrimary} onClick={handleSearch}>Cari</button>
            </div>
            <table style={table}>
              <tbody>
                {searchResult.map(m => (
                  <tr key={m.nim}>
                    <td>{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.prodi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SORT */}
        {page === "sort" && (
          <div style={card}>
            <h2>Pengurutan Data</h2>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <button style={btnPrimary} onClick={sortNamaAsc}>Nama A–Z</button>
              <button style={btnInfo} onClick={sortNamaDesc}>Nama Z–A</button>
              <button style={btnPrimary} onClick={sortNimAsc}>NIM ↑</button>
              <button style={btnInfo} onClick={sortNimDesc}>NIM ↓</button>
              <button style={btnInfo} onClick={() => exportCSV(sortedData)}>Export CSV</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th>NIM</th>
                    <th>Nama</th>
                    <th>Prodi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map(m => (
                    <tr key={m.nim}>
                      <td>{m.nim}</td>
                      <td>{m.nama}</td>
                      <td>{m.prodi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/* ===== STYLE ===== */
const card = { background: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 4px 10px rgba(0,0,0,.1)", maxWidth: 900, margin: "20px auto" };
const input = { width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #000000ff" };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 10 };
const btnPrimary = { background: "#1e40af", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" };
const btnWarn = { background: "#f59e0b", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6, marginRight: 6 };
const btnDanger = { background: "#dc2626", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6 };
const btnInfo = { background: "#0d9488", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6 };
const homeCard = { background: "#b1b2b3ff", padding: 30, borderRadius: 12, maxWidth: 900, margin: "40px auto", textAlign: "center" };
const homeBox = { background: "#ffffff", padding: 16, borderRadius: 8, textAlign: "left", boxShadow: "0 2px 6px rgba(0,0,0,.05)" };
