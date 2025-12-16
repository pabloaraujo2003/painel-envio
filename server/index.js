import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const COMTELE_KEY = process.env.COMTELE_AUTH_KEY;
const COMTELE_URL = "https://sms.comtele.com.br/api/v2/send";

async function enviarSMS({ to, message, sender }) {
  const body = {
    Receivers: to,
    Content: message,
    ...(sender ? { Sender: sender } : {})
  };

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

  if (!res.ok) {
    const err = new Error(`Comtele HTTP ${res.status}`);
    err.details = data;
    throw err;
  }
  return data;
}

app.post("/api/send-1-1", async (req, res) => {
  const { items, sender } = req.body;

  if (!COMTELE_KEY) return res.status(500).json({ error: "COMTELE_AUTH_KEY não configurada" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items inválido" });

  const resultados = [];
  for (let i = 0; i < items.length; i++) {
    const { to, message } = items[i];
    try {
      const r = await enviarSMS({ to, message, sender });
      resultados.push({ index: i, to, ok: true, response: r });
    } catch (e) {
      resultados.push({ index: i, to, ok: false, error: e.details || String(e) });
    }
  }

  res.json({
    total: items.length,
    enviados: resultados.filter(r => r.ok).length,
    resultados
  });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
