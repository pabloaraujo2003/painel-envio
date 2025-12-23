export default function TextareaCard({ title, count, value, onChange, placeholder, hint }) {
  return (
    <div className="card">
      <div className="card__top">
        <h2 className="card__title">{title}</h2>
        <span className="card__meta">{count} itens</span>
      </div>

      <textarea
        className="textarea mono"
        value={value}
        onChange={onChange}
        rows={14}
        placeholder={placeholder}
      />

      <p className="hint">{hint}</p>
    </div>
  );
}
