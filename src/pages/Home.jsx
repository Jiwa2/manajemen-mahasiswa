import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_URL = "https://manajemen-mahasiswa-production.up.railway.app";

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

  const toggle = () => setOpen(!open);
  const handleSelect = (key) => {
    setPage(key);
    setOpen(false);
  };

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa`);
      const json = await res.json();
      setData(json);
      setSortedData(json);
    } catch (err) {
      alert("Gagal load data mahasiswa");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= ADD ================= */
  const handleAdd = async () => {
    if (!nim || !nama || !prodi) {
      alert("Semua field wajib diisi!");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim, nama, prodi }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }
      setNim(""); setNama(""); setProdi("");
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
        body: JSON.stringify({ nim, nama, prodi }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }
      setEditMode(false);
      setNim(""); setNama(""); setProdi("");
      loadData();
    } catch {
      alert("Gagal update data");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (nim) => {
    if (!window.confirm("Hapus data ini?")) return;
    await fetch(`${API_URL}/api/mahasiswa/${nim}`, { method: "DELETE" });
    loadData();
  };

  /* ================= SEARCH ================= */
  const handleSearch = () => {
    const filtered = data.filter(m => m.nim.includes(searchNIM));
    setSortedData(filtered);
  };

  /* ================= SORT ================= */
  const sortNamaAsc = () => setSortedData([...sortedData].sort((a,b)=>a.nama.localeCompare(b.nama)));
  const sortNamaDesc = () => setSortedData([...sortedData].sort((a,b)=>b.nama.localeCompare(a.nama)));
  const sortNimAsc = () => setSortedData([...sortedData].sort((a,b)=>a.nim-b.nim));
  const sortNimDesc = () => setSortedData([...sortedData].sort((a,b)=>b.nim-a.nim));

  /* ================= CSV ================= */
  const exportCSV = () => {
    if (!sortedData.length) return alert("Data kosong!");
    const rows = sortedData.map(m => `"${m.nim}","${m.nama}","${m.prodi}"`);
    const csv = ["NIM,Nama,Prodi", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_mahasiswa.csv";
    link.click();
  };

  return (
    <>
      <Navbar onToggle={toggle} />
      <Sidebar open={open} onSelect={handleSelect} />

      <main className={`content ${open ? "shifted" : ""}`}>

        {page==="Home" && (
          <div style={homeCard}>
            <h1 style={{ color: "#1e3a8a", marginBottom: 8 }}>Sistem Manajemen Data Mahasiswa</h1>
            <p style={{ color: "#555", marginBottom: 16, fontSize: 20 }}>Selamat datang!</p>
          </div>
        )}

        {page==="input" && (
          <div style={card}>
            <h2>{editMode ? "Edit Data" : "Input Data"}</h2>
            <input style={input} value={nim} onChange={e=>setNim(e.target.value)} placeholder="NIM"/>
            <input style={input} value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama"/>
            <input style={input} value={prodi} onChange={e=>setProdi(e.target.value)} placeholder="Prodi"/>
            <button style={btnPrimary} onClick={editMode?handleEditSave:handleAdd}>{editMode?"Simpan":"Simpan"}</button>
          </div>
        )}

        {page==="view" && (
          <div style={card}>
            {/* SEARCH */}
            <div style={{ marginBottom: 12 }}>
              <input style={{ padding:6, width:200, marginRight:6 }} placeholder="Cari NIM..." value={searchNIM} onChange={e=>setSearchNIM(e.target.value)}/>
              <button style={btnInfo} onClick={handleSearch}>Cari</button>
              <button style={btnInfo} onClick={()=>setSortedData(data)}>Reset</button>
            </div>

            {/* SORT */}
            <div style={{ marginBottom: 12 }}>
              <button style={btnInfo} onClick={sortNimAsc}>NIM ↑</button>
              <button style={btnInfo} onClick={sortNimDesc}>NIM ↓</button>
              <button style={btnInfo} onClick={sortNamaAsc}>Nama A→Z</button>
              <button style={btnInfo} onClick={sortNamaDesc}>Nama Z→A</button>
              <button style={btnInfo} onClick={exportCSV}>Export CSV</button>
            </div>

            {/* TABLE */}
            <table style={table}>
              <thead>
                <tr><th>NIM</th><th>Nama</th><th>Prodi</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {sortedData.map(m=>(
                  <tr key={m.nim}>
                    <td>{m.nim}</td>
                    <td>{m.nama}</td>
                    <td>{m.prodi}</td>
                    <td>
                      <button style={btnWarn} onClick={()=>startEdit(m)}>Edit</button>
                      <button style={btnDanger} onClick={()=>handleDelete(m.nim)}>Hapus</button>
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
const card={ background:"#fff", padding:20, borderRadius:10, maxWidth:900, margin:"20px auto" };
const input={ width:"100%", padding:10, marginBottom:10 };
const table={ width:"100%", borderCollapse:"collapse" };
const btnPrimary={ background:"#1e40af", color:"#fff", padding:"8px 14px", border:"none", cursor:"pointer" };
const btnWarn={ background:"#f59e0b", color:"#fff", marginRight:6, border:"none", cursor:"pointer" };
const btnDanger={ background:"#dc2626", color:"#fff", border:"none", cursor:"pointer" };
const btnInfo={ background:"#0d9488", color:"#fff", marginRight:6, border:"none", cursor:"pointer" };
const homeCard={ background:"#b1b2b3ff", padding:30, borderRadius:12, maxWidth:900, margin:"40px auto", textAlign:"center" };
