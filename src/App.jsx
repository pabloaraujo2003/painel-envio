import { useState } from "react";

export default function App() {
  const [linhas, setLinhas] = useState("");
  const [comandos, setComandos] = useState("");
  const [sender, setSender] = useState("");
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  function parse(text) {
    return text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
  }

  async function enviar() {
    const listaLinhas = parse(linhas);
    const listaComandos = parse(comandos);

    if (listaLinhas.length !== listaComandos.length) {
      alert(`Quantidade diferente:\nLinhas: ${listaLinhas.length}\nComandos: ${listaComandos.length}`);
      return;
    }

    const payload = listaLinhas.map((linha, i) => ({
      to: linha,
      message: listaComandos[i]
    }));

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-1-1", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sender, items: payload })
      });

      setResult(await res.json());
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Envio 1:1 — Comtele</h1>

      <label>Sender (opcional)</label>
      <input
        value={sender}
        onChange={e => setSender(e.target.value)}
        style={{ width: 240, marginBottom: 20 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h3>Linhas (1 por linha)</h3>
          <textarea
            rows={12}
            value={linhas}
            onChange={e => setLinhas(e.target.value)}
            placeholder="5511999999999"
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <h3>Comandos (1 por linha)</h3>
          <textarea
            rows={12}
            value={comandos}
            onChange={e => setComandos(e.target.value)}
            placeholder="SET,APN,...."
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <button
        onClick={enviar}
        disabled={sending}
        style={{ marginTop: 20, padding: "10px 16px" }}
      >
        {sending ? "Enviando..." : "Enviar comandos"}
      </button>

      {result && (
        <pre style={{ marginTop: 20, padding: 12, border: "1px solid #333", borderRadius: 8 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
