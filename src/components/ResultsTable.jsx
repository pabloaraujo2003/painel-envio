export default function ResultsTable({ result, okCount, failCount, items }) {
  if (!result) return null;

  return (
    <section className="card">
      <header className="resultHeader">
        <h2 className="card__title">Resultado do envio</h2>
        <div className="resultStats">
          <span>
            ✅ OK: <b>{okCount}</b>
          </span>
          <span>
            ❌ Falha: <b>{failCount}</b>
          </span>
          <span>
            Total: <b>{result.total ?? items.length}</b>
          </span>
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
                  {r.ok
                    ? JSON.stringify(r.response)
                    : JSON.stringify(r.error)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
