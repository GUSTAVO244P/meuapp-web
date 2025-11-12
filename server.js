import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
// import bcrypt from 'bcrypt'; // <--- Você pode descomentar e instalar o bcrypt depois
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexão com MySQL
let db;
async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost", // O Node.js se conecta ao XAMPP/MySQL via localhost
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "meuapp", // Banco 'meuapp'
    });
    console.log("Banco de dados conectado ✅");
  } catch (err) {
    console.error("❌ Erro ao conectar ao banco:", err);
    console.log('💡 Dica: Verifique se o XAMPP/MySQL está ativo.');
  }
}
await connectDB();

// Rota de teste
app.get("/", (req, res) => {
  res.send("API Node.js + MySQL rodando na rota raiz (/) ✅");
});

// Sua rota de teste GET
app.get("/cadastro", (req, res) => {
  res.send("API Node.js + MySQL rodando na rota de cadastro (GET) ✅");
});

// ✅ Rota de REGISTRO (POST) - Usa a tabela 'cadastro' e todos os campos
app.post("/register", async (req, res) => {
  // 1. Recebe TODOS os campos
  const { nome, sobrenome, endereco, profissao, username, password } = req.body; 
  console.log("📝 Tentativa de registro:", req.body);

  if (!nome || !username || !password) {
    return res.status(400).json({ success: false, message: "Nome, usuário e senha são obrigatórios!" });
  }
  
  if (password.length < 6) {
      return res.status(400).json({ success: false, message: "A senha deve ter pelo menos 6 caracteres!" });
  }

  try {
    // 2. Verifica se username já existe na tabela 'cadastro'
    const [exists] = await db.execute(
      "SELECT id FROM cadastro WHERE username = ?",
      [username]
    );

    if (exists.length > 0) {
      return res.status(400).json({ success: false, message: "Usuário já existe!" });
    }

    // Usando a senha pura (sem bcrypt)
    const hashedPassword = password; 

    // 3. Insere todos os 6 campos na tabela 'cadastro'
    const [results] = await db.execute(
      "INSERT INTO cadastro (nome, sobrenome, endereco, profissao, username, password) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, sobrenome, endereco, profissao, username, hashedPassword]
    );

    console.log('✅ Usuário cadastrado com ID:', results.insertId);
    res.json({ success: true, message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao registrar usuário (SQL):", err.message);
    res.status(500).json({ success: false, message: "Erro interno do servidor ao salvar dados." });
  }
});


// ✅ Rota de LOGIN (POST) - Consulta a tabela 'cadastro'
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("🔐 Tentativa de login:", req.body);

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Preencha username e password!" });
  }

  try {
    // 1. Consulta a tabela 'cadastro'
    const [rows] = await db.execute(
      "SELECT nome, password FROM cadastro WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      // 2. Comparação de senha pura (para usuários recém-cadastrados)
      const passwordMatch = (rows[0].password === password); 

      if (passwordMatch) {
        res.json({ success: true, message: `Login bem-sucedido! Bem-vindo, ${rows[0].nome}!` });
      } else {
        res.status(401).json({ success: false, message: "Senha incorreta!" });
      }
    } else {
      res.status(404).json({ success: false, message: "Usuário não encontrado!" });
    }
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));