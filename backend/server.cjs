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

// GET semua transaksi
app.get("/api/mahasiswa", (req, res) => {
  const data = loadData();
  res.json(data);
});

// POST transaksi
app.post("/api/mahasiswa", (req, res) => {
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
    console.error("Error POST:", err);
    res.status(500).json({ message: "Gagal menyimpan data", error: err.message });
  }
});

// PUT update transaksi
app.put("/api/mahasiswa/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { keterangan, nominal, tipe } = req.body;

    if (!keterangan || !nominal || !tipe) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const data = loadData();
    const index = data.findIndex(m => m._id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const existingCreatedAt = data[index].createdAt;
    const transaksi = {
      _id: id,
      keterangan,
      nominal: parseInt(nominal),
      tipe,
      createdAt: existingCreatedAt
    };

    data[index] = transaksi;
    saveData(data);

    res.json({ message: "Data berhasil diupdate", data: transaksi });
  } catch (err) {
    console.error("Error PUT:", err);
    res.status(500).json({ message: "Gagal mengupdate data", error: err.message });
  }
});

// DELETE transaksi
app.delete("/api/mahasiswa/:id", (req, res) => {
  try {
    const id = req.params.id;
    const data = loadData();

    const newList = data.filter(m => m._id !== id);
    if (newList.length === data.length) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    saveData(newList);
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    console.error("Error DELETE:", err);
    res.status(500).json({ message: "Gagal menghapus data", error: err.message });
  }
});

/* ================= PORT (INI KUNCI RAILWAY) ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});


