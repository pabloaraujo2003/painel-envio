export default function PreviewTable({ preview, match, totalLinhas, totalCmds }) {
  return (
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

      {!match && (totalLinhas > 0 || totalCmds > 0) ? (
        <p className="dangerText">
          Ajuste: a quantidade de linhas e comandos precisa bater (1:1).
        </p>
      ) : null}
    </div>
  );
}
