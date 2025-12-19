import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_URL = "https://manajemen-mahasiswa-production.up.railway.app";

export default function Home() {
  const navigate = useNavigate();

  /* ====== AUTH PROTECTION ====== */
  useEffect(() => {
    if (!localStorage.getItem("login")) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("login");
    navigate("/");
  };

  /* ====== STATE ====== */
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
    setSortedData([]);
  };

  /* ====== LOAD DATA ====== */
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

  /* ====== ADD / EDIT ====== */
  const handleAdd = async () => {
    if (!nim || !nama || !prodi) return alert("Semua field wajib diisi!");
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, nama, prodi }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.message);
      }
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
      const res = await fetch(`${API_URL}/api/mahasiswa/${editNIM}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, nama, prodi }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.message);
      }
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

  const exportCSV = (list) => {
    if (!list.length) return alert("Data kosong!");
    const rows = list.map((m) => `"${m.nim}","${m.nama}","${m.prodi}"`);
    const csv = ["NIM,Nama,Prodi", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_mahasiswa.csv";
    link.click();
  };

  /* ====== SEARCH ====== */
  const handleSearch = () => {
    const filtered = data.filter((m) => m.nim.includes(searchNIM));
    setSortedData(filtered);
  };

  /* ====== SORT ====== */
  const sortNamaAsc = () => setSortedData([...data].sort((a, b) => a.nama.localeCompare(b.nama)));
  const sortNamaDesc = () => setSortedData([...data].sort((a, b) => b.nama.localeCompare(a.nama)));
  const sortNimAsc = () => setSortedData([...data].sort((a, b) => a.nim - b.nim));
  const sortNimDesc = () => setSortedData([...data].sort((a, b) => b.nim - a.nim));

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
            <button style={btnInfo} onClick={() => exportCSV(data)}>Export CSV</button>
            <table style={table}>
              <thead>
                <tr><th>NIM</th><th>Nama</th><th>Prodi</th><th>Aksi</th></tr>
              </thead>
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
      </main>
    </>
  );
}

/* ===== STYLE ===== */
const card = { background: "#fff", padding: 24, borderRadius: 12, maxWidth: 950, margin: "20px auto", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" };
const input = { width: "100%", padding: 10, marginBottom: 10 };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 10 };
const btnPrimary = { background: "#1e40af", color: "#fff", padding: "8px 14px", marginRight: 6 };
const btnWarn = { background: "#f59e0b", color: "#fff", marginRight: 6 };
const btnDanger = { background: "#dc2626", color: "#fff", marginRight: 6 };
const btnInfo = { background: "#0d9488", color: "#fff", marginRight: 6 };
const homeCard = { background: "#b1b2b3ff", padding: 30, borderRadius: 12, maxWidth: 900, margin: "40px auto", textAlign: "center" };
const homeBox = { background: "#fff", padding: 16, borderRadius: 8 };
