import { clamp } from "./utils";

export default function Controls({
  sender,
  setSender,
  limite,
  setLimite,
  sending,
  result,
  match,
  items,
  handleFileImport,
  limpar,
  enviar,
  fileInputRef,
}) {
  return (
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          style={{ display: "none" }}
          accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
        />
        <button
          className="btn"
          onClick={() => fileInputRef.current.click()}
          disabled={sending}
        >
          Importar Arquivo
        </button>

        <button
          className="btn btn--ghost"
          onClick={limpar}
          disabled={sending && !result}
        >
          Limpar
        </button>

        <button
          className={`btn btn--primary ${
            !match || items.length === 0 ? "btn--disabled" : ""
          }`}
          onClick={enviar}
          disabled={!match || items.length === 0 || sending}
          title={
            !match ? "A quantidade de linhas e comandos precisa ser igual" : ""
          }
        >
          {sending ? "Enviando..." : `Enviar ${items.length} (1:1)`}
        </button>
      </div>
    </section>
  );
}
