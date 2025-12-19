import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "123") {
      localStorage.setItem("login", "true");
      navigate("/home");
    } else {
      alert("Username atau password salah");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Login Admin</h2>
        <p style={subtitle}>Sistem Manajemen Data Mahasiswa</p>

        <form onSubmit={handleLogin}>
          <input
            style={input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={button} type="submit">
            Login
          </button>
        </form>

        <p style={footer}>© 2025 Manajemen Mahasiswa</p>
      </div>
    </div>
  );
}

/* ===== STYLE ===== */
const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #1e3a8a, #0f766e)",
};

const card = {
  background: "#fff",
  padding: "32px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "380px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const title = {
  marginBottom: "6px",
  fontSize: "26px",
  fontWeight: "bold",
  color: "#1e3a8a",
};

const subtitle = {
  marginBottom: "20px",
  fontSize: "14px",
  color: "#555",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  outline: "none",
};

const button = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#1e40af",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};

const footer = {
  marginTop: "18px",
  fontSize: "12px",
  color: "#888",
};
