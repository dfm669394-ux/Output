export default function BarList({ title, items, valueKey = 'achievement', suffix = '%' }) {
  const max = Math.max(1, ...items.map(i => Math.abs(i[valueKey] || 0)));
  return (
    <div className="panel">
      <div className="panel-title">{title}</div>
      <div className="bar-list">
        {items.slice(0, 10).map((item, idx) => {
          const val = item[valueKey] || 0;
          return <div className="bar-row" key={`${item.name}-${idx}`}>
            <div className="bar-label"><span>{idx + 1}</span>{item.name}</div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, Math.abs(val) / max * 100)}%` }} /></div>
            <div className="bar-value">{val.toLocaleString(undefined,{maximumFractionDigits:1})}{suffix}</div>
          </div>;
        })}
      </div>
    </div>
  );
}
