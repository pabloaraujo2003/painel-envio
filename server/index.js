import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

/**
 * =========================
 * CORS
 * =========================
 * Permite frontend Vercel, localhost, etc.
 */
const allowedOrigins = [
  "https://painel-envio.vercel.app", // Substitua pelo domínio do Vercel
  "http://localhost:5173", // localhost Vitegit add index.js
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("CORS check - Origin:", origin); // Log para depuração
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

/**
 * =========================
 * COMTELE
 * =========================
 */
const COMTELE_KEY = process.env.COMTELE_AUTH_KEY;
const COMTELE_URL = "https://sms.comtele.com.br/api/v2/send";

async function enviarSMS({ to, message, sender }) {
  if (!COMTELE_KEY) throw new Error("COMTELE_AUTH_KEY não configurada");

  const phone = String(to ?? "").replace(/\D/g, "");
  const content = String(message ?? "").trim();

  if (!phone) throw new Error("Número inválido");
  if (!content) throw new Error("Mensagem vazia");

  const body = {
    Receivers: phone,
    Content: content,
    ...(sender ? { Sender: String(sender).trim() } : {})
  };

  const res = await fetch(COMTELE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-key": COMTELE_KEY
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok || data?.Success === false) {
    const err = new Error(`Erro Comtele (${res.status})`);
    err.details = data;
    throw err;
  }

  return data;
}

/**
 * =========================
 * SMS 1 A 1
 * =========================
 */
app.post("/api/send-1-1", async (req, res) => {
  const { items, sender } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items inválido" });
  }

  const resultados = [];

  for (let i = 0; i < items.length; i++) {
    const { to, message } = items[i];

    try {
      const r = await enviarSMS({ to, message, sender });
      resultados.push({ index: i, to, ok: true, response: r });
    } catch (e) {
      resultados.push({
        index: i,
        to,
        ok: false,
        error: e?.details ?? e?.message ?? String(e)
      });
    }
  }

  res.json({
    total: items.length,
    enviados: resultados.filter(r => r.ok).length,
    resultados
  });
});

/**
 * =========================
 * GEMINI
 * =========================
 */
app.post("/api/gemini", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
      req.body?.prompt ??
      "Explique como funciona uma API em uma frase.";

    const result = await model.generateContent(String(prompt));
    res.json({ text: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

/**
 * =========================
 * START
 * =========================
 */
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
