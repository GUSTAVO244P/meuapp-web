import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = "https://meuapp-api.up.railway.app";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(${SERVER_URL}/login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      alert("Erro ao conectar ao servidor");
    }
  };

  return (
    <div className="form">
      <h2>Login</h2>
      <input placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Entrar</button>
      <p>
        Não tem conta? <a onClick={() => navigate("/cadastro")}>Cadastre-se</a>
      </p>
    </div>
  );
