import { useMemo, useState } from "react";

function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

export default function App() {
  const [linhasText, setLinhasText] = useState("");
  const [cmdsText, setCmdsText] = useState("");
  const [sender, setSender] = useState("");
  const [limite, setLimite] = useState(50);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const linhas = useMemo(() => parseLines(linhasText), [linhasText]);
  const comandos = useMemo(() => parseLines(cmdsText), [cmdsText]);

  const totalLinhas = linhas.length;
  const totalCmds = comandos.length;

  const match = totalLinhas > 0 && totalLinhas === totalCmds;
  const diff = totalLinhas - totalCmds;

  const items = useMemo(() => {
    const total = Math.min(totalLinhas, totalCmds, clamp(limite, 1, 5000));
    return Array.from({ length: total }, (_, i) => ({
      to: linhas[i],
      message: comandos[i],
      index: i,
    }));
  }, [linhas, comandos, totalLinhas, totalCmds, limite]);

  const preview = useMemo(() => items.slice(0, 5), [items]);

  const badge = useMemo(() => {
    if (totalLinhas === 0 && totalCmds === 0)
      return { tone: "neutral", icon: "ℹ️", text: "Cole linhas e comandos" };

    if (!match) {
      return {
        tone: "danger",
        icon: "⚠️",
        text: diff > 0 ? `Faltam ${Math.abs(diff)} comandos` : `Faltam ${Math.abs(diff)} linhas`,
      };
    }

    return { tone: "success", icon: "✅", text: "Pronto para enviar (1:1)" };
  }, [totalLinhas, totalCmds, match, diff]);

  async function enviar() {
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-1-1", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sender: sender || undefined,
          items: items.map(({ to, message }) => ({ to, message })),
        }),
      });

      setResult(await res.json());
    } finally {
      setSending(false);
    }
  }

  function limpar() {
    setLinhasText("");
    setCmdsText("");
    setResult(null);
  }

  const okCount = result?.resultados?.filter((r) => r.ok).length ?? 0;
  const failCount = result?.resultados?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="page">
      <header className="header">
        <div className="header__left">
          <h1 className="title">Painel de Envio 1:1 (Comtele)</h1>
          <p className="subtitle">
            Cole as <b>linhas</b> e os <b>comandos</b> (um por linha). A ordem é respeitada.
          </p>
        </div>

        <div className="header__right">
          <span className={`badge badge--${badge.tone}`}>
            <span className="badge__icon">{badge.icon}</span>
            <span className="badge__text">{badge.text}</span>
          </span>
        </div>
      </header>

      <section className="grid2">
        <div className="card">
          <div className="card__top">
            <h2 className="card__title">Linhas</h2>
            <span className="card__meta">{totalLinhas} itens</span>
          </div>

          <textarea
            className="textarea mono"
            value={linhasText}
            onChange={(e) => setLinhasText(e.target.value)}
            rows={14}
            placeholder={"Ex:\n5511999999999\n5511988888888"}
          />

          <p className="hint">Dica: cole direto da coluna “LINHA” do Sheets.</p>
        </div>

        <div className="card">
          <div className="card__top">
            <h2 className="card__title">Comandos</h2>
            <span className="card__meta">{totalCmds} itens</span>
          </div>

          <textarea
            className="textarea mono"
            value={cmdsText}
            onChange={(e) => setCmdsText(e.target.value)}
            rows={14}
            placeholder={"Ex:\nSET,APN,internet\nSET,SERVER,1.2.3.4,9000"}
          />

          <p className="hint">Dica: cole direto da coluna “CMD” do Sheets.</p>
        </div>
      </section>

      <section className="card">
        <div className="controls">
          <label className="field">
            <span className="field__label">Sender (opcional)</span>
            <input
              className="input"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Ex: LWSIM"
            />
          </label>

          <label className="field">
            <span className="field__label">Limite de envios</span>
            <input
              className="input input--small"
              type="number"
              min={1}
              max={5000}
              value={limite}
              onChange={(e) => setLimite(clamp(e.target.value, 1, 5000))}
            />
          </label>

          <div className="spacer" />

          <button className="btn btn--ghost" onClick={limpar} disabled={sending && !result}>
            Limpar
          </button>

          <button
            className={`btn btn--primary ${(!match || items.length === 0) ? "btn--disabled" : ""}`}
            onClick={enviar}
            disabled={!match || items.length === 0 || sending}
            title={!match ? "A quantidade de linhas e comandos precisa ser igual" : ""}
          >
            {sending ? "Enviando..." : `Enviar ${items.length} (1:1)`}
          </button>
        </div>

        <div className="section">
          <h3 className="section__title">Prévia (primeiros 5 pares)</h3>

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Linha</th>
                  <th>Comando</th>
                </tr>
              </thead>
              <tbody>
                {preview.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="muted">
                      Nada para pré-visualizar ainda.
                    </td>
                  </tr>
                ) : (
                  preview.map((p) => (
                    <tr key={p.index}>
                      <td className="muted">{p.index + 1}</td>
                      <td>{p.to}</td>
                      <td>
                        <code className="code">{p.message}</code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!match && (totalLinhas || totalCmds) ? (
            <p className="dangerText">Ajuste: a quantidade de linhas e comandos precisa bater (1:1).</p>
          ) : null}
        </div>
      </section>

      {result && (
        <section className="card">
          <header className="resultHeader">
            <h2 className="card__title">Resultado do envio</h2>
            <div className="resultStats">
              <span>✅ OK: <b>{okCount}</b></span>
              <span>❌ Falha: <b>{failCount}</b></span>
              <span>Total: <b>{result.total ?? items.length}</b></span>
            </div>
          </header>

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Linha</th>
                  <th>Status</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {(result.resultados || []).map((r) => (
                  <tr key={r.index}>
                    <td className="muted">{r.index + 1}</td>
                    <td>{r.to}</td>
                    <td>{r.ok ? "✅ Enviado" : "❌ Falhou"}</td>
                    <td className="small">
                      {r.ok ? JSON.stringify(r.response) : JSON.stringify(r.error)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="footer">
        Segurança: a chave da Comtele fica só no backend (server/index.js via .env).
      </footer>
    </div>
  );
}
