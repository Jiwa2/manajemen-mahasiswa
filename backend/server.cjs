const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const mahasiswaRoute = require("./routes/mahasiswa.cjs");
app.use("/api/mahasiswa", mahasiswaRoute);

const PORT = 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

app.put("/api/mahasiswa/:nim", (req, res) => {
  const { nim } = req.params;
  const { nama, prodi } = req.body;

  const index = data.findIndex(m => m.nim == nim);
  if (index === -1) return res.status(404).json({ message: "Data tidak ditemukan" });

  data[index].nama = nama;
  data[index].prodi = prodi;

  saveData();
  res.json({ message: "Berhasil update" });
});
