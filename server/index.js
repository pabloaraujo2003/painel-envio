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

  const CHUNK_SIZE = 10; // Enviar em lotes de 10
  const resultados = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    
    console.log(`Processando lote de ${chunk.length} (iniciando do índice ${i})`);

    const promises = chunk.map(async (item, chunkIndex) => {
      const originalIndex = i + chunkIndex;
      const { to, message } = item;
      try {
        const r = await enviarSMS({ to, message, sender });
        return { index: originalIndex, to, ok: true, response: r };
      } catch (e) {
        return {
          index: originalIndex,
          to,
          ok: false,
          error: e?.details ?? e?.message ?? String(e)
        };
      }
    });

    const chunkResults = await Promise.all(promises);
    resultados.push(...chunkResults);
  }

  // Ordena os resultados pela ordem original
  resultados.sort((a, b) => a.index - b.index);

  res.json({
    total: items.length,
    enviados: resultados.filter(r => r.ok).length,
    resultados
  });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

