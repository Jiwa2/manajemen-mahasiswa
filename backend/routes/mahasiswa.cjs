const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/mahasiswa.json");

// ======================= FUNCTION UTAMA =========================
function loadData() {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error membaca file:", err);
    return [];
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error menyimpan file:", err);
    throw new Error("Gagal menyimpan data");
  }
}

// ======================= ROUTES =================================

// GET semua data
router.get("/", (req, res) => {
  try {
    const data = loadData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST tambah data transaksi
router.post("/", (req, res) => {
  try {
    const { keterangan, nominal, tipe, createdAt } = req.body;

    if (!keterangan || !nominal || !tipe) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const data = loadData();
    const id = Math.random().toString(36).substr(2, 9);
    
    const transaksi = {
      _id: id,
      keterangan,
      nominal: parseInt(nominal),
      tipe,
      createdAt: createdAt || new Date().toISOString()
    };

    data.push(transaksi);
    saveData(data);

    res.json({ message: "Data ditambahkan", data: transaksi });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan data" });
  }
});

// DELETE berdasarkan ID
router.delete("/:id", (req, res) => {
  try {
    const id = req.params.id;
    let data = loadData();

    const newList = data.filter(m => m._id !== id && m.nim !== id);

    if (newList.length === data.length) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    saveData(newList);
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data" });
  }
});

// PUT update data
router.put("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { keterangan, nominal, tipe } = req.body;

    const data = loadData();
    const index = data.findIndex(m => m._id === id || m.nim === id);

    if (index === -1) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const existingCreatedAt = data[index].createdAt;
    const transaksi = {
      _id: data[index]._id || id,
      keterangan,
      nominal: parseInt(nominal),
      tipe,
      createdAt: existingCreatedAt
    };

    data[index] = transaksi;
    saveData(data);

    res.json({ message: "Data berhasil diupdate", data: transaksi });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengupdate data" });
  }
});

module.exports = router;
