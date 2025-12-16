import express from "express";

const app = express();
app.use(express.json());

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

  const data = await res.json();
  if (!res.ok) throw data;
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
      resultados.push({ index: i, to, ok: false, error: e });
    }
  }

  res.json({
    total: items.length,
    enviados: resultados.filter(r => r.ok).length,
    resultados
  });
});

app.listen(3001, () => console.log("API rodando em http://localhost:3001"));
