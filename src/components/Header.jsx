export default function Header({ badge, theme, toggleTheme, apiStatus }) {
  return (
    <header className="header">
      <div className="header__left">
        <div className="title-area">
          <h1 className="title">Painel de Envio 1:1 (Comtele)</h1>
          <span className={`api-status api-status--${apiStatus}`}>
            API: {apiStatus}
          </span>
        </div>
        <p className="subtitle">
          Cole as <b>linhas</b> e os <b>comandos</b> ou{" "}
          <b>importe um arquivo</b>.
        </p>
      </div>

      <div className="header__right">
        {/* BADGE */}
        <span className={`badge badge--${badge.tone}`}>
          <span className="badge__icon">{badge.icon}</span>
          <span className="badge__text">{badge.text}</span>
        </span>

        {/* 👉 BOTÃO DE TEMA */}
        <button
          className="btn btn--ghost"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          style={{ marginLeft: "12px" }}
        >
          {theme === "dark" ? "☀️ Claro" : "🌙 Escuro"}
        </button>
      </div>
    </header>
  );
}
