import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000/api/mahasiswa";

export default function Home() {

  // ===== STATE =====
  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  const [keterangan, setKeterangan] = useState("");
  const [nominal, setNominal] = useState("");
  const [tipe, setTipe] = useState("masuk"); // "masuk" atau "keluar"

  // ===== LOAD DATA =====
  const loadData = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error load data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ===== HITUNG SALDO =====
  const hitungSaldo = () => {
    let saldo = 0;
    data.forEach((item) => {
      if (item.tipe === "masuk") {
        saldo += parseInt(item.nominal) || 0;
      } else {
        saldo -= parseInt(item.nominal) || 0;
      }
    });
    return saldo;
  };

  const hitungMasuk = () => {
    return data.reduce((sum, item) => {
      return item.tipe === "masuk" ? sum + (parseInt(item.nominal) || 0) : sum;
    }, 0);
  };

  const hitungKeluar = () => {
    return data.reduce((sum, item) => {
      return item.tipe === "keluar" ? sum + (parseInt(item.nominal) || 0) : sum;
    }, 0);
  };

  // ===== ADD / EDIT =====
  const handleAdd = async () => {
    if (!keterangan || !nominal) return alert("Semua field wajib diisi!");
    try {
      const now = new Date().toISOString();
      const payload = { keterangan, nominal: parseInt(nominal), tipe, createdAt: now };
      
      if (editMode) {
        // Edit
        const res = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal update data");
        
        // Update state langsung
        const newData = data.map(item => 
          item._id === editId ? json.data : item
        );
        setData(newData);
        alert("Data berhasil diupdate!");
      } else {
        // Add
        const res = await fetch(`${API_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal menambahkan data");
        
        // Update state langsung - tambah data baru ke array
        setData([...data, json.data]);
        alert("Data berhasil ditambahkan!");
      }
      
      setKeterangan("");
      setNominal("");
      setTipe("masuk");
      setEditMode(false);
      setEditId("");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const startEdit = (item) => {
    setEditMode(true);
    setEditId(item._id || item.nim);
    setKeterangan(item.keterangan || item.nim);
    setNominal(item.nominal || item.nama);
    setTipe(item.tipe || "masuk");
  };

  const handleCancel = () => {
    setEditMode(false);
    setKeterangan("");
    setNominal("");
    setTipe("masuk");
    setEditId("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus data");
      
      // Update state langsung - hapus data dari array
      const newData = data.filter(item => item._id !== id);
      setData(newData);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ===== DOWNLOAD PDF =====
  // ===== DOWNLOAD CSV =====
  const downloadCSV = () => {
    const saldo = hitungSaldo();
    const masuk = hitungMasuk();
    const keluar = hitungKeluar();
    const tanggalHari = new Date().toLocaleDateString("id-ID");

    // Hitung saldo kumulatif
    let saldoKumulatif = 0;
    const dataWithSaldo = data.map((item) => {
      if (item.tipe === "masuk") {
        saldoKumulatif += parseInt(item.nominal) || 0;
      } else {
        saldoKumulatif -= parseInt(item.nominal) || 0;
      }
      return {
        ...item,
        saldoKumulatif,
      };
    });

    // Buat CSV header dan data
    let csvContent = "REKAPAN HARIAN DAPUR MERAJI\n";
    csvContent += `Tanggal: ${tanggalHari}\n\n`;
    csvContent += "Waktu,Keterangan,Pemasukan,Pengeluaran,Saldo Kumulatif\n";

    // Tambah data transaksi
    dataWithSaldo.forEach((item) => {
      const waktu = new Date(item.createdAt).toLocaleTimeString("id-ID");
      const pemasukan = item.tipe === "masuk" ? item.nominal : "";
      const pengeluaran = item.tipe === "keluar" ? item.nominal : "";
      csvContent += `${waktu},"${item.keterangan}",${pemasukan},${pengeluaran},${item.saldoKumulatif}\n`;
    });

    // Tambah ringkasan
    csvContent += "\n";
    csvContent += "RINGKASAN\n";
    csvContent += `Total Pemasukan,${masuk}\n`;
    csvContent += `Total Pengeluaran,${keluar}\n`;
    csvContent += `Saldo Akhir,${saldo}\n`;

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Rekapan_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== RESET HARIAN / TUTUP BUKU =====
  const resetHarian = async () => {
    const confirm = window.confirm(
      "Anda yakin ingin TUTUP BUKU hari ini?\n\n" +
      "Rekapan akan didownload (CSV) dan semua data akan dihapus untuk hari besok.\n\n" +
      "Proses ini tidak bisa dibatalkan!"
    );
    if (!confirm) return;

    try {
      // Download CSV dulu
      downloadCSV();

      // Delete semua data
      for (const item of data) {
        await fetch(`${API_URL}/${item._id}`, { method: "DELETE" });
      }

      // Clear state
      setData([]);
      setKeterangan("");
      setNominal("");
      setTipe("masuk");
      setEditMode(false);
      setEditId("");

      alert("✅ Buku harian ditutup. Data sudah dihapus untuk hari besok!");
    } catch (err) {
      alert("Error saat tutup buku: " + err.message);
    }
  };

  const saldo = hitungSaldo();
  const masuk = hitungMasuk();
  const keluar = hitungKeluar();

  return (
    <>
      <Navbar />
      <main style={mainContent}>
        <div style={container}>
          
          {/* BUTTON TUTUP BUKU */}
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <button 
              style={{ ...btnDanger, padding: "12px 20px", fontSize: 16 }}
              onClick={resetHarian}
            >
              🔄 TUTUP BUKU & RESET HARIAN
            </button>
          </div>
          
          {/* RINGKASAN SALDO */}
          <div style={summaryContainer}>
            <div style={{ ...summaryCard, borderLeft: "5px solid #16a34a" }}>
              <p style={summaryLabel}>Uang Masuk</p>
              <p style={{ ...summaryValue, color: "#16a34a" }}>Rp {masuk.toLocaleString("id-ID")}</p>
            </div>
            <div style={{ ...summaryCard, borderLeft: "5px solid #dc2626" }}>
              <p style={summaryLabel}>Pengeluaran</p>
              <p style={{ ...summaryValue, color: "#dc2626" }}>Rp {keluar.toLocaleString("id-ID")}</p>
            </div>
            <div style={{ ...summaryCard, borderLeft: "5px solid #1e40af", backgroundColor: saldo >= 0 ? "#eff6ff" : "#fee2e2" }}>
              <p style={summaryLabel}>SALDO HARI INI</p>
              <p style={{ ...summaryValue, color: saldo >= 0 ? "#1e40af" : "#dc2626", fontSize: 28 }}>
                Rp {saldo.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* INPUT TRANSAKSI */}
          <div style={card}>
            <h2>{editMode ? "Edit Transaksi" : "Input Transaksi"}</h2>
            <div style={formGroup}>
              <div>
                <label style={label}>Tipe Transaksi</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <label style={radioLabel}>
                    <input
                      type="radio"
                      value="masuk"
                      checked={tipe === "masuk"}
                      onChange={(e) => setTipe(e.target.value)}
                    />
                    📥 Uang Masuk
                  </label>
                  <label style={radioLabel}>
                    <input
                      type="radio"
                      value="keluar"
                      checked={tipe === "keluar"}
                      onChange={(e) => setTipe(e.target.value)}
                    />
                    📤 Pengeluaran
                  </label>
                </div>
              </div>

              <div>
                <label style={label}>Keterangan</label>
                <input
                  style={input}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Jual Nasi Kuning, Beli Bumbu, dll"
                />
              </div>

              <div>
                <label style={label}>Nominal (Rp)</label>
                <input
                  style={input}
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  placeholder="Masukkan jumlah uang"
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnPrimary} onClick={handleAdd}>
                  {editMode ? "💾 Simpan Perubahan" : "➕ Tambah Transaksi"}
                </button>
                {editMode && <button style={btnSecondary} onClick={handleCancel}>❌ Batal</button>}
              </div>
            </div>
          </div>

          {/* DAFTAR TRANSAKSI */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Daftar Transaksi Hari Ini</h2>
              <button style={btnSuccess} onClick={downloadCSV}>📊 Download Rekapan CSV</button>
            </div>

            {data.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>Belum ada transaksi</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Keterangan</th>
                      <th>Tipe</th>
                      <th>Nominal</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item._id || item.nim} style={{ backgroundColor: item.tipe === "masuk" ? "#f0fdf4" : "#fef2f2" }}>
                        <td>{new Date(item.createdAt).toLocaleTimeString("id-ID")}</td>
                        <td style={{ fontWeight: 500 }}>{item.keterangan || item.nim}</td>
                        <td>{item.tipe === "masuk" ? "📥 Masuk" : "📤 Keluar"}</td>
                        <td style={{ fontWeight: "bold", color: item.tipe === "masuk" ? "#16a34a" : "#dc2626" }}>
                          {item.tipe === "masuk" ? "+" : "-"} Rp {(item.nominal || item.nama).toLocaleString("id-ID")}
                        </td>
                        <td>
                          <button style={btnWarn} onClick={() => startEdit(item)}>Edit</button>
                          <button style={btnDanger} onClick={() => handleDelete(item._id || item.nim)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

/* ===== STYLE ===== */
const mainContent = { padding: "20px", paddingTop: "84px", backgroundColor: "#f9fafb", minHeight: "100vh" };
const container = { maxWidth: 1100, margin: "0 auto" };

// Summary Cards
const summaryContainer = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15, marginBottom: 30 };
const summaryCard = { background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const summaryLabel = { margin: "0 0 10px 0", color: "#666", fontSize: 14, fontWeight: 500 };
const summaryValue = { margin: 0, fontSize: 24, fontWeight: "bold" };

// Card & Form
const card = { background: "#fff", padding: 24, marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const formGroup = { display: "flex", flexDirection: "column", gap: 15 };
const label = { display: "block", marginBottom: 8, fontWeight: 500, color: "#333" };
const input = { width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" };
const radioLabel = { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" };

// Table
const table = { width: "100%", borderCollapse: "collapse", marginTop: 10 };

// Buttons
const btnBase = { padding: "10px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" };
const btnPrimary = { ...btnBase, background: "#1e40af", color: "#fff" };
const btnSecondary = { ...btnBase, background: "#6b7280", color: "#fff" };
const btnWarn = { ...btnBase, background: "#f59e0b", color: "#fff", fontSize: 12, padding: "6px 10px" };
const btnDanger = { ...btnBase, background: "#dc2626", color: "#fff", fontSize: 12, padding: "6px 10px", marginLeft: 6 };
const btnSuccess = { ...btnBase, background: "#16a34a", color: "#fff" };
