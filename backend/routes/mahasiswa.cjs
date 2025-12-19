const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "./data/mahasiswa.json");

// ======================= CLASS MAHASISWA =========================
class Mahasiswa {
  #nim;
  #nama;
  #prodi;
  #createdAt;

  constructor(nim, nama, prodi, createdAt = new Date().toISOString()) {
    this.#nim = String(nim);
    this.#nama = nama;
    this.#prodi = prodi;
    this.#createdAt = createdAt; // timestamp otomatis
  }

  getNim() { return this.#nim; }
  getNama() { return this.#nama; }
  getProdi() { return this.#prodi; }
  getCreatedAt() { return this.#createdAt; }

  setNama(nama) { this.#nama = nama; }
  setProdi(prodi) { this.#prodi = prodi; }

  toJSON() {
    return {
      nim: this.#nim,
      nama: this.#nama,
      prodi: this.#prodi,
      createdAt: this.#createdAt
    };
  }
}

// ======================= FUNCTION UTAMA =========================
function loadData() {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
    const raw = fs.readFileSync(file);
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

// POST tambah data
// POST tambah data
router.post("/", (req, res) => {
  try {
    const { nim, nama, prodi } = req.body;

    if (!nim || !nama || !prodi) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const data = loadData();
    if (data.find(m => m.nim === String(nim))) {
      return res.status(400).json({ message: "NIM sudah terdaftar" });
    }

    const createdAt = new Date().toISOString(); // tambahkan timestamp
    const mhs = {
      nim: String(nim),
      nama,
      prodi,
      createdAt
    };

    data.push(mhs);
    saveData(data);

    res.json({ message: "Data ditambahkan", data: mhs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan data" });
  }
});



// DELETE berdasarkan NIM
router.delete("/:nim", (req, res) => {
  try {
    const nim = String(req.params.nim);
    let data = loadData();

    const newList = data.filter(m => m.nim !== nim);

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
router.put("/:nim", (req, res) => {
  try {
    const nim = String(req.params.nim);
    const { nama, prodi } = req.body;

    const data = loadData();
    const index = data.findIndex(m => m.nim === nim);

    if (index === -1) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // Validasi input
    const namaRegex = /^[a-zA-Z\s]+$/;
    if (!namaRegex.test(nama)) {
      return res.status(400).json({ message: "Nama hanya boleh huruf" });
    }

    const existingCreatedAt = data[index].createdAt; // simpan timestamp lama
    const mhs = new Mahasiswa(nim, nama, prodi, existingCreatedAt);
    data[index] = mhs.toJSON();
    saveData(data);

    res.json({ message: "Data berhasil diupdate", data: mhs.toJSON() });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengupdate data" });
  }
});

// SEARCH by NIM
router.get("/search/:nim", (req, res) => {
  try {
    const nim = String(req.params.nim);
    const data = loadData();
    const result = data.filter(m => m.nim.includes(nim));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Gagal mencari data" });
  }
});

module.exports = router;
