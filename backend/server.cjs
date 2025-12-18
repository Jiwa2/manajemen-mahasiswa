const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

/* ================= FILE DATA ================= */
const file = path.join(__dirname, "data", "mahasiswa.json");

/* ================= UTILITY ================= */
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

/* ================= ROUTES ================= */

// health check (WAJIB biar kelihatan hidup)
app.get("/", (req, res) => {
  res.send("API RUNNING");
});

// GET semua mahasiswa
app.get("/api/mahasiswa", (req, res) => {
  const data = loadData();
  res.json(data);
});

// POST mahasiswa
app.post("/api/mahasiswa", (req, res) => {
  const { nim, nama, prodi } = req.body;

  if (!nim || !nama || !prodi) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const nimRegex = /^\d+$/;
  const namaRegex = /^[a-zA-Z\s]+$/;

  if (!nimRegex.test(nim)) {
    return res.status(400).json({ message: "Format NIM salah" });
  }

  if (!namaRegex.test(nama)) {
    return res.status(400).json({ message: "Nama hanya boleh huruf" });
  }

  const data = loadData();
  if (data.find(m => m.nim === String(nim))) {
    return res.status(400).json({ message: "NIM sudah terdaftar" });
  }

  const mhs = { nim: String(nim), nama, prodi };
  data.push(mhs);
  saveData(data);

  res.json({ message: "Data ditambahkan", data: mhs });
});

// PUT mahasiswa
app.put("/api/mahasiswa/:nim", (req, res) => {
  const nimParam = String(req.params.nim);
  const { nama, prodi } = req.body;

  if (!nama || !prodi) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const namaRegex = /^[a-zA-Z\s]+$/;
  if (!namaRegex.test(nama)) {
    return res.status(400).json({ message: "Nama hanya boleh huruf" });
  }

  const data = loadData();
  const index = data.findIndex(m => m.nim === nimParam);
  if (index === -1) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  data[index].nama = nama;
  data[index].prodi = prodi;
  saveData(data);

  res.json({ message: "Data berhasil diupdate", data: data[index] });
});

// DELETE mahasiswa
app.delete("/api/mahasiswa/:nim", (req, res) => {
  const nim = String(req.params.nim);
  const data = loadData();

  const newList = data.filter(m => m.nim !== nim);
  if (newList.length === data.length) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  saveData(newList);
  res.json({ message: "Data berhasil dihapus" });
});

// SEARCH mahasiswa
app.get("/api/mahasiswa/search/:nim", (req, res) => {
  const nim = String(req.params.nim);
  const data = loadData();
  const result = data.filter(m => m.nim.includes(nim));
  res.json(result);
});

/* ================= PORT (INI KUNCI RAILWAY) ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
