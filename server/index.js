import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const COMTELE_KEY = process.env.COMTELE_AUTH_KEY;
const COMTELE_URL = "https://sms.comtele.com.br/api/v2/send";

async function enviarSMS({ to, message, sender }) {
  if (!COMTELE_KEY) throw new Error("COMTELE_AUTH_KEY não configurada");

  // normaliza: só dígitos
  const phone = String(to ?? "").replace(/\D/g, "");
  const content = String(message ?? "").trim();

  if (!phone) throw Object.assign(new Error("Número inválido/vazio"), { details: { to } });
  if (!content) throw Object.assign(new Error("Mensagem vazia"), { details: { message } });

  const body = {
    Receivers: phone,
    Content: content,
    ...(sender ? { Sender: String(sender).trim() } : {}) // ✅ só se existir
  };

  console.log("➡️ Comtele REQ:", body);

  const res = await fetch(COMTELE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "auth-key": COMTELE_KEY
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  console.log("⬅️ Comtele RES:", res.status, data);

  // Comtele pode responder 200 e Success:false, então trate os dois
  if (!res.ok || data?.Success === false) {
    const err = new Error(`Comtele HTTP ${res.status}`);
    err.details = data;
    throw err;
  }

  return data;
}

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

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Substitua pela sua chave de API
const genAI = new GoogleGenerativeAI("AIzaSyBsrfzFxDplDtWGT6BG5vZv0SZ-_eyXBjc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
  const prompt = "Explique como funciona uma API em uma frase.";
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}

run();

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
