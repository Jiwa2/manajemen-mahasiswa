import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

/* ================= API CONFIG ================= */
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://manajemen-mahasiswa-production.up.railway.app";

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

  /* ================= LOAD ================= */
  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
      setSortedData(json);
    } catch {
      alert("Gagal load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ADD ================= */
  const handleAdd = async () => {
    if (!nim || !nama || !prodi) return alert("Semua field wajib diisi");

    try {
      const res = await fetch(`${API_URL}/api/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: nim.toString(), nama, prodi }),
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.message);
      }

      setNim("");
      setNama("");
      setProdi("");
      loadData();
    } catch {
      alert("Gagal menambahkan data");
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (m) => {
    setEditMode(true);
    setEditNIM(m.nim);
    setNim(m.nim);
    setNama(m.nama);
    setProdi(m.prodi);
    setPage("input");
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa/${editNIM}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, prodi }),
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.message);
      }

      setEditMode(false);
      setNim("");
      setNama("");
      setProdi("");
      loadData();
    } catch {
      alert("Gagal update data");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (nim) => {
    if (!window.confirm("Hapus data ini?")) return;

    try {
      const res = await fetch(`${API_URL}/api/mahasiswa/${nim}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.message);
      }

      loadData();
    } catch {
      alert("Gagal menghapus data");
    }
  };

  /* ================= SEARCH ================= */
  const handleSearch = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/mahasiswa/search/${searchNIM}`
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      setSearchResult(json);
    } catch {
      alert("Gagal mencari data");
    }
  };

  /* ================= SORT ================= */
  const sortNamaAsc = () =>
    setSortedData([...data].sort((a, b) => a.nama.localeCompare(b.nama)));
  const sortNamaDesc = () =>
    setSortedData([...data].sort((a, b) => b.nama.localeCompare(a.nama)));
  const sortNimAsc = () =>
    setSortedData([...data].sort((a, b) => Number(a.nim) - Number(b.nim)));
  const sortNimDesc = () =>
    setSortedData([...data].sort((a, b) => Number(b.nim) - Number(a.nim)));

  /* ================= EXPORT CSV ================= */
  const exportCSV = (list) => {
    if (!list.length) return alert("Data kosong");
    const header = ["NIM", "Nama", "Prodi"];
    const rows = list.map(
      (m) => `"${m.nim}","${m.nama}","${m.prodi}"`
    );
    const blob = new Blob(
      [[header.join(","), ...rows].join("\n")],
      { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_mahasiswa.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar onToggle={toggle} />
      <Sidebar open={open} onSelect={handleSelect} />

      <main className={`content ${open ? "shifted" : ""}`}>
        {page === "Home" && (
          <div style={homeCard}>
            <h1>Sistem Manajemen Data Mahasiswa</h1>
            <p>Gunakan sidebar untuk navigasi</p>
          </div>
        )}

        {page === "input" && (
          <div style={card}>
            <h2>{editMode ? "Edit Data" : "Input Data"}</h2>
            <input style={input} placeholder="NIM" value={nim} onChange={(e) => setNim(e.target.value)} />
            <input style={input} placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} />
            <input style={input} placeholder="Prodi" value={prodi} onChange={(e) => setProdi(e.target.value)} />
            <button style={btnPrimary} onClick={editMode ? handleEditSave : handleAdd}>
              Simpan
            </button>
          </div>
        )}

        {page === "view" && (
          <div style={card}>
            <button style={btnInfo} onClick={() => exportCSV(data)}>Export CSV</button>
            <table style={table}>
              <tbody>
                {data.map((m) => (
                  <tr key={m.nim}>
                    <td>{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.prodi}</td>
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

        {page === "search" && (
          <div style={card}>
            <input style={input} value={searchNIM} onChange={(e) => setSearchNIM(e.target.value)} />
            <button style={btnPrimary} onClick={handleSearch}>Cari</button>
            <table style={table}>
              <tbody>
                {searchResult.map((m) => (
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

        {page === "sort" && (
          <div style={card}>
            <button onClick={sortNamaAsc}>Nama A–Z</button>
            <button onClick={sortNamaDesc}>Nama Z–A</button>
            <button onClick={sortNimAsc}>NIM ↑</button>
            <button onClick={sortNimDesc}>NIM ↓</button>
            <button onClick={() => exportCSV(sortedData)}>Export CSV</button>
          </div>
        )}
      </main>
    </>
  );
}

/* ===== STYLE ===== */
const card = { background: "#fff", padding: 20, borderRadius: 10, maxWidth: 900, margin: "20px auto" };
const input = { width: "100%", padding: 10, marginBottom: 10 };
const table = { width: "100%", marginTop: 10 };
const btnPrimary = { background: "#1e40af", color: "#fff", padding: 8 };
const btnWarn = { background: "#f59e0b", color: "#fff", marginRight: 5 };
const btnDanger = { background: "#dc2626", color: "#fff" };
const btnInfo = { background: "#0d9488", color: "#fff", marginBottom: 10 };
const homeCard = { padding: 30, textAlign: "center" };
