export default function Header({ badge }) {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="title">Painel de Envio 1:1 (Comtele)</h1>
        <p className="subtitle">
          Cole as <b>linhas</b> e os <b>comandos</b> ou{" "}
          <b>importe um arquivo</b>.
        </p>
      </div>

      <div className="header__right">
        <span className={`badge badge--${badge.tone}`}>
          <span className="badge__icon">{badge.icon}</span>
          <span className="badge__text">{badge.text}</span>
        </span>
      </div>
    </header>
  );
}
